// 服务端主要逻辑
const http = require('http');
// const fs = require('fs');
const path = require('path');
const url = require('url');
// const { promisify } = require('util');
let zlib = require('zlib');


// 第三方模块
const fs = require('mz/fs'); // 返回的每一个模块都是promise 不需要用promisify一个个包
const ejs = require('ejs');
const mime = require('mime');
const chalk = require('chalk'); // 粉笔 添加颜色
const debug = require('debug')('dev');
let {readFileSync} = require('fs');
const crypto = require('crypto'); // crypto 模块提供了加密功能

let tmpl = readFileSync(path.join(__dirname, 'template.html'), 'utf8');



class Server{
    constructor(config){
        this.config = config;
        this.tmpl = tmpl;
    }

    // 发送请求的回调函数
    async handleRequest(req,res){
        let {dir} = this.config;
        let {pathname} = url.parse(req.url);
        let realPath = decodeURIComponent(path.join(dir,pathname));
        try{
            let statObj = await fs.stat(realPath);

            if(statObj.isDirectory()){
                // 启动服务后，默认把当前文件夹的内容 展示给用户
                // 先看当前的路径是不是文件夹，是文件夹，找index.html，没有index.html，返回读取目录的结果
                // 如果是文件，直接显示
                let html = path.join(realPath,'index.html');
                try{

                    await fs.access(html);
                    this.sendFile(req,res,null,html);

                }catch (e){

                    // 获取当前目录下的文件列表
                    let dirs = await fs.readdir(realPath);
                    // console.log('文件目录',dirs);  // 列出文件目录
                    // 文件目录列表 映射到template.html中
                    let renderStr = ejs.render(this.tmpl,{
                        dirs: dirs.map(item => ({
                            name: item,  //  路径的名字
                            path: path.join(pathname, item)  //  请求的路径
                        }))
                    });
                    console.log('文件',renderStr);
                    res.setHeader('Content-Type','text/html;charset=utf8');
                    res.end(renderStr);
                }

            }else { // 是文件直接发送请求
                this.sendFile(req,res,statObj,realPath);
            }

        }catch (e){
            debug(e);
            this.sendError(req,res,e)
        }

    }

    sendFile(req,res,statObj,realPath){

        res.setHeader('Content-Type',mime.getType(realPath)+';charset=utf8');


        // 缓存 304
        this.setCache(req,res,realPath);

        // 分段传输 206
        let range = this.setRange(req,res,realPath);


        // 压缩 gzip deflate
        let gzip;
        if(gzip = this.gzip(req,res)){
            if(range){
                let {start ,end} = range;
                fs.createReadStream(realPath,{start,end}).pipe(gzip).pipe(res);
                return
            }
            fs.createReadStream(realPath).pipe(gzip).pipe(res);
            return
        }

        if(range){
            let {start ,end} = range;
            fs.createReadStream(realPath,{start,end}).pipe(res);
        }


        fs.createReadStream(realPath).pipe(res);
    }

    async setRange(req,res,realPath){
        let range = req.headers['range'];
        let stateObj = await fs.stat(realPath);
        if(range){
            let [,start,end] = range.match(/bytes=(\d*)-(\d*)/);
            start = start ? Number(start) : 0;
            end = end ? Number(end) : stateObj.length-1;
            res.statusCode = 206;
            res.setHeader('Content-Range',`bytes${start}-${end}/${stateObj.size}`);
            res.setHeader('Accept-Ranges','bytes');
            return { start , end }
        }
        return false
    }

    setCache(req,res,realPath){
        res.setHeader('Cache-Control','max-age=10');
        let etag = crypto.createHash('md5').update(fs.readFileSync(realPath)).digest('base64');
        res.setHeader('Etag',etag);
        if(etag === req.headers['if-none-match']){
            res.statusCode = 304;
            res.end();
        }
    }

    gzip(req,res){
        // 获取请求头中的压缩方式
        let gzip = req.headers['accept-encoding'];
        if(gzip){ // 返回一个压缩流 转化流
            // gzip deflate
            if(gzip.match(/\bgzip\b/)){
                res.setHeader('Content-Encoding','gzip');
                return zlib.createGzip();
            }else if(gzip.match(/\bdeflate\b/)){
                res.setHeader('Content-Encoding','bdeflate');
                return zlib.createDflate();
            }
        }else {
            return false
        }
    }

    sendError(req,res,e){
        debug(JSON.stringify(e));
        res.statusCode = 404;
        res.end('Not Found');
    }
    start(){
        // 开启一个服务 为使结构更简单，将回调函数单独拿出去，
        // 此时的回调函数 this 指向可能会发生改变，需要重新绑定
        let server = http.createServer(this.handleRequest.bind(this));
        let { port,host } = this.config;
        server.listen(port,host,()=>{
            debug(`http://${host}:${chalk.red(port)}`)
        })
    }
}
module.exports = Server;

// debug('hello');
// console.log(chalk.red('hello'));  // 打印出红色的hello

// 将当前目录下的 template.html 读取出来
// let str = fs.readFileSync(path.join(__dirname,'template.html'),'utf8');
// 将内容中的变量（hello）进行赋值替换

// <%=hello%>   取值用等号
// let r = ejs.render(str,{hello:'zx'});


/*
 <%arr.forEach(item=>{%>
 <li><%=item%></li>
 <%})%>
 let r = ejs.render(str,{arr:[1,2,3]});
 // 得到的就是替换后完整的文件内容
 console.log(r);
 * */
