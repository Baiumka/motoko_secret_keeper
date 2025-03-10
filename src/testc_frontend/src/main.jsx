import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import vetkd from "ic-vetkd-utils";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

await vetkd("ic_vetkd_utils_bg.wasm");

