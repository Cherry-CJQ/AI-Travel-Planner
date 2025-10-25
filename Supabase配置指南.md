# Supabase 配置指南

## 步骤 1: 创建 Supabase 项目

1. **访问 Supabase**
   - 打开 https://supabase.com
   - 点击 "Start your project"
   - 使用 GitHub、GitLab 或邮箱注册/登录

2. **创建新项目**
   - 点击 "New Project"
   - 填写项目名称: `ai-travel-planner`
   - 设置数据库密码 (请妥善保存)
   - 选择区域: `East Asia (Singapore)` 或离您最近的区域
   - 点击 "Create new project"

3. **等待项目初始化**
   - 项目创建需要几分钟时间
   - 等待状态变为 "ACTIVE"

## 步骤 2: 获取项目配置

1. **进入项目设置**
   - 在项目概览页面，点击左侧菜单的 "Settings"
   - 选择 "API"

2. **复制配置信息**
   - **Project URL**: 在 "Config" 部分找到
   - **anon/public key**: 在 "Project API keys" 部分找到

3. **更新 .env 文件**
   ```env
   VITE_SUPABASE_URL=您的项目URL
   VITE_SUPABASE_ANON_KEY=您的anon密钥
   ```

## 步骤 3: 配置数据库表

### 方法 1: 使用 SQL 编辑器 (推荐)

1. **打开 SQL 编辑器**
   - 在 Supabase 控制台左侧菜单点击 "SQL Editor"
   - 点击 "New query"

2. **执行数据库 schema**
   - 复制 `supabase/schema-corrected.sql` 文件内容
   - 粘贴到 SQL 编辑器中
   - 点击 "Run" 执行

### 方法 2: 使用 Table Editor

1. **创建 users 表**
   - 点击左侧菜单 "Table Editor"
   - 点击 "Create a new table"
   - 表名: `users`
   - 添加以下列:
     - `id` (UUID, 主键, 默认值: `uuid_generate_v4()`)
     - `email` (text, 唯一约束)
     - `password_hash` (text)
     - `name` (text)
     - `created_at` (timestamptz, 默认值: `now()`)
     - `updated_at` (timestamptz, 默认值: `now()`)

2. **创建其他表**
   按照同样的方法创建以下表:
   - `trips`
   - `daily_plans` 
   - `expenses`
   - `user_settings`

## 步骤 4: 配置行级安全 (RLS)

1. **启用 RLS**
   - 在 Table Editor 中，为每个表:
   - 点击表名 → "Policies" 标签
   - 确保 "Enable RLS" 已开启

2. **创建策略** (可选，用于生产环境)
   - 为每个表创建适当的访问策略

## 步骤 5: 测试连接

1. **重启开发服务器**
   ```bash
   npm run dev
   ```

2. **测试环境变量**
   - 访问 http://localhost:3000/test-env.html
   - 确认 Supabase 连接状态

3. **测试用户注册**
   - 在应用中尝试注册新用户
   - 检查 Supabase 表中是否创建了用户记录

## 故障排除

### 常见问题

1. **连接失败**
   - 检查 `.env` 文件中的 URL 和密钥是否正确
   - 确认项目状态为 "ACTIVE"

2. **表不存在**
   - 确认已执行数据库 schema
   - 检查表名拼写是否正确

3. **认证错误**
   - 确认使用了正确的 anon key (不是 service key)
   - 检查 RLS 策略设置

### 获取帮助

- Supabase 文档: https://supabase.com/docs
- Discord 社区: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/supabase/issues

## 下一步

完成 Supabase 配置后，继续:
1. 测试用户注册/登录功能
2. 测试行程规划功能
3. 测试其他核心功能