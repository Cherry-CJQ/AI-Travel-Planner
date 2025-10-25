# AI旅行规划助手 - 部署文档

## 概述

本文档介绍如何将AI旅行规划助手应用部署到生产环境。我们提供了多种部署方式，包括Docker容器化部署和传统服务器部署。

## 系统要求

- **操作系统**: Linux, macOS, Windows (支持WSL2)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 至少2GB RAM
- **存储**: 至少1GB可用空间

## 快速开始

### 1. 使用Docker Compose部署（推荐）

```bash
# 克隆项目
git clone https://github.com/Cherry-CJQ/AI-Travel-Planner.git
cd AI-Travel-Planner

# 一键部署
./deploy.sh deploy
```

### 2. 手动部署步骤

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 部署脚本使用

我们提供了一个便捷的部署脚本 `deploy.sh`：

```bash
# 完整部署（构建+启动）
./deploy.sh deploy

# 仅构建镜像
./deploy.sh build

# 启动服务
./deploy.sh start

# 停止服务
./deploy.sh stop

# 重启服务
./deploy.sh restart

# 查看日志
./deploy.sh logs

# 健康检查
./deploy.sh health

# 清理资源
./deploy.sh cleanup
```

## 环境配置

### 环境变量

创建 `.env` 文件配置环境变量：

```env
# 应用配置
NODE_ENV=production
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 可选配置
VITE_LLM_API_KEY=your_llm_api_key
VITE_MAP_API_KEY=your_map_api_key
VITE_VOICE_API_KEY=your_voice_api_key
```

### 端口配置

默认端口映射：
- **生产环境**: 3000 → 80
- **开发环境**: 3001 → 3000

修改端口映射：
```yaml
# 在 docker-compose.yml 中修改
ports:
  - "8080:80"  # 主机端口:容器端口
```

## 生产环境部署

### 1. 使用Docker Swarm

```bash
# 初始化Swarm
docker swarm init

# 部署服务栈
docker stack deploy -c docker-compose.yml ai-travel-planner

# 查看服务状态
docker service ls
```

### 2. 使用Kubernetes

创建Kubernetes部署文件 `k8s-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-travel-planner
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-travel-planner
  template:
    metadata:
      labels:
        app: ai-travel-planner
    spec:
      containers:
      - name: ai-travel-planner
        image: ai-travel-planner:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ai-travel-planner-service
spec:
  selector:
    app: ai-travel-planner
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
```

部署到Kubernetes：
```bash
kubectl apply -f k8s-deployment.yaml
```

## 监控和日志

### 查看容器日志

```bash
# 查看所有服务日志
docker-compose logs

# 实时查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs ai-travel-planner
```

### 健康检查

应用提供健康检查端点：
```bash
curl http://localhost:3000/health
```

### 性能监控

集成Prometheus和Grafana（可选）：
```yaml
# 在 docker-compose.yml 中添加
monitoring:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3002:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 安全配置

### 1. 使用HTTPS

配置Nginx SSL证书：
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 其他配置...
}
```

### 2. 安全头配置

Nginx已配置以下安全头：
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer-when-downgrade
- Content-Security-Policy

### 3. 防火墙配置

```bash
# 只开放必要端口
ufw allow 80
ufw allow 443
ufw enable
```

## 备份和恢复

### 备份配置

```bash
# 备份Docker镜像
docker save ai-travel-planner > ai-travel-planner-backup.tar

# 备份配置文件
tar -czf config-backup.tar.gz .env docker-compose.yml
```

### 恢复部署

```bash
# 恢复镜像
docker load < ai-travel-planner-backup.tar

# 恢复配置
tar -xzf config-backup.tar.gz

# 重新部署
docker-compose up -d
```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   
   # 修改端口映射
   # 在 docker-compose.yml 中修改 ports 配置
   ```

2. **内存不足**
   ```bash
   # 清理Docker资源
   docker system prune -a
   
   # 增加Docker内存限制
   # 在Docker Desktop设置中调整
   ```

3. **构建失败**
   ```bash
   # 清理构建缓存
   docker-compose build --no-cache
   
   # 检查网络连接
   docker-compose logs ai-travel-planner
   ```

### 获取帮助

如果遇到问题，请：
1. 查看应用日志：`docker-compose logs ai-travel-planner`
2. 检查容器状态：`docker-compose ps`
3. 提交Issue到GitHub仓库

## 更新部署

### 滚动更新

```bash
# 拉取最新代码
git pull

# 重新构建和部署
./deploy.sh deploy
```

### 蓝绿部署

```bash
# 部署新版本到不同端口
docker-compose -p ai-travel-planner-v2 up -d

# 测试新版本
curl http://localhost:3001/health

# 切换流量
# 修改负载均衡器配置指向新版本

# 清理旧版本
docker-compose -p ai-travel-planner-v1 down
```

## 性能优化建议

1. **启用Gzip压缩** - 已配置在Nginx中
2. **使用CDN** - 静态资源通过CDN分发
3. **启用缓存** - 浏览器和代理服务器缓存
4. **监控资源使用** - 使用Docker Stats监控容器资源

---

**注意**: 在生产环境部署前，请确保已配置所有必要的环境变量和安全设置。