// 流的原理：一点点读，一点点写，只占用一点点内存
// 实现文件拷贝
function copy(source,target,callback) {
    // 打开需要读取的源文件
    fs.open(source,'r',function (err,rfd) {
        // 打开需要写入的目标文件
        fs.open(target,'w',function (err,wfd) {
            // 定义buffer的长度
            const size = 6;
            let buffer = Buffer.alloc(size);
            function next() {
                // null 可以自动找到下一次读、写的位置，不需要我们计算
                fs.read(rfd,buffer,0,size,null,function (err,bytesRead) {
                    if(bytesRead>0){
                        // 写入文件的长度肯定是真实读取的文件长度，用bytesRead比较靠谱
                        // 文件最后读取的长度很可能<size,如果用size，最后写入的文件比读取的文件要长
                        fs.write(wfd,buffer,0,bytesRead,null,function (err,written) {
                            next()
                        })
                    }else {
                        fs.close(rfd,()=>{});
                        fs.close(wfd,()=>{});
                        fs.fsync(wfd,()=>{});
                        callback();
                    }
                })
            }
            next()
        })
    })
}

copy('a.md', 'b.md',function () {
    console.log('拷贝完成')
});
