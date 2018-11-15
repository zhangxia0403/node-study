
/*
 commonjs 规范一个文件就是一个模块，拥有单独的作用域；
 普通方式定义的变量、函数、对象都属于该模块内；
 通过require来加载模块；
 通过exports和modul.exports来暴露模块中的内容
 1、取得文件名
 根据文件扩展名判断文件类型
 2、加载模块，取得文件内容
 * */


const path = require('path');
const fs = require('fs');
const vm = require('vm');

// 1、首先创建一个模块，模块上存一些变量，属性
function Module(fileurl) {
    // 存储路径
    this.fileurl = fileurl;
    // 存储要输出的内容
    this.exports = {};
}

// 3、对应的文件作对应的事
Module.extensions = {
    '.js'(module){  // 要将文件中的内容执行，返回执行结果
        // 首先要拿到要执行的内容
        let content = fs.readFileSync(module.fileurl,'utf8');
        // 将函数拆分为两部分
        let moduleWrap = ['(function(exports,module,require,__filename,__dirname){','})'];
        // 将函数与执行的内容进行拼接，获得一个完整的函数
        let script = moduleWrap[0] + content + moduleWrap[1];
        // 此时获取的是一个函数字符串，我们要将函数执行
        // vm.runInThisContext 不访问函数外部的变量，也不导致外部变量受到污染
        // 函数内外变量同名时，只改变函数内的，函数外的不变
        // eval 函数内外变量同名时，不仅改变函数内的，也改变函数外的
        vm.runInThisContext(script).call(
            module.exports, // 第一个改变this指向
            module.exports, // 函数参数
            module,
            req
        );
    },
    '.json'(module){  // 只需要将文件内容显示出来
        // 接受参数，给module.exports重新赋值
        module.exports = JSON.parse(fs.readFileSync(module.fileurl,'utf8'))
    }
};

// 定义的变量、函数、对象都属于该模块内
// 2、在模块上定义解析路径的方法
Module._resolveFilename = function (filename) {
    // 拿到文件的绝对路径
    let asbpath = path.resolve(__dirname,filename);
    // 判断路径是否有扩展名，没有就加上
    // node在加载模块时，会找文件的路径，看他是那种类型文件，如果没有后缀名就会自动给添上
    // 顺序是 .js  .json

    // 没有扩展名
    if(!path.extname(asbpath)){
        // 取出Module.extensions的key
        let ext =  Object.keys(Module.extensions);
        // 循环key值，判断文件的类型
        for(let i=0;i<ext.length;i++){
            let r = asbpath + ext[i];
            try{
                // 这个文件是否能被访问
                fs.accessSync(r);
                return r; // 直接把路径输出
            }catch (e){

            }
        }
    }

};


// 4、加载文件所在的模块
Module._load = function (filename) {
    // 当前需要引用的地址
    let abspath = Module._resolveFilename(filename);
    // 创建模块
    let module = new Module(abspath);
    // 取得引用路径的扩展名
    let exts = path.extname(module.fileurl);
    // 根据扩展名执行 Module.extensions 中对应的方法
    // 将模版作为参数传入
    Module.extensions[exts](module);

    return module.exports
};


function req(filename) {
    return Module._load(filename)
}


// 加载模块
let d = req('./index');
console.log('我是执行的结果',d);

let dd = require('./index');
console.log(dd);

