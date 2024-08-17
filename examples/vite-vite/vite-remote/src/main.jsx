import React from 'react';
import ReactDOM from 'react-dom/client';
import styled, { a } from 'styled-components';
import { ref } from "vue";
import { AgGridDemo } from './AgGridDemo';
import App1 from './App1';
import { App2 } from './App2';
console.log(123444, styled, a, ref)

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(
  <React.StrictMode>
    <h1>MF Remote as standalone app</h1>

    <h2>App1</h2>
    <App1 />

    <h2>App2</h2>
    <App2 />

    <h2>AgGridDemo</h2>
    <AgGridDemo />

  </React.StrictMode>
);
