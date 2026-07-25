import { create } from 'zustand'
import { authAPI, LoginRequest, LoginResponse } from '@/lib/api/auth'

interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  latest_login_time?: string
  registered_at?: string
  is_frozen?: boolean
  roles?: string[]
  permissions?: string[]
}

interface Token {
  token: string
  scope: string
  granted_at: string
  expired_at: string
}

interface UserStore {
  user: User | null
  token: Token | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  // 登录方法
  login: (credentials: LoginRequest) => Promise<void>

  // 设置用户信息
  setUser: (user: User) => void

  // 设置token
  setToken: (token: Token) => void

  // 登出方法
  logout: () => void

  // 清除错误
  clearError: () => void

  // 检查token是否过期
  isTokenExpired: () => boolean

  // 验证token
  validateToken: () => Promise<boolean>

  // 更新头像
  updateAvatar: (avatarUrl: string) => void

  // 更新用户信息
  updateUser: (userData: Partial<User>) => void

  // 强制同步方法
  syncFromStorage: () => void

  // 保存到存储
  saveToStorage: () => void

  // 初始化方法
  initialize: () => void
}

// 手动存储管理
const STORAGE_KEY = 'carbon-user-storage'

// 从cookie读取数据
const loadFromStorage = (): Partial<UserStore> => {
  if (typeof document === 'undefined') {
    return {
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
    }
  }

  try {
    const cookieData = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${STORAGE_KEY}=`))

    if (cookieData) {
      const encodedData = cookieData.split('=')[1]
      const decodedData = decodeURIComponent(encodedData)
      const parsed = JSON.parse(decodedData)
      return parsed.state || {}
    }
  } catch (error) {
    console.error('从存储加载数据失败:', error)
  }

  return {
    user: null,
    token: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
  }
}

// 保存到cookie
const saveToStorage = (state: Partial<UserStore>) => {
  if (typeof document === 'undefined') return

  try {
    const dataToSave = {
      state: {
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
        isLoading: state.isLoading,
        error: state.error,
      }
    }

    const encodedData = encodeURIComponent(JSON.stringify(dataToSave))
    const expires = new Date()
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000) // 30天

    document.cookie = `${STORAGE_KEY}=${encodedData}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
  } catch (error) {
    console.error('保存到存储失败:', error)
  }
}

export const useUserStore = create<UserStore>((set, get) => {
  // 初始化时从存储加载数据
  const initialState = loadFromStorage()

  return {
    user: initialState.user ?? null,
    token: initialState.token ?? null,
    isLoggedIn: initialState.isLoggedIn ?? false,
    isLoading: initialState.isLoading ?? false,
    error: initialState.error ?? null,

    login: async (credentials: LoginRequest) => {
      try {
        console.log('用户store开始登录:', credentials.username)
        set({ isLoading: true, error: null })

        const response: LoginResponse = await authAPI.loginWithUsernamePassword(credentials)
        console.log('API调用成功，开始处理响应')

        // 检查用户是否被冻结
        if (response.data.user.is_frozen) {
          console.error('用户账户被冻结')
          throw new Error('账户已被冻结，请联系管理员')
        }

        // 检查token是否过期
        const expiredAt = new Date(response.data.token.expired_at)
        if (expiredAt <= new Date()) {
          console.error('Token已过期')
          throw new Error('登录已过期，请重新登录')
        }

        console.log('验证通过，更新用户状态')

        // 更新用户状态
        const user: User = {
          id: response.data.user.user_id,
          username: response.data.user.username,
          latest_login_time: response.data.user.latest_login_time,
          registered_at: response.data.user.registered_at,
          is_frozen: response.data.user.is_frozen,
          roles: response.data.user_roles
            ?.map(role => role.role_type)
            .filter((role): role is string => Boolean(role)) || [],
          permissions: response.data.user_privileges?.map(privilege => privilege.toString()) || []
        }

        const token: Token = {
          token: response.data.token.token,
          scope: response.data.token.scope,
          granted_at: response.data.token.granted_at,
          expired_at: response.data.token.expired_at,
        }

        const newState = {
          user,
          token,
          isLoggedIn: true,
          isLoading: false,
          error: null,
        }

        set(newState)
        saveToStorage(newState)

        console.log('用户状态更新完成，登录成功')

      } catch (error) {
        console.error('用户store登录失败:', error)
        const errorState = {
          isLoading: false,
          error: error instanceof Error ? error.message : '登录失败',
        }
        set(errorState)
        saveToStorage(errorState)
        throw error
      }
    },

    logout: () => {
      const newState = {
        user: null,
        token: null,
        isLoggedIn: false,
        isLoading: false,
        error: null,
      }
      set(newState)
      saveToStorage(newState)
    },

    setUser: (user: User) => {
      const newState = {
        user,
        isLoggedIn: true,
        error: null,
      }
      set(newState)
      saveToStorage(newState)
    },

    setToken: (token: Token) => {
      const newState = {
        token,
        isLoggedIn: true,
        error: null,
      }
      set(newState)
      saveToStorage(newState)
    },

    updateAvatar: (avatarUrl: string) => {
      const state = get()
      const newState = {
        ...state,
        user: state.user ? { ...state.user, avatar: avatarUrl } : null,
      }
      set(newState)
      saveToStorage(newState)
    },

    updateUser: (userData: Partial<User>) => {
      const state = get()
      const newState = {
        ...state,
        user: state.user ? { ...state.user, ...userData } : null,
      }
      set(newState)
      saveToStorage(newState)
    },

    clearError: () => {
      const newState = { error: null }
      set(newState)
      saveToStorage(newState)
    },

    isTokenExpired: () => {
      const { token } = get()
      if (!token) return true

      const expiredAt = new Date(token.expired_at)
      return expiredAt <= new Date()
    },

    validateToken: async () => {
      const { token } = get()
      if (!token) return false

      // 检查本地过期时间
      if (get().isTokenExpired()) {
        get().logout()
        return false
      }

      // 调用API验证token
      try {
        const isValid = await authAPI.validateToken(token.token)
        if (!isValid) {
          get().logout()
        }
        return isValid
      } catch (error) {
        get().logout()
        return false
      }
    },

    syncFromStorage: () => {
      try {
        if (typeof document === 'undefined') return

        const storedData = loadFromStorage()
        console.log('从存储同步状态:', storedData)

        // 修正状态不一致
        if ((storedData.user || storedData.token) && !storedData.isLoggedIn) {
          storedData.isLoggedIn = true
          console.log('修正登录状态为已登录')
        }

        set(storedData)
      } catch (error) {
        console.error('从存储同步状态失败:', error)
      }
    },

    saveToStorage: () => {
      const state = get()
      saveToStorage(state)
    },

    initialize: () => {
      try {
        if (typeof document === 'undefined') return

        const storedData = loadFromStorage()
        console.log('初始化用户状态:', storedData)

        // 修正状态不一致
        if ((storedData.user || storedData.token) && !storedData.isLoggedIn) {
          storedData.isLoggedIn = true
          console.log('修正登录状态为已登录')
        }

        set(storedData)
      } catch (error) {
        console.error('初始化用户状态失败:', error)
      }
    }
  }
})
