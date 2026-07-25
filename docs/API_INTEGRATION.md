# API 集成说明

## 概述

本项目已集成真实的用户认证API，支持用户名密码登录功能。

## API 配置

### 1. 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
TALE_BASE_URL=https://api.turingue.com
TALE_APP_KEY=oa_example
TALE_APP_SECRET=<server-only-secret>
```

### 2. API 端点

- **登录**: `POST /auth/v1/login/username-password`
- **验证Token**: `GET /auth/v1/validate`

## 功能特性

### 用户认证
- ✅ 用户名密码登录
- ✅ Token 管理
- ✅ 自动Token验证
- ✅ 登录状态持久化
- ✅ 账户状态检查（冻结状态）

### 安全特性
- ✅ 请求超时控制（10秒）
- ✅ 错误处理和重试机制
- ✅ 本地Token过期检查
- ✅ 自动登出过期用户

## 使用方法

### 1. 用户登录

```typescript
import { useUserStore } from '@/lib/stores/user-store'

const { login } = useUserStore()

// 登录
await login({
  username: 'carbon',
  password: 'carbon'
})
```

### 2. 检查登录状态

```typescript
const { isLoggedIn, user, token } = useUserStore()

if (isLoggedIn) {
  console.log('用户已登录:', user.username)
  console.log('Token:', token.token)
}
```

### 3. 用户登出

```typescript
const { logout } = useUserStore()
logout()
```

## API 响应格式

### 登录成功响应

```json
{
  "data": {
    "app": {
      "app_name": "whut-carbonlab-dev",
      "app_key": "oa_example",
      "org_id": "0791e08a-0166-4bdb-af4a-7ea5af3d7013",
      "app_id": "a7b10bbe-a8f3-4a1e-8ca3-aad2cec296bc"
    },
    "user": {
      "latest_login_time": "2025-08-23T11:18:10+08:00",
      "registered_at": "2025-08-23T10:48:37+08:00",
      "is_frozen": false,
      "user_id": "ou_9dfb58f14fab49fc8687fc0b1ab0a44c",
      "username": "carbon"
    },
    "token": {
      "granted_at": "2025-08-23T11:18:10+08:00",
      "scope": "tu_cabc961ec1f9457e8aeaccc57279d8e9",
      "expired_at": "2025-08-30T11:18:10+08:00",
      "token": "tu_cabc961ec1f9457e8aeaccc57279d8e9"
    }
  },
  "code": 200,
  "msg": "OK"
}
```

## 注意事项

1. **安全性**: Token 会存储在 localStorage 中，请确保在HTTPS环境下使用
2. **过期处理**: Token 过期后会自动登出用户
3. **错误处理**: 网络错误、超时等异常情况都有相应的错误提示
4. **状态管理**: 使用 Zustand 进行状态管理，支持状态持久化

## 故障排除

### 常见问题

1. **登录失败**: 检查用户名、密码以及服务端 Tale 环境变量是否正确
2. **网络错误**: 检查网络连接和API地址是否正确
3. **Token过期**: 重新登录即可

### 调试信息

在浏览器控制台中可以看到详细的API请求和响应信息，有助于问题排查。
