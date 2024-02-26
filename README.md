# WebContainers App

# About the Project

The WebContainers App is a cutting-edge web application designed to demonstrate the capabilities of WebContainers and how they can be utilized to create dynamic, scalable web applications. This project leverages technologies such as TypeScript, Vite, and Express to showcase a modular design that includes features like real-time terminal emulation, file system management, and custom UI components.

# Getting Started

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/carrara88/webcontainers-app.git
   ```
2. Navigate to the project directory:
   ```sh
   cd webcontainers-app
   ```
3. Install NPM packages:
   ```sh
   npm install
   ```
4. Start the development server:
   ```sh
   npm run dev
   ```

### Package scripts:

From `package.json` here the list of available scripts

   ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
   ```

# Features

- **Factory Design Pattern**: Utilizes `Factory.ts` and `FactoryPart.ts` for object creation, demonstrating the factory design pattern.
- **Web Terminal**: `XTermTerminal.ts` provides real-time terminal emulation within the web app.
- **Dynamic UI**: `UIBuilder.ts` allows for dynamic construction of the user interface.
- **File System Management**: `WebFileSystem.ts` simulates file system operations within the web environment.
- **Server Setup**: `ExpressServer.ts` demonstrates setting up an Express server within the WebContainer environment.

# Project Structure

```
root/
├── index.html
├── loading.html
├── vite.config.js
├── package.json
├── tsconfig.json
└── src/
    ├── main.ts
    ├── files.ts
    └── class/ 
        ├── Container.ts
        ├── Environment.ts
        ├── ExpressServer.ts
        ├── Factory.ts
        ├── FactoryPart.ts
        ├── UIBuilder.ts
        ├── WebFileSystem.ts
        ├── XTermTerminal.ts
        ├── LoadingTime.ts
        
```


# WebContainer API Starter

WebContainer API is a browser-based runtime for executing Node.js applications and operating system commands. It enables you to build applications that previously required a server running.

WebContainer API is perfect for building interactive coding experiences. Among its most common use cases are production-grade IDEs, programming tutorials, or employee onboarding platforms.

## WebContainer How To

For an up-to-date documentation, please refer to [our documentation](https://webcontainers.io).

## WebContainer Cross-Origin Isolation

WebContainer _requires_ [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) to function. In turn, this requires your website to be [cross-origin isolated](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements). Among other things, the root document must be served with:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

You can check [our article](https://blog.stackblitz.com/posts/cross-browser-with-coop-coep/) on the subject and our [docs on browser support](https://developer.stackblitz.com/docs/platform/browser-support) for more details.

## WebContainer Serve over HTTPS

Please note that your deployed page must be served over HTTPS. This is not necessary when developing locally, as `localhost` is exempt from some browser restrictions, but there is no way around it once you deploy to production.


## WebContainer Troubleshooting

Cookie blockers, either from third-party addons or built-in into the browser, can prevent WebContainer from running correctly. Check the `on('error')` event and our [docs](https://developer.stackblitz.com/docs/platform/third-party-blocker).

To troubleshoot other webcontainer problems, check the [Troubleshooting page](https://webcontainers.io/guides/troubleshooting) in stackblitz docs.

# Contributing

We welcome contributions from the community! If you'd like to contribute to the WebContainers App, please fork the repository and create a pull request with your features or fixes.

# License

Distributed under the MIT License. See `LICENSE` for more information.
