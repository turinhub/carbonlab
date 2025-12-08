const API_BASE_URL =
  process.env.NEXT_PUBLIC_TALE_BACKEND_URL || process.env.TALE_BASE_URL || process.env.NEXT_PUBLIC_TALE_BASE_URL || 'https://api.turingue.com';
const PLATO_BASE_URL =
  process.env.NEXT_PUBLIC_PLATO_BASE_URL || process.env.PLATO_BASE_URL || 'https://api.turingue.com';

// Debug env vars
if (typeof window !== 'undefined') {
  console.log('API Config:', {
    API_BASE_URL,
    PLATO_BASE_URL,
    NEXT_PUBLIC_TALE_BACKEND_URL: process.env.NEXT_PUBLIC_TALE_BACKEND_URL,
    NEXT_PUBLIC_PLATO_BASE_URL: process.env.NEXT_PUBLIC_PLATO_BASE_URL
  });
}
  
// 通用API请求配置
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number>;
}

// Tale API响应类型
export interface TaleApiResponse<T = unknown> {
  total: any;
  code: number;
  msg: string;
  data?: T;
  success?: boolean;
}

// 通用API请求方法
export const apiRequest = async <T = unknown>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<TaleApiResponse<T>> => {
  const { method = 'GET', headers = {}, body, params } = config;

  // 构建URL
  let url = `${API_BASE_URL}${endpoint}`;

  // 添加查询参数
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
    url += `?${queryParams.toString()}`;
  }

  // 构建请求配置
  const requestConfig: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  // Safe header encoding check
  Object.entries(requestConfig.headers as Record<string, string>).forEach(([key, value]) => {
    // Check for non-ASCII characters in header values
    if (/[^\x00-\x7F]/.test(value)) {
      console.error(`[API Warning] Header '${key}' contains non-ASCII characters:`, value);
      // Optional: Encode it or strip it?
      // For now, just log it.
      try {
        // Try to encode if possible, but usually headers must be ASCII (ISO-8859-1)
        // If it's a token, it might be corrupted.
        // If it's a custom header like 'app-name', we should encodeURI.
        // requestConfig.headers[key] = encodeURIComponent(value);
      } catch (e) {}
    }
  });

  // 添加请求体
  if (body && method !== 'GET') {
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (body instanceof FormData) {
      requestConfig.body = body;
    } else {
      // 对于JSON数据，设置Content-Type并stringify
      if (!headers['Content-Type']) {
        requestConfig.headers = {
          ...requestConfig.headers,
          'Content-Type': 'application/json',
        };
      }
      requestConfig.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, requestConfig);

    // 解析响应体，无论状态码如何
    let result: TaleApiResponse<T>;
    try {
      result = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (parseError) {
      // 如果无法解析JSON，使用通用错误信息
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 如果HTTP状态码不是2xx，但有解析成功的响应体，使用服务器返回的错误信息
    if (!response.ok) {
      throw new Error(result.msg || `HTTP error! status: ${response.status}`);
    }

    // 检查业务状态码
    if (result.code !== 200) {
      throw new Error(result.msg || '请求失败');
    }

    return result;
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
};

// 便捷方法
export const apiGet = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>
) => apiRequest<T>(endpoint, { method: 'GET', params });

export const apiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => apiRequest<T>(endpoint, { method: 'POST', body, headers });

export const apiPut = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => apiRequest<T>(endpoint, { method: 'PUT', body, headers });

export const apiDelete = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>,
  body?: unknown
) => apiRequest<T>(endpoint, { method: 'DELETE', params, body });

// 带认证的API请求方法
export const apiRequestWithAuth = async <T = unknown>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<TaleApiResponse<T>> => {
  const { useAppTokenStore } = await import('@/lib/stores/app-token-store');
  const { getAppToken } = useAppTokenStore.getState();

  const appToken = await getAppToken();
  if (!appToken) {
    throw new Error('无法获取应用token');
  }

  const headers = {
    'x-t-token': appToken,
    ...config.headers,
  };

  return apiRequest<T>(endpoint, {
    ...config,
    headers,
  });
};

// 带认证的便捷方法
export const apiGetWithAuth = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>
) => apiRequestWithAuth<T>(endpoint, { method: 'GET', params });

export const apiPostWithAuth = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => apiRequestWithAuth<T>(endpoint, { method: 'POST', body, headers });

export const apiPutWithAuth = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => apiRequestWithAuth<T>(endpoint, { method: 'PUT', body, headers });

export const apiDeleteWithAuth = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>,
  body?: unknown
) => apiRequestWithAuth<T>(endpoint, { method: 'DELETE', params, body });

// 课程和题库专用API请求方法（使用PLATO_BASE_URL，无需token）
export const platoApiRequest = async <T = unknown>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<TaleApiResponse<T>> => {
  const { method = 'GET', headers = {}, body, params } = config;

  // 构建URL
  let url = `${PLATO_BASE_URL}${endpoint}`;

  // 添加查询参数
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
    url += `?${queryParams.toString()}`;
  }

  // 构建请求配置
  const requestConfig: RequestInit = {
    method,
    headers: {
      ...headers,
    },
  };

  // Safe header encoding check
  Object.entries(requestConfig.headers as Record<string, string>).forEach(([key, value]) => {
    if (/[^\x00-\x7F]/.test(value)) {
      console.error(`[Plato API Warning] Header '${key}' contains non-ASCII characters:`, value);
    }
  });

  // 添加请求体
  if (body && method !== 'GET') {
    // 如果是FormData，不设置Content-Type，让浏览器自动设置
    if (body instanceof FormData) {
      requestConfig.body = body;
    } else {
      // 对于JSON数据，设置Content-Type并stringify
      if (!headers['Content-Type']) {
        requestConfig.headers = {
          ...requestConfig.headers,
          'Content-Type': 'application/json',
        };
      }
      requestConfig.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, requestConfig);

    // 解析响应体，无论状态码如何
    let result: TaleApiResponse<T>;
    try {
      result = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (parseError) {
      // 如果无法解析JSON，使用通用错误信息
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 如果HTTP状态码不是2xx，但有解析成功的响应体，使用服务器返回的错误信息
    if (!response.ok) {
      throw new Error(result.msg || `HTTP error! status: ${response.status}`);
    }

    // 检查业务状态码
    if (result.code !== 200) {
      throw new Error(result.msg || '请求失败');
    }

    return result;
  } catch (error) {
    console.error('Plato API请求失败:', error);
    throw error;
  }
};

// Plato API便捷方法
export const platoApiGet = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>
) => platoApiRequest<T>(endpoint, { method: 'GET', params });

export const platoApiPost = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => platoApiRequest<T>(endpoint, { method: 'POST', body, headers });

export const platoApiPut = <T = unknown>(
  endpoint: string,
  body?: unknown,
  headers?: Record<string, string>
) => platoApiRequest<T>(endpoint, { method: 'PUT', body, headers });

export const platoApiDelete = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number>,
  body?: unknown
) => platoApiRequest<T>(endpoint, { method: 'DELETE', params, body });