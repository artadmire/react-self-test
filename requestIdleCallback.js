
// function A() {
//     return <div className="main">
//                 <h2>hello</h2>
//                 <div id="list">
//                     <ul>
//                         <li>list 1</li>
//                         <li>list 2</li>
//                         <li>list 3</li>
//                         <li>list 4</li>
//                         <li>list 5</li>
//                     </ul>
//                 </div>
//             </div>
// }

// class B extends React.Component {

//     handleClick(){
//         new Array(5000).fill(0).forEach(setState)
//     }

//     render() {
//         return <div></div>
//     }
// }

// 虚拟 DOM


// function A_() {
//     return React.createElement("div", 
//                 { className: "main" }, 
//                 React.createElement("h2", null, "hello"), 
//                 React.createElement(
//                     "div", 
//                     { id: "list" }, 
//                     React.createElement("ul", null, 
//                         React.createElement("li", null, "list 1"), 
//                         /*#__PURE__*/React.createElement("li", null, "list 2"), 
//                         /*#__PURE__*/React.createElement("li", null, "list 3"), 
//                         /*#__PURE__*/React.createElement("li", null, "list 4"), 
//                         /*#__PURE__*/React.createElement("li", null, "list 5"))));
//   }

// const AVdom = {
//     type: 'div',
//     props: {
//         className: "main",
//         children: [
//             {
//                 type: 'h2',
//                 props: {
//                     children: [
//                         {
//                             value: "hello",
//                         }
//                     ]
//                 }
//             },
//             {
//                 type: "div",
//                 props: {
//                     id: "list",
//                     children: [
//                         ...
//                     ]
//                 }
//             }
//         ]
//     }
// }

// const workInProgress = {}

// while(workInProgress && shouldYield()) {
//     workInProgress = do(workInProgress);
// }

// function do(workInProgress) {
//     // todo
//     return workInProgress.child;
// }


/**
 * schedule —> 把我的任务放进一个队列里，然后以某一种节奏进行执行；
 * 
 */

// task 的任务队列
const queue = [];
const threshold = 1000 / 60;

const transtions = [];
let deadline = 0;

// 获取当前时间， bi  date-now 精确
const now = () => performance.now(); // 时间 ，精确
// 从任务queue中，选择第一个 任务 
const peek = arr => arr.length === 0 ? null : arr[0];

// schedule —> 把我的任务放进一个队列里，然后以某一种节奏进行执行；
export function schedule (cb) {
    queue.push(cb);
    startTranstion(flush);
}

// 此时，是否应该交出执行权 如果说有用户输入 或者执行时间太长(超时) 其实就是过了16.66ms
function shouldYield() {
    return navigator.scheduling.isInputPending() || now() >= deadline;
}

// 执行权的切换
function startTranstion(cb) {
    transtions.push(cb) && postMessage();
}

// 执行权的切换
const postMessage = (() => {
    const cb = () => transtions.splice(0, 1).forEach(c => c());
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = cb;
    return () => port2.postMessage(null);
})()

// 模拟实现 requestIdleCallback 方法
function flush() {
    // 生成时间，用于判断
    deadline = now() + threshold;
    let task = peek(queue);

    // 我还没有超出 16.666ms 同时，也没有更高的优先级打断我 就继续执行
    while(task && !shouldYield()) {
        const { cb } = task;
        const next = cb();
        // 相当于有一个约定，如果，你这个task 返回的是一个函数，那下一次，就从你这里接着跑
        // 那如果 task 返回的不是函数，说明已经跑完了。不需要再从你这里跑了
        if(next && typeof next === "function") {
            task.cb = next;
        } else {
            queue.shift()
        }
        task = peek(queue);
    }

    // 如果我的这一个时间片，执行完了，到了这里。
    task && startTranstion(flush)
}