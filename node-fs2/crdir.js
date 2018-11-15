// 创建目录 和删除目录

let fs = require('fs');
let path = require('path');
// fs.mkdir(path,[mode],callback);
/*
 path：被创建目录的完整路径及目录名
 mode：目录权限，默认0777可读可写可执行
 callback(err)：err错误对象
* */

// fs.mkdir('m/n',function (err) {
//     if(err) throw err;
//     console.log('创建目录成功');
// });
/*
创建目录注意的点：
1、必须保证其上一级目录是存在的
2、目录已存在，是不会再次被创建的
* */

// 同步创建多层目录
// function dirSync(p) {
//     // 将路径拆分成数组
//     let dirs = p.split('/'); //[ 'n', 'r', 'c' ]
//     for(let i=0;i<dirs.length;i++){
//         // 将得到的数组，组成多层次的路径，便于依次创建目录
//         let currentPath = dirs.slice(0,i+1).join('/');
//         try{
//             fs.accessSync(currentPath);
//         }catch (e){
//             fs.mkdirSync(currentPath);
//         }
//     }
// }
// dirSync('n/r/c');

// 异步创建多层目录
// function dir(p,callback) {
//     let dirs = p.split('/');
//     let i = 0;
//     function next() {
//         if(i === dirs.length) callback();
//         let currentPath = dirs.slice(0,++i).join('/');
//         fs.access(currentPath,function (err) {
//             if(err){
//                 fs.mkdir(currentPath,function () {
//                     next()
//                 })
//             }else {
//                 next()
//             }
//         })
//     }
//     next();
// }
//
// dir('m/n/v',function () {
//     console.log('目录创建成功');
// });


// 同步 删除目录
// fs.rmdirSync()
// 同步 删除文件
// fs.unlinkSync('m/n/v/11.js');
/*
注意：删除文件夹时，要确保当前的文件夹是空的，否则报错
* */

// 同步 对多层目录结构进行删除
// function removeSync(p) {
//     // 获取当前目录的状态
//     let statObj = fs.statSync(p);
//     // 是否为文件夹
//     if(statObj.isDirectory()){ // 是目录
//         // 获取当前目录的下一层目录
//         let dirs = fs.readdirSync(p);
//         // 获取完整的子目录路径
//         dirs = dirs.map(d => path.join(p,d));
//         // 对子目录进行遍历
//         dirs.forEach(d=>{
//             // 根据判断结果依次删除
//             removeSync(d)
//         });
//         // 最后删除当前的目录
//         fs.rmdirSync(p);
//     }else { // 是文件
//         // 删除当前文件
//         fs.unlinkSync(p);
//     }
// }
//
// removeSync('m');


// 广度删除目录，
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
//
//
// remove('m',()=>{
//     console.log('目录删除成功');
// });

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