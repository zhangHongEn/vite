import { Plugin } from "vite"
import { HOST_AUTO_INIT_QUERY_STR, WRAP_REMOTE_ENTRY_QUERY_STR } from "../virtualModules/virtualRemoteEntry"
import { getLocalSharedImportMapId } from "../virtualModules/virtualShared_preBuild"

let _resolve: any, _reject: any, promise = new Promise((resolve, reject) => {
  _resolve = resolve
  _reject = reject
})

let parsePromise = promise

  ; (global as any).parsePromise = promise
const parseStartSet = new Set()
const parseEndSet = new Set()
export default function (): Plugin[] {
  return [
    {
      enforce: "pre",
      name: "parseStart",
      load(id) {
        if (id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR) || id.includes("REMOTE_ENTRY_ID") || id.includes(getLocalSharedImportMapId())) {
          return
        }
        parseStartSet.add(id)
      }
    },
    {
      enforce: "post",
      name: "parseEnd",
      moduleParsed(module) {
        const id = module.id
        if (id.includes(HOST_AUTO_INIT_QUERY_STR) || id.includes(WRAP_REMOTE_ENTRY_QUERY_STR)) return
        parseEndSet.add(id)
        if (parseStartSet.size === parseEndSet.size) {
          _resolve(1)
        }
      }
    },
  ]
}
export {
  parsePromise
}
