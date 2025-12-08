import { appTokenService } from './app-token-service';

interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  requiresAppToken?: boolean;
  appKey?: string;
}

class HttpClient {
  private static instance: HttpClient;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  // 获取用户token
  private getUserToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('tale-token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }

  // 发送请求
  async request(url: string, config: RequestConfig = {}): Promise<Response> {
    const {
      method = 'GET',
      headers = {},
      body,
      requiresAppToken = false,
      appKey
    } = config;

    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

    // 设置基础headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // 添加app token
    if (requiresAppToken && appKey) {
      const appToken = await appTokenService.getValidAppToken(appKey);
      if (appToken) {
        requestHeaders['x-t-token'] = appToken; 
      }
    }

    // Safe header encoding check
    Object.entries(requestHeaders).forEach(([key, value]) => {
      if (/[^\x00-\x7F]/.test(value)) {
        console.error(`[HttpClient Warning] Header '${key}' contains non-ASCII characters:`, value);
      }
    });

    // 发送请求
    let response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body
    });

    // 处理401错误
    if (response.status === 401 && requiresAppToken && appKey) {
      console.log('Received 401, attempting to refresh app token...');
      
      try {
        // 清除旧token并重新获取
        appTokenService.clearAppToken(appKey);
        const newAppToken = await appTokenService.fetchAppToken(appKey);
        
        if (newAppToken) {
          // 使用新token重试请求
          requestHeaders['x-t-token'] = newAppToken; 
          response = await fetch(fullUrl, {
            method,
            headers: requestHeaders,
            body
          });
        }
      } catch (error) {
        console.error('Failed to refresh app token:', error);
      }
    }

    return response;
  }

  // GET请求
  async get(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request(url, { ...config, method: 'GET' });
  }

  // POST请求
  async post(url: string, data?: unknown, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // PUT请求
  async put(url: string, data?: unknown, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  // DELETE请求
  async delete(url: string, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request(url, { ...config, method: 'DELETE' });
  }
}

export const httpClient = HttpClient.getInstance();
