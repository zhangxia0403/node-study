问题1.

const promise = new Promise((resolve, reject) => { // 同步代码顺序执行
  console.log(1)
  resolve()
  console.log(2)
})
promise.then(() => { // 异步代码在同步之后执行
  console.log(3)
});

// 输出1,2,3



问题2.

Promise.resolve(1)
.then((res) => {
  console.log(res)  // 1
  return 2  // 返回的是普通类型值，直接走then的成功态回调
}).catch((err) =>3)
.then(res => console.log(res))  // 2



问题3.

实现 Promise.finally 并说下finally的含义
finally 就是不管函数执行的结果，都会执行finally函数，并且把上一个函数的状态原封不动的传递给下一个then
Promise.finally = (callback) => {
    return this.then(data => {
        return new Promise.resolve(callback).then(()=> data)
    },err => {
        callback();
        return new Promise.resolve(callback).then(() => {
            throw err
        })
    })
};

问题4.

async、await 优缺点
优点：1、是异步操作更简洁，更像是同步代码，不像promise的then方法，虽然解决了函数的回调问题，但是链式then的方法使代码看起来很臃肿，难以维护
缺点：await必须后面的代码必须等前面的代码执行完成，才能执行，会导致线程堵塞


问题5.

Promise.resolve(1)
  .then((x) => x + 1)  // 2
  .then((x) => { throw new Error('My Error') })
  .catch(() => 1)  // 1
  .then((x) => x + 1)  // 2
  .then((x) => console.log(x))  // 2
  .catch(console.error)
// 2

问题6.

Promise 在事件循环中的执行过程是怎样的？
1、promis在新建时，会先执行promise中的代码，因为这是同步的
2、promise.then()中的代码会等到promise中代码执行完成
3、如果我们在promise的代码中添加setTimeout,让其变为异步，此时then中的函数会先执行，因为promise中的函数为宏任务，微任务会先于宏任务执行

问题7.

谈一谈 你对promise的理解
1、promise的出现是为了解决函数回调的问题，相对于函数的回调，层层嵌套，promise的链式then闲的结构更加清晰，便于维护
2、promise的特点，
    promise具有pending fulfilled rejected三种状态，并且
    只能是 pending => fulfilled
       或 pending => rejected
    状态一旦发生改变，就不会再次改变
3、Promise的三个缺点
   无法取消Promise,一旦新建它就会立即执行，无法中途取消
   如果不设置回调函数，Promise内部抛出的错误，不会反映到外部
   当处于pending状态时，无法得知目前进展到哪一个阶段，是刚刚开始还是即将完成