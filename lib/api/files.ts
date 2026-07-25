'use server'

import type { FileType } from '@turinhub/tale-js-sdk'
import { createTaleServerAppClient } from '@/lib/server/tale-client'
import { toLegacyFile } from '@/lib/server/tale-legacy-adapters'

export interface FileData {
  id: string
  folder_id: string
  file_name: string
  file_type: string
  file_attr?: object
  link_url?: string
  content?: string
  oss_url?: string
  preview_image_url?: string
  remark?: string
  created_at: string
  updated_at: string
}

export interface FileResponse {
  data: FileData
  code: number
  msg: string
}

export interface CreateFileRequest {
  file?: File
  folder_id: string
  file_name: string
  file_type: string
  file_attr?: object
  link_url?: string
  content?: string
  oss_url?: string
  remark?: string
}

export interface UpdateFileRequest {
  file?: File
  id: string
  folder_id: string
  file_name: string
  file_type: string
  file_attr?: object
  link_url?: string
  content?: string
  oss_url?: string
  remark?: string
}

export async function createFile(
  data: CreateFileRequest
): Promise<FileData> {
  const result = await createTaleServerAppClient().cms.createFile({
    folderId: data.folder_id,
    fileName: data.file_name,
    fileType: data.file_type as FileType,
    fileAttr: data.file_attr as Record<string, unknown> | undefined,
    linkUrl: data.link_url,
    content: data.content,
    remark: data.remark,
  })
  return toLegacyFile(result)
}

export async function updateFile(
  id: string,
  data: UpdateFileRequest
): Promise<FileData> {
  const result = await createTaleServerAppClient().cms.updateFile(id, {
    folderId: data.folder_id,
    fileName: data.file_name,
    fileType: data.file_type as FileType,
    fileAttr: data.file_attr as Record<string, unknown> | undefined,
    linkUrl: data.link_url,
    content: data.content,
    remark: data.remark,
  })
  return toLegacyFile(result)
}

export async function updateFileContent(
  id: string,
  content: string
): Promise<void> {
  await createTaleServerAppClient().cms.updateFileContent(id, content)
}

export interface FilesQueryParams {
  page?: number
  size?: number
  sortBy?: string
  folder_id?: string
  keyword?: string
}

export interface FilesResponse {
  code: number
  msg: string
  data: {
    content: FileData[]
    totalElements: number
    totalPages: number
    size: number
    number: number
  }
}

export async function getFiles(
  params: FilesQueryParams = {}
): Promise<FilesResponse> {
  if (!params.folder_id) {
    throw new Error('folder_id is required for getting files')
  }
  const result = await createTaleServerAppClient().cms.listFiles({
    folderId: params.folder_id,
    page: params.page,
    size: params.size,
    sort: params.sortBy,
  })
  return {
    code: 200,
    msg: 'OK',
    data: {
      content: result.content.map(toLegacyFile),
      totalElements: result.total,
      totalPages: result.totalPages,
      size: result.size,
      number: result.page,
    },
  }
}

export async function getFileById(
  id: string
): Promise<FileData> {
  return toLegacyFile(await createTaleServerAppClient().cms.getFile(id))
}

export async function deleteFile(
  id: string
): Promise<void> {
  await createTaleServerAppClient().cms.deleteFile(id)
}

export interface FileSTSCredentialsRequest {
  file_extension: string
  durationSeconds?: number
}

export interface FileSTSCredentialsResponse {
  credentials: {
    tmpSecretId: string
    tmpSecretKey: string
    sessionToken: string
  }
  allowPrefix: string
  startTime: number
  expiredTime: number
  bucket: string
  region: string
}

export async function getFileSTSCredentials(
  fileId: string,
  data: FileSTSCredentialsRequest
): Promise<FileSTSCredentialsResponse> {
  return createTaleServerAppClient().cms.getFileStsCredentials(
    fileId,
    data.file_extension,
    data.durationSeconds
  )
}

export interface FileUploadCompleteRequest {
  oss_key: string
  file_size: number
  etag: string
}

export interface OssMetadata {
  content_type: string
  content_length: number
  last_modified: string
  etag: string
}

export interface PresignedUrlResponse {
  presigned_url: string
}

export async function getFilePresignedUrl(
  fileId: string
): Promise<PresignedUrlResponse> {
  const result = await createTaleServerAppClient().cms.getFilePresignedUrl(fileId)
  return { presigned_url: result.presignedUrl }
}

export async function notifyFileUploadComplete(
  fileId: string,
  data: FileUploadCompleteRequest
): Promise<void> {
  await createTaleServerAppClient().cms.fileUploadComplete(fileId, {
    ossKey: data.oss_key,
    fileSize: data.file_size,
    etag: data.etag,
  })
}

export async function getOssMetadata(
  ossKey: string
): Promise<OssMetadata> {
  const result = await createTaleServerAppClient().cms.getOssMetadata(ossKey)
  return {
    content_type: result.contentType ?? '',
    content_length: result.contentLength ?? 0,
    last_modified: result.lastModified ?? '',
    etag: result.etag ?? '',
  }
}

export interface UploadPreviewImageResponse {
  code: number
  msg: string
  data: {
    preview_image_url: string
  }
}

export async function uploadFilePreviewImage(
  fileId: string,
  imageFile: File
): Promise<UploadPreviewImageResponse['data']> {
  const result = await createTaleServerAppClient().cms.setFilePreviewImage(
    fileId,
    imageFile
  )
  return { preview_image_url: result.previewImageUrl ?? '' }
}
