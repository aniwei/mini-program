# mini-program

一个基于 Web 运行微信小程序的框架，目前还处理开发阶段，不过已有不错的成功。已经可以运行 vant-app 小程序版本、以及 weui-app 小程序版本。

项目还处于早期阶段，上手比较容易，欢迎一起参与开发此开源项目，让我们不再饱受微信开发工具的困扰，随时随地开发调试小程序。感兴趣可以加我「微信二维码」。

#### Vant 小程序

<img src="https://github.com/aniwei/mini-program/blob/main/screenshot/vant-web.jpg" alt="vant" width="30%" height="30%">
<img src="https://github.com/aniwei/mini-program/blob/main/screenshot/vant.jpg" alt="vant" width="30%" height="30%">

#### WeUI 小程序

<img src="https://github.com/aniwei/mini-program/blob/main/screenshot/weui-web-01.jpg" alt="vant" width="30%" height="30%">
<img src="https://github.com/aniwei/mini-program/blob/main/screenshot/weui-web-02.jpg" alt="vant" width="30%" height="30%">

## 运行 DEMO

### 环境依赖
```
vscode 
node > 16 
pnpm 
nx
```
### 开始
- 安装依赖
```
pnpm i
```

- 构建代码
```
pnpm build
```

- 执行 vscode 调试模式，调试配置选择 「@catalyzed/cli」
在此之前，如果运行的是 vant，需要下载官方 vant-app 仓库，构建出 dist 目录；而后将 dist 目录复制至 packages/cli/example/vant 目录下
```
{
  "name": "@catalyzed/cli",
  "program": "${workspaceRoot}/packages/cli/src/cli",
  "request": "launch",
  "cwd": "${workspaceFolder}/packages/cli/example/vant", // 将 vant 切换为 weui 可运行 weui 项目，切换时候，注意源码启动页
  "env": {
  "PORT": 4001,
  "DEBUG": "wx:*"
  },
  "skipFiles": [
  "<node_internals>/**"
  ],
  "runtimeArgs": [
  "-r",
  "ts-node/register",
  "-r",
  "tsconfig-paths/register"
  ],
  "args": ["start"],
  "type": "pwa-node",
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "port": 9229
}
```

- 浏览器打开 http://localhost:3000 

### 可能遇到的问题
- 无法编译微信代码
本项目依赖 「微信代码编译工具 wsc wscc」，苹果 M 系列需要安装 「Rosetta」

## 架构设计
<img src="https://github.com/aniwei/mini-program/blob/main/mini-program-framework.png" alt="vant" width="50%" height="50%">

## 模块说明
<img src="https://github.com/aniwei/mini-program/blob/main/package-introduction.png" alt="vant" width="50%" height="50%">

## 路线图
// TODO

## 其他
未来还会将 iFrame 层，增加类似 Flutter 的实现，通过定义渲染器切换

## 微信

欢迎交流

<img src="https://github.com/aniwei/mini-program/blob/main/wechat.jpg" alt="vant" width="30%" height="30%">



# License
Copyright (c) Aniwei. All rights reserved.
Licensed under the MIT license.
