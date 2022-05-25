
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function () {
  'use strict';

  const diff = (prev, next, parent) => {
    let prevMap = {};
    let nextMap = {};

    // 遍历我的老的 children
    for (let i = 0; i < prev.length; i++) {
      let { key = i + '' } = prev[i];
      prevMap[key] = i;
    }

    let lastIndex = 0;
    // 遍历我的新的 children
    for (let n = 0; n < next.length; n++) {
      let { key = n + '' } = next[n];
      // 老的节点
      let j = prevMap[key];
      // 新的 child
      let nextChild = next[n];
      nextMap[key] = n;
      // 老的children      新的children
      // [b, a]           [c, d, a]  =>  [c, b, a]  --> c
      // [b, a]           [c, d, a]  =>  [c, d, b, a]  --> d
      
      if (j == null) {
        // 从老的里面，没有找到。新插入 上个节点的下个节点的前面去插入 就是在两个节点中间插入
        let refNode = n === 0 ? prev[0].staticNode : next[n - 1].staticNode.nextSibling;
        mount(nextChild, parent, refNode);
      }
      else {
        // [b, a]           [c, d, a]  =>  [c, d, a, b]  --> a
        // 如果找到了，我 patch 
        patch(prev[j], nextChild, parent);

        if (j < lastIndex) {
          // 上一个节点的下一个节点的前面，执行插入
          let refNode = next[n - 1].staticNode.nextSibling;
          parent.insertBefore(nextChild.staticNode, refNode);
        }
        else {
          lastIndex = j;
        }
      }
    }
    // [b, a]           [c, d, a]  =>  [c, d, a]  --> b
    for (let i = 0; i < prev.length; i++) {
      let { key = '' + i } = prev[i];
      if (!nextMap.hasOwnProperty(key)) parent.removeChild(prev[i].staticNode);
    }
  };

  function patchChildren(prev, next, parent) {
      // diff 整个的逻辑还是耗性能的，所以，我们可以先提前做一些处理。
      if(!prev) {
          if(!next) ; else {
              next = Array.isArray(next) ? next : [next];
              for(const c of next) {
                  mount(c, parent);
              }
          }
      } else if (prev && !Array.isArray(prev)) {
          // 只有一个 children
          if(!next) parent.removeChild(prev.staticNode);
          else if(next && !Array.isArray(next)) {
              patch(prev, next, parent);
          } else {
              // 如果prev 只有一个节点，next 有多个节点
              parent.removeChild(prev.staticNode);
              for(const c of next) {
                  mount(c, parent);
              }
          }
      } else diff(prev, next, parent);
  }

  function patch (prev, next, parent) {
      // type: 'div' -> 'ul'
      if(prev.type !== next.type) {
          parent.removeChild(prev.staticNode);
          mount(next, parent);
          return;
      }

      // type 一样，diff props 
      // 先不看 children 
      const { props: { children: prevChildren, ...prevProps}} = prev;
      const { props: { children: nextChildren, ...nextProps}} = next;
      // patch Porps
      const staticNode = (next.staticNode = prev.staticNode);
      for(let key of Object.keys(nextProps)) {
          let prev = prevProps[key],
          next = nextProps[key];
          patchProps(key, prev, next, staticNode);
      }

      for(let key of Object.keys(prevProps)) {
          if(!nextProps.hasOwnProperty(key)) patchProps(key, prevProps[key], null, staticNode);
      }

      // patch Children ！！！
      patchChildren(
          prevChildren,
          nextChildren,
          staticNode
      );

  }


  function patchProps(key, prev, next, staticNode) {
      // style 
      if(key === "style") {
          // margin: 0 padding: 10
          if(next) {
              for(let k in next) {
                  staticNode.style[k] = next[k];
              }
          }
          if(prev) {
          // margin: 10; color: red
              for(let k in prev) {
                  if(!next.hasOwnProperty(k)) {
                      // style 的属性，如果新的没有，老的有，那么老的要删掉。
                      staticNode.style[k] = "";
                  }
              }
          }
      }

      else if(key === "className") {
          if(!staticNode.classList.contains(next)) {
              staticNode.classList.add(next);
          }
      }

      // events
      else if(key[0] === "o" && key[1] === 'n') {
          prev && staticNode.removeEventListener(key.slice(2).toLowerCase(), prev);
          next && staticNode.addEventListener(key.slice(2).toLowerCase(), next);

      } else if (/\[A-Z]|^(?:value|checked|selected|muted)$/.test(key)) {
          staticNode[key] = next;

      } else {
          staticNode.setAttribute && staticNode.setAttribute(key, next);
      }
  }

  const normalize = (children = []) => children.map(child => typeof child === 'string' ? createVText(child): child);

  const NODE_FLAG = {
      EL: 1, // 元素 element 01
      TEXT: 1 << 1 // 向左移动一位 是2
  };
  // El & TEXT  = 0


  const createVText = (text) => {
      return {
          type: "",
          props: {
              nodeValue: text + ""
          },
          $$: { flag: NODE_FLAG.TEXT }
      }
  };

  const createVNode = (type, props, key, $$) => {
      return {
          type, 
          props,
          key,
          $$,
      }
  };

  const createElement = (type, props, ...kids) => {
      props = props || {};
      let key = props.key || void 0;
      
      kids = normalize(props.children || kids);

      if(kids.length) props.children = kids.length === 1? kids[0] : kids;

      // 定义一下内部的属性
      const $$ = {};
      $$.staticNode = null;
      $$.flag = type === "" ? NODE_FLAG.TEXT: NODE_FLAG.EL;

      return createVNode(type, props, key, $$)
  };

  function mount(vnode, parent, refNode) {
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

  // step 1
  // setTimeout(() => render(vnode, document.getElementById("app")))

  // step 2
  // setTimeout(() => render(null, document.getElementById("app")),5000)

  function render(vnode, parent) {
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
              parent.removeChild(prev.staticNode);
          }
      } 
  }

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

  setTimeout(() => render(vnode, document.getElementById("app")));
  setTimeout(() => render(nextVNode, document.getElementById("app")),6000);
  setTimeout(() => render(lastVNode, document.getElementById("app")),8000);
  console.log(nextVNode);

})();
