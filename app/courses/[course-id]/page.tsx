'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import {
  getCourseByIdForComponent,
  subscribeToCourseAPI,
  checkCourseSubscriptionAPI,
} from '@/lib/api/courses';
import { CourseHeaderSkeleton } from '@/components/course/CourseSkeleton';
import { CourseContent } from '@/components/course/CourseContent';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useUserStore } from '@/lib/stores/user-store';
import { getAvatarPresignedUrl } from '@/lib/api/users';
import { getProcessedFileUri } from '@/lib/utils';

// SWR fetcher 函数
const courseFetcher = async ([_, courseId]: [string, string]) => {
  return await getCourseByIdForComponent(courseId);
};

const subscriptionFetcher = async ([_, courseId, userId]: [
  string,
  string,
  string,
]) => {
  return await checkCourseSubscriptionAPI(courseId, userId);
};

export default function LearningUnit({
  params,
}: {
  params: Promise<{ 'course-id': string }>;
}) {
  const { user } = useUserStore();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const resolvedParams = React.use(params);
  const courseId = resolvedParams['course-id'];

  // 使用 SWR 获取课程数据
  const {
    data: course,
    error: courseError,
    isLoading: courseLoading,
  } = useSWR(['course', courseId], courseFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 1000, 
  });

  // 使用 SWR 获取订阅状态
  const {
    data: isSubscribed,
    error: subscriptionError,
    isLoading: subscriptionLoading,
    mutate: mutateSubscription,
  } = useSWR(
    user?.id ? ['subscription', courseId, user.id] : null,
    subscriptionFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分钟内不重复请求
    }
  );

  const loading = courseLoading || subscriptionLoading;
  const error = courseError || subscriptionError;

  // 生成课程封面图片预览URL
  useEffect(() => {
    const generateImageUrl = async () => {
      if (course?.coverImageKey) {
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
          console.error('生成课程封面预览URL失败:', error);
          // 如果生成失败，设置为空字符串
          setImageUrl('');
        } finally {
          setImageLoading(false);
        }
      } else {
        // 如果没有coverImageKey，设置为空
        setImageUrl('');
        setImageLoading(false);
      }
    };

    if (course) {
      generateImageUrl();
    }
  }, [course]);

  const handleSubscribe = async () => {
    if (subscribing) return; // 如果正在订阅中，直接返回
    setSubscribing(true); // 开始订阅过程
    try {
      if (!user?.id) {
        console.error('用户信息不完整，请重新登录');
        return;
      }
      // 直接调用 subscribeToCourseAPI
      const success = await subscribeToCourseAPI(courseId, user.id);
      if (success) {
        // 使用 SWR mutate 更新订阅状态
        mutateSubscription(true, false);
        setShowWelcomeDialog(true);
      } else {
        console.error('订阅课程失败');
      }
    } catch (error) {
      console.error('订阅过程中发生错误', error);
    } finally {
      setSubscribing(false); // 结束订阅过程
    }
  };

  return (
    <div className='container mx-auto px-4 py-2 md:py-8'>
      {loading ? (
        <CourseHeaderSkeleton />
      ) : error ? (
        <div className='text-center text-red-500'>
          {error instanceof Error
            ? error.message
            : '获取课程数据失败，请稍后重试'}
        </div>
      ) : course ? (
        <div className='flex flex-col md:flex-row gap-8 mb-8'>
          <div className='md:w-1/3'>
            {imageLoading ? (
              <div className='w-full h-[225px] bg-gray-300 rounded-lg animate-pulse' />
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt={course.title}
                width={400}
                height={225}
                className='rounded-lg shadow-lg w-full'
                onError={e => {
                  // 图片加载失败时的处理
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className='w-full h-[225px] bg-gray-200 rounded-lg flex items-center justify-center'>
                <span className='text-gray-500'>暂无封面</span>
              </div>
            )}
          </div>
          <div className='md:w-2/3'>
            <h1 className='text-3xl font-bold mb-4'>{course.title}</h1>
            <p className='text-secondary-foreground mb-4'>
              {course.description}
            </p>
            <div className='flex items-center mb-6'>
              <span className='text-yellow-500 mr-2'>★</span>
              <span className='font-bold mr-2'>{course.average_rating}</span>
              <span className='text-secondary-foreground'>
                ({course.enrollment_count} 学生)
              </span>
            </div>
            {!isSubscribed && (
              <Button onClick={handleSubscribe} disabled={subscribing}>
                {subscribing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    订阅中...
                  </>
                ) : (
                  '立即订阅'
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div>课程不存在或加载失败</div>
      )}

      <CourseContent courseId={courseId} />

      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>欢迎加入课程！</DialogTitle>
            <DialogDescription>
              恭喜您成功订阅了 {course?.title}
              。我们为您准备了一些建议，以帮助您更好地开始学习之旅。
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <h3 className='font-semibold mb-2'>学习建议：</h3>
            <ul className='list-disc list-inside space-y-2'>
              <li>制定学习计划，每天坚持学习</li>
              <li>积极参与课程讨论，与其他学员交流</li>
              <li>完成每个单元的课程和练习</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWelcomeDialog(false)}>
              开始学习
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}