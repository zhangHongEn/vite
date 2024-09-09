import { Manifest, Plugin } from 'vite';
import { getNormalizeModuleFederationOptions, getNormalizeShareItem } from '../utils/normalizeModuleFederationOptions';
import { packageNameDecode } from '../utils/packageNameUtils';
import { getWrapRemoteEntryImportId, LOAD_SHARE_TAG } from '../virtualModules';
import { getUsedRemotesMap } from '../virtualModules/virtualRemotes';

export let manifest = {
}

const Manifest = (): Plugin[] => {
  let manifestName: string
  return [
    {
      name: "moddule-federation-manifest",
      enforce: "post",
      config(config) {
        // (config.build || {}).manifest = true
      },
      configResolved(config) {
        manifestName = typeof config.build.manifest === "string" ? config.build.manifest : 'manifest.json'

      },
      generateBundle(options, bundle) {
        let mfmanifestName = "_nuxt/mf-manifest.json"
        this.emitFile({
          type: 'asset',
          fileName: mfmanifestName,
          source: "",
        });
        // https://github.com/vitejs/vite/blob/main/packages/vite/src/node/plugins/manifest.ts
        setTimeout(() => {
          let manifestJson
          // const { name } = getNormalizeModuleFederationOptions()
          for (const fileName in bundle) {
            const chunk = bundle[fileName];
            if (fileName.includes(manifestName) && !fileName.includes(mfmanifestName)) {
              console.log(333333, chunk)
              manifestJson = JSON.parse((chunk as any).source);
            }
          }
          for (const fileName in bundle) {
            if (fileName === mfmanifestName) {
              console.log(13333, generateMFManifest(manifestJson));
              (bundle[fileName] as any).source = generateMFManifest(manifestJson)
            }
          }
        });
      }
    }
  ]
};

function generateMFManifest(manifestJson: Manifest) {
  const options = getNormalizeModuleFederationOptions()
  const { name } = options
  const remoteEntry = {
    name: "",
    path: "",
    type: "esm"
  }
  Object.keys(manifestJson).forEach(key => {
    if (manifestJson[key].src?.includes(getWrapRemoteEntryImportId())) {
      remoteEntry.name = manifestJson[key].file
    }
  })
  const remotes: { federationContainerName: string, moduleName: string, alias: string, entry: string }[] = []
  const usedRemotesMap = getUsedRemotesMap()
  Object.keys(usedRemotesMap).forEach(remoteKey => {
    const usedModules = Array.from(usedRemotesMap[remoteKey])
    usedModules.forEach(moduleKey => {
      remotes.push({
        "federationContainerName": options.remotes[remoteKey].entry,
        "moduleName": moduleKey.replace(remoteKey, "").replace("/", ""),
        "alias": remoteKey,
        "entry": "*"
      })
    })
  })
  const shared = Object.keys(manifestJson).filter(fileName => {
    return fileName.includes(LOAD_SHARE_TAG)
  }).map(fileName => {
    if (fileName.includes(LOAD_SHARE_TAG)) {
      const sourceName = manifestJson[fileName].name || ""
      const shareKey = packageNameDecode(sourceName.split(LOAD_SHARE_TAG)[1])
      const shareItem = getNormalizeShareItem(shareKey)
      return {
        "id": `${name}:${shareKey}`,
        "name": shareKey,
        "version": shareItem.version,
        "requiredVersion": shareItem.shareConfig.requiredVersion,
        "assets": {
          "js": {
            "async": (manifestJson[fileName].dynamicImports || []),
            "sync": (manifestJson[fileName].imports || []).concat(manifestJson[fileName].file)
          },
          "css": {
            "async": manifestJson[fileName].css || [],
            "sync": []
          }
        }
      }
    }
  })
  const exposes = Object.keys(options.exposes).map(key => {
    const formatKey = key.replace("./", "")
    // TODO容错后缀
    const sourcePath = options.exposes[key].import.replace("./", "")
    const { imports, css, dynamicImports } = manifestJson[sourcePath]
    return {
      "id": name + ":" + formatKey,
      "name": formatKey,
      "assets": {
        "js": {
          "sync": (imports || []).concat(manifestJson[sourcePath].file),
          "async": dynamicImports || []
        },
        "css": {
          "sync": css,
          "async": []
        }
      },
      "path": key
    }
  })
  const result = {
    "id": name,
    "name": name,
    "metaData": {
      "name": name,
      "type": "app",
      "buildInfo": {
        "buildVersion": "1.0.0",
        "buildName": name
      },
      remoteEntry,
      ssrRemoteEntry: remoteEntry,
      "types": {
        "path": "",
        "name": "",
        // "zip": "@mf-types.zip",
        // "api": "@mf-types.d.ts"
      },
      "globalName": name,
      "pluginVersion": "0.2.5",
      "publicPath": "auto"
    },
    shared,
    remotes,
    exposes
  }
  return JSON.stringify(result)
}

export default Manifest;
