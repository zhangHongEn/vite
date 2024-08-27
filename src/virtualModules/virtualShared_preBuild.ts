/**
 * Even the resolveId hook cannot interfere with vite pre-build,
 * and adding query parameter virtual modules will also fail.
 * You can only proxy to the real file through alias
 */

import { writeFileSync } from "fs";
import { resolve } from "pathe";
// import { parsePromise } from "../plugins/pluginModuleParseEnd";
import { getNormalizeModuleFederationOptions, ShareItem } from "../utils/normalizeModuleFederationOptions";
import { packageNameEncode, removePathFromNpmPackage } from "../utils/packageNameUtils";
import VirtualModule from "../utils/VirtualModule";
const emptyNpmDir = resolve(require.resolve("an-empty-js-file"), "../")

/**
 * The original shared module is proxied by getLoadShareModulePath, and the new shared module is prebuilt here
 */
const cacheMap2: Record<string, string> = {}
export function getPreBuildLibPath(pkg: string): string {
  if (!cacheMap2[pkg]) cacheMap2[pkg] = `__mf__prebuildwrap_${packageNameEncode(pkg)}`
  const filename = cacheMap2[pkg]
  return filename
}
export function writePreBuildLibPath(pkg: string): string {
  const filename = resolve(emptyNpmDir, `__mf__prebuildwrap_${packageNameEncode(pkg)}.js`)
  writeFileSync(filename, "")
  return filename
}
export const localSharedImportMapModule = new VirtualModule("localsharedMap")
localSharedImportMapModule.write("")
export function getLocalSharedImportMapId() {
  return localSharedImportMapModule.getPath()
}
let shareds: Record<string, null> = {}
export async function generateLocalSharedImportMap() {
  await (global as any).parsePromise
  const options = getNormalizeModuleFederationOptions()
  return `
;() =>import("@module-federation/runtime");
    const localSharedImportMap = {
      ${Object.keys(shareds).map(pkg => `
        ${JSON.stringify(pkg)}: async () => {
          let pkg = await import("${getPreBuildLibPath(pkg)}")
          return pkg
        }
      `).join(",")}
    }
      const localShared = {
      ${Object.keys(shareds)
      .map((key) => {
        const shareItem = options.shared[removePathFromNpmPackage(key)];
        return `
          ${JSON.stringify(key)}: {
            name: ${JSON.stringify(shareItem.name)},
            version: ${JSON.stringify(shareItem.version)},
            scope: [${JSON.stringify(shareItem.scope)}],
            loaded: false,
            from: ${JSON.stringify(options.name)},
            async get () {
              localShared[${JSON.stringify(key)}].loaded = true
              const {${JSON.stringify(key)}: pkgDynamicImport} = localSharedImportMap 
              const res = await pkgDynamicImport()
              const exportModule = {...res}
              // All npm packages pre-built by vite will be converted to esm
              Object.defineProperty(exportModule, "__esModule", {
                value: true,
                enumerable: false
              })
              return function () {
                return exportModule
              }
            },
            shareConfig: {
              singleton: ${shareItem.shareConfig.singleton},
              requiredVersion: ${JSON.stringify(shareItem.shareConfig.requiredVersion)}
            }
          }
        `;
      })
      .join(',')}
    }
      export default localShared
      `
}

export const LOAD_SHARE_TAG = "__mf__loadShare_"
/**
 * generate loadShare virtual module
 */
const cacheMap1: Record<string, string> = {}
export function getLoadShareModulePath(pkg: string): string {
  const { name } = getNormalizeModuleFederationOptions()
  if (!cacheMap1[pkg]) cacheMap1[pkg] = packageNameEncode(name) + "_" + `${LOAD_SHARE_TAG}${packageNameEncode(pkg)}.js`
  const filename = cacheMap1[pkg]
  return resolve(emptyNpmDir, filename)
}
export function writeLoadShareModule(pkg: string, shareItem: ShareItem, command: string) {
  console.log(123123132, pkg)
  writeFileSync(getLoadShareModulePath(pkg), `
    () => import(${JSON.stringify(getPreBuildLibPath(pkg))}).catch(() => {});
    // dev uses dynamic import to separate chunks
    ${command !== "build" ? `;() => import(${JSON.stringify(pkg)}).catch(() => {});` : ''}
    const {loadShare} = require("@module-federation/runtime")
    const res = loadShare(${JSON.stringify(pkg)}, {
    customShareInfo: {shareConfig:{
      singleton: ${shareItem.shareConfig.singleton},
      strictVersion: ${shareItem.shareConfig.strictVersion},
      requiredVersion: ${JSON.stringify(shareItem.shareConfig.requiredVersion)}
    }}})
    const exportModule = ${command !== "build" ? "/*mf top-level-await placeholder replacement mf*/" : "await "}res.then(factory => factory())
    module.exports = exportModule
  `)
}


export function addShare(pkg: string) {
  console.log("dadadadaaddadd", pkg)
  shareds[pkg] = null
}