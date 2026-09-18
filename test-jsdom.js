import { JSDOM } from 'jsdom';
import fs from 'fs';

JSDOM.fromURL("http://localhost:5173", {
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true
}).then(dom => {
  dom.window.console.log = (...args) => console.log('PAGE LOG:', ...args);
  dom.window.console.error = (...args) => console.log('PAGE ERROR:', ...args);
  dom.window.addEventListener('error', err => console.log('GLOBAL ERROR:', err.error || err.message));
  setTimeout(() => {
    console.log("Done waiting");
    process.exit(0);
  }, 2000);
}).catch(console.error);
