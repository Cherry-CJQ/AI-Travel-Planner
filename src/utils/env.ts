// 环境变量工具函数
// 支持在Docker容器运行时注入环境变量

interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_AMAP_JS_API_KEY: string;
  VITE_AMAP_API_KEY: string;
  VITE_LLM_BASE_URL: string;
  VITE_LLM_MODEL: string;
  VITE_APP_TITLE: string;
  VITE_USE_PROXY: string;
  NODE_ENV: string;
}

// 获取环境变量值
export function getEnv(): EnvironmentVariables {
  // 优先使用运行时注入的环境变量（Docker部署）
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV as EnvironmentVariables;
  }
  
  // 回退到构建时环境变量（开发环境）
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    VITE_AMAP_JS_API_KEY: import.meta.env.VITE_AMAP_JS_API_KEY || '',
    VITE_AMAP_API_KEY: import.meta.env.VITE_AMAP_API_KEY || '',
    VITE_LLM_BASE_URL: import.meta.env.VITE_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    VITE_LLM_MODEL: import.meta.env.VITE_LLM_MODEL || 'qwen-plus',
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE || 'AI旅行规划助手',
    VITE_USE_PROXY: import.meta.env.VITE_USE_PROXY || 'false',
    NODE_ENV: import.meta.env.NODE_ENV || 'development'
  };
}

// 检查必需的环境变量是否已配置
export function validateEnvironment(): boolean {
  const env = getEnv();
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY', 
    'VITE_AMAP_JS_API_KEY',
    'VITE_AMAP_API_KEY'
  ];
  
  for (const key of requiredVars) {
    if (!env[key as keyof EnvironmentVariables]) {
      console.error(`❌ 环境变量 ${key} 未配置`);
      return false;
    }
  }
  
  return true;
}

// 导出环境变量常量
export const ENV = getEnv();