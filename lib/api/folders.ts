'use server'

import type { FileType, Folder as SdkFolder } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'

export interface Folder {
  id: string
  app_id: string
  folder_name: string
  folder_type: string[]
  folder_attr?: {
    icon: string
    color: string
  }
  remark: string
  created_at: string
  updated_at: string
}

export interface FoldersResponse {
  data: {
    total: number
    content: Folder[]
    pageable: {
      sort: { orders: unknown[] }
      pageNumber: number
      pageSize: number
    }
  }
  code: number
  msg: string
}

export interface FoldersQueryParams {
  page?: number
  size?: number
  sortBy?: string
  keyword?: string
}

export interface CreateFolderRequest {
  folder_name: string
  folder_type: string[]
  remark?: string
  folder_attr?: object
}

export interface UpdateFolderRequest {
  folder_name: string
  folder_type: string[]
  remark?: string
  folder_attr: object
}

function toFolder(folder: SdkFolder): Folder {
  return {
    id: folder.id,
    app_id: folder.appKey,
    folder_name: folder.folderName,
    folder_type: folder.folderType,
    folder_attr: folder.folderAttr as Folder['folder_attr'],
    remark: folder.remark ?? '',
    created_at: folder.createdAt,
    updated_at: folder.updatedAt,
  }
}

export async function getFolders(
  params?: FoldersQueryParams
): Promise<FoldersResponse> {
  const result = await createTaleServerAppClient().cms.listFolders({
    page: params?.page,
    size: params?.size,
    sort: params?.sortBy,
  })
  return {
    data: {
      total: result.total,
      content: result.content.map(toFolder),
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

export async function createFolder(
  data: CreateFolderRequest
): Promise<Folder> {
  const result = await createTaleServerAppClient().cms.createFolder({
    folderName: data.folder_name,
    folderType: data.folder_type as FileType[],
    folderAttr: data.folder_attr as Record<string, unknown> | undefined,
    remark: data.remark,
  })
  return toFolder(result)
}

export async function updateFolder(
  id: string,
  data: UpdateFolderRequest
): Promise<Folder> {
  const result = await createTaleServerAppClient().cms.updateFolder(id, {
    folderName: data.folder_name,
    folderType: data.folder_type as FileType[],
    folderAttr: data.folder_attr as Record<string, unknown>,
    remark: data.remark,
  })
  return toFolder(result)
}

export async function deleteFolder(
  id: string
): Promise<void> {
  await createTaleServerAppClient().cms.deleteFolder(id)
}

export async function getFolderById(
  id: string
): Promise<Folder> {
  return toFolder(await createTaleServerAppClient().cms.getFolder(id))
}
