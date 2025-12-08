'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PptViewerProps {
  pptUrl: string;
  fileName?: string;
}

export default function PptViewer({ pptUrl, fileName }: PptViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pptLoaded, setPptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPpt();
  }, [pptUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPpt = async () => {
    if (!pptUrl) return;

    setLoading(true);
    setError(null);
    setPptLoaded(false);

    try {
      // 动态导入 pptx-preview
      const { default: PptxGenJS } = (await import('pptx-preview')) as any;

      if (containerRef.current) {
        // 清空容器
        containerRef.current.innerHTML = '';

        // 配置选项
        const options = {
          // 自定义配置
          width: containerRef.current.clientWidth,
          height: 600,
          showNotes: false,
          showSlideNumbers: true,
          slideMode: true,
          enableLinks: true,
        };

        // 创建 PPT 预览
        const pptx = new PptxGenJS();
        await pptx.loadFromUrl(pptUrl);

        // 渲染到容器
        await pptx.render(containerRef.current, options);

        setPptLoaded(true);
      }
    } catch (err) {
      console.error('加载 PPT 文件失败:', err);
      setError(err instanceof Error ? err.message : '加载 PPT 文件失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span className='text-sm text-muted-foreground'>
            正在加载 PowerPoint 文档...
          </span>
        </div>
        <Skeleton className='w-full h-[500px]' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className='border-destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-2'>
            <p>{error}</p>
            <div className='flex gap-2'>
              <Button onClick={loadPpt} size='sm' variant='outline'>
                重新加载
              </Button>
              {pptUrl && (
                <Button
                  onClick={() => window.open(pptUrl, '_blank')}
                  size='sm'
                  variant='outline'
                >
                  <Download className='w-4 h-4 mr-1' />
                  下载文件
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* 工具栏 */}
      <div className='flex items-center justify-between p-2 bg-muted border-b'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{fileName || 'PowerPoint 文档'}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={loadPpt} size='sm' variant='outline'>
            刷新
          </Button>
          {pptUrl && (
            <Button
              onClick={() => window.open(pptUrl, '_blank')}
              size='sm'
              variant='outline'
            >
              <Download className='w-4 h-4 mr-1' />
              下载
            </Button>
          )}
        </div>
      </div>

      {/* PPT 内容 */}
      <div className='flex-1 overflow-auto bg-gray-50'>
        <div className='w-full h-full'>
          <div
            ref={containerRef}
            className='w-full h-full min-h-[500px] flex items-center justify-center'
          >
            {!pptLoaded && (
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在准备演示文稿...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}