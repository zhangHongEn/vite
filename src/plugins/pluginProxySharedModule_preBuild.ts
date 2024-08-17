import { createFilter } from '@rollup/pluginutils';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import { Plugin, UserConfig } from 'vite';
import { NormalizedShared } from '../utils/normalizeModuleFederationOptions';
import { getLoadShareModulePath, writeLoadShareModule, writeLocalSharedImportMap } from '../virtualModules/virtualShared_preBuild';
export function proxySharedModule(
  options: { shared?: NormalizedShared; include?: string | string[]; exclude?: string | string[] }
): Plugin[] {
  let { shared = {}, include, exclude } = options;
  const filterFunction = createFilter(include, exclude);
  writeLocalSharedImportMap(Object.keys(shared))
  return [
    {
      name: 'preBuildShared',
      enforce: 'post',
      config(config: UserConfig, { command }) {
        // config?.optimizeDeps?.include?.push?.("an-empty-js-file");
        // config.optimizeDeps.needsInterop.push('an-empty-js-file');
        Object.keys(shared).forEach((key) => {
          const proxyEntire = {
            // Intercept all dependency requests to the proxy module
            // Dependency requests issued by localSharedImportMap are allowed without proxying.
            find: new RegExp(`^${key}$`), replacement: key, customResolver(source: string, importer: string) {
              writeLoadShareModule(source, shared[key], command)
              const preBuildLibPath = getLoadShareModulePath(source)
              // if (importer.includes(`node_modules/${key}/`)) {
              //   return (this as any).resolve(key)
              // }
              config?.optimizeDeps?.include?.push?.(preBuildLibPath);
              return (this as any).resolve(preBuildLibPath)
            }
          }
          const proxyDirectory = {
            // Intercept all dependency requests to the proxy module
            // Dependency requests issued by localSharedImportMap are allowed without proxying.
            find: new RegExp(`^(${key}\/.*)`), replacement: "$1", customResolver(source: string, importer: string) {
              writeLoadShareModule(source, shared[key], command)
              const preBuildLibPath = getLoadShareModulePath(source)
              // if (importer.includes(`node_modules/${key}/`)) {
              //   return (this as any).resolve(key)
              // }
              console.log(11122234, source, preBuildLibPath)
              config?.optimizeDeps?.include?.push?.(preBuildLibPath);
              return (this as any).resolve(preBuildLibPath)
            }
          }
          const preBuildLibPath = getLoadShareModulePath(key)
            ; (config.resolve?.alias as any).push({
              find: new RegExp(`^${preBuildLibPath}$`), customResolver(source: string, importer: string) {
                console.log("newal", source)

                return (this as any).resolve(key)
              }
            })
            ; (config.resolve?.alias as any).push(proxyEntire, proxyDirectory)
        })
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
              console.log('loadsharestart')
                const __mfproxy__await${name} = await (${name}()).catch(e => console.error(11111, e)||e.e.e);
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