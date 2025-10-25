# 快速开始指南

## 第一步：环境准备

### 1. 克隆项目
```bash
git clone https://github.com/Cherry-CJQ/AI-Travel-Planner.git
cd AI-Travel-Planner
```

### 2. 安装依赖
```bash
npm install
```

## 第二步：安全配置（重要！）

### 1. 创建本地环境文件
```bash
# 复制示例文件
cp .env.example .env
```

### 2. 编辑环境文件
打开 `.env` 文件，填入您的配置：

```env
# 必需配置 - Supabase
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 可选配置 - 高德地图
VITE_AMAP_API_KEY=your_amap_api_key_here

# 可选配置 - 阿里云百炼
VITE_ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id_here
VITE_ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret_here
VITE_LLM_MODEL=qwen-plus
```

### 3. 验证安全配置
```bash
# 检查.env文件是否被Git忽略
git status

# 应该看不到.env文件
# 如果看到，立即执行：
git rm --cached .env
```

## 第三步：获取API密钥

### 1. Supabase配置（必需）
1. 访问 [Supabase官网](https://supabase.com)
2. 创建新项目
3. 进入 Settings > API
4. 复制：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public → `VITE_SUPABASE_ANON_KEY`

### 2. 高德地图配置（可选但推荐）
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取Key → `VITE_AMAP_API_KEY`

### 3. 阿里云百炼配置（可选）
1. 访问 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 开通服务并创建AccessKey
3. 获取：
   - AccessKey ID → `VITE_ALIYUN_ACCESS_KEY_ID`
   - AccessKey Secret → `VITE_ALIYUN_ACCESS_KEY_SECRET`

## 第四步：启动应用

### 1. 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 2. 构建生产版本
```bash
npm run build
npm run preview
```

## 第五步：测试功能

### 基础功能测试（无需完整配置）
1. **用户认证** - 注册/登录功能
2. **UI组件** - 加载状态、错误处理
3. **响应式设计** - 移动端适配

### 完整功能测试（需要完整配置）
1. **地图功能** - 地点搜索、路线规划
2. **AI行程生成** - 智能行程规划
3. **语音输入** - 语音识别功能

## 分阶段测试建议

### 阶段1：基础测试（仅Supabase）
```env
# .env 配置
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
# 其他配置留空或使用默认值
```

测试内容：
- ✅ 用户注册/登录
- ✅ 基本UI交互
- ✅ 错误处理

### 阶段2：地图功能测试
在阶段1基础上添加：
```env
VITE_AMAP_API_KEY=your_amap_key
```

测试内容：
- ✅ 地图显示
- ✅ 地点搜索
- ✅ 路线规划

### 阶段3：AI功能测试
在阶段2基础上添加：
```env
VITE_ALIYUN_ACCESS_KEY_ID=your_id
VITE_ALIYUN_ACCESS_KEY_SECRET=your_secret
VITE_LLM_MODEL=qwen-plus
```

测试内容：
- ✅ AI行程生成
- ✅ 智能预算分析
- ✅ 完整业务流程

## 故障排除

### 常见问题

1. **环境变量不生效**
   ```bash
   # 重启开发服务器
   npm run dev
   ```

2. **Supabase连接失败**
   - 检查URL和密钥是否正确
   - 验证网络连接
   - 检查CORS设置

3. **地图不显示**
   - 检查高德API密钥
   - 验证API调用配额
   - 检查浏览器控制台错误

4. **AI服务无响应**
   - 检查阿里云AccessKey
   - 验证模型服务状态
   - 检查网络连接

### 开发工具

```bash
# 代码检查
npm run lint

# 类型检查
npm run type-check

# 运行测试
npm run test:run

# 测试覆盖率
npm run test:coverage
```

## 下一步

完成基础测试后，您可以：

1. **自定义功能** - 根据需求修改业务逻辑
2. **UI优化** - 调整界面样式和交互
3. **部署上线** - 使用Docker部署到生产环境
4. **性能优化** - 优化加载速度和用户体验

## 获取帮助

- 📖 详细配置：查看 [CONFIGURATION.md](./CONFIGURATION.md)
- 🔒 安全指南：查看 [SECURITY.md](./SECURITY.md)
- 🐳 部署说明：查看 [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 问题反馈：在GitHub提交Issue

---

**记住**: 安全第一！永远不要提交包含真实API密钥的 `.env` 文件到版本控制。