import R from 'react';
import RD from 'react-dom/client';

import { AgGridDemo } from '@namespace/viteViteRemote/AgGridDemo';
import App1 from '@namespace/viteViteRemote/App1';
import { App2 } from '@namespace/viteViteRemote/App2';
import { ref } from 'vue';

console.log('Share vue', ref);
console.log('Share React', R, RD);

export default function () {
  return (
    <div>
      Vite React
      {/* <h2>Button</h2>
      <Button />
      <h2>Remote2App</h2>
      <Remote2App />
      <h2>Mfapp01App</h2>
      <Mfapp01App /> */}
      {/* <h2>Vite Remote App1</h2> */}
      <App1 />
      <h2>Vite Remote App2</h2>
      <App2 />
      <h2>Vite Remote AgGridDemo</h2>
      <AgGridDemo />
    </div>
  );
}
