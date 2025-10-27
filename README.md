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
- 🛡️ **错误处理** - 完善的错误边界和用户体验优化

## 🛠️ 技术栈

### 前端技术
- **React 18** + **TypeScript** - 现代化前端框架
- **Ant Design** - 企业级UI组件库
- **Vite** - 快速构建工具
- **Zustand** - 轻量级状态管理
- **React Router** - 客户端路由

### 后端服务
- **Supabase** - 全栈BaaS平台 (PostgreSQL + 认证 + 存储)
- **阿里云百炼** - 大语言模型API服务
- **高德地图** - 地图和位置服务

### 开发工具
- **Vitest** + **Testing Library** - 单元测试和组件测试
- **ESLint** - 代码质量检查
- **Docker** - 容器化部署

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Docker (可选，用于部署)

### 1. 克隆项目
```bash
git clone https://github.com/Cherry-CJQ/AI-Travel-Planner.git
cd AI-Travel-Planner
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
复制环境变量示例文件并配置您的API密钥：
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入您的配置信息。

### 4. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000 查看应用。

## 📋 配置说明

### 必需配置
1. **Supabase数据库**
   - 创建Supabase项目
   - 配置数据库表结构
   - 获取项目URL和匿名密钥

2. **高德地图API**
   - 注册高德开放平台账号
   - 创建两个应用：
     - **Web端(JS API)** - 用于地图显示（有Key和Secret）
     - **Web服务API** - 用于地理编码、路径规划等（只有Key）

3. **阿里云百炼**
   - 开通阿里云百炼服务
   - 获取API Key

### 详细配置指南
请参考 [CONFIGURATION.md](./CONFIGURATION.md) 获取完整的配置说明。

## 🐳 Docker部署

### 方式一：使用预构建镜像（推荐）

1. **下载Docker镜像文件**：
   - 从 [Releases页面](https://github.com/Cherry-CJQ/AI-Travel-Planner/releases) 下载最新版本的镜像文件

2. **加载镜像**：
   ```bash
   # 如果是.tar文件
   docker load -i ai-travel-planner-latest.tar
   
   # 如果是.tar.gz文件，先解压
   gunzip ai-travel-planner-latest.tar.gz
   docker load -i ai-travel-planner-latest.tar
   ```

3. **运行容器**：
   ```bash
   docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner:latest
   ```

4. **访问应用**：
   打开浏览器访问 http://localhost:3000

### 方式二：从源码构建

#### 开发环境
```bash
# 构建开发镜像
docker build -f Dockerfile.dev -t ai-travel-planner:dev .

# 运行开发容器
docker run -p 3000:3000 ai-travel-planner:dev
```

#### 生产环境
```bash
# 使用Docker Compose一键部署
docker-compose up -d

# 或使用部署脚本
./deploy.sh deploy
```

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 和 [GITHUB_DOCKER_GUIDE.md](./GITHUB_DOCKER_GUIDE.md)

## 🧪 测试

项目包含完整的测试套件：

```bash
# 运行所有测试
npm run test:run

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test
```

测试文档请参考 [TESTING.md](./TESTING.md)

## 📁 项目结构

```
AI-Travel-Planner/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── Error/          # 错误处理组件
│   │   ├── Loading/        # 加载状态组件
│   │   ├── Empty/          # 空状态组件
│   │   └── Network/        # 网络状态组件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务层
│   │   ├── supabase.ts     # Supabase客户端
│   │   ├── llmService.ts   # AI服务
│   │   ├── mapService.ts   # 地图服务
│   │   └── voiceService.ts # 语音服务
│   ├── stores/             # 状态管理
│   ├── utils/              # 工具函数
│   ├── test/               # 测试配置
│   └── types/              # TypeScript类型定义
├── public/                  # 静态资源
├── docs/                   # 项目文档
└── config/                 # 配置文件
```

## 📚 文档

- [产品需求文档 (PRD)](./PRD.md) - 项目需求和功能规格
- [配置说明](./CONFIGURATION.md) - 详细配置指南
- [部署指南](./DEPLOYMENT.md) - 生产环境部署说明
- [测试文档](./TESTING.md) - 测试策略和执行指南

## 🎯 开发状态

✅ **已完成功能**
- [x] 项目架构设计与技术栈确认
- [x] 前端基础框架搭建
- [x] 后端API服务搭建
- [x] 用户认证系统实现
- [x] 语音识别模块集成
- [x] LLM API集成与行程生成逻辑
- [x] 地图交互模块实现
- [x] 预算管理与记账功能
- [x] 行程管理与数据持久化
- [x] 响应式设计与移动端优化
- [x] 错误处理与用户体验优化
- [x] Docker容器化部署
- [x] 文档完善与测试

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目！

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件