#!/usr/bin/env node

const fs = require("fs");
const { join } = require("path");
const { exec } = require("child_process");

// Unnecessary files
const unnecessaryFilesInSrc = [
  "App.css",
  "App.test.js",
  "App.test.tsx",
  "index.css",
  "logo.svg",
  "serviceWorker.js",
  "serviceWorker.ts",
  "setupTests.js",
  "setupTests.ts",
];
const unnecessaryFilesInPublic = [
  "favicon.ico",
  "logo192.png",
  "logo512.png",
  "manifest.json",
];

// Content replacement
const appJsContent = `import React from 'react';

function App() {
  return (
    <div className="App">

    </div>
  );
}

export default App;`;

const indexJsContent = `import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);`;

const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

// Args
const args = process.argv.slice(2);

// File paths
const folderName = args[0].startsWith("--") ? args[2] : args[0];
const appPath = join(process.cwd(), folderName);
const appJsPath = join(appPath, "src/App");
const indexJsPath = join(appPath, "src/index");
const indexHtmlPath = join(appPath, "public/index.html");

// fs util
const writeFileIfExists = async (file, content) =>
  new Promise((rs, rj) => {
    fs.readFile(file, (err) => {
      if (err) {
        rj();
      } else {
        rs(fs.writeFile(file, content, "utf-8", () => {}));
      }
    });
  });

// Cleanup function
const cleanup = async () => {
  console.log("");
  console.log("Cleaning up...");

  await Promise.allSettled([
    ...unnecessaryFilesInSrc.map((file) =>
      fs.unlink(join(appPath, "src", file), () => {})
    ),
    ...unnecessaryFilesInPublic.map((file) =>
      fs.unlink(join(appPath, "public", file), () => {})
    ),
    fs.unlink(join(appPath, "README.md"), () => {}),
    writeFileIfExists(appJsPath + ".js", appJsContent),
    writeFileIfExists(appJsPath + ".tsx", appJsContent),
    writeFileIfExists(indexJsPath + ".js", indexJsContent),
    writeFileIfExists(indexJsPath + ".tsx", indexJsContent),
    fs.writeFile(indexHtmlPath, indexHtmlContent, "utf-8", () => {}),
  ]);

  console.log("Done!");
};

// Exec create-react-app and do cleanup
const composer = exec(`npx create-react-app ${args.join(" ")} --colors`);

composer.stdout.pipe(process.stdout);

composer.on("exit", (code, data) => {
  if (code === 0) {
    cleanup();
  }
});
