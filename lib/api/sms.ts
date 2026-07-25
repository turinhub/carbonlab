'use server'

import type {
  SmsQueryParams,
  SmsRecord,
  SmsRecordsResponse,
} from '@/lib/types/tale'
import {
  sendLoginSmsAction,
  verifyLoginSmsAction,
} from '@/lib/actions/tale-auth-actions'
import {
  createTaleServerAppClient,
  taleServerRequest,
} from '@/lib/server/tale-client'
import type { LoginResponse } from '@/lib/api/auth'

export async function getSmsRecords(
  params?: SmsQueryParams
): Promise<SmsRecordsResponse> {
  const result = await createTaleServerAppClient().smsRecords.list({
    page: params?.page,
    size: params?.size,
    verifiedStatus: params?.verifiedStatus,
    smsType:
      params?.sms_type && params.sms_type !== 'all'
        ? params.sms_type
        : undefined,
  })

  return {
    data: {
      total: result.total,
      content: result.content,
      pageable: {
        sort: {
          orders: result.sort.map(order => ({
            ...order,
            ignoreCase: false,
            nullHandling: 'NATIVE',
          })),
        },
        pageNumber: result.page,
        pageSize: result.size,
      },
    },
    code: 200,
    msg: 'OK',
  }
}

export async function resendSms(recordId: string): Promise<void> {
  await taleServerRequest(
    `/push/v1/sms/${encodeURIComponent(recordId)}/resend`,
    { method: 'POST' }
  )
}

export async function deleteSmsRecord(recordId: string): Promise<void> {
  await taleServerRequest(
    `/push/v1/sms/${encodeURIComponent(recordId)}`,
    { method: 'DELETE' }
  )
}

export async function getSmsRecordDetail(recordId: string): Promise<SmsRecord> {
  const result = await taleServerRequest<
    { data?: SmsRecord } & Partial<SmsRecord>
  >(
    `/push/v1/sms/${encodeURIComponent(recordId)}`,
    { method: 'GET' }
  )
  return result.data ?? (result as SmsRecord)
}

export async function sendSmsCode(
  phone: string,
  smsType = 'login'
): Promise<{ id: string }> {
  if (smsType !== 'login') {
    throw new Error(`Unsupported SMS type: ${smsType}`)
  }
  return sendLoginSmsAction(phone)
}

export async function verifySmsCode(
  recordId: string,
  code: string
): Promise<LoginResponse> {
  return verifyLoginSmsAction(recordId, code)
}
