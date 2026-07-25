import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, getProcessedFileUri } from "@/lib/utils";
import { Play } from 'lucide-react';
import { getAvatarPresignedUrl } from '@/lib/api/users';
import { useUserStore } from '@/lib/stores/user-store';

// 定义课程图标映射
const courseIcons = {
  "carbon-emission-map": "map-marked-alt",
  "emission-source": "microscope",
  "personal-carbon-footprint": "user",
  "enterprise-carbon-footprint": "building",
  "carbon-market-simulation": "chart-line",
  "trading-strategy": "chess",
  "carbon-sink-measurement": "tree",
  "neutral-path-planning": "route",
}

type CourseCardProps = {
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    status?: string;
    icon?: string;
    module: string;
    image?: string;
    coverImageKey?: string;
  };
  className?: string;
};

export function CourseCard({ course, className }: CourseCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const router = useRouter();
  const { isLoggedIn } = useUserStore();

  // 生成课程封面图片预览URL
  useEffect(() => {
    const generateImageUrl = async () => {
      console.log('CourseCard - 开始生成图片URL，课程数据:', {
        id: course.id,
        title: course.title,
        coverImageKey: course.coverImageKey,
        image: course.image
      });

      if (course.coverImageKey) {
        try {
          setImageLoading(true);
          // 处理coverImageKey，确保它是有效的对象键
          let objectKey = course.coverImageKey;

          // 如果coverImageKey以'/'开头，移除开头的'/'
          if (objectKey.startsWith('/')) {
            objectKey = objectKey.substring(1);
          }

          const presignedResponse = await getAvatarPresignedUrl(objectKey);
          const url = getProcessedFileUri(presignedResponse.presignedUrl);
          
          setImageUrl(url);
        } catch (error) {
          console.error('CourseCard - 生成课程封面预览URL失败:', error);
          // 使用备用的image字段
          console.log('CourseCard - 使用备用image字段:', course.image);
          setImageUrl(course.image || '');
        } finally {
          setImageLoading(false);
        }
      } else if (course.image) {
        // 如果没有coverImageKey，使用image字段
        console.log('CourseCard - 没有coverImageKey，使用image字段:', course.image);
        setImageUrl(course.image);
        setImageLoading(false);
      } else {
        console.log('CourseCard - 没有任何图片数据，显示默认图标');
        setImageLoading(false);
      }
    };

    generateImageUrl();
  }, [course.coverImageKey, course.image]);


  
  // 根据状态设置徽章颜色
  const statusColor = {
    "已上线": "bg-green-100 text-green-800",
    "开发中": "bg-amber-100 text-amber-800",
    "维护中": "bg-orange-100 text-orange-800",
  }[course.status || ""] || "";

  // 根据模块设置按钮和背景颜色
  const moduleStyles = {
    "carbon-monitor": {
      bg: "bg-emerald-50",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: "text-emerald-600"
    },
    "carbon-calculate": {
      bg: "bg-blue-50",
      button: "bg-blue-600 hover:bg-blue-700",
      icon: "text-blue-600"
    },
    "carbon-trading": {
      bg: "bg-purple-50",
      button: "bg-purple-600 hover:bg-purple-700",
      icon: "text-purple-600"
    },
    "carbon-neutral": {
      bg: "bg-orange-50",
      button: "bg-orange-600 hover:bg-orange-700",
      icon: "text-orange-600"
    }
  }[course.module] || {
    bg: "bg-indigo-50",
    button: "bg-indigo-600 hover:bg-indigo-700",
    icon: "text-indigo-600"
  };

  // 根据课程ID获取图标，如果没有则使用模块默认图标
  const getIcon = () => {
    // 优先使用课程自身的icon属性
    if (course.icon) {
      return <i className={`fas fa-${course.icon} text-6xl ${moduleStyles.icon}`}></i>;
    }
    
    // 其次使用预定义的课程图标映射
    const icon = courseIcons[course.id as keyof typeof courseIcons];
    if (icon) {
      return <i className={`fas fa-${icon} text-6xl ${moduleStyles.icon}`}></i>;
    }
    
    // 如果没有课程特定图标，使用模块默认图标
    const moduleIcons = {
      "carbon-monitor": "chart-line",
      "carbon-calculate": "calculator",
      "carbon-trading": "exchange-alt",
      "carbon-neutral": "leaf"
    }
    
    const moduleIcon = moduleIcons[course.module as keyof typeof moduleIcons] || "book";
    return <i className={`fas fa-${moduleIcon} text-6xl ${moduleStyles.icon}`}></i>;
  };

  const isAvailable = course.status !== "开发中" && course.status !== "维护中";

  // 处理开始学习按钮点击
  const handleStartLearning = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      // 未登录时跳转到登录页面，并设置回调URL
      const currentUrl = `/courses/${course.id}`;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    // 已登录时直接跳转到课程页面
    router.push(`/courses/${course.id}`);
  };

  return (
    <Card className={cn("h-full overflow-hidden transition-all hover:shadow-lg hover:translate-y-[-5px]", className)}>
      <div className={`aspect-video relative overflow-hidden ${moduleStyles.bg} flex items-center justify-center`}>
        {imageLoading ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-sm text-gray-600">加载中...</p>
          </div>
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            {getIcon()}
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-xl text-gray-800">{course.title}</h3>
          <div className="flex items-center gap-2">
            {course.status && (course.status === "开发中" || course.status === "维护中") && (
              <span className={`text-xs font-medium ${statusColor} px-2 py-1 rounded`}>
                {course.status}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-5">{course.description}</p>
        <button
          onClick={handleStartLearning}
          className={`inline-block ${moduleStyles.button} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
        >
          <Play className="h-4 w-4 inline-block mr-2" />
          开始学习
        </button>
      </CardContent>
    </Card>
  );
}
