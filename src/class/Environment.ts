// src/class/Container.ts
import { v4 as uuidv4 } from 'uuid';
import { IFileSystem, IFileSystemStructure } from './WebFileSystem';
import { ITerminal } from './XTermTerminal';
import { IServer } from './ExpressServer';
import { Container } from './Container';
import { UIBuilder } from './UIBuilder';

export interface IEnvironment {
  env: 'dev' | 'qa' | 'prod';
  domElements: Map<string, HTMLElement | HTMLIFrameElement>;
  container: Container,
  webFileSystem: IFileSystem,
  xTermTerminal: ITerminal,
  expressServer: IServer;
  init(): Promise<void>;
  initPreview(url: string): void;
  initEditor(): void;
}
export class Environment implements IEnvironment {
  public applicationID: string = uuidv4();
  public env: 'dev'|'qa'|'prod' = 'dev';
  public domElements: Map<string, HTMLElement | HTMLIFrameElement> = new Map();

  constructor(
    public document: Document,
    public window: Window,
    public container: Container,
    public webFileSystem: IFileSystem,
    public xTermTerminal: ITerminal,
    public expressServer: IServer
  ) {
    this.container.setEnvironment(this)
    this.webFileSystem.setEnvironment(this)
    this.xTermTerminal.setEnvironment(this)
    this.expressServer.setEnvironment(this)
  }

  async init() {
    this.initUI();
    await this.container.start();
    await this.initEditor();
    await this.xTermTerminal.start();
    await this.expressServer.start();
  }

  private initUI() {
    let uiParts = UIBuilder.build(this.domElements, this.applicationID, this.document.querySelector('body') as HTMLElement);
    console.log(uiParts);
  }
  async initEditor() {
    console.log("####################################################");
    let files: IFileSystemStructure = this.webFileSystem.mount();
    console.log("####################################################");
    let editor = this.domElements.get('editor') as HTMLTextAreaElement;
    editor.value = files['index.js'].file.contents;
    editor?.addEventListener('input', (ev: Event) => {
      this.webFileSystem.writeFile((ev.currentTarget as HTMLTextAreaElement).value, 'index.js');
    });
    return;
  }


  public initPreview(url: string) {
    if (this.domElements.get('frame'))
      (this.domElements.get('frame') as HTMLIFrameElement).src = url;
  }

}

