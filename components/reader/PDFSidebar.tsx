'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PDFSidebarProps {
  pdfDocument: PDFDocumentProxy | null;
  currentPage: number;
  onPageClick: (pageNumber: number) => void;
}

interface PDFThumbnail {
  pageNumber: number;
  url: string;
}

interface PDFBookmark {
  title: string;
  bold?: boolean;
  italic?: boolean;
  color?: Uint8ClampedArray;
  dest?: string | unknown[] | null;
  url?: string | null;
  unsafeUrl?: string;
  newWindow?: boolean;
  count?: number;
  items?: PDFBookmark[];
  pageNumber?: number;
}

export function PDFSidebar({
  pdfDocument,
  currentPage,
  onPageClick,
}: PDFSidebarProps) {
  const [thumbnails, setThumbnails] = React.useState<PDFThumbnail[]>([]);
  const [bookmarks, setBookmarks] = React.useState<PDFBookmark[]>([]);
  const [loading, setLoading] = React.useState(true);

  // 加载缩略图
  React.useEffect(() => {
    const loadThumbnails = async () => {
      if (!pdfDocument) return;

      setLoading(true);
      const thumbs: PDFThumbnail[] = [];

      for (let i = 1; i <= pdfDocument.numPages; i++) {
        try {
          const page = await pdfDocument.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport,
          } as any).promise;

          thumbs.push({
            pageNumber: i,
            url: canvas.toDataURL(),
          });
        } catch (error) {
          console.error(`Error loading thumbnail for page ${i}:`, error);
        }
      }

      setThumbnails(thumbs);
      setLoading(false);
    };

    loadThumbnails();
  }, [pdfDocument]);

  // 加载书签
  React.useEffect(() => {
    const loadBookmarks = async () => {
      if (!pdfDocument) return;
      try {
        const outline = await pdfDocument.getOutline();
        setBookmarks((outline as PDFBookmark[]) || []);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      }
    };

    loadBookmarks();
  }, [pdfDocument]);

  // 处理书签点击
  const handleBookmarkClick = async (bookmark: PDFBookmark) => {
    if (!pdfDocument) return;

    try {
      let pageIndex: number | undefined;

      // 处理不同类型的书签目标
      if (bookmark.dest) {
        if (typeof bookmark.dest === 'string') {
          // 命名目标
          const destination = await pdfDocument.getDestination(bookmark.dest);
          if (destination && destination[0]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pageIndex = await pdfDocument.getPageIndex(destination[0] as any);
          }
        } else if (Array.isArray(bookmark.dest) && bookmark.dest[0]) {
          // 显式目标
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pageIndex = await pdfDocument.getPageIndex(bookmark.dest[0] as any);
        }
      } else if (bookmark.pageNumber) {
        // 直接页码
        pageIndex = bookmark.pageNumber - 1;
      }

      if (typeof pageIndex === 'number') {
        onPageClick(pageIndex + 1);
      }
    } catch (error) {
      console.error('Error navigating to bookmark:', error);
    }
  };

  return (
    <div className='w-64 border-r bg-muted'>
      <Tabs defaultValue='thumbnails'>
        <TabsList className='w-full p-2'>
          <TabsTrigger value='thumbnails' className='flex-1 bg-transparent'>
            缩略图
          </TabsTrigger>
          <TabsTrigger value='bookmarks' className='flex-1 bg-transparent'>
            书签
          </TabsTrigger>
        </TabsList>

        <TabsContent value='thumbnails'>
          <ScrollArea className='h-[calc(100vh-8rem)]'>
            {loading ? (
              <div className='space-y-2 p-4'>
                {Array.from({ length: pdfDocument?.numPages || 5 }, (_, i) => (
                  <div key={i} className='flex flex-col items-center p-1'>
                    <Skeleton className='w-48 h-32' />
                    <Skeleton className='w-16 h-4 mt-1' />
                  </div>
                ))}
              </div>
            ) : (
              <div className='space-y-2 p-4'>
                {thumbnails.map(thumb => (
                  <div
                    key={thumb.pageNumber}
                    className={`w-full flex flex-col items-center p-1 rounded ${
                      currentPage === thumb.pageNumber ? 'bg-primary/10' : ''
                    }`}
                  >
                    <Image
                      src={thumb.url}
                      alt={`Page ${thumb.pageNumber}`}
                      width={192}
                      height={256}
                      className='w-48 border cursor-pointer hover:opacity-80 transition-opacity'
                      onClick={() => onPageClick(thumb.pageNumber)}
                    />
                    <span className='text-sm mt-1'>
                      第 {thumb.pageNumber} 页
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value='bookmarks'>
          <ScrollArea className='h-[calc(100vh-8rem)]'>
            <div className='p-4'>
              {bookmarks.length === 0 ? (
                <div className='text-sm text-muted-foreground text-center py-4'>
                  没有可用的书签
                </div>
              ) : (
                <div className='space-y-2'>
                  {bookmarks.map((bookmark, index) => (
                    <button
                      key={index}
                      onClick={() => handleBookmarkClick(bookmark)}
                      className='text-sm hover:text-primary w-full text-left py-1 px-2 rounded hover:bg-primary/10'
                    >
                      {bookmark.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
