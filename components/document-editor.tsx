/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client';

import type React from 'react';

import { useState, useCallback, useEffect } from 'react';
import {
  createFile,
  updateFile,
  updateFileContent,
  getFileSTSCredentials,
  notifyFileUploadComplete,
  type CreateFileRequest,
  type FileSTSCredentialsRequest,
  type FileUploadCompleteRequest,
} from '@/lib/api/files';
import {
  Upload,
  FileText,
  Music,
  FileImage,
  Video,
  File,
  Link,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MarkdownEditor from '@/components/MarkdownEditor';
import CurrentFileInfo from '@/components/CurrentFileInfo';
import { toast } from 'sonner';

// JSON类型定义
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface DocumentData {
  id?: string;
  title: string;
  citation: string;
  createTime: string;
  contentType: 'markdown' | 'file' | 'link';
  fileType:
    | 'pdf'
    | 'audio'
    | 'video'
    | 'image'
    | 'link'
    | 'markdown'
    | 'doc'
    | 'other';
  content: string;
  fileName: string;
  externalUrl: string;
  fileAttr?: Record<string, unknown>;
  // 添加API返回的字段
  ossKey?: string;
  remark?: string;
  urlValidation?: {
    isValid: boolean;
    isChecking: boolean;
    error?: string;
    status?: 'success' | 'error' | 'checking' | 'idle';
  };
}

interface DocumentEditorProps {
  onBack?: () => void;
  document?: DocumentData | null;
  repository?: {
    id: string;
    supportedFileTypes: string[];
    folder_name?: string;
    folder_attr?: {
      icon?: string;
      color?: string;
      [key: string]: unknown;
    };
  } | null;
}

const contentTypes = [
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    color: 'bg-red-100 text-red-800',
  },
  {
    value: 'audio',
    label: '音频',
    icon: Music,
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'video',
    label: '视频',
    icon: Video,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'image',
    label: '图片',
    icon: FileImage,
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'link',
    label: '外部链接',
    icon: Link,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'markdown',
    label: 'Markdown',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    value: 'doc',
    label: '文档',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'other',
    label: '其他',
    icon: File,
    color: 'bg-gray-100 text-gray-800',
  },
];

export default function DocumentEditor({
  onBack,
  document: initialDocument,
  repository,
}: DocumentEditorProps) {
  // 初始化文档数据，根据是否为新建决定使用folder的folderAttr还是文件本身的数据
  const [document, setDocument] = useState<DocumentData>(() => {
    if (initialDocument && initialDocument.id) {
      // 修改现有文档，使用从API获取的完整数据
      return {
        id: initialDocument.id,
        title: initialDocument.title,
        citation: initialDocument.citation,
        createTime: initialDocument.createTime,
        contentType: initialDocument.contentType || 'markdown',
        fileType: (initialDocument.fileType?.toLowerCase() ||
          'pdf') as DocumentData['fileType'],
        content:
          initialDocument.content ||
          `# ${initialDocument.title}\n\n## 文档内容\n\n请在此处编辑文档内容...`,
        fileName: initialDocument.fileName || '',
        externalUrl: initialDocument.externalUrl || '',
        fileAttr: (initialDocument.fileAttr as JsonObject) || {},
        ossKey: initialDocument.ossKey || '',
        remark: initialDocument.remark || '',
      };
    } else {
      // 新建文档，使用folder的folderAttr
      return {
        title: '',
        citation: '',
        createTime: new Date().toLocaleString('zh-CN'),
        contentType: 'markdown',
        fileType: (repository?.supportedFileTypes[0]?.toLowerCase() ||
          'pdf') as DocumentData['fileType'],
        content: '# 新文档\n\n## 文档内容\n\n请在此处编辑文档内容...',
        fileName: '',
        externalUrl: '',
        fileAttr: (repository?.folder_attr as JsonObject) || {},
      };
    }
  });

  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    error?: string;
    status: 'success' | 'error' | 'checking' | 'idle';
  }>({
    isValid: false,
    isChecking: false,
    status: 'idle',
  });

  const [saving, setSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(
    initialDocument?.id || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    isUploading: boolean;
    progress: number;
    isSuccess: boolean;
    speed?: number; // KB/s
    startTime?: number;
    uploadedBytes?: number;
  }>({ isUploading: false, progress: 0, isSuccess: false });

  // 格式化上传速度显示（输入为字节/秒）
  const formatSpeed = (speed: number) => {
    const speedKB = speed / 1024; // 转换为KB/s
    if (speedKB < 1024) {
      return `${speedKB.toFixed(1)} KB/s`;
    } else if (speedKB < 1024 * 1024) {
      return `${(speedKB / 1024).toFixed(1)} MB/s`;
    } else {
      return `${(speedKB / 1024 / 1024).toFixed(1)} GB/s`;
    }
  };

  // Get supported file types from repository
  const supportedFileTypes = repository?.supportedFileTypes || [];

  // Filter content types based on repository support
  const availableContentTypes = contentTypes.filter(type =>
    supportedFileTypes.map(t => t.toLowerCase()).includes(type.value)
  );

  // 自动选中第一个可用的内容类型（仅对新建文档生效）
  useEffect(() => {
    if (availableContentTypes.length > 0 && !document.id) {
      const currentFileTypeExists = availableContentTypes.some(
        type => type.value === document.fileType
      );

      if (!currentFileTypeExists) {
        setDocument(prev => ({
          ...prev,
          fileType: availableContentTypes[0].value as DocumentData['fileType'],
        }));
      }
    }
  }, [availableContentTypes, document.fileType, document.id]);

  // URL格式验证函数
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // 检查URL可访问性
  const checkUrlAccessibility = useCallback(async (url: string) => {
    if (!url.trim()) {
      setUrlValidation({ isValid: false, isChecking: false, status: 'idle' });
      return;
    }

    if (!isValidUrl(url)) {
      setUrlValidation({
        isValid: false,
        isChecking: false,
        error: 'URL格式不正确，请输入有效的网址（如：https://example.com）',
        status: 'error',
      });
      return;
    }

    setUrlValidation({ isValid: false, isChecking: true, status: 'checking' });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      clearTimeout(timeoutId);

      setUrlValidation({
        isValid: true,
        isChecking: false,
        status: 'success',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUrlValidation({
        isValid: true, // 格式正确就认为有效
        isChecking: false,
        status: 'success',
      });
    }
  }, []);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: never[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 创建防抖的URL检查函数
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUrlCheck = useCallback(
    debounce(checkUrlAccessibility, 1000),
    []
  );

  // 获取接受的文件类型
  const getAcceptedFileTypes = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '.pdf';
      case 'audio':
        return '.mp3,.wav,.aac,.m4a';
      case 'video':
        return '.mp4,.avi,.mov,.wmv,.flv';
      case 'image':
        return '.jpg,.jpeg,.png,.gif,.bmp,.webp';
      case 'markdown':
        return '.md,.markdown';
      case 'doc':
        return '.doc,.docx,.txt,.rtf';
      default:
        return '*';
    }
  };

  // 处理URL输入变化
  const handleUrlChange = (url: string) => {
    setDocument({ ...document, externalUrl: url });
    void debouncedUrlCheck(url as never);
  };

  // 根据文件类型显示上传组件
  const renderFileUpload = () => {
    if (
      !repository?.supportedFileTypes.includes(document.fileType.toUpperCase())
    ) {
      return null;
    }

    const fileType = contentTypes.find(
      type => type.value === document.fileType
    );
    if (!fileType) return null;

    const Icon = fileType.icon;

    // 获取文件显示URL
    const ossKey = document.ossKey;

    return (
      <div className='space-y-4'>
        {/* 显示当前文件信息或提示 */}
        {ossKey ? (
          <CurrentFileInfo ossUrl={ossKey} fileName={document.fileName} />
        ) : documentId ? (
          <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <div className='flex items-center gap-2 text-yellow-800'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='font-medium'>暂未上传文件</span>
            </div>
            <p className='text-sm text-yellow-700 mt-1'>
              请上传文件或检查文件是否正常
            </p>
          </div>
        ) : null}

        <div className='flex items-center gap-2'>
          <Icon className={`w-5 h-5`} />
          <span className='font-medium'>{fileType.label}文件上传</span>
        </div>

        <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors'>
          <input
            type='file'
            onChange={handleFileUpload}
            className='hidden'
            id='file-upload-new'
            accept={getAcceptedFileTypes(document.fileType)}
          />
          <label htmlFor='file-upload-new' className='cursor-pointer'>
            <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
            <p className='text-sm text-gray-600'>
              点击上传{fileType.label}文件
            </p>
          </label>

          {uploadedFile && (
            <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded'>
              <p className='text-sm text-green-700'>
                已选择文件: {uploadedFile.name}
              </p>
              {uploadStatus.isUploading && (
                <div className='mt-2'>
                  <div className='flex justify-between text-xs text-gray-600 mb-1'>
                    <span>上传中...</span>
                    <div className='text-right'>
                      <span>{uploadStatus.progress}%</span>
                      {uploadStatus.speed !== undefined &&
                        uploadStatus.speed > 0 && (
                          <span className='text-xs text-gray-500 ml-2'>
                            {formatSpeed(uploadStatus.speed)}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                      style={{ width: `${uploadStatus.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              {uploadStatus.isSuccess && (
                <div className='mt-2 flex items-center text-xs text-green-600'>
                  <svg
                    className='w-4 h-4 mr-1'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  上传成功
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 处理文件上传
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file type is supported
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isSupported = supportedFileTypes.some((type: string) => {
        switch (type.toLowerCase()) {
          case 'pdf':
            return fileExtension === 'pdf';
          case 'audio':
            return ['mp3', 'wav', 'aac', 'm4a'].includes(fileExtension || '');
          case 'video':
            return ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(
              fileExtension || ''
            );
          case 'image':
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(
              fileExtension || ''
            );
          case 'markdown':
            return ['md', 'markdown'].includes(fileExtension || '');
          case 'doc':
            return ['doc', 'docx', 'txt', 'rtf'].includes(fileExtension || '');
          default:
            return false;
        }
      });

      if (!isSupported) {
        toast.error(
          `不支持的文件类型：${fileExtension}。该资料库仅支持：${supportedFileTypes.join(', ')}`
        );
        return;
      }

      // 检查文件大小（限制为1GB）
      const maxSize = 1024 * 1024 * 1024; // 1GB
      if (file.size > maxSize) {
        toast.error('文件大小不能超过1GB');
        return;
      }

      setDocument({ ...document, fileName: file.name });
      setUploadedFile(file);

      // 如果是编辑现有文档且有documentId，立即上传文件
      if (documentId) {
        try {
          setUploadStatus({
            isUploading: true,
            progress: 0,
            isSuccess: false,
            startTime: Date.now(),
            uploadedBytes: 0,
            speed: undefined,
          });
          toast.info('开始上传文件...');
          const fileUrl = await uploadFileWithSTS(file, documentId);

          // 上传成功后更新文档的 externalUrl 和后端的 oss_url
          if (fileUrl) {
            setDocument({
              ...document,
              fileName: file.name,
              externalUrl: fileUrl,
            });

            // 从完整URL中提取OSS key并更新后端记录
            try {
              const url = new URL(fileUrl);
              const ossKey = url.pathname.substring(1); // 移除开头的 '/'

              // 调用API更新文件的oss_url字段
              await updateFile(
                documentId,
                {
                  id: documentId,
                  folder_id: repository?.id || '',
                  file_name: file.name,
                  file_type: document.fileType,
                  file_attr: document.fileAttr || {},
                  link_url: '',
                  content: '',
                  oss_url: ossKey,
                  remark: document.remark || '',
                }
              );

              console.log('OSS URL已更新到后端:', ossKey);
            } catch (updateError) {
              console.error('更新后端OSS URL失败:', updateError);
              // 这里不抛出错误，因为文件已经上传成功，只是后端记录更新失败
              toast.warning('文件上传成功，但更新记录失败，请刷新页面');
            }
          }

          setUploadStatus({
            isUploading: false,
            progress: 100,
            isSuccess: true,
          });
          toast.success('文件上传成功！');
        } catch (error) {
          console.error('文件上传失败:', error);
          setUploadStatus({
            isUploading: false,
            progress: 0,
            isSuccess: false,
          });
          toast.error('文件上传失败，请重试');
          // 上传失败时清除文件选择
          setUploadedFile(null);
          setDocument({ ...document, fileName: '' });
        }
      } else {
        // 对于新建文档，重置上传状态
        setUploadStatus({ isUploading: false, progress: 0, isSuccess: false });
      }
      // 对于新建文档，文件会在保存文档时上传
    }
  };

  // 使用STS凭证上传文件到腾讯云COS
  const uploadFileWithSTS = async (
    file: File,
    fileId: string
  ): Promise<string | null> => {
    try {
      // 动态导入cos-js-sdk-v5以避免SSR问题
      let COS: any;
      try {
        const cosModule = await import('cos-js-sdk-v5');
        COS = cosModule.default;
      } catch (importError) {
        console.error('COS SDK导入失败:', importError);
        throw new Error('文件上传功能暂时不可用，请联系管理员安装必要的依赖');
      }

      // 获取文件扩展名
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      // 获取STS凭证
      const stsRequest: FileSTSCredentialsRequest = {
        file_extension: fileExtension,
        durationSeconds: 1800,
      };

      const stsResponse = await getFileSTSCredentials(
        fileId,
        stsRequest
      );

      if (!stsResponse?.credentials) {
        throw new Error('获取上传凭证失败');
      }

      const {
        credentials,
        allowPrefix,
        startTime,
        expiredTime,
        bucket,
        region,
      } = stsResponse;
      const { tmpSecretId, tmpSecretKey, sessionToken } = credentials;

      // 创建COS实例
      const cos = new COS({
        SecretId: tmpSecretId,
        SecretKey: tmpSecretKey,
        SecurityToken: sessionToken,
        StartTime: startTime,
        ExpiredTime: expiredTime,
      });

      // 使用COS SDK上传文件
      return new Promise((resolve, reject) => {
        cos.uploadFile(
          {
            Bucket: bucket,
            Region: region,
            Key: allowPrefix,
            Body: file,
            SliceSize: 1024 * 1024, // 大于1MB时使用分块上传
            onProgress: (progressData: { percent: number }) => {
              const progress = Math.round(progressData.percent * 100);
              console.log('上传进度:', progress + '%');

              setUploadStatus(prev => {
                const currentTime = Date.now();
                const uploadedBytes = Math.round(
                  file.size * progressData.percent
                );
                const elapsedTime = prev.startTime
                  ? (currentTime - prev.startTime) / 1000
                  : 0; // 秒
                const speed =
                  elapsedTime > 0 ? Math.round(uploadedBytes / elapsedTime) : 0; // 字节/秒

                return {
                  ...prev,
                  progress,
                  uploadedBytes,
                  speed,
                };
              });
            },
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          async (err: any, data: any) => {
            if (err) {
              console.error('COS上传失败:', err);
              reject(new Error(`文件上传失败: ${err.message || err}`));
            } else if (data && data.statusCode === 200) {
              try {
                // 调用上传完成接口
                const uploadCompleteData: FileUploadCompleteRequest = {
                  oss_key: allowPrefix,
                  file_size: file.size,
                  etag: data.ETag || 'unknown',
                };

                await notifyFileUploadComplete(
                  fileId,
                  uploadCompleteData
                );
                console.log('文件上传完成通知已发送');

                // 返回完整的文件URL
                const fileUrl = `https://${data.Location}`;
                console.log('文件上传成功:', fileUrl);
                resolve(fileUrl);
              } catch (notifyError) {
                console.error('上传完成通知失败:', notifyError);
                // 即使通知失败，也返回文件URL，因为文件已经上传成功
                const fileUrl = `https://${data.Location}`;
                resolve(fileUrl);
              }
            } else {
              reject(new Error('文件上传失败: 未知错误'));
            }
          }
        );
      });
    } catch (error) {
      console.error('STS上传失败:', error);
      throw error;
    }
  };

  // 获取验证状态图标
  const getValidationIcon = () => {
    switch (urlValidation.status) {
      case 'checking':
        return (
          <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent'></div>
        );
      case 'success':
        return (
          <svg
            className='w-4 h-4 text-green-500'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className='w-4 h-4 text-red-500'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // 添加保存文档函数
  const handleSaveDocument = async () => {
    if (!repository) {
      toast.error('未选择资料库');
      return;
    }

    // 如果是外部链接类型且URL不为空，需要校验URL格式
    if (document.fileType === 'link' && document.externalUrl.trim()) {
      if (!isValidUrl(document.externalUrl)) {
        toast.error('请输入正确的URL格式（必须以http://或https://开头）');
        return;
      }
    }

    try {
      setSaving(true);

      // 根据文件类型决定数据存储位置
      const getRequestData = () => {
        const baseData = {
          folder_id: repository.id,
          file_name: document.title,
          file_type: document.fileType.toUpperCase(),
          remark: document.citation,
          file_attr: document.fileAttr,
        };

        // 根据文件类型决定数据存储位置
        if (document.fileType === 'link') {
          // 链接类型存储到link_url
          return {
            ...baseData,
            link_url: document.externalUrl,
            file: undefined,
          };
        } else {
          // 其他类型
          return {
            ...baseData,
            link_url: '',
            file: uploadedFile || undefined,
          };
        }
      };

      if (documentId) {
        // 更新现有文档
        // 如果有文件需要上传，先上传文件
        if (uploadedFile && document.fileType !== 'link') {
          try {
            await uploadFileWithSTS(uploadedFile, documentId);
          } catch {
            toast.error('文件上传失败，请重试');
            return;
          }
        }

        const updateData = {
          ...getRequestData(),
          id: documentId,
          folder_id: repository.id,
          // 如果上传了文件，移除file字段，因为文件已经通过STS上传
          file: undefined,
        };

        const response = await updateFile(
          documentId,
          updateData
        );

        if (response) {
          // 如果有内容需要更新，单独调用内容更新接口（仅限非链接类型）
          if (
            document.content &&
            document.content.trim() &&
            document.fileType == 'markdown'
          ) {
            await updateFileContent(
              documentId,
              document.content
            );
          }
          toast.success('文档更新成功！');
          // 保存成功后跳转到管理资料库列表页面
          onBack?.();
        } else {
          toast.error('更新文档失败');
        }
      } else {
        // 创建新文档
        const createData = {
          ...getRequestData(),
          // 创建时不包含file字段，因为需要先创建记录再上传文件
          file: undefined,
        } as CreateFileRequest;

        const response = await createFile(createData);

        if (response?.id) {
          setDocumentId(response.id);

          // 如果有文件需要上传，在创建记录后上传文件
          if (uploadedFile && document.fileType !== 'link') {
            try {
              await uploadFileWithSTS(uploadedFile, response.id);
            } catch {
              toast.error('文件上传失败，但文档记录已创建');
              return;
            }
          }

          // 如果有内容需要更新，单独调用内容更新接口（仅限非链接类型）
          if (
            document.content &&
            document.content.trim() &&
            document.fileType !== 'link'
          ) {
            await updateFileContent(
              response.id,
              document.content
            );
          }
          toast.success('文档创建成功！');
          // 保存成功后跳转到管理资料库列表页面
          onBack?.();
        } else {
          toast.error('创建文档失败');
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存文档失败');
    } finally {
      setSaving(false);
    }
  };

  const renderContentEditor = () => {
    if (document.fileType.toLowerCase() === 'link') {
      return (
        <div className='flex-1 overflow-hidden p-6'>
          <div className='space-y-6'>
            <div>
              <Label htmlFor='external-url'>外部链接</Label>
              <div className='relative'>
                <Input
                  id='external-url'
                  type='url'
                  placeholder='请输入完整的网址，如：https://example.com'
                  value={document.externalUrl}
                  onChange={e => handleUrlChange(e.target.value)}
                  className={`pr-10 ${
                    urlValidation.status === 'error'
                      ? 'border-red-300 focus:border-red-500'
                      : urlValidation.status === 'success'
                        ? 'border-green-300 focus:border-green-500'
                        : ''
                  }`}
                />
                <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                  {getValidationIcon()}
                </div>
              </div>
              {urlValidation.error && (
                <p className='text-sm text-red-600 mt-1'>
                  {urlValidation.error}
                </p>
              )}
              {urlValidation.status === 'success' && (
                <p className='text-sm text-green-600 mt-1'>链接格式正确</p>
              )}
              <p className='text-sm text-gray-500 mt-2'>
                注意：外部链接类型仅支持填写符合 HTTP/HTTPS
                格式的网址，不支持文件上传。
              </p>
            </div>
          </div>
        </div>
      );
    }

    // 对于markdown类型，直接显示markdown编辑器
    if (document.fileType.toLowerCase() === 'markdown') {
      return (
        <div className='flex-1 overflow-hidden'>
          <MarkdownEditor
            value={document.content || ''}
            onChange={content => setDocument({ ...document, content })}
            className='h-full'
            placeholder='在此输入Markdown内容...'
          />
        </div>
      );
    }

    // 需要文件上传的类型：pdf、图片、视频、音频、doc
    if (
      ['pdf', 'image', 'video', 'audio', 'doc'].includes(
        document.fileType.toLowerCase()
      )
    ) {
      return (
        <div className='flex-1 overflow-hidden p-6'>{renderFileUpload()}</div>
      );
    }

    // 对于其他类型，显示markdown编辑器
    return (
      <div className='flex-1 overflow-hidden'>
        <MarkdownEditor
          value={document.content || ''}
          onChange={content => setDocument({ ...document, content })}
          className='h-full'
          placeholder='在此输入Markdown内容...'
        />
      </div>
    );
  };

  return (
    <div className='flex flex-col h-full bg-white rounded-lg border border-gray-200'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
        <h1 className='text-lg font-semibold text-gray-900'>
          {document.title || '新建文档'}
        </h1>
        <Button
          onClick={() => handleSaveDocument()}
          disabled={saving}
          className='bg-blue-600 hover:bg-blue-700 text-white'
        >
          {saving ? '保存中...' : '保存文档'}
        </Button>
      </div>

      {/* Content Editor */}
      {renderContentEditor()}
    </div>
  );
}
