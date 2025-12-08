"use client";

import React, { Suspense, use } from "react";
import { ArrowLeft, BookOpen, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";

// 动态导入PDFViewer组件，禁用服务器端渲染
const PDFViewer = dynamic(() => import("@/components/reader/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">PDF查看器加载中...</p>
      </div>
    </div>
  ),
});

export default function Chapter5Page({ params }: { params: Promise<{ "course-id": string }> }) {
  const { "course-id": courseId } = use(params);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 页面头部 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回课程
                </Button>
              </Link>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <h1 className="text-xl font-semibold">第5章 碳足迹计量</h1>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>PDF 文档阅读器</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {/* PDF 查看器 - 参考8.31的样式 */}
        <div className="h-[calc(100vh-120px)] border rounded-lg">
          <PDFViewer 
            pdfUrl="/chapter-5-carbon-footprint-measurement.pdf"
          />
        </div>
      </div>
    </div>
  );
}