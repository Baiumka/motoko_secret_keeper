import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import vetkd from "ic-vetkd-utils";
import vetkd_wasm from "ic-vetkd-utils/ic_vetkd_utils_bg.wasm";


await vetkd(await vetkd_wasm());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
