# AI旅行规划助手 (AI Travel Planner)

## 项目简介

AI旅行规划助手是一个基于AI大语言模型、语音识别和地图交互的智能旅行规划Web应用。用户可以通过语音或文字输入旅行需求，系统自动生成个性化的完整旅行方案，并提供预算管理和记账功能。

## 核心功能

- 🎤 **语音输入** - 支持语音识别，快速输入旅行需求
- 🤖 **AI行程规划** - 基于LLM生成个性化旅行方案
- 🗺️ **地图交互** - 高德地图集成，可视化展示行程
- 💰 **预算管理** - AI预算分析 + 语音记账功能
- 👤 **用户系统** - 账户管理，行程云端同步

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design UI组件库
- 高德地图 JavaScript API
- 科大讯飞语音识别API

### 后端/数据库
- Supabase (PostgreSQL + 认证 + 存储)
- 阿里云百炼 LLM API

### 部署
- Docker容器化部署
- 支持多环境配置

## 快速开始

### 环境要求
- Node.js 18+
- Docker (用于部署)

### 本地开发
```bash
# 克隆项目
git clone <repository-url>
cd AI-Travel-Planner

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### Docker部署
```bash
# 构建镜像
docker build -t ai-travel-planner .

# 运行容器
docker run -p 3000:3000 ai-travel-planner
```

## 配置说明

### API Key配置
**重要**: 所有API Key必须通过应用设置页面配置，禁止硬编码。

需要配置的API Key:
- 阿里云百炼 LLM API Key
- 科大讯飞语音识别 API Key
- 高德地图 API Key

配置方式:
1. 启动应用后访问设置页面
2. 在相应输入框中填入您的API Key
3. 保存配置

### 环境变量
参考 `.env.example` 文件配置环境变量。

## 项目结构

```
src/
├── components/     # 可复用组件
├── pages/         # 页面组件
├── hooks/         # 自定义React Hooks
├── services/      # API服务层
├── stores/        # 状态管理
├── types/         # TypeScript类型定义
└── utils/         # 工具函数
```

## 开发计划

详细开发计划请参考 [开发计划.md](./开发计划.md)

## 许可证

MIT License