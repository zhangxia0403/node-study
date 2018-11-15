本地服务
在任何目录下都可以启动
1、yarn init -y 初始化项目
2、当前文件夹变为一个全局命令
    1)需要创建一个bin的文件夹,里面一个www.js文件
    2)在package.json下配置
        原始的
        {
          "name": "http-server",
          "version": "1.0.0",
          "main": "index.js",
          "license": "MIT"
        }
        修改后的
        {
          "name": "http-server",
          "version": "1.0.0",
          "main": "index.js",
          "license": "MIT",
          "bin": {
            "zx-server": "./bin/www"
          }
        }
    3)将项目映射到npm中，此时可以全局访问项目
        命令行中执行 npm link
        此时运行 zx-server ，相当于在命令行中运行 www.js 会报错，我们要告诉他是在node中运行www.js
        在www.js 中添加一行  #! /usr/bin/env node  告诉他在node环境中运行
        修改后，需要重新 npm link 一下，因为他会记住上一次操作
        此时执行 zx-server 就可以正常运行项目 www.js
4、npm install commander 命令行下解析用户执行的参数 的包

5、发包
