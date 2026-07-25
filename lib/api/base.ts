const PLATO_BASE_URL =
  process.env.NEXT_PUBLIC_PLATO_BASE_URL ||
  process.env.PLATO_BASE_URL ||
  'https://api.turingue.com'

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number>
}

export interface TaleApiResponse<T = unknown> {
  total?: number
  code: number
  msg: string
  data?: T
  success?: boolean
}

export async function platoApiRequest<T = unknown>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<TaleApiResponse<T>> {
  const { method = 'GET', headers = {}, body, params } = config
  const url = new URL(endpoint, PLATO_BASE_URL)

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.append(key, String(value))
  }

  const requestHeaders = new Headers(headers)
  let requestBody: BodyInit | undefined
  if (body instanceof FormData) {
    requestBody = body
  } else if (body !== undefined && method !== 'GET') {
    requestHeaders.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: requestBody,
  })
  const result = (await response.json()) as TaleApiResponse<T>

  if (!response.ok || result.code !== 200) {
    throw new Error(result.msg || `HTTP error! status: ${response.status}`)
  }

  return result
}

export const platoApiGet = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>
) => platoApiRequest<T>(endpoint, { method: 'GET', params })

export const platoApiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => platoApiRequest<T>(endpoint, { method: 'POST', body, headers })

export const platoApiPut = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => platoApiRequest<T>(endpoint, { method: 'PUT', body, headers })

export const platoApiDelete = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>,
  body?: unknown
) => platoApiRequest<T>(endpoint, { method: 'DELETE', params, body })
