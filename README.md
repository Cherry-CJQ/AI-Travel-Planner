# AI旅行规划助手 (AI Travel Planner)

## 项目简介

AI旅行规划助手是一个基于AI大语言模型、语音识别和地图交互的智能旅行规划Web应用。用户可以通过语音或文字输入旅行需求，系统自动生成个性化的完整旅行方案，并提供预算管理和记账功能。

## 🚀 核心功能

- 🎤 **语音输入** - 支持浏览器原生语音识别，快速输入旅行需求
- 🤖 **AI行程规划** - 基于阿里云百炼LLM生成个性化旅行方案
- 🗺️ **地图交互** - 高德地图集成，可视化展示行程路线和地点
- 💰 **预算管理** - 智能预算分析 + 实时记账功能
- 👤 **用户系统** - Supabase认证，行程云端同步存储
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 🛠️ 技术栈

### 前端技术
- **React 18** + **TypeScript** - 现代化前端框架
- **Ant Design** - 企业级UI组件库
- **Vite** - 快速构建工具
- **Zustand** - 轻量级状态管理

### 后端服务
- **Supabase** - 全栈BaaS平台 (PostgreSQL + 认证 + 存储)
- **阿里云百炼** - 大语言模型API服务
- **高德地图** - 地图和位置服务

## 🐳 Docker部署（推荐）

### 使用预构建镜像

1. **下载Docker镜像文件**：
   - 从 [Releases页面](https://github.com/Cherry-CJQ/AI-Travel-Planner/releases) 下载 `ai-travel-planner.tar` (约24.8MB)

2. **加载镜像**：
   ```bash
   docker load -i ai-travel-planner.tar
   ```

3. **运行容器**：
   ```bash
   docker run -d -p 8080:80 --name ai-travel-planner ai-travel-planner:latest
   ```

4. **访问应用**：
   打开浏览器访问 http://localhost:8080

## 🛠️ 从源码构建

```bash
# 克隆项目
git clone https://github.com/Cherry-CJQ/AI-Travel-Planner.git
cd AI-Travel-Planner

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的配置信息

# 启动开发服务器
npm run dev

# 访问应用
打开浏览器访问 http://localhost:3000
```

## ⚙️ 配置说明

应用需要配置以下环境变量：

- **Supabase** - 数据库和认证服务
- **高德地图** - 地图和位置服务
- **阿里云百炼** - AI大语言模型服务

详细配置说明请参考 `.env.example` 文件中的注释

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件