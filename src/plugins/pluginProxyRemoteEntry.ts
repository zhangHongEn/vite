import { createFilter } from '@rollup/pluginutils';
import { Plugin } from 'vite';
import { getNormalizeModuleFederationOptions } from '../utils/normalizeModuleFederationOptions';
import { generateHostAutoInit, generateRemoteEntry, generateWrapIsHostInit, generateWrapRemoteEntry, HOST_AUTO_INIT_ID, REMOTE_ENTRY_ID, WRAP_HOST_AUTO_INIT_PATH, WRAP_REMOTE_ENTRY_QUERY_STR } from '../virtualModules/virtualRemoteEntry';

const filter: (id: string) => boolean = createFilter();

export default function (): Plugin {
  return {
    name: 'proxyRemoteEntry',
    enforce: 'post',
    resolveId(id: string) {
      if (id === REMOTE_ENTRY_ID) {
        return REMOTE_ENTRY_ID;
      }
      if (id === HOST_AUTO_INIT_ID) {
        return HOST_AUTO_INIT_ID
      }
    },
    load(id: string) {
      if (id === REMOTE_ENTRY_ID) {
        return generateRemoteEntry(getNormalizeModuleFederationOptions());
      }
      if (id === HOST_AUTO_INIT_ID) {
        return generateHostAutoInit(getNormalizeModuleFederationOptions());
      }
    },
    async transform(code: string, id: string) {
      if (!filter(id)) return;
      if (id.includes(REMOTE_ENTRY_ID)) {
        return generateRemoteEntry(getNormalizeModuleFederationOptions());
      }
      if (id.includes(HOST_AUTO_INIT_ID)) {
        return generateHostAutoInit(getNormalizeModuleFederationOptions());
      }
      if (id.includes(WRAP_REMOTE_ENTRY_QUERY_STR)) {
        return generateWrapRemoteEntry();
      }
      if (id.includes(WRAP_HOST_AUTO_INIT_PATH)) {
        return generateWrapIsHostInit();
      }
    },
  }


}