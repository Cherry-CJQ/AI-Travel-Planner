/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_LLM_API_KEY: string
  readonly VITE_VOICE_API_KEY?: string
  readonly VITE_MAP_API_KEY?: string
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Docker环境变量注入
interface Window {
  ENV?: {
    VITE_SUPABASE_URL: string
    VITE_SUPABASE_ANON_KEY: string
    VITE_AMAP_JS_API_KEY: string
    VITE_AMAP_API_KEY: string
    VITE_LLM_BASE_URL?: string
    VITE_LLM_MODEL?: string
    VITE_APP_TITLE?: string
    VITE_USE_PROXY?: string
    NODE_ENV?: string
  }
}