import './style.css';
import { files } from './files';
import { WebContainer, WebContainerProcess } from '@webcontainer/api';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';
import { FitAddon } from 'xterm-addon-fit';
import { v4 as uuidv4 } from 'uuid';
import { Factory } from './class/Factory';


type ServerOnChange = (newUrl: string) => void;

export class Container {

  env: 'dev'|'qa'|'prod' = 'dev';
  containerApp: ContainerApp;
  status: Map<string, any> = new Map();
  webcontainerInstance!: WebContainer;
  containerTerminalProcessWriter!: WritableStreamDefaultWriter<string>;
  containerProcesses: Map<string, WebContainerProcess> = new Map();
  shellStarted: boolean = false;
  terminalUI!: Terminal;
  fitAddon!: FitAddon;
  serverUrl!: string;
  serverOnChange: ServerOnChange[] = [];
  containerTerminalProcessReader!: ReadableStreamDefaultReader<string>;

  constructor(containerApp: ContainerApp) {
    this.containerApp = containerApp
  }

  async init() {
    // Boot Container
    this.webcontainerInstance = await WebContainer.boot();
    this.status.set('isBooted', true);
    console.log("isBooted",this.status.get('isBooted'))

    // Mount files
    await this.webcontainerInstance.mount(files).then(() => {
      this.status.set('isMounted', true);
      console.log("isMounted",this.status.get('isMounted'))
    },(reason: any) => {
      if(reason)
      this.status.set('isMounted', false);
      console.log("isMounted",this.status.get('isMounted'),reason)
    });


    console.log("install container");
    await this.install();
    console.log("start server...");
    await this.startServer();
    console.log("start terminal...");
    await this.startTerminalUI();
    console.log("start terminal process...");
    await this.startTerminalProcess();
  }
  
  addOnChange(callback: ServerOnChange) {
    this.serverOnChange.push(callback);
  }

  async writeFile(content: any, filename:string='/index.js') {
    await this.webcontainerInstance.fs.writeFile(filename, content);
  }

  async install() {
    await this.webcontainerInstance.spawn('npm', ['install']).then(async (process: WebContainerProcess) => {
      console.log("installing process...");
      await process.exit
      console.log("installing process completed");
    });    
  }

  async bootstrapTerminalProcess() {    
    if (this.shellStarted===false) {
      // confirm shell startup
      this.shellStarted = true;
      console.log("bootstrap terminal process...");
      
      await this.sendInputToShell(`npm run ${this.env}-bootstrap`, true);
      //await this.sendInputToShell('npm run start', true);
    }
  }
  
  async startServer() { 
    // wait for `server-ready` event
    this.webcontainerInstance.on('server-ready', (_port: any, url: any) => {
      // set new server URL
      this.serverUrl = url;
      // run all onChange callbacks
      this.serverOnChange.forEach(callback => {
        callback(url);
      });
    });
  }

  async startTerminalUI() {
    // start terminal 
    this.terminalUI = new Terminal({
      convertEol: true,
    });
    // get terminal UI
    let terminalElement = this.containerApp.domElements.get('terminal');
    // if terminal UI exist
    if (terminalElement) {
      // load terminal UI addons
      this.fitAddon = new FitAddon();
      this.terminalUI.loadAddon(this.fitAddon);
      // open terminal on UI
      this.terminalUI.open(terminalElement);
      // resize terminal UI
      this.fitAddon.fit();
    }
  }

  async startTerminalProcess() {
    // create new shell process on web container instance with jsh
    // TODO: more detailed comment
    let options = this.terminalUI ? {
      terminal: {
        cols: this.terminalUI.cols,
        rows: this.terminalUI.rows,
      },
    } : {};
    this.containerProcesses.set('terminal', await this.webcontainerInstance.spawn('jsh', options));

    // connect shell output stream terminal output writer
    this.containerProcesses.get('terminal')?.output.pipeTo(
      new WritableStream({
        write: async (data) => {
          // write output stream data on terminal
          if (this.terminalUI) {
            this.terminalUI.write(data);
          } else {
            console.log("$",data);
          }
          // detect shell session name from shell output with regex
          const regex: RegExp = /~\/([^\s\[][\w\s-]+)/;
          const matches: RegExpMatchArray | null = data.match(regex);
          // shell is started if shell session name is detected for the first time
          if (matches && matches.length>1 && this.shellStarted === false) {
            // bootstrap terminal process 
            await this.bootstrapTerminalProcess();
          }
        },
      })
    );

    // set container terminal process input writer
    this.containerTerminalProcessWriter = this.containerProcesses.get('terminal')?.input.getWriter() as WritableStreamDefaultWriter;
    // set container terminal process output reader
    // this.containerTerminalProcessReader = this.containerProcesses.get('terminal')?.output.getReader() as ReadableStreamDefaultReader;
    
    // connect terminal UI data input event with terminal input writer
    if (this.terminalUI)
    this.terminalUI.onData((data: any) => {
      this.containerTerminalProcessWriter.write(data);
    });

  }

  async sendInputToShell(command: string, execute: boolean = false): Promise<void> {
    try {
      await this.containerTerminalProcessWriter.write(command + (execute ? '\n' : ''));
    } catch (error) {
      console.error('error sending input to shell:', error);
    }
  }

}



export class ContainerApp {

  applicationID: string = uuidv4();
  domElements: Map<string, any> = new Map();
  container: Container;
  onload: () => void;

  constructor(public document: Document, public window: Window) {
    this.container = new Container(this);
    // on window load
    this.window.addEventListener('DOMContentLoaded', async () => {
      console.log("DOM loaded from window")
    });
    // on application load
    this.onload = async () => {
      console.log("onload", this.window)
      this.domElements.get('editor').value = files['index.js'].file.contents;
      this.domElements.get('editor').addEventListener('input', (e: { currentTarget: { value: any; }; }) => {
        this.container.writeFile(e.currentTarget.value);
      });
      console.log("editor", this.domElements.get('editor'));
      this.container.addOnChange((newUrl: string) => {
        // update frame-preview src
        this.src(this.container.serverUrl);
        console.log('container server URL:',  this.container.serverUrl);
      });
      // on window resize
      this.window.addEventListener('resize', () => {
        this.container.fitAddon.fit();
        this.container.containerProcesses.get('terminal')?.resize({
          cols: this.container.terminalUI.cols,
          rows: this.container.terminalUI.rows,
        });
      });
    };
  }


  async init() {
    this.initUI();
    
    await this.container.init();
    this.onload();
  }


  public src(url: string) {
    if (this.domElements.get('frame-preview'))
      this.domElements.get('frame-preview').src = url;
  }

  protected initUI() {
    this.domElements.set('appContainer', document.querySelector('#app'));
    let appContainer = this.domElements.get('appContainer');
    if (appContainer) {
      const container = document.createElement('div');
      container.id =  `container-${this.applicationID}`;
      container.className = `container-${this.applicationID}`;

      const editor = document.createElement('div');
      editor.id =  `editor-${this.applicationID}`;
      editor.className =  `editor-${this.applicationID}`;
      const textarea = document.createElement('textarea');
      textarea.textContent = 'Loading file...';
      editor.appendChild(textarea);

      const preview = document.createElement('div');
      preview.id =  `preview-${this.applicationID}`;
      preview.className = `preview-${this.applicationID}`;
      
      const iframe = document.createElement('iframe');
      iframe.src = 'loading.html';

      const terminal = document.createElement('div');
      terminal.id =  `terminal-${this.applicationID}`;
      terminal.className =  `terminal-${this.applicationID}`;

      container.appendChild(editor);
      preview.appendChild(iframe);
      container.appendChild(preview);
      appContainer.appendChild(container);
      appContainer.appendChild(terminal);

      // update DOM elements map
      this.domElements.set('frame-preview', iframe);
      this.domElements.set('editor', textarea);
      this.domElements.set('terminal', terminal);
    }
  }

  protected getTemplate() {
    
  }
}





// OLD VERSION HERE
//let containerApp = new ContainerApp(document, window);
//containerApp.init();


// NEW VERSION HERE
(async () => {
  let environment = await Factory.createEnvironment(document, window);
  environment.init();
})();
