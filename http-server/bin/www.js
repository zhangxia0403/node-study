#! /usr/bin/env node
// console.log('node-fs2 环境下运行');

// 命令行下解析用户执行的参数  commander
// console.log(process.argv);
let package = require('../package.json');
let comd = require('commander');

// let mg = comd
//     .version(package.version)
//     .option('-p,--port <v>','server port')
//     .parse(process.argv);
// console.log(mg);
// 报错 option `-o,--host <v>' argument missing
// 解决-p后面需要带参数 zx-server -p 3000


// 用户没有输入参数 设置默认的参数
let parser = {
    port: 3000,
    host: 'localhost',
    dir: process.cwd() // 获取当前目录
};


// 监听一个自定义事件
comd.on('--help',function () {
    console.log('Usage:');
    console.log('  you need help');
});



let argvs = comd
    .version(package.version)  // commander提供的
    .option('-p,--port <v>','server port')  // 自己配置port 执行 zx-server -p 能获取port
    .option('-o,--host <v>','server hostname')  // 域名...
    .option('-d,--dir <v>','server directory') // 目录...
    .parse(process.argv);

// parser = {...parser,...argvs}; // 将解析的结果重新赋值给parser
// console.log(parser); // 命令行输入zx-server 输出最终的解析结果

let Server = require('../server');
let server = new Server({...parser,...argvs});
server.start(); // 启动服务
