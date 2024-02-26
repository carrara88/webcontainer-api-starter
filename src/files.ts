
export interface FileStructure {
  [key: string]: {
      file: {
          contents: string;
      };
  };
}

//const folderPath = './container/';
//const fileLoader = new FileLoader(folderPath);
//const loadedFiles: string[] = fileLoader.loadFiles();
//console.log(loadedFiles);

/** @satisfies {import('@webcontainer/api').FileSystemTree} */

export const files:FileStructure = {
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
  };