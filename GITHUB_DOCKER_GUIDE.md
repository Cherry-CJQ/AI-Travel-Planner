# GitHub代码提交和Docker镜像制作指南

## 第一步：准备GitHub仓库

### 1.1 创建GitHub仓库
1. 登录GitHub账号
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - Repository name: `ai-travel-planner`
   - Description: `AI旅行规划助手 - 智能行程规划应用`
   - Public (公开)
   - 勾选 "Add a README file"
4. 点击 "Create repository"

### 1.2 本地代码推送到GitHub
```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件到暂存区
git add .

# 提交更改
git commit -m "初始提交：AI旅行规划助手完整功能"

# 添加GitHub远程仓库
git remote add origin https://github.com/你的用户名/ai-travel-planner.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

## 第二步：构建Docker镜像

### 2.1 本地构建Docker镜像
```bash
# 构建生产环境镜像
docker build -t ai-travel-planner:latest .

# 或者使用部署脚本
./deploy.sh build
```

### 2.2 验证镜像构建成功
```bash
# 查看构建的镜像
docker images

# 应该看到类似输出：
# REPOSITORY           TAG       IMAGE ID       CREATED         SIZE
# ai-travel-planner    latest    abc123def456   2 minutes ago   200MB
```

### 2.3 测试镜像运行
```bash
# 运行容器测试
docker run -d -p 3000:80 --name ai-travel-planner-test ai-travel-planner:latest

# 访问 http://localhost:3000 验证应用正常运行

# 停止测试容器
docker stop ai-travel-planner-test
docker rm ai-travel-planner-test
```

## 第三步：导出Docker镜像文件

### 3.1 导出镜像为tar文件
```bash
# 导出镜像
docker save -o ai-travel-planner-latest.tar ai-travel-planner:latest

# 查看生成的文件
ls -lh ai-travel-planner-latest.tar
```

### 3.2 压缩镜像文件（可选）
```bash
# 压缩以减小文件大小
gzip ai-travel-planner-latest.tar

# 或者使用其他压缩工具
7z a ai-travel-planner-latest.tar.gz ai-travel-planner-latest.tar
```

## 第四步：在GitHub发布版本

### 4.1 创建GitHub Release
1. 进入GitHub仓库页面
2. 点击右侧 "Releases"
3. 点击 "Create a new release"
4. 填写版本信息：
   - Tag version: `v1.0.0`
   - Release title: `AI旅行规划助手 v1.0.0`
   - Description: 描述本次发布的功能和修复

### 4.2 上传Docker镜像文件
1. 在Release页面，拖拽或选择文件上传：
   - `ai-travel-planner-latest.tar` (或压缩后的文件)
2. 点击 "Publish release"

## 第五步：提供使用说明

### 5.1 在README.md中添加Docker使用说明
在GitHub仓库的README.md文件中添加以下内容：

```markdown
## 🐳 Docker快速启动

### 方式一：使用预构建镜像

1. 下载Docker镜像文件：
   - 从 [Releases页面](https://github.com/你的用户名/ai-travel-planner/releases) 下载最新版本的镜像文件

2. 加载镜像：
   ```bash
   # 如果是.tar文件
   docker load -i ai-travel-planner-latest.tar
   
   # 如果是.tar.gz文件，先解压
   gunzip ai-travel-planner-latest.tar.gz
   docker load -i ai-travel-planner-latest.tar
   ```

3. 运行容器：
   ```bash
   docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner:latest
   ```

4. 访问应用：
   打开浏览器访问 http://localhost:3000

### 方式二：从源码构建

1. 克隆代码：
   ```bash
   git clone https://github.com/你的用户名/ai-travel-planner.git
   cd ai-travel-planner
   ```

2. 构建镜像：
   ```bash
   docker build -t ai-travel-planner:latest .
   ```

3. 运行容器：
   ```bash
   docker run -d -p 3000:80 --name ai-travel-planner ai-travel-planner:latest
   ```
```

## 第六步：环境配置说明

### 6.1 必需的环境变量
创建 `.env` 文件配置以下环境变量：

```env
# Supabase数据库配置（必需）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 高德地图API配置（推荐）
VITE_AMAP_JS_API_KEY=your-js-api-key
VITE_AMAP_API_KEY=your-web-api-key
```

### 6.2 Docker运行时的环境变量
```bash
docker run -d -p 3000:80 \
  -e VITE_SUPABASE_URL="https://your-project.supabase.co" \
  -e VITE_SUPABASE_ANON_KEY="your-anon-key" \
  --name ai-travel-planner \
  ai-travel-planner:latest
```

## 完整操作命令总结

```bash
# 1. 推送到GitHub
git add .
git commit -m "完整功能提交"
git push origin main

# 2. 构建Docker镜像
docker build -t ai-travel-planner:latest .

# 3. 导出镜像文件
docker save -o ai-travel-planner-latest.tar ai-travel-planner:latest

# 4. 压缩镜像（可选）
gzip ai-travel-planner-latest.tar

# 5. 在GitHub Releases页面手动上传 ai-travel-planner-latest.tar.gz 文件
```

## 注意事项

1. **镜像文件大小**：Docker镜像文件可能较大（约200MB），建议使用压缩
2. **环境变量**：确保用户知道需要配置必要的环境变量
3. **端口冲突**：如果3000端口被占用，可以使用其他端口
4. **网络要求**：应用需要访问Supabase和高德地图API，确保网络连接正常

## 验证步骤

完成以上步骤后，用户可以：
1. 从GitHub Releases下载Docker镜像文件
2. 加载镜像并运行容器
3. 访问 http://localhost:3000 验证应用正常运行
4. 测试主要功能：注册登录、创建行程、地图显示等