import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "pathe";
import { packageNameEncode } from "../utils/packageNameUtils";

const emptyNpmDir = resolve("./node_modules/__mf__virtual")
try {
  mkdirSync(emptyNpmDir)
} catch (e) { }
writeFileSync(resolve(emptyNpmDir, "empty.js"), "")
writeFileSync(resolve(emptyNpmDir, "package.json"), JSON.stringify({
  name: "__mf__virtual",
  main: "empty.js"
}))

/**
 * 在node_modules/__mf__virtual/*下物理生成文件作为虚拟模块
 * 因为插件无法干预vite prebunding
 */
export default class VirtualModule {
  name: string
  constructor(name: string) {
    this.name = name
  }
  getPath() {
    return resolve(emptyNpmDir, this.getTag())
  }
  getTag() {
    return `__mf__${packageNameEncode(this.name)}`
  }
  write(code: string) {
    writeFileSync(this.getPath() + ".js", code)
  }

}