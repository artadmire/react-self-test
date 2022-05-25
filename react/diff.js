import { mount } from './mount.js'
import { patch } from './patch.js'

export const diff = (prev, next, parent) => {
  let prevMap = {}
  let nextMap = {}

  // 遍历我的老的 children
  for (let i = 0; i < prev.length; i++) {
    let { key = i + '' } = prev[i]
    prevMap[key] = i
  }

  let lastIndex = 0
  // 遍历我的新的 children
  for (let n = 0; n < next.length; n++) {
    let { key = n + '' } = next[n]
    // 老的节点
    let j = prevMap[key]
    // 新的 child
    let nextChild = next[n]
    nextMap[key] = n
    // 老的children      新的children
    // [b, a]           [c, d, a]  =>  [c, b, a]  --> c
    // [b, a]           [c, d, a]  =>  [c, d, b, a]  --> d
    
    if (j == null) {
      // 从老的里面，没有找到。新插入 上个节点的下个节点的前面去插入 就是在两个节点中间插入
      let refNode = n === 0 ? prev[0].staticNode : next[n - 1].staticNode.nextSibling
      mount(nextChild, parent, refNode)
    }
    else {
      // [b, a]           [c, d, a]  =>  [c, d, a, b]  --> a
      // 如果找到了，我 patch 
      patch(prev[j], nextChild, parent)

      if (j < lastIndex) {
        // 上一个节点的下一个节点的前面，执行插入
        let refNode = next[n - 1].staticNode.nextSibling;
        parent.insertBefore(nextChild.staticNode, refNode)
      }
      else {
        lastIndex = j
      }
    }
  }
  // [b, a]           [c, d, a]  =>  [c, d, a]  --> b
  for (let i = 0; i < prev.length; i++) {
    let { key = '' + i } = prev[i]
    if (!nextMap.hasOwnProperty(key)) parent.removeChild(prev[i].staticNode)
  }
}
