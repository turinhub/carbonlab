'use server'

import type {
  AppTokensQueryParams,
  AppTokensResponse,
} from '@/lib/types/tale'
import {
  createTaleServerAppClient,
} from '@/lib/server/tale-client'

export async function getAppTokens(
  params?: AppTokensQueryParams
): Promise<AppTokensResponse> {
  const result = await createTaleServerAppClient().appTokens.list({
    page: params?.page,
    size: params?.size,
    isValid: params?.is_valid,
    sort: params?.sort_by,
    sortDirection: params?.sort_direction,
    search: params?.search,
  })

  return {
    total: result.total,
    content: result.content.map(token => ({
      type: token.type,
      app_key: token.appKey,
      token:
        token.token.length > 12
          ? `${token.token.slice(0, 8)}...${token.token.slice(-4)}`
          : '********',
      status: token.status,
      expired_at: token.expiredAt,
    })),
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
  }
}
