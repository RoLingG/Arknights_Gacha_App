# Arknights Gacha Recorder (官服抽卡记录桌面端)

[![Built with Wails](https://img.shields.io/badge/Built%20with-Wails-1ac3f5.svg)](https://wails.io)[![Go Version](https://img.shields.io/badge/Go-%3E%3D1.20-00ADD8.svg)](https://go.dev)[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个极简、安全、完全离线的明日方舟**官服**抽卡记录桌面端管理工具。  
利用官服公开 API 拉取 30 天内抽卡记录，本地存储、本地分析，**无需登录、无账号风险**。

## 开发指南（wails v2）

### 前置要求

- Go ≥ 1.20
- Node.js ≥ 18
- wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## 技术栈

**后端**: Go + Wails v2

**前端**: HTML + CSS + JavaScript + MDUI

**打包**: wails build

## TODO

- 前端升级成 Vue + Ts
- 用户界面体验改善
- 等等......
