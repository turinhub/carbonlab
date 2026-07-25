'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Calendar, HardDrive, AlertCircle } from 'lucide-react';
import { getOssMetadata, type OssMetadata } from '@/lib/api/files';

interface CurrentFileInfoProps {
  ossUrl?: string;
  fileName?: string;
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

// 获取文件类型显示名称
const getFileTypeLabel = (contentType: string): string => {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF文档',
    'image/jpeg': 'JPEG图片',
    'image/png': 'PNG图片',
    'image/gif': 'GIF图片',
    'image/webp': 'WebP图片',
    'video/mp4': 'MP4视频',
    'video/avi': 'AVI视频',
    'video/mov': 'MOV视频',
    'audio/mp3': 'MP3音频',
    'audio/wav': 'WAV音频',
    'audio/aac': 'AAC音频',
    'application/msword': 'Word文档',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'Word文档',
    'text/plain': '文本文件',
    'text/markdown': 'Markdown文档',
  };

  return typeMap[contentType] || contentType;
};

export default function CurrentFileInfo({
  ossUrl,
  fileName,
}: CurrentFileInfoProps) {
  const [metadata, setMetadata] = useState<OssMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!ossUrl) {
        return;
      }

      // 如果ossUrl是完整的URL，提取key
      let ossKey = ossUrl;
      if (ossUrl.startsWith('http')) {
        try {
          const url = new URL(ossUrl);
          const keyParam = url.searchParams.get('key');
          if (keyParam) {
            ossKey = decodeURIComponent(keyParam);
          } else {
            // 如果没有key参数，可能是直接的OSS URL，跳过获取元数据
            return;
          }
        } catch {
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getOssMetadata(ossKey);
        setMetadata(data);
      } catch (err) {
        console.error('获取文件元数据失败:', err);
        setError(err instanceof Error ? err.message : '获取文件信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [ossUrl]);

  // 如果没有OSS URL，不显示组件
  if (!ossUrl) {
    return null;
  }

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium flex items-center gap-2'>
          <FileText className='w-4 h-4' />
          当前文件信息
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        {loading ? (
          <div className='space-y-3'>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ) : error ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <AlertCircle className='w-4 h-4 text-orange-500' />
            <span>无法获取文件详细信息</span>
          </div>
        ) : metadata ? (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>文件名</span>
              <span className='text-sm font-medium break-all' title={fileName}>
                {fileName || '未知文件'}
              </span>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>文件类型</span>
              <Badge variant='secondary' className='text-xs'>
                {getFileTypeLabel(metadata.content_type)}
              </Badge>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>文件大小</span>
              <div className='flex items-center gap-1'>
                <HardDrive className='w-3 h-3 text-muted-foreground' />
                <span className='text-sm font-medium'>
                  {formatFileSize(metadata.content_length)}
                </span>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>最后修改</span>
              <div className='flex items-center gap-1'>
                <Calendar className='w-3 h-3 text-muted-foreground' />
                <span className='text-sm'>
                  {formatDate(metadata.last_modified)}
                </span>
              </div>
            </div>

            <div className='pt-2 border-t'>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>ETag</span>
                <span
                  className='text-xs font-mono text-muted-foreground break-all'
                  title={metadata.etag}
                >
                  {metadata.etag}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className='text-sm text-muted-foreground'>文件信息不可用</div>
        )}
      </CardContent>
    </Card>
  );
}
