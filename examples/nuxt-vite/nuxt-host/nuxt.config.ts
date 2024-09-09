import { federation } from '@module-federation/vite';
import topl from "vite-plugin-top-level-await";

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  debug: true,
  devtools: { enabled: true },
  // experimental: {
  //   appManifest: true
  // },
  vite: {
    plugins: [
      federation({
        name: 'nuxhost',
        remotes: {
          '@namespace/viteViteRemote': {
            entry: 'http://localhost:3000/_nuxt/mf-manifest.json',
            type: 'module',
          },
        },
        filename: 'remoteEntry.js',
        shared: {
          // vue: {},
        },
        runtimePlugins: ['./utils/mfPlugins'],
        // exposes: {
        //   "./App": "./App.vue"
        // }
      }),
      new topl()
    ],
    build: {
      target: 'chrome89',
    },
  },
});
