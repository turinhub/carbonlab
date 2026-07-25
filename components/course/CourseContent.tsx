'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CourseContentSkeleton } from '@/components/course/CourseSkeleton';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Circle, ChevronRight, Check } from 'lucide-react';
import {
  getCourseUnitsForComponent,
  getCourseByIdForComponent,
  CourseUnit,
  getCourseProgressAPI,
  getCourseProgressRecordsAPI,
  ProgressRecord,
} from '@/lib/api/courses';
import { getAvatarPresignedUrl } from '@/lib/api/users';
import { getProcessedFileUri } from '@/lib/utils';
import { useUserStore } from '@/lib/stores/user-store';

interface CourseContentProps {
  courseId: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  category: string;
  enrollment_count: number;
  average_rating: number;
  cover_url: string;
  coverImageKey?: string;
  isEnabled: boolean;
}

export function CourseContent({ courseId }: CourseContentProps) {
  const { user } = useUserStore();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);

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
          // 使用备用的cover_url
          setImageUrl(course.cover_url || '');
        } finally {
          setImageLoading(false);
        }
      } else if (course?.cover_url) {
        // 如果没有coverImageKey，使用cover_url
        setImageUrl(course.cover_url);
        setImageLoading(false);
      } else {
        setImageLoading(false);
      }
    };

    if (course) {
      generateImageUrl();
    }
  }, [course]);

  useEffect(() => {
    async function fetchCourseDetails() {
      setLoading(true);
      setError(null);
      try {
        if (!user?.id) {
          console.error('用户信息不完整，请重新登录');
          setError('用户信息不完整，请重新登录');
          return;
        }

        // 同时获取课程基本信息、课程单元数据、课程进度和详细进度记录
        const [courseData, unitsData, progressData, progressRecordsData] =
          await Promise.all([
            getCourseByIdForComponent(courseId),
            getCourseUnitsForComponent(courseId),
            getCourseProgressAPI(courseId, user.id),
            getCourseProgressRecordsAPI(courseId, user.id),
          ]);

        setCourse(courseData);
        setUnits(unitsData.units);
        setProgressPercentage(progressData);
        setProgressRecords(progressRecordsData);
      } catch (err) {
        console.error('获取课程详情失败:', err);
        setError('获取课程详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) {
      fetchCourseDetails();
    }
  }, [courseId, user?.id]);

  if (loading) {
    return <CourseContentSkeleton />;
  }

  if (error) {
    return (
      <div className='bg-background p-4 rounded-lg'>
        <div className='text-center text-red-500'>{error}</div>
      </div>
    );
  }

  const totalLessons = units.reduce(
    (acc, unit) => acc + (unit.lessons?.length || 0),
    0
  );

  // 根据实际进度记录计算已完成课时数
  const completedLessons = progressRecords.filter(
    record => record.status?.toLowerCase() === 'completed'
  ).length;

  // 检查特定课时是否已完成的函数
  const isLessonCompleted = (lessonId: string): boolean => {
    return progressRecords.some(
      record =>
        record.lessonId === lessonId &&
        record.status?.toLowerCase() === 'completed'
    );
  };

  return (
    <div className='bg-background p-4 rounded-lg'>
      {/* 课程进度 */}
      <div className='mb-4'>
        <h3 className='text-lg font-semibold mb-2'>课程进度</h3>
        <Progress value={progressPercentage} className='mb-2' />
        <p className='text-sm text-gray-600'>
          已完成 {completedLessons} / {totalLessons} 课时 ({progressPercentage}
          %)
        </p>
      </div>

      <Accordion
        type='single'
        collapsible
        className='w-full'
        defaultValue='item-0'
      >
        {units.map((unit, unitIndex) => {
          const unitLessons = unit.lessons || [];
          // 根据实际进度记录计算单元完成情况
          const completedInUnit = unitLessons.filter((lesson: any) =>
            isLessonCompleted(lesson.id)
          ).length;
          const isUnitCompleted =
            completedInUnit === unitLessons.length && unitLessons.length > 0;

          return (
            <AccordionItem value={`item-${unitIndex}`} key={unit.id}>
              <AccordionTrigger>
                <div className='flex justify-between w-full items-center'>
                  <span>
                    第 {unitIndex + 1} 单元：{unit.title}
                  </span>
                  <div className='flex items-center'>
                    <span className='mr-2'>
                      {isUnitCompleted && (
                        <Check className='text-green-500 h-4 w-4' />
                      )}
                    </span>
                    <span className='text-gray-500 text-sm mr-2'>
                      {completedInUnit}/{unitLessons.length} 完成
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className='space-y-2'>
                  {unitLessons.map((lesson: any, lessonIndex: number) => {
                    // 根据实际进度记录判断课时完成状态
                    const isCompleted = isLessonCompleted(lesson.id);

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/units/${unit.id}?lesson_id=${lesson.id}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <div className='flex items-center p-2 rounded hover:bg-gray-100 transition-colors'>
                            {isCompleted ? (
                              <Check className='text-green-500 mr-2 flex-shrink-0' />
                            ) : (
                              <Circle className='text-gray-300 mr-2 flex-shrink-0' />
                            )}
                            <span
                              className={`flex-grow ${
                                isCompleted ? 'text-gray-600' : 'text-gray-800'
                              }`}
                            >
                              {unitIndex + 1}.{lessonIndex + 1} {lesson.title}
                            </span>
                            <ChevronRight className='text-gray-400 ml-2 flex-shrink-0' />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}