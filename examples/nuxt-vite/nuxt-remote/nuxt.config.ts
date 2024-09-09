import { federation } from '@module-federation/vite';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  debug: true,
  devtools: { enabled: true },
  experimental: {
    appManifest: true
  },
  vite: {
    plugins: [
      federation({
        name: '@namespace/viteViteRemote',
        remotes: {
          // '@namespace/viteViteRemote': {
          //   entry: 'http://localhost:5176/mf-manifest.json',
          //   type: 'module',
          // },
        },
        filename: '_nuxt/remoteEntry.js',
        shared: {
          // vue: {},
        },
        runtimePlugins: ['./utils/mfPlugins'],
        exposes: {
          "./App": "./App.vue"
        }
      }),
    ],
    build: {
      target: 'chrome89',
    },
  },
});
