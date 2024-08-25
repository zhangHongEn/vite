import { createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { Plugin, UserConfig } from 'vite';
import { NormalizedShared } from '../utils/normalizeModuleFederationOptions';
import { packageNameDecode } from '../utils/packageNameUtils';
import { wrapManualChunks } from '../utils/wrapManualChunks';
import { addShare, generateLocalSharedImportMap, getLoadShareModulePath, getLocalSharedImportMapId, LOAD_SHARE_TAG, writeLoadShareModule, writePreBuildLibPath } from '../virtualModules/virtualShared_preBuild';
export function proxySharedModule(
  options: { shared?: NormalizedShared; include?: string | string[]; exclude?: string | string[] }
): Plugin[] {
  let { shared = {}, include, exclude } = options;
  const filterFunction = createFilter(include, exclude);
  // writeLocalSharedImportMap(Object.keys(shared))
  return [
    {
      name: "generateLocalSharedImportMap",
      enforce: "post",
      resolveId(id) {
        if (id.includes(getLocalSharedImportMapId()))
        return id
      },
      load(id) {
        if (id.includes(getLocalSharedImportMapId())){
          console.log("__mf__localSharedImportMap__mf__localSharedImportMap")
          return generateLocalSharedImportMap()
        }
      },
      transform(code, id) {
        if (id.includes(getLocalSharedImportMapId())){
          return generateLocalSharedImportMap()
        }
      }
    },
    {
      name: 'preBuildShared',
      enforce: 'post',
      config(config: UserConfig, { command }) {
        if (!config.build) config.build = {};
        if (!config.build.rollupOptions) config.build.rollupOptions = {};
        let { rollupOptions } = config.build;
        if (!rollupOptions.output) rollupOptions.output = {};
        // config?.optimizeDeps?.include?.push?.("an-empty-js-file");
        // config.optimizeDeps.needsInterop.push('an-empty-js-file');
        wrapManualChunks(config.build.rollupOptions.output, (id: string) => {
          if (id.includes("node_modules/@module-federation/runtime")) {
            return "@module-federation/runtime"
          }
          if (id.includes(LOAD_SHARE_TAG) || id.includes("__mf__prebuildwrap_")) {
            return id.split("/").pop()
          }
        });
        config?.optimizeDeps?.include?.push('an-emtpy-js-file');
        ; (config.resolve as any).alias.push(
          ...Object.keys(shared).map((key) => {
            
            config?.optimizeDeps?.needsInterop?.push(key);
            return {
              // Intercept all dependency requests to the proxy module
              // Dependency requests issued by localSharedImportMap are allowed without proxying.
              find: new RegExp(`(^${key}(\/.+)?$)`), replacement: "$1", customResolver(source: string, importer: string) {
                // if (importer.includes(`node_modules/${source}/`)) {
                //   console.log(250250, importer, source)
                //   return (this as any).resolve(source)
                // }
                const loadSharePath = getLoadShareModulePath(source)
                config?.optimizeDeps?.needsInterop?.push(loadSharePath);
                console.log(155555, source, importer)
                // write proxyFile
                writeLoadShareModule(source, shared[key], command)
                addShare(source)
                // config?.optimizeDeps?.include?.push?.(getPreBuildLibPath(source));
                // console.log(5555, getPreBuildLibPath(source).replace("__mf__prebuildwrap_", ""))
                writePreBuildLibPath(source)
                config?.optimizeDeps?.include?.push?.("__mf__prebuildwrapa_abcabc");
                return (this as any).resolve(loadSharePath)
              }
            }
          })
        );
        (config.resolve as any).alias.push(
          ...Object.keys(shared).map((key) => {
            return command === "build" ?
            { find: new RegExp(`__mf__prebuildwrap_(.+)`), replacement: function (_: string, $1: string) {
              console.log(123999, packageNameDecode($1))
              return packageNameDecode($1)
            } } :
            { find: new RegExp(`__mf__prebuildwrap_(.+)`), customResolver(source: string, importer: string) {
              console.log(9999999, source)
                  return (this as any).resolve("react-dom")
                }
            }
          })
        );
        (config.resolve as any).alias.push(
          ...Object.keys(shared).map((key) => {
            return { find: new RegExp(`__mf__prebuildwrapa/abcabc`), customResolver(source: string, replacement:"$$$aad", importer: string) {
              console.log(999999910, source)
                  return (this as any).resolve("vue")
                }
            }
          })
        );
      },
    },
    {
      name: "prebuild-top-level-await",
      apply: "serve",
      transform(code: string, id: string): { code: string; map: any } | null {
        if (!(code.includes("/*mf top-level-await placeholder replacement mf*/"))) {
          return null
        }
        if (!filterFunction(id)) return null;
        let ast: any;
        try {
          ast = (this as any).parse(code, {
            allowReturnOutsideFunction: true,
          });
        } catch (e) {
          throw new Error(`${id}: ${e}`);
        }

        const magicString = new MagicString(code);

        walk(ast, {
          enter(node: any) {
            // 处理命名导出
            if (node.type === 'ExportNamedDeclaration' && node.specifiers) {
              const exportSpecifiers = node.specifiers.map((specifier: any) => specifier.exported.name);
              const proxyStatements = exportSpecifiers.map((name: string) => `
                const __mfproxy__await${name} = await ${name}();
                const __mfproxy__${name} = () => __mfproxy__await${name};
              `).join('\n');
              const exportStatements = exportSpecifiers.map((name: string) => `__mfproxy__${name} as ${name}`).join(', ');

              const start = node.start;
              const end = node.end;
              const replacement = `${proxyStatements}\nexport { ${exportStatements} };`;

              magicString.overwrite(start, end, replacement);
            }

            // 处理默认导出
            if (node.type === 'ExportDefaultDeclaration') {
              const declaration = node.declaration;
              const start = node.start;
              const end = node.end;

              let proxyStatement;
              let exportStatement = 'default';

              if (declaration.type === 'Identifier') {
                // 处理标识符 (如: export default foo;)
                proxyStatement = `
                  const __mfproxy__awaitdefault = await ${declaration.name}();
                  const __mfproxy__default = __mfproxy__awaitdefault;
                `;
              } else if (declaration.type === 'CallExpression' || declaration.type === 'FunctionDeclaration') {
                // 处理调用表达式或函数声明 (如: export default someFunction();)
                const declarationCode = code.slice(declaration.start, declaration.end);
                proxyStatement = `
                  const __mfproxy__awaitdefault = await (${declarationCode});
                  const __mfproxy__default = __mfproxy__awaitdefault;
                `;
              } else {
                // 其他类型 (可以根据需要添加更多处理逻辑)
                proxyStatement = `
                  const __mfproxy__awaitdefault = await (${code.slice(declaration.start, declaration.end)});
                  const __mfproxy__default = __mfproxy__awaitdefault;
                `;
              }

              const replacement = `${proxyStatement}\nexport { __mfproxy__default as ${exportStatement} };`;

              magicString.overwrite(start, end, replacement);
            }
          }
        });
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true }),
        };
      },
    }
  ]
}
