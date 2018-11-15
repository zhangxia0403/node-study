/**
 * 异步 广度 删除目录
 */

// const fs = require('fs');
// const path = require('path');
// function remove(p,callback){
//     // 创建空数组，存储所有的目录
//     let arr = [p];
//
//     function next(i) {
//         // 目录下的所有子目录都存好后，开始依次删除
//         if(i === arr.length) return removeDir();
//         // 获取当前文件夹
//         let curPath = arr[i];
//         // 获取当前文件的状态
//         fs.stat(curPath,function (err,statObj) {
//             // 判断是否为文件夹
//             if(statObj.isDirectory()){ // 是
//                 // 读取文件的下一层目录
//                 fs.readdir(curPath,function (err,dirs) {
//                     // 组成完整的路径
//                     dirs = dirs.map(d=>path.join(curPath,d));
//                     // 合并数组
//                     arr = [...arr,...dirs];
//                     next(++i);
//                 })
//             }else {
//                 next(++i)
//             }
//
//         })
//
//     }
//     next(0);
//
//     function removeDir() {
//         function next(i) {
//             // 删除完成就触发成功的回调
//             if(i < 0) callback();
//             // 拿到当前要操作的路径
//             let curPath = arr[i];
//
//             fs.stat(curPath,function (err,statObj) {
//                 if(statObj.isDirectory()){
//                     fs.rmdir(curPath,()=>next(i-1));
//                 }else {
//                     fs.unlink(curPath,()=>next(i-1))
//                 }
//             })
//         }
//         next(arr.length - 1)
//     }
//
// }
//
// remove('m',()=>{
//     console.log('目录删除成功');
// });



/**
 * async await
 * 广度删除目录
 * */
const { promisify } = require('util');
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);

async function remove(p,callback) {
    let arr = [p];
    let i = 0;
    while (i !== arr.length){
        let curpath = arr[i];
        let statObj = await stat(curpath);
        if(statObj.isDirectory()){
            let dirs = await readdir(curpath);
            dirs = dirs.map(d => path.join(curpath,d));
            arr = [...arr,...dirs]
        }
        i++;
    }
    let curpath;
    while(curpath = arr.pop()){
        let statObj = await stat(curpath);

        if(statObj.isDirectory()){
            await rmdir(curpath);
        }else {
            await unlink(curpath);
        }
    }
}
remove('m').then(()=>{
    console.log('目录删除成功');
});