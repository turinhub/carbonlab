import {
  loginWithUsernamePasswordAction,
  validateTaleTokenAction,
} from '@/lib/actions/tale-auth-actions'

export interface LoginResponse {
  data: {
    app: {
      app_name: string
      app_key: string
      org_id: string
      app_id: string
    }
    user: {
      latest_login_time: string
      registered_at: string
      is_frozen: boolean
      user_id: string
      username: string
    }
    token: {
      granted_at: string
      scope: string
      expired_at: string
      token: string
    }
    third_party: Record<string, unknown>
    user_roles: Array<{
      role_id: string
      role_name: string
      role_type?: string
    }>
    user_privileges: Array<{
      privilege_id: string
      privilege_name: string
      privilege_type?: string
    }>
    user_groups: unknown[]
  }
  code: number
  msg: string
}

export interface LoginRequest {
  username: string
  password: string
}

export const authAPI = {
  loginWithUsernamePassword(
    credentials: LoginRequest
  ): Promise<LoginResponse> {
    return loginWithUsernamePasswordAction(credentials)
  },

  validateToken(token: string): Promise<boolean> {
    return validateTaleTokenAction(token)
  },
}
