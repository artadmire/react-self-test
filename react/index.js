import { render } from "./render";
import { createElement } from "./react";

// 用户的开发：
// react / preact / vue

const vnode = createElement(
  "ul",
  {
    id: "ul-test",
    className: "padding-20",
    style: {
      padding: "10px",
    },
  },
  createElement("li", { key: "li-0" }, "this is li 01")
);

const nextVNode = createElement(
  "ul",
  {
    style: {
      width: "100px",
      height: "100px",
      backgroundColor: "green",
    },
  },
  [
    createElement("li", { key: "li-b" }, "this is li b"),
    createElement("li", { key: "li-a" }, "this is li a"),
   
  ]
);

const lastVNode = createElement(
  "ul",
  {
    style: {
      width: "100px",
      height: "200px",
      backgroundColor: "pink",
    },
  },
  [
    createElement("li", { key: "li-c" }, "this is li c"),
    createElement("li", { key: "li-d" }, "this is li d"),
    createElement("li", { key: "li-a" }, "this is li a"),
  ]
);

setTimeout(() => render(vnode, document.getElementById("app")))
setTimeout(() => render(nextVNode, document.getElementById("app")),6000)
setTimeout(() => render(lastVNode, document.getElementById("app")),8000)
console.log(nextVNode);
