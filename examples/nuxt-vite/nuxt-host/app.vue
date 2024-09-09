<template>
  <div>
    <h1>Nuxt host</h1>

    <p>
      Mode: <i> {{ runtimeConfig.app.buildId ? ' dev ' : ' prod ' }} mode </i>
    </p>
    <hr />
  </div>
</template>

<script setup>
import App1 from "@namespace/viteViteRemote/App";
console.log(123, App1)
const runtimeConfig = useRuntimeConfig();

// if (process.client) {
//   // Load remote app on client side
//   import('@namespace/viteViteRemote/App1').then((app) => {
//     console.log(app);
//   });
// }
</script>
