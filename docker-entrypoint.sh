#!/bin/sh

# Docker启动脚本 - 用于在运行时注入环境变量

set -e

echo "🚀 启动AI旅行规划助手..."

# 检查必需的环境变量
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ 错误: 必需的环境变量 VITE_SUPABASE_URL 未设置"
    exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: 必需的环境变量 VITE_SUPABASE_ANON_KEY 未设置"
    exit 1
fi

if [ -z "$VITE_AMAP_JS_API_KEY" ]; then
    echo "❌ 错误: 必需的环境变量 VITE_AMAP_JS_API_KEY 未设置"
    exit 1
fi

if [ -z "$VITE_AMAP_API_KEY" ]; then
    echo "❌ 错误: 必需的环境变量 VITE_AMAP_API_KEY 未设置"
    exit 1
fi

echo "📋 运行时配置:"
echo "  - Supabase URL: ${VITE_SUPABASE_URL:0:20}..."
echo "  - Supabase Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo "  - 地图JS API Key: ${VITE_AMAP_JS_API_KEY:0:10}..."
echo "  - 地图服务API Key: ${VITE_AMAP_API_KEY:0:10}..."
echo "  - LLM基础URL: ${VITE_LLM_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}"
echo "  - LLM模型: ${VITE_LLM_MODEL:-qwen-plus}"
echo "  - 应用标题: ${VITE_APP_TITLE:-AI旅行规划助手}"
echo "  - 使用代理: ${VITE_USE_PROXY:-false}"
echo "  - 环境: ${NODE_ENV:-production}"

# 使用envsubst替换环境变量模板中的占位符
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

echo "✅ 环境变量注入完成"
echo "🌐 应用将在 http://localhost:80 可用"

# 启动nginx
exec "$@"