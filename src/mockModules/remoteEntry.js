export function init() {
  console.log("init registered")
  window.map = {
    react() {
      return import('localReact');
    },
    reactDom() {
      return import('localReactDom');
    },
  };
}
export function get() {
  return window.map
}