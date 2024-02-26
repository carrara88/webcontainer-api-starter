// src/class/XTermTerminal.ts
import '../style.css';
import 'xterm/css/xterm.css';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { FactoryPart } from './FactoryPart';
import { WebContainerProcess } from '@webcontainer/api';
import { IEnvironment } from './Environment';

export interface ITerminal {
    setEnvironment(environmant: IEnvironment): ITerminal;
    terminal: Terminal;
    fitAddon: FitAddon;
    start(): Promise<void>;
    sendData(data: any): Promise<void>;
    onReceiveData(callback: (data: any) => void): void;
    onReady(): void;
}
export type TTerminalEvent = (event: string, value: any) => void;

export class XTermTerminal extends FactoryPart implements ITerminal {
    fitAddon: FitAddon;
    terminal: Terminal;
    process!: WebContainerProcess;
    processWriter!: WritableStreamDefaultWriter<string>;
    processEvents: TTerminalEvent[] = [];

    constructor() {
        super();
        this.terminal = new Terminal({ convertEol: true });
        this.fitAddon = new FitAddon();
    }

    async start(): Promise<void> {
        this.changeStatus('isStart', true);

        this.process = await this.environment.container.newProcess() as WebContainerProcess;
        this.processWriter = this.process.input.getWriter() as WritableStreamDefaultWriter;

        this.terminal.loadAddon(this.fitAddon);
        const terminalElement = this.environment.domElements.get('terminal') as HTMLElement;
        this.terminal.open(terminalElement);
        this.fitAddon.fit();

        this.terminal.onData((data: any) => {
            this.processWriter.write(data);
        });

        this.environment.container.webcontainerInstance.on('server-ready', (_port: any, url: any) => {
            // set new server URL
            this.environment.expressServer.serverUrl = url;
            this.environment.initPreview(this.environment.expressServer.serverUrl);
        });


        // connect shell output stream terminal output writer
        await this.process.output.pipeTo(
            new WritableStream({
                write: async (data) => {
                    // write output stream data on terminal
                    if (this.terminal) {
                        this.terminal.write(data);
                    } else {
                        console.log("$", data);
                    }
                    await this.detectUser(data);
                    //await this.detectCompleted(data);
                    //await this.detectAvailable(data);
                },
            })
        );
    }

    async detectCompleted(data:string) {
        // detect startup if pattern is detected
        const completedRegex: RegExp = /^(.+\[?2004h)$/;
        const completedMatches: RegExpMatchArray | null = data.match(completedRegex);
        if (completedMatches && completedMatches.length > 1) {
            this.changeStatus('isCompleted', true);
        }
    }
    async detectUser(data: string) { 
        // detect user from shell output with regex
        const userRegex: RegExp = /[^~]+~\/([^\s\[]+).+/;
        const userMatches: RegExpMatchArray | null = data.match(userRegex);
        // user is ready if shell session name is detected
        if (userMatches && userMatches.length > 1 && this.getStatus('isUserDetected') === false) {
            this.changeStatus('isUserDetected', true);
            console.log("userDetected:", userMatches[1]);
            // bootstrap terminal process 
            await this.onReady();
        }
    }
    async detectAvailable(data:string) {
        const readyRegex: RegExp = /^(.+[1G].\[[0J]+.\[[35m❯]+.\[[39m]+\s.\[[3G]+)$/;
        const readyMatches: RegExpMatchArray | null = data.match(readyRegex);
        // shell is available if pattern is detected
        if (readyMatches && readyMatches.length > 1 && this.getStatus('isReady') === true) {
            this.changeStatus('isAvailable', true);
        }
    }

    addProcessEvent(processEvent: TTerminalEvent) {
        this.processEvents.push(processEvent);
    }

    async sendData(data: any): Promise<void> {
        this.processWriter.write(data);
        console.log("$", data);
    }

    onReceiveData(callback: (data: any) => void): void {
        this.terminal.onData(callback);
    }

    async onReady() {
        if (this.getStatus('isReady') == false) {
            // confirm shell startup
            this.changeStatus('isReady', true);
            // 'npm run dev-bootstrap' | 'npm run qa-bootstrap | npm run prod-bootstrap'
            await this.sendData(`npm run ${this.environment.env}-bootstrap\n`);
        }
    }
}

