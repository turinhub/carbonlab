import { platoApiGet, platoApiPost, platoApiPut } from './base';

// 课程数据类型定义
export type Course = {
  coverImageKey: string | undefined;
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  category: string;
  userId: string;
  isEnabled: boolean;
  enrollmentCount: number | null;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
  units: any;
  coverUrl: string;
};

// 课程单元数据类型定义
export type CourseUnit = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  lessons: any;
};

// 类别映射
export const categoryMap: Record<string, string> = {
  REQUIRED_COURSE: '必修课',
  ELECTIVE_COURSE: '选修课',
  PUBLIC_COURSE: '公共课',
  CORE_COURSE: '核心课',
};

// 获取课程列表（直接返回处理后的数据）
export const getCoursesForComponent = async (): Promise<Course[]> => {
  const response = await platoApiGet<{
    page: number;
    size: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    data: Course[];
  }>('/api/courses', { 
    page: 0, 
    size: 10
  });

  return (response.data?.data || []).map(course => ({
    ...course,
    category: categoryMap[course.category] || course.category,
    enrollment_count: course.enrollmentCount || 0,
    cover_url: course.coverUrl,
    is_enabled: course.isEnabled,
    src: course.coverUrl,
  })) as any;
};

// 获取单个课程（直接返回处理后的数据）
export const getCourseByIdForComponent = async (courseId: string) => {
  const response = await platoApiGet<Course>(`/api/courses/${courseId}`);
  if (!response.data) {
    return null;
  }
  const course = response.data;
  return {
    ...course,
    category: categoryMap[course.category] || course.category,
    enrollment_count: course.enrollmentCount || 0,
    average_rating: course.averageRating || 0,
    cover_url: course.coverUrl,
  };
};

// 获取课程单元（直接返回处理后的数据）
export const getCourseUnitsForComponent = async (courseId: string) => {
  console.log('正在请求课程单元，courseId:', courseId);
  try {
    const response = await platoApiGet<CourseUnit[]>(
      `/api/v1/courses/${courseId}/units`
    );
    console.log('API 响应:', response);
    return {
      units: (response.data || []).map(unit => ({
        ...unit,
        lessons: unit.lessons || [],
      })),
    };
  } catch (error) {
    console.error('获取课程单元失败:', error);
    throw error;
  }
};

// 订阅课程API函数
export const subscribeToCourseAPI = async (
  courseId: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await platoApiPost(
      `/api/courses/${courseId}/${userId}/subscription`
    );
    return response.success || false;
  } catch (error) {
    console.error('订阅课程失败:', error);
    return false;
  }
};

// 检查课程订阅状态API函数
export const checkCourseSubscriptionAPI = async (
  courseId: string,
  userId: string
): Promise<boolean> => {
  try {
    const response = await platoApiGet<boolean>(
      `/api/courses/subscription/${courseId}/${userId}/check`
    );
    return response.data || false;
  } catch (error) {
    console.error('检查课程订阅状态失败:', error);
    return false;
  }
};

// 获取课程进度API函数
export const getCourseProgressAPI = async (
  courseId: string,
  userId: string
): Promise<number> => {
  try {
    const response = await platoApiGet<number>(
      `/api/courses/${courseId}/${userId}/progress`
    );
    return response.data || 0;
  } catch (error) {
    console.error('获取课程进度失败:', error);
    return 0;
  }
};

// 课时数据类型定义
export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  content: string | null;
  description: string;
  coverImageKey: string;
  position: number;
  aiSummary: string | null;
  aiMindmap: string | null;
  category: string;
  meta: any;
  createdAt: string;
  updatedAt: string;
};

// 获取课时详情API函数
export const getLessonByIdAPI = async (
  lessonId: string
): Promise<Lesson | null> => {
  try {
    const response = await platoApiGet<Lesson>(
      `/api/courses/lessons/${lessonId}`
    );
    return response.data || null;
  } catch (error) {
    console.error('获取课时详情失败:', error);
    return null;
  }
};

// 更新或创建课程进度记录API函数
export const updateLessonProgressAPI = async (params: {
  courseId: string;
  unitId: string;
  lessonId: string;
  userId: string;
  status: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const statusMap = {
      not_started: 'NOT_STARTED',
      in_progress: 'IN_PROGRESS',
      completed: 'COMPLETED',
    } as const;

    // 映射状态为大写格式
    const mappedStatus =
      statusMap[params.status as keyof typeof statusMap] ||
      params.status.toUpperCase();

    const response = await platoApiPost('/api/courses/progress/upsert', {
      ...params,
      status: mappedStatus,
    });
    return { success: response.success || true };
  } catch (error) {
    console.error('更新课程进度失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
};

// 单元和课时数据类型定义
export type UnitWithLessons = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  aiMindmap: any | null;
};

// 获取单元和课时API函数
export const getUnitWithLessonsAPI = async (
  unitId: string,
  userId: string
): Promise<UnitWithLessons | null> => {
  try {
    const response = await platoApiGet<UnitWithLessons>(
      `/api/courses/units/${unitId}/${userId}/with-lessons`
    );
    return response.data || null;
  } catch (error) {
    console.error('获取单元和课时失败:', error);
    return null;
  }
};

// 进度记录数据类型定义
export type ProgressRecord = {
  id: string;
  courseId: string;
  unitId: string;
  lessonId: string;
  userId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
};

// 获取单元进度记录API函数
export const getUnitProgressRecordsAPI = async (
  unitId: string,
  userId: string
): Promise<ProgressRecord[]> => {
  try {
    const response = await platoApiGet<ProgressRecord[]>(
      `/api/courses/progress/unit/${unitId}/${userId}`
    );
    return response.data || [];
  } catch (error) {
    console.error('获取单元进度记录失败:', error);
    return [];
  }
};

// 获取课程进度记录API函数
export const getCourseProgressRecordsAPI = async (
  courseId: string,
  userId: string
): Promise<ProgressRecord[]> => {
  try {
    const response = await platoApiGet<ProgressRecord[]>(
      `/api/courses/progress/course/${courseId}/${userId}`
    );
    return response.data || [];
  } catch (error) {
    console.error('获取课程进度记录失败:', error);
    return [];
  }
};

// 订阅课程数据类型定义
export type SubscriptionCourse = {
  id: string;
  title: string;
  description: string;
  coverImageKey: string;
  category: string; // API 返回的是字符串类型
  userId: string;
  isEnabled: boolean;
  enrollmentCount: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  units: any;
  position: number;
  courseEnrollmentStatusEnum: string;
  courseRating: number | null;
};

export type SubscriptionResponse = {
  page: number;
  size: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  data: SubscriptionCourse[];
};

// 获取用户订阅课程
export const getUserSubscriptionsAPI = async (
  userId: string,
  page: number = 0,
  size: number = 10
): Promise<SubscriptionResponse> => {
  try {
    const response = await platoApiGet<SubscriptionResponse>(
      `/api/courses/subscriptions/${userId}?page=${page}&size=${size}`
    );
    return response.data || {
      page: 0,
      size: 0,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrevious: false,
      data: [],
    };
  } catch (error) {
    console.error('获取用户订阅课程失败:', error);
    return {
      page: 0,
      size: 0,
      total: 0,
      pages: 0,
      hasNext: false,
      hasPrevious: false,
      data: [],
    };
  }
};
