import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
/*import vetkd from "ic-vetkd-utils";
import vetkdWasmUrl from "ic-vetkd-utils/ic_vetkd_utils_bg.wasm?url";

async function initVetkd() {
  console.log("Loading WASM from:", vetkdWasmUrl);
  console.log("vetkd:", vetkd);
  const wasmResponse = await fetch(vetkdWasmUrl);
  const wasmBuffer = await wasmResponse.arrayBuffer();
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, { wbg: vetkd });

  console.log("WASM Module:", wasmModule);
  await vetkd(wasmModule.instance);
}

initVetkd();*/
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
