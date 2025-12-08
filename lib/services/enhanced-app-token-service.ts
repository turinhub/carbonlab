import { appTokenService } from './app-token-service';

// 增强的认证令牌服务
export class EnhancedAppTokenService {
  private static instance: EnhancedAppTokenService;
  private retryCount = 0;
  private maxRetries = 3;

  static getInstance(): EnhancedAppTokenService {
    if (!EnhancedAppTokenService.instance) {
      EnhancedAppTokenService.instance = new EnhancedAppTokenService();
    }
    return EnhancedAppTokenService.instance;
  }

  /**
   * 获取有效的应用令牌（增强版）
   */
  async getValidAppToken(appKey: string): Promise<string | null> {
    try {
      console.log(`🔑 尝试获取应用令牌 (尝试 ${this.retryCount + 1}/${this.maxRetries + 1})`);
      
      // 1. 先尝试从缓存获取
      let token = this.getCachedAppToken(appKey);
      if (token) {
        console.log('✅ 从缓存获取到应用令牌');
        return token;
      }

      // 2. 清除所有认证令牌并重新获取
      console.log('🔄 清除所有认证令牌并重新获取...');
      appTokenService.clearAllAppTokens();
      
      // 3. 强制重新获取令牌
      token = await this.forceFetchAppToken(appKey);
      
      if (token) {
        console.log('✅ 成功获取新的应用令牌');
        this.retryCount = 0; // 重置重试计数
        return token;
      }

      throw new Error('无法获取有效的应用令牌');
      
    } catch (error) {
      console.error(`❌ 获取应用令牌失败 (尝试 ${this.retryCount + 1}):`, error);
      
      // 重试机制
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`🔄 将在 2 秒后重试 (${this.retryCount}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.getValidAppToken(appKey);
      }
      
      console.error('❌ 达到最大重试次数，获取应用令牌失败');
      return null;
    }
  }

  /**
   * 从缓存获取应用令牌
   */
  private getCachedAppToken(appKey: string): string | null {
    try {
      return appTokenService.getAppToken(appKey);
    } catch (error) {
      console.warn('从缓存获取应用令牌失败:', error);
      return null;
    }
  }

  /**
   * 强制获取应用令牌
   */
  private async forceFetchAppToken(appKey: string): Promise<string | null> {
    try {
      // 1. 先尝试获取 Tale Token
      console.log('🔄 步骤 1: 获取 Tale Token...');
      const taleToken = await this.getTaleToken();
      
      if (taleToken) {
        console.log('✅ Tale Token 获取成功');
      } else {
        console.log('⚠️ Tale Token 获取失败，继续尝试其他方式');
      }

      // 2. 尝试获取应用令牌
      console.log('🔄 步骤 2: 获取应用令牌...');
      const appToken = await appTokenService.fetchAppToken(appKey);
      
      if (appToken) {
        console.log('✅ 应用令牌获取成功');
        return appToken;
      }

      throw new Error('应用令牌获取失败');
      
    } catch (error) {
      console.error('强制获取应用令牌失败:', error);
      return null;
    }
  }

  /**
   * 获取 Tale Token
   */
  private async getTaleToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/tale-token');
      const data = await response.json();
      
      if (data.token) {
        console.log('✅ Tale Token 获取成功:', data.token.substring(0, 20) + '...');
        return data.token;
      }
      
      throw new Error('Tale Token 响应无效');
    } catch (error) {
      console.error('获取 Tale Token 失败:', error);
      return null;
    }
  }

  /**
   * 测试 API 连接
   */
  async testApiConnection(appKey: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('🧪 测试 API 连接...');
      
      const token = await this.getValidAppToken(appKey);
      if (!token) {
        return {
          success: false,
          message: '无法获取认证令牌'
        };
      }

      // 测试资源库 API
      const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';
      const response = await fetch(`${API_BASE_URL}/cms/folder/page?page=0&size=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': token,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        return {
          success: true,
          message: 'API 连接测试成功',
          data: {
            status: response.status,
            repositories: data.data?.content?.length || 0
          }
        };
      } else {
        return {
          success: false,
          message: `API 调用失败: ${response.status}`,
          data: { status: response.status, data }
        };
      }
      
    } catch (error) {
      console.error('API 连接测试失败:', error);
      return {
        success: false,
        message: `API 连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
        data: { error: error instanceof Error ? error.message : '未知错误' }
      };
    }
  }

  /**
   * 重置重试计数
   */
  resetRetryCount(): void {
    this.retryCount = 0;
  }

  /**
   * 清除所有认证令牌
   */
  clearAllTokens(): void {
    appTokenService.clearAllAppTokens();
    this.resetRetryCount();
  }
}

// 创建默认实例
export const enhancedAppTokenService = EnhancedAppTokenService.getInstance();



