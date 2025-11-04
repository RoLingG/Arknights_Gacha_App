# Arknights Gacha App (官服抽卡记录桌面端)

[![Go Version](https://img.shields.io/badge/Go-%3E%3D1.20-00ADD8.svg)](https://go.dev)  [![License](https://img.shields.io/badge/Wails-2.10-C70039.svg)](LICENSE) [![License](https://img.shields.io/badge/Node.js-%3E%3D18-8CC84B.svg)](LICENSE)  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个极简、安全的明日方舟**官服**抽卡记录桌面端管理工具。
利用官服公开 API 拉取 30 天内抽卡记录，本地存储、本地分析。

> 此项目是Web版的重构，意在能够让用户开箱直用。
>
> 但目前 Workflows 自动双平台打包不完善，Windows 系统用户还请下载完对应桌面端之后自行加上 `.exe` 后缀打开使用。另外 Mac 系统暂时没适配。

## 开发指南（wails v2.10）

### 前置要求

- Go ≥ 1.20
- Node.js ≥ 18
- wails v2.10

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## 技术栈

**后端**: Go + Wails v2.10

**前端**: HTML + CSS + JavaScript + MDUI

## Todo

- 前端升级成 Vue + Ts
- 用户UI界面体验改善
- Workflows 自动化打包优化
- 适配 Mac 系统
- 解决桌面端代码签名问题
- 等等......
