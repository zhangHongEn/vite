import { UserConfig } from 'vite';
import { LOAD_SHARE_TAG } from '../virtualModules/virtualShared_preBuild';

interface Output {
  manualChunks?: {
    [key: string]: any;
  };
}

export default (singleChunkModules: string[]) => ({
  name: 'normalizeBuild',
  config: (config: UserConfig, { command }: { command: string }) => {
    if (!config.build) config.build = {};
    if (!config.build.rollupOptions) config.build.rollupOptions = {};
    let { rollupOptions } = config.build;
    if (!rollupOptions.output) rollupOptions.output = {};
    normalizeManualChunks(rollupOptions.output as any, singleChunkModules);
  },
});

function normalizeManualChunks(output: Output, singleChunkModules: string[]): void {
  if (!output.manualChunks) output.manualChunks = {};
  const wrapManualChunks =
    (original: any) =>
      (id: string, ...args: any[]) => {
        if (id.includes("node_modules/@module-federation/runtime") ||id.includes("node_modules/@module-federation_runtime") ) {
          return "@module-federation/runtime"
        }
        console.log(191818181, id)
        if (id.includes(LOAD_SHARE_TAG) || id.includes("__mf__prebuildwrap_")) {
          // console.log(191818181, id.split("/").pop())
          return id.split("/").pop()
        }
        if (typeof original === 'function') {
          return original(id, ...args);
        }
        if (typeof original === 'object' && original) {
          return original[id];
        }
      };
  output.manualChunks = wrapManualChunks(output.manualChunks);
}
