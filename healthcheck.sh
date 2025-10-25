#!/bin/sh

# 健康检查脚本
# 检查nginx是否正常运行

# 检查nginx进程是否存在
if ! pgrep nginx > /dev/null; then
    echo "Nginx is not running"
    exit 1
fi

# 检查nginx是否响应HTTP请求
if ! curl -f http://localhost/health > /dev/null 2>&1; then
    echo "Nginx is not responding to HTTP requests"
    exit 1
fi

# 检查静态文件是否可访问
if ! curl -f http://localhost/index.html > /dev/null 2>&1; then
    echo "Static files are not accessible"
    exit 1
fi

echo "Application is healthy"
exit 0