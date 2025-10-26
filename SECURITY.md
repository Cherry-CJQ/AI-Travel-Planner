# 安全配置指南

## 重要安全提醒

**⚠️ 警告**: 您的GitHub仓库是公开的，请务必遵循以下安全措施：

1. **永远不要提交 `.env` 文件到版本控制**
2. **不要在代码中硬编码API密钥**
3. **使用环境变量管理敏感信息**
4. **定期轮换API密钥**

## 安全配置步骤

### 1. 确保.gitignore配置正确

检查您的 `.gitignore` 文件是否包含以下内容：

```
# 环境变量文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志文件
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 依赖目录
node_modules/
dist/
build/
```

### 2. 创建本地环境变量文件

在项目根目录创建 `.env` 文件（**不要提交到Git**）：

```bash
# 创建.env文件（本地使用）
touch .env
```

### 3. 安全配置环境变量

编辑 `.env` 文件，填入您的实际配置：

```env
# Supabase配置（必需）
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# 高德地图配置（可选）
VITE_AMAP_JS_API_KEY=your-js-api-key-here
VITE_AMAP_API_KEY=your-web-service-api-key-here

# 阿里云配置（可选）
VITE_ALIYUN_ACCESS_KEY_ID=your-access-key-id
VITE_ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret
VITE_LLM_MODEL=qwen-plus
```

### 4. 验证.gitignore配置

确保 `.env` 文件没有被Git跟踪：

```bash
# 检查Git状态
git status

# 应该看不到.env文件
# 如果看到.env文件，立即停止并执行：
git rm --cached .env
```

## 开发环境测试

### 1. 使用模拟数据进行测试

在开发初期，您可以使用模拟数据测试应用功能：

```typescript
// 在开发环境中使用模拟数据
if (import.meta.env.DEV) {
  // 使用模拟的行程数据
  const mockTrips = [
    {
      id: '1',
      title: '测试行程',
      destination: '北京',
      start_date: '2024-01-10',
      end_date: '2024-01-15',
      budget: 5000
    }
  ]
}
```

### 2. 分阶段配置API

**阶段1：基础功能测试**
- 只配置Supabase进行用户认证测试
- 使用模拟的行程数据
- 测试UI组件和基本交互

**阶段2：地图功能测试**
- 配置高德地图API
- 测试地图显示和地点搜索
- 验证地图交互功能

**阶段3：AI功能测试**
- 配置阿里云百炼API
- 测试行程生成功能
- 验证AI响应质量

## 生产环境部署

### 1. 服务器环境变量

在生产服务器上设置环境变量：

```bash
# 在部署脚本或服务器配置中设置
export VITE_SUPABASE_URL=your-production-url
export VITE_SUPABASE_ANON_KEY=your-production-key
export VITE_AMAP_API_KEY=your-production-amap-key
```

### 2. Docker部署配置

使用Docker时，通过环境变量传递配置：

```yaml
# docker-compose.yml
services:
  ai-travel-planner:
    environment:
      - VITE_SUPABASE_URL=${SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - VITE_AMAP_API_KEY=${AMAP_API_KEY}
```

### 3. CI/CD管道配置

在GitHub Actions等CI/CD工具中安全配置环境变量：

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # 使用GitHub Secrets中的环境变量
          echo "Deploying with secure environment variables"
```

## 安全最佳实践

### 1. API密钥管理

- **使用不同的密钥**：开发、测试、生产环境使用不同的API密钥
- **限制权限**：为每个API密钥设置最小必要权限
- **监控使用**：定期检查API使用情况和异常访问

### 2. Supabase安全配置

```sql
-- 启用行级安全策略
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- 创建策略确保用户只能访问自己的数据
CREATE POLICY "用户只能访问自己的行程" ON trips
FOR ALL USING (auth.uid() = user_id);
```

### 3. 前端安全

```typescript
// 验证环境变量是否已配置
const validateConfig = () => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    console.error('缺少必要的环境变量:', missing)
    return false
  }
  return true
}
```

## 故障排除

### 常见安全问题

1. **环境变量未加载**
   - 检查 `.env` 文件位置和格式
   - 确认变量名以 `VITE_` 开头
   - 重启开发服务器

2. **API密钥泄露**
   - 立即在相应平台撤销泄露的密钥
   - 生成新的API密钥
   - 更新所有环境中的配置

3. **权限错误**
   - 检查API密钥的权限设置
   - 验证CORS配置
   - 检查行级安全策略

### 紧急响应

如果发现敏感信息已提交到Git：

```bash
# 1. 立即从Git历史中删除文件
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 强制推送到远程仓库
git push origin --force --all

# 3. 在相应平台轮换所有API密钥
```

## 总结

记住安全第一的原则：
- ✅ 使用 `.env.example` 作为模板
- ✅ 将真实的 `.env` 添加到 `.gitignore`
- ✅ 通过环境变量管理敏感信息
- ✅ 定期审计和轮换密钥
- ❌ 不要提交包含敏感信息的文件
- ❌ 不要在代码中硬编码密钥
- ❌ 不要分享 `.env` 文件

遵循这些指南，您可以安全地开发和测试项目，同时保护您的API密钥和敏感信息。