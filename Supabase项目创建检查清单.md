# Supabase 项目创建检查清单

## ✅ 已完成的项目准备

- [x] 创建了 `.env` 文件模板
- [x] 准备了数据库 schema 文件 (`supabase/schema-corrected.sql`)
- [x] 创建了详细的配置指南
- [x] 修复了所有 TypeScript 编译错误
- [x] 应用构建成功

## 🔄 下一步操作

### 步骤 1: 创建 Supabase 项目

1. **访问 Supabase 官网**
   - 打开 https://supabase.com
   - 点击 "Start your project"

2. **注册/登录账户**
   - 使用 GitHub、GitLab 或邮箱注册
   - 完成邮箱验证

3. **创建新项目**
   - 项目名称: `ai-travel-planner` (或您喜欢的名称)
   - 数据库密码: 设置一个强密码并妥善保存
   - 区域: 选择 `East Asia (Singapore)` 或离您最近的区域
   - 点击 "Create new project"

4. **等待项目初始化**
   - 项目创建需要 1-3 分钟
   - 等待状态变为 "ACTIVE"

### 步骤 2: 获取项目配置

1. **进入项目设置**
   - 在项目概览页面，点击左侧菜单的 "Settings"
   - 选择 "API"

2. **复制配置信息**
   - **Project URL**: 在 "Config" 部分找到
   - **anon/public key**: 在 "Project API keys" 部分找到

3. **更新 .env 文件**
   ```bash
   # 编辑 .env 文件，替换以下配置：
   VITE_SUPABASE_URL=您的项目URL
   VITE_SUPABASE_ANON_KEY=您的anon密钥
   ```

### 步骤 3: 部署数据库 Schema

1. **打开 SQL 编辑器**
   - 在 Supabase 控制台左侧菜单点击 "SQL Editor"
   - 点击 "New query"

2. **执行数据库 schema**
   - 打开文件 `supabase/schema-corrected.sql`
   - 复制全部内容
   - 粘贴到 SQL 编辑器中
   - 点击 "Run" 执行

3. **验证表创建**
   - 在 SQL 编辑器中执行:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```
   - 应该看到: users, trips, daily_plans, expenses, user_settings

### 步骤 4: 测试连接

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试环境变量**
   - 访问 http://localhost:3000/test-env.html
   - 确认 Supabase 连接状态显示 "✅ 连接成功"

3. **测试用户注册**
   - 访问 http://localhost:3000/
   - 点击 "注册" 按钮
   - 填写测试信息注册新用户
   - 检查 Supabase 的 Table Editor 中 users 表是否有新记录

## 🛠️ 故障排除

### 常见问题及解决方案

1. **连接失败: Invalid API key**
   - 检查 `.env` 文件中的 URL 和密钥是否正确
   - 确认复制的是 anon key (不是 service key)

2. **表不存在错误**
   - 确认已执行 `supabase/schema-corrected.sql`
   - 检查表名拼写是否正确

3. **认证错误**
   - 确认使用的是 anon key
   - 检查项目状态是否为 "ACTIVE"

4. **网络连接问题**
   - 检查网络连接
   - 尝试刷新页面重新连接

### 验证步骤

完成配置后，请验证以下功能:

- [ ] 用户注册功能正常
- [ ] 用户登录功能正常  
- [ ] 行程创建功能正常
- [ ] 数据持久化正常

## 📞 获取帮助

如果遇到问题:

1. **查看 Supabase 文档**: https://supabase.com/docs
2. **加入 Discord 社区**: https://discord.supabase.com
3. **查看项目 Issues**: 在项目仓库中创建 issue

## 🎯 完成标志

当您完成所有配置后，应该能够:

- ✅ 在浏览器中访问应用
- ✅ 注册新用户账户
- ✅ 登录系统
- ✅ 创建和管理行程
- ✅ 所有数据正确保存到 Supabase

完成 Supabase 配置后，我们将继续测试其他核心功能。