const fs = require('fs');

// fs.open(filename,flags,[mode],callback);
/*
 filename：打开的文件名
 flags：操作标识（对打开的文件进行怎样的操作）
 mode：文件操作权限，可不写，默认是0666(可读，可写)
 callback：回调函数，(err,fd)=>{},fd:整数，返回的文件描述符，从3开始（0，1，2前几个被系统占用）
* */

//fs.read(fd, buffer, offset, length, position, callback);
/*
 fd, 使用fs.open打开成功后返回的文件描述符
 buffer, 一个Buffer对象，v8引擎分配的一段内存
 offset, 整数，向缓存区中写入时的初始位置，以字节为单位
 length, 整数，读取文件的长度，不能大于buffer规定的长度
 position, 整数，读取文件初始位置；文件大小以字节为单位
 callback(err, bytesRead, buffer), 读取执行完成后回调函数，bytesRead实际读取字节数，被读取的缓存区对象
* */

// 使用fs.write写入文件时，操作系统是将数据读到内存，再把数据写入到文件中，当数据读完时并不代表数据已经写完，因为有一部分还可能在内在缓冲区内。
// 因此可以使用fs.fsync方法将内存中数据写入文件；--刷新内存缓冲区；

//fs.fsync(fd, [callback])
/**
 * fd, 使用fs.open打开成功后返回的文件描述符
 * [callback(err, written, buffer)], 写入操作执行完成后回调函数，written实际写入字节数，buffer被读取的缓存区对象
 */

// fs.open('./a.md','r',function (err,fd) {
//     // 缓存区规定的长度
//     let buffer = Buffer.alloc(12);
//     // offset + length <= buffer.length，否则报错
//     // fs.read(fd,buffer,3,9,0,callback) RangeError: Length extends beyond buffer
//     fs.read(fd,buffer,0,12,3,function (err,bytesRead) {
//         // bytesRead 真实读取的文件长度
//         console.log(bytesRead);
//         console.log(buffer.toString());
//         fs.close(fd,()=>{
//             console.log('读取完成后最好关闭fd文件描述符，避免占用过多');
//         })
//     })
// });
//
// fs.open('./b.md','w',function (err,fd) {
//     let buffer = Buffer.from('zhangxia');
//     fs.write(fd,buffer,2,6,0,function (err,written) {
//         // 文件真实写入的长度
//         console.log(written); // 6
//     })
// });


// 打开要读取的文件
// fs.open('./a.md','r',function (err,rfd) {
//     // 打开要写入的文件
//     fs.open('./b.md','w',function (err,wfd) {
//         let buffer = Buffer.alloc(6);
//         function next() {
//             fs.read(rfd,buffer,0,6,null,function (err,bytesRead) {
//                 if(bytesRead > 0){
//                     fs.write(wfd,buffer,0,bytesRead,null,function (err,written) {
//                         next()
//                     })
//                 }else {
//                     fs.close(rfd,()=>{});
//                     fs.close(wfd,()=>{});
//                 }
//             })
//         }
//         next()
//     })
// });

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


