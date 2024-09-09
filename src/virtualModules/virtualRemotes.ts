import VirtualModule from "../utils/VirtualModule";

export const remoteVirtualModule = new VirtualModule("remoteModule")
export function writeRemote(remote:string, command:string) {
  const m = new VirtualModule(remote)
  m.writeSync(generateRemotes(remote, command).code)
  return m.getImportId()
  // remoteVirtualModule.writeSync()
}
const usedRemotesMap: Record<string, Set<string>> = {
  // remote1: {remote1/App, remote1, remote1/Button}
}
export function addUsedRemote(remoteKey:string, remoteModule: string) {
  if (!usedRemotesMap[remoteKey]) usedRemotesMap[remoteKey] = new Set()
  usedRemotesMap[remoteKey].add(remoteModule)
}
export function getUsedRemotesMap() {
  return usedRemotesMap
}
export function generateRemotes(id: string, command: string): { code: string; map: null; syntheticNamedExports: string } {
  return {
    code: `
    import {loadRemote} from "@module-federation/runtime"
    const exportModule = await loadRemote(${JSON.stringify(id)})
    ${(command === "build" &&
        `
        export default 'default' in (exportModule || {}) ? exportModule.default : undefined
        export const __mf__dynamicExports = exportModule
        `
      ) || ""}
      ${(command !== "build" &&
        `
        export default exportModule
        `
      ) || ""}
  `,
    map: null,
    // TODO: vite dev mode invalid, use optimizeDeps.needsInterop
    syntheticNamedExports: '__mf__dynamicExports',
  };
}