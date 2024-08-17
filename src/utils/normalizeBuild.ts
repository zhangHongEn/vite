import { UserConfig } from 'vite';
import { HOST_AUTO_INIT_QUERY_STR, WRAP_REMOTE_ENTRY_QUERY_STR } from '../virtualModules/virtualRemoteEntry';
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
        if (id.includes(LOAD_SHARE_TAG) || id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR)) {
          console.log(123213333, id.split("/").pop())
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
