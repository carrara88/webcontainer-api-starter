// src/class/WebFileSystem.ts
import { IEnvironment } from "./Environment";
import { FactoryPart } from "./FactoryPart";
export interface IFileSystemStructure {
    [key: string]: {
        file: {
            contents: string;
        };
    };
  }
  
export interface IFileSystem {
    setEnvironment(environmant: IEnvironment): IFileSystem;
    writeFile(content: any, filename: string): Promise<void>;
    mount(): IFileSystemStructure;
}

export class WebFileSystem extends FactoryPart implements IFileSystem {
    constructor() {
        super();
    }

    mount():IFileSystemStructure {
        return {
            'index.js': {
              file: {
                contents: `
        import express from 'express';
        const app = express();
        const port = 3111;
          
        app.get('/', (req, res) => {
            res.send('Welcome to a WebContainers! 🥳');
        });
          
        app.listen(port, () => {
            console.log(\`App is live at http://localhost:\${port}\`);
        });`,
              },
            },
            'package.json': {
              file: {
                contents: `
                  {
                    "name": "example-app",
                    "type": "module",
                    "dependencies": {
                      "express": "latest",
                      "nodemon": "latest"
                    },
                    "scripts": {
                      "dev-bootstrap": "npm install && nodemon index.js",
                      "dev": "nodemon index.js",
                      "qa-bootstrap": "npm install && nodemon index.js",
                      "qa": "nodemon index.js",
                      "prod-bootstrap": "npm install && npm run start",
                      "prod": "node index.js"
                  }
                  }`,
              },
            },
          }
    }

    async writeFile(content: any, filename: string = '/index.js'): Promise<void> {
      await this.environment.container.webcontainerInstance.fs.writeFile(filename, content);
    }
}