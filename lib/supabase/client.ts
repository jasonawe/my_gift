import { createBrowserClient } from '@supabase/ssr'

// 构造一个纯内存存储器，完全不触碰浏览器的 localStorage/sessionStorage
const memoryStorage = new Map<string, string>();
const inMemoryStorage = {
  getItem: (key: string) => memoryStorage.get(key) || null,
  setItem: (key: string, value: string) => memoryStorage.set(key, value),
  removeItem: (key: string) => memoryStorage.delete(key),
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: inMemoryStorage as any, // 强制使用内存，绕过浏览器权限检查
        persistSession: false,           // 禁用持久化
        autoRefreshToken: false,         // 禁用自动刷新（因为没法持久化）
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }
  )
}
