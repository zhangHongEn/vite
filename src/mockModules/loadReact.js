import {loadShare} from "@module-federation/runtime"
() => import("localReact")
console.log("loadReact")
export default function () {
  return loadShare("react")
}