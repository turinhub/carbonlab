'use server'

import type { FileType, Folder as SdkFolder } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export interface Repository {
  id: string
  appId: string
  folderName: string
  folderType: string[]
  folderAttr?: {
    icon: string
    color: string
  }
  remark: string
  createdAt: string
  updatedAt: string
}

export interface RepositoriesResponse {
  data: {
    total: number
    content: Repository[]
    pageable: {
      sort: { orders: unknown[] }
      pageNumber: number
      pageSize: number
    }
  }
  code: number
  msg: string
}

export interface RepositoriesQueryParams {
  page?: number
  size?: number
  sortBy?: string
  keyword?: string
}

export interface CreateRepositoryRequest {
  folderName: string
  folderType: string[]
  remark?: string
  folderAttr?: object
}

export interface UpdateRepositoryRequest {
  folderName: string
  folderType: string[]
  remark?: string
  folderAttr: object
}

function toRepository(folder: SdkFolder): Repository {
  return {
    id: folder.id,
    appId: folder.appKey,
    folderName: folder.folderName,
    folderType: folder.folderType,
    folderAttr: folder.folderAttr as Repository['folderAttr'],
    remark: folder.remark ?? '',
    createdAt: folder.createdAt,
    updatedAt: folder.updatedAt,
  }
}

export async function getRepositories(
  params?: RepositoriesQueryParams
): Promise<RepositoriesResponse> {
  const result = await createTaleServerAppClient().cms.listFolders({
    page: params?.page,
    size: params?.size,
    sort: params?.sortBy,
  })
  return {
    data: {
      total: result.total,
      content: result.content.map(toRepository),
      pageable: {
        sort: { orders: result.sort },
        pageNumber: result.page,
        pageSize: result.size,
      },
    },
    code: 200,
    msg: 'OK',
  }
}

export async function createRepository(
  data: CreateRepositoryRequest
): Promise<Repository> {
  const result = await createTaleServerAppClient().cms.createFolder({
    folderName: data.folderName,
    folderType: data.folderType as FileType[],
    folderAttr: data.folderAttr as Record<string, unknown> | undefined,
    remark: data.remark,
  })
  return toRepository(result)
}

export async function updateRepository(
  id: string,
  data: UpdateRepositoryRequest
): Promise<Repository> {
  const result = await createTaleServerAppClient().cms.updateFolder(id, {
    folderName: data.folderName,
    folderType: data.folderType as FileType[],
    folderAttr: data.folderAttr as Record<string, unknown>,
    remark: data.remark,
  })
  return toRepository(result)
}

export async function deleteRepository(
  id: string
): Promise<void> {
  await createTaleServerAppClient().cms.deleteFolder(id)
}

export async function getRepository(
  id: string
): Promise<Repository> {
  return toRepository(await createTaleServerAppClient().cms.getFolder(id))
}
