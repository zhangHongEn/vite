import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';

export default {
  input: 'src/main.js', // 你需要设置入口文件
  output: {
    dir: 'dist/rollup',
    format: 'es',
    chunkFileNames: "[name][hash].js",
    manualChunks(id) {
      if (id.includes("loadReactDom")) return "loadReactDom";
      if (id.includes("loadReact")) return "loadReact";
      if (id.includes("hostAutoInit")) return "hostAutoInit";
      if (id.includes("remoteEntry")) return "remoteEntry";
    }
  },
  plugins: [
    resolve({
      browser: true,
    }),
    alias({
      entries: [
        { find: 'react', replacement: './src/mockModules/loadReact.js' },
        { find: 'react-dom', replacement: './src/mockModules/loadReactDom.js' },
        { find: 'localReact', replacement: 'react' },
        { find: 'localReactDom', replacement: 'react-dom' }
      ]
    }),
  ],
};