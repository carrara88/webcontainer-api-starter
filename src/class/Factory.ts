// src/class/Factory.ts
import { Environment, IEnvironment } from './Environment';
import { Container } from './Container';
import { WebFileSystem } from './WebFileSystem';
import { XTermTerminal } from './XTermTerminal';
import { ExpressServer } from './ExpressServer';

// Factory
export class Factory {
    static async createEnvironment(document: Document, window: Window): Promise<IEnvironment> {
        
        const container = new Container();
        const fileSystem = new WebFileSystem();
        const terminal = new XTermTerminal();
        const server = new ExpressServer();

        return new Environment(document, window, container, fileSystem, terminal, server);
        
    }
}