import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  server: {
    port: 5172,
    open: true,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:5172',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.mode = "development"
      config.output!.uniqueName = 'app1';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'examples_rust',
          remotes: {
            // "@namespace/viteViteRemote": 'viteRemote@http://localhost:5176/mf-manifest.json',
          },
          // remoteType: 'var',
          exposes: {
            './app': './src/app.tsx',
          },
          manifest: {
            filePath: '',
          },
          shared: [
            {
              name: 'react',
              version: "18.0.0"
            },
            'react/',
            'react-dom',
            'react-dom/',
            'vue',
            // 'antd'
          ],
        }),
      ]);
    },
  },
  plugins: [
    pluginReact({
      splitChunks: {
        react: false,
        router: false,
      },
    }),
  ],
});
