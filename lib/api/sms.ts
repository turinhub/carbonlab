import { SmsRecord, SmsRecordsResponse, SmsQueryParams } from '@/lib/types/tale'
import { appTokenService } from '@/lib/services/app-token-service'

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'

// 获取推送记录列表
export async function getSmsRecords(params?: SmsQueryParams, appKey?: string): Promise<SmsRecordsResponse> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  const queryParams = new URLSearchParams({
    page: params?.page?.toString() || '0',
    size: params?.size?.toString() || '10',
    verifiedStatus: params?.verifiedStatus?.toString() || 'false',
    ...(params?.sms_type && params.sms_type !== 'all' && { sms_type: params.sms_type }),
  })
  
  const response = await fetch(`${API_BASE_URL}/push/v1/sms?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// 重新发送短信
export async function resendSms(recordId: string, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  const response = await fetch(`${API_BASE_URL}/push/v1/sms/${recordId}/resend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 删除推送记录
export async function deleteSmsRecord(recordId: string, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  const response = await fetch(`${API_BASE_URL}/push/v1/sms/${recordId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 获取推送记录详情
export async function getSmsRecordDetail(recordId: string, appKey?: string): Promise<SmsRecord> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  const response = await fetch(`${API_BASE_URL}/push/v1/sms/${recordId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data.data || data
}

// 发送短信验证码
export async function sendSmsCode(phone: string, smsType: string = 'login', appKey?: string): Promise<{ id: string }> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  console.log('发送短信验证码，手机号:', phone, '类型:', smsType)
  
  // 生成验证码
  const verificationCode = generateVerificationCode()
  console.log('生成的验证码:', verificationCode)
  
  const requestBody = {
    phone,
    sms_type: smsType,
    content: `您的登录验证码是：${verificationCode}，5分钟内有效，请勿泄露给他人。`,
    expire_minutes: 5
  }
  
  console.log('请求体:', requestBody)
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  // 尝试多个可能的短信发送端点
  const endpoints = [
    '/push/v1/sms/send',
    '/sms/v1/send',
    '/auth/v1/sms/send',
    '/app/v1/sms/send',
    '/account/v1/sms/send',
    '/push/v1/sms',
    '/sms/v1/verification/send'
  ]
  
  let lastError: Error | null = null
  
  for (const endpoint of endpoints) {
    try {
      console.log('尝试端点:', endpoint)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('端点响应状态:', endpoint, response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('短信发送成功，端点:', endpoint, '响应:', result)
        return { id: result.data?.id || result.id || result.record_id || 'temp_' + Date.now() }
      } else if (response.status === 404) {
        console.log('端点不存在，尝试下一个:', endpoint)
        lastError = new Error(`端点不存在: ${endpoint}`)
        continue
      } else {
        const errorText = await response.text()
        console.log('端点返回错误，尝试下一个:', endpoint, response.status, errorText)
        lastError = new Error(`端点 ${endpoint} 返回错误: ${response.status} - ${errorText}`)
        continue
      }
    } catch (error) {
      console.log('端点请求异常，尝试下一个:', endpoint, error)
      lastError = error instanceof Error ? error : new Error('未知错误')
      continue
    }
  }
  
  // 所有端点都失败了
  console.error('所有短信发送端点都失败了')
  throw new Error(`发送短信验证码失败: 所有端点都无法访问。最后错误: ${lastError?.message || '未知错误'}`)
}

// 验证短信验证码
export async function verifySmsCode(recordId: string, code: string, appKey?: string): Promise<boolean> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  console.log('验证短信验证码，记录ID:', recordId, '验证码:', code)
  
  const requestBody = { code }
  console.log('请求体:', requestBody)
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  // 尝试多个可能的验证端点
  const endpoints = [
    `/push/v1/sms/${recordId}/verify`,
    `/sms/v1/${recordId}/verify`,
    `/auth/v1/sms/${recordId}/verify`,
    `/app/v1/sms/${recordId}/verify`,
    `/account/v1/sms/${recordId}/verify`,
    `/push/v1/sms/verify`,
    `/sms/v1/verification/verify`
  ]
  
  let lastError: Error | null = null
  
  for (const endpoint of endpoints) {
    try {
      console.log('尝试验证端点:', endpoint)
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
        body: JSON.stringify(requestBody),
      })
      
      console.log('验证端点响应状态:', endpoint, response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('验证成功，端点:', endpoint, '响应:', result)
        return result.data?.verified || result.verified || false
      } else if (response.status === 404) {
        console.log('验证端点不存在，尝试下一个:', endpoint)
        lastError = new Error(`验证端点不存在: ${endpoint}`)
        continue
      } else {
        const errorText = await response.text()
        console.log('验证端点返回错误，尝试下一个:', endpoint, response.status, errorText)
        lastError = new Error(`验证端点 ${endpoint} 返回错误: ${response.status} - ${errorText}`)
        continue
      }
    } catch (error) {
      console.log('验证端点请求异常，尝试下一个:', endpoint, error)
      lastError = error instanceof Error ? error : new Error('未知错误')
      continue
    }
  }
  
  // 所有验证端点都失败了
  console.error('所有短信验证端点都失败了')
  throw new Error(`验证短信验证码失败: 所有端点都无法访问。最后错误: ${lastError?.message || '未知错误'}`)
}

// 生成6位数字验证码
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
