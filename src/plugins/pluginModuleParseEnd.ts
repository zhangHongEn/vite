import { Plugin } from "vite"
import { HOST_AUTO_INIT_QUERY_STR, WRAP_REMOTE_ENTRY_QUERY_STR } from "../virtualModules/virtualRemoteEntry"
import { getLocalSharedImportMapId } from "../virtualModules/virtualShared_preBuild"

let _resolve: any, _reject: any, promise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

let parseStartCount = 0,
  parseEndCount = 0,
  parsePromise = promise

;(global as any).parsePromise = promise
export default function (): Plugin[] {
  return [
    {
      enforce: "pre",
      name: "parseStart",
      load(id) {
        if (id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR) || id.includes(getLocalSharedImportMapId())) {
          console.log(123213, id)
          return
        }
        parseStartCount++
      }
    },
    {
      enforce: "post",
      name: "parseEnd",
      moduleParsed(module) {
        const id = module.id
        if (id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR) || id.includes(getLocalSharedImportMapId())) {
          console.log(123213, id)
          return
        }
        if (id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR) || id.includes(getLocalSharedImportMapId())) return
        parseEndCount++
        if (parseStartCount === parseEndCount) {
          _resolve(1)
        }
      }
    },
  ]
}
export {
  parsePromise
}
