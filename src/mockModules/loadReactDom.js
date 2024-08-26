import {loadShare} from "@module-federation/runtime"
() => import("localReactDom")
console.log("loadReactDom")
export default function () {
  return loadShare("react-dom")
}