import { patchProps } from "./patch";
import { NODE_FLAG } from "./react";

export function mount(vnode, parent, refNode) {
    // 为什么会有一个 refNode?
    /**        这个位置插入 | 插入节点 （这个时候refNode就是最后一个li）
     * 假如： ul ->  li  li  li(refNode) 
     */
    if(!parent) throw new Error('no container');
    const $$ = vnode.$$;

    if($$.flag & NODE_FLAG.TEXT) {
        // 如果是一个文本节点
        const el = document.createTextNode(vnode.props.nodeValue);
        vnode.staticNode = el;
        parent.appendChild(el);
    } else if($$.flag & NODE_FLAG.EL) {
        // 如果是一个元素节点的情况，先不考虑是一个组件的情况；
        const { type, props } = vnode;
        const staticNode = document.createElement(type);
        vnode.staticNode = staticNode;

        // 我们再来处理，children 和后面的内容
        const { children, ...rest} = props;
        if(Object.keys(rest).length) {
            for(let key of Object.keys(rest)) {
                // 属性对比的函数
                patchProps(key, null, rest[key], staticNode);
            }
        }

        if(children) {
            // 递归处理子节点
            const __children = Array.isArray(children) ? children : [children];
            for(let child of __children) {
                mount(child, staticNode);
            }
        }
        refNode ? parent.insertBefore(staticNode, refNode) : parent.appendChild(staticNode);
    }
   
}