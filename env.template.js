// 环境变量模板 - 在容器启动时会被替换为实际值
window.ENV = {
  VITE_SUPABASE_URL: '${VITE_SUPABASE_URL}',
  VITE_SUPABASE_ANON_KEY: '${VITE_SUPABASE_ANON_KEY}',
  VITE_AMAP_JS_API_KEY: '${VITE_AMAP_JS_API_KEY}',
  VITE_AMAP_API_KEY: '${VITE_AMAP_API_KEY}',
  VITE_LLM_BASE_URL: '${VITE_LLM_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}',
  VITE_LLM_MODEL: '${VITE_LLM_MODEL:-qwen-plus}',
  VITE_APP_TITLE: '${VITE_APP_TITLE:-AI旅行规划助手}',
  VITE_USE_PROXY: '${VITE_USE_PROXY:-false}',
  NODE_ENV: '${NODE_ENV:-production}'
};