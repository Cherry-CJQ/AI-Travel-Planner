# AI旅行规划助手 - 配置说明

## 概述

本文档列出了AI旅行规划助手项目中需要根据您的具体需求进行配置和修改的关键项目。这些配置包括第三方API密钥、数据库连接、环境变量等。

## 关键配置项

### 1. 数据库配置 (Supabase)

**位置**: 环境变量或配置文件

**需要配置的项目**:
- **Supabase URL**: 您的Supabase项目URL
- **Supabase Anon Key**: 您的Supabase匿名密钥

**配置方法**:
```env
# .env 文件
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**获取方式**:
1. 访问 [Supabase官网](https://supabase.com)
2. 创建新项目或使用现有项目
3. 在项目设置中找到API设置
4. 复制URL和anon public key

### 2. 地图服务配置 (高德地图)

**位置**: `src/services/mapService.ts`

**需要配置的项目**:
- **高德地图API密钥**: 用于地图显示和地点搜索

**配置方法**:
```typescript
// src/services/mapService.ts
const AMAP_API_KEY = 'your_amap_api_key_here'
```

**获取方式**:
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册开发者账号
3. 创建应用并获取API Key
4. 根据需要配置Web服务API权限

### 3. AI服务配置 (阿里云百炼)

**位置**: `src/services/llmService.ts`

**需要配置的项目**:
- **阿里云Access Key ID**: 阿里云账号访问密钥ID
- **阿里云Access Key Secret**: 阿里云账号访问密钥Secret
- **模型服务名称**: 使用的AI模型服务名称

**配置方法**:
```typescript
// src/services/llmService.ts
const config = {
  accessKeyId: 'your_aliyun_access_key_id',
  accessKeySecret: 'your_aliyun_access_key_secret',
  model: 'qwen-plus' // 或其他可用模型
}
```

**获取方式**:
1. 访问 [阿里云百炼](https://bailian.console.aliyun.com/)
2. 开通百炼服务
3. 在访问控制中创建AccessKey
4. 选择合适的模型服务

### 4. 语音识别配置

**位置**: `src/services/voiceService.ts`

**需要配置的项目**:
- **语音识别API密钥** (可选): 如果需要使用第三方语音识别服务

**当前实现**:
- 使用Web Speech API (浏览器原生支持，无需配置)
- 如需更高级功能，可集成阿里云语音识别等第三方服务

### 5. 环境配置

**位置**: `.env` 文件

**完整环境变量示例**:
```env
# 应用配置
NODE_ENV=development
VITE_APP_TITLE=AI旅行规划助手

# Supabase配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 第三方API配置 (可选)
VITE_AMAP_API_KEY=your_amap_api_key
VITE_ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
VITE_ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
VITE_LLM_MODEL=qwen-plus

# 部署配置
VITE_API_BASE_URL=http://localhost:3000
```

### 6. 数据库表结构

**位置**: Supabase数据库

**需要创建的表**:
- **trips**: 行程表
- **trip_days**: 行程天数表
- **expenses**: 支出记录表
- **profiles**: 用户资料表

**SQL创建脚本示例**:
```sql
-- 创建行程表
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建行程天数表
CREATE TABLE trip_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  activities JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建支出记录表
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户资料表
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. 安全配置

**需要配置的安全项**:
- **CORS设置**: 在Supabase中配置允许的域名
- **行级安全策略**: 在Supabase中启用RLS并配置策略
- **API速率限制**: 根据需要配置第三方API的调用限制

**Supabase RLS策略示例**:
```sql
-- 启用行级安全
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 行程表策略：用户只能访问自己的行程
CREATE POLICY "用户只能访问自己的行程" ON trips
FOR ALL USING (auth.uid() = user_id);

-- 支出记录策略：用户只能访问自己行程的支出
CREATE POLICY "用户只能访问自己行程的支出" ON expenses
FOR ALL USING (auth.uid() = user_id);
```

### 8. 部署配置

**位置**: 各种部署配置文件

**需要修改的项目**:
- **Docker配置**: 端口映射、环境变量
- **Nginx配置**: 域名、SSL证书
- **CI/CD配置**: 构建脚本、部署目标

**Docker环境变量示例**:
```dockerfile
# 在Dockerfile或docker-compose.yml中设置
ENV VITE_SUPABASE_URL=your_production_supabase_url
ENV VITE_SUPABASE_ANON_KEY=your_production_supabase_key
ENV VITE_AMAP_API_KEY=your_production_amap_key
```

## 配置优先级

1. **环境变量** (最高优先级)
2. **配置文件** (.env文件)
3. **代码中的默认值** (最低优先级)

## 测试配置

在完成配置后，建议运行以下测试：

```bash
# 测试数据库连接
npm run dev

# 测试地图服务
# 访问应用并尝试使用地图功能

# 测试AI服务
# 尝试生成行程规划

# 运行完整测试套件
npm run test:run
```

## 故障排除

### 常见问题

1. **Supabase连接失败**
   - 检查URL和密钥是否正确
   - 验证网络连接
   - 检查CORS设置

2. **地图不显示**
   - 检查高德地图API密钥
   - 验证API调用配额
   - 检查网络连接

3. **AI服务无响应**
   - 检查阿里云AccessKey
   - 验证模型服务状态
   - 检查API调用限制

4. **语音识别失败**
   - 检查浏览器权限
   - 验证麦克风访问权限
   - 检查网络连接

### 获取帮助

如果遇到配置问题，请：
1. 查看相关服务的官方文档
2. 检查浏览器控制台错误信息
3. 查看应用日志
4. 在项目GitHub仓库提交Issue

---

**注意**: 在生产环境部署前，请确保所有敏感信息（如API密钥）已正确配置，并且使用了生产环境的安全设置。