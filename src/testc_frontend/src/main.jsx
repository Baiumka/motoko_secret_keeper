import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import vetkd from "ic-vetkd-utils";

async function initVetkd() {
  const response = await fetch("/ic_vetkd_utils_bg.wasm");
  const wasmBuffer = await response.arrayBuffer();

  const imports = {
    wbg: vetkd, 
  };

  const wasmModule = await WebAssembly.instantiate(wasmBuffer, imports);
  console.log("WASM module exports:", wasmModule.instance.exports);

  await vetkd(wasmModule.instance);
}

initVetkd();

initVetkd();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
