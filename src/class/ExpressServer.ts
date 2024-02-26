import { IEnvironment } from "./Environment";
import { FactoryPart } from "./FactoryPart";

export interface IServer {
    serverUrl: string;
    setEnvironment(environmant: IEnvironment): IServer;
    start(): Promise<string>; // Returns the URL of the started server
    addServerEvent(callback: (newUrl: string) => void): void;
}
  
export class ExpressServer extends FactoryPart implements IServer {
    serverUrl: string = '';
    private serverEvents: ((newUrl: string) => void)[] = [];

    constructor() {
        super();
    }
   
    async start(): Promise<string> {
      this.serverEvents.forEach(callback => callback(this.serverUrl));
      return this.serverUrl;
    }
  
    addServerEvent(callback: (newUrl: string) => void): void {
      this.serverEvents.push(callback);
    }
  }