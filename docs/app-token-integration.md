# Tale SDK 服务端集成

Carbon Lab 使用 `@turinhub/tale-js-sdk` 访问 Tale。App Secret、App Token
签发与业务 API 调用都留在服务端，浏览器不再保存或读取 App Token。

## 环境变量

服务端运行环境必须配置：

```bash
TALE_BASE_URL=https://api.turingue.com
TALE_APP_KEY=oa_example
TALE_APP_SECRET=<server-only-secret>
```

- 不要给 Secret 使用 `NEXT_PUBLIC_` 前缀。
- 不要向 Git 提交真实 Secret 或 Token。
- `TALE_APP_KEY` 是当前 Carbon Lab 唯一使用的 App，只在服务端读取。
- 浏览器不需要 Tale App Key；所有 Tale SDK 调用都经过 Server Action 或
  Route Handler。`NEXT_PUBLIC_TALE_BACKEND_URL` 目前仅用于将历史相对文件
  URL 转换为完整地址，不参与 SDK 鉴权。

## 代码边界

统一入口是 `lib/server/tale-client.ts`：

- `getTaleServerConfig()` 读取并校验服务端配置。
- `createTaleServerAppClient()` 创建 SDK App Client。
- SDK 自己负责 App Token 缓存和刷新。
- `taleServerRequest()` 只用于 SDK 尚未覆盖的 Tale 接口。

页面和客户端组件通过 `lib/api/` 下的 Server Action 调用业务能力。业务
模块使用 `createTaleAppClient()` 的 `users`、`userGroups`、`rbac`、`cms`、
`tasks`、`auth`、`smsRecords` 和 `appTokens` facade，不向客户端返回 App
Token。

## 兼容策略

Tale SDK 的请求和响应字段使用 camelCase。当前页面仍有一部分历史
snake_case 契约，因此服务端通过 `lib/server/tale-legacy-adapters.ts`
进行临时转换。新增 SDK 调用必须使用 camelCase；后续页面完成类型迁移后，
再逐步删除兼容适配器。

## 已移除的旧接口

以下浏览器 Token 机制已废弃：

- `/api/tale-token`
- `/api/app-token`
- `app-token-service`
- `enhanced-app-token-service`
- `app-token-store`
- `tale-app-token-*` 浏览器 cookie

不要重新引入前端 App Token 缓存。需要新的 Tale 能力时，优先扩展服务端
SDK action。
