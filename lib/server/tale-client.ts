import 'server-only'

import {
  ConfigurationError,
  createTaleAppClient,
  getAppToken,
  type TaleAppClient,
} from '@turinhub/tale-js-sdk'

const DEFAULT_TALE_BASE_URL = 'https://api.turingue.com'

interface TaleServerConfig {
  baseUrl: string
  appKey: string
  appSecret: string
}

export function getTaleServerConfig(): TaleServerConfig {
  const baseUrl = process.env.TALE_BASE_URL || DEFAULT_TALE_BASE_URL
  const appKey = process.env.TALE_APP_KEY
  const appSecret = process.env.TALE_APP_SECRET

  if (!appKey || !appSecret) {
    throw new ConfigurationError(
      'Missing required server environment variables: TALE_APP_KEY, TALE_APP_SECRET'
    )
  }

  return { baseUrl, appKey, appSecret }
}

export function createTaleServerAppClient(): TaleAppClient {
  const config = getTaleServerConfig()

  return createTaleAppClient({
    baseUrl: config.baseUrl,
    appTokenProvider: () => getAppToken(config),
  })
}

export async function taleServerRequest<T>(
  path: string,
  init: RequestInit
): Promise<T> {
  const config = getTaleServerConfig()
  const appToken = await getAppToken(config)
  const response = await fetch(
    `${config.baseUrl.replace(/\/+$/, '')}${path}`,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        'x-t-token': appToken,
      },
      cache: 'no-store',
    }
  )

  const body = await response.json().catch(() => undefined)
  if (!response.ok) {
    const message =
      body && typeof body === 'object' && 'msg' in body
        ? String(body.msg)
        : `Tale request failed with status ${response.status}`
    throw new Error(message)
  }

  return body as T
}
