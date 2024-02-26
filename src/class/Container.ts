import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { LoadingTime } from "./LoadingTime";
import { FactoryPart } from "./FactoryPart";

export class Container extends FactoryPart {
    webcontainerInstance!: WebContainer;
    /*
    webFileSystem!: IFileSystem;
    xTermTerminal!: ITerminal;
    espressServer!: IServer;
    */
    loadingTime: LoadingTime;

    
    constructor() {
        super();
        this.loadingTime = new LoadingTime();
    }

    async start():Promise<void> {
        await this.boot();
        await this.mount();
        await this.install();
    }

    /**
     * used by WebFileSystem on constructor
     * @param webFileSystem:IFileSystem parent WebFileSystem
     * @returns void
     
    public setWebFileSystem(webFileSystem: IFileSystem):void {
        this.webFileSystem = webFileSystem;
    }
    */
     /**
     * used by XTermTerminal on constructor
     * @param webFileSystem:ITerminal parent XTermTerminal
     * @returns void
    
    public setXTermTerminal(xTermTerminal: ITerminal):void {
        this.xTermTerminal = xTermTerminal;
    }
     */
    /**
     * used by EspressServer on constructor
     * @param webFileSystem:IServer parent EspressServer
     * @returns Promise<void>
     
    public setEspressServer(espressServer: IServer):void {
        this.espressServer = espressServer;
    }
    */
    /** Actions */
    /**
     * boot new webcontainer as current instance
     * @returns void
     */
    async boot():Promise<void> {
        this.changeStatus('isBootRunned', true);
        await WebContainer.boot().then((value: WebContainer) => {
            this.webcontainerInstance = value as WebContainer;
            this.changeStatus('isBootSucceded', true);
        }, (reason: any) => {
            if (reason)
                console.log('isBootError', reason)
            this.changeStatus('isBootError', true);
        });
    }

    async mount():Promise<void> {
        this.changeStatus('isMountRunned', true);
        // Mount files
        await this.webcontainerInstance.mount(await this.environment.webFileSystem.mount()).then((value: void) => {
            this.changeStatus('isMountSucceded', true);
        }, (reason: any) => {
            if (reason)
                console.log('isMountError', reason)
            this.changeStatus('isMountError', true);
        });
    }

    async install():Promise<void> {
        this.changeStatus('isInstallRunned', true);
        await this.webcontainerInstance.spawn('npm', ['install']).then(async (process: WebContainerProcess) => {
            await process.exit
            this.changeStatus('isInstallSucceded', true);
        }, (reason: any) => {
            if (reason)
                console.log('isInstallError', reason)
            this.changeStatus('isInstallError', true);
        });
    }

    async newProcess():Promise<WebContainerProcess|undefined> {
        let options = this.environment.xTermTerminal.terminal ? {
            terminal: {
              cols: this.environment.xTermTerminal.terminal.cols,
              rows: this.environment.xTermTerminal.terminal.rows,
            },
          } : {};
        return this.webcontainerInstance.spawn('jsh', options);
        
        /*.then(async (process: WebContainerProcess) => {
            this.changeStatus('isNewTerminalLoading...', true);
            return process;
            await process.exit
            this.changeStatus('isNewTerminalSucceded', true);
        }, (reason: any) => {
            if (reason)
                console.log('isNewTerminalError', reason)
            this.changeStatus('isNewTerminalError', true);
        });
        return undefined;*/
    }


}