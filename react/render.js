import { mount } from "./mount";
import { patch } from "./patch";

// step 1
// setTimeout(() => render(vnode, document.getElementById("app")))

// step 2
// setTimeout(() => render(null, document.getElementById("app")),5000)

export function render(vnode, parent) {
    let prev = parent.__vnode;
    if(!prev) {
        mount(vnode, parent);
        parent.__vnode = vnode;
    } else {
        if(vnode) {
            // 新旧两个
            patch(prev, vnode, parent);
            parent.__vnode = vnode;
        } else {
            parent.removeChild(prev.staticNode)
        }
    } 
}