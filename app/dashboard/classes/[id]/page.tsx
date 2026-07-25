'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Search,
  Plus,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  XCircle,
  RefreshCw,
  Cloud,
  CheckCircle,
  XCircle as XCircleIcon,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUsers } from '@/lib/api/users';
import { useUserStore } from '@/lib/stores/user-store';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { classSyncService, Class as ClassType } from '@/lib/services/class-sync-service';

// 班级信息表单验证
const classFormSchema = z.object({
  name: z.string().min(2, { message: '班级名称至少需要2个字符' }),
  description: z.string().optional(),
  maxStudents: z.number().min(1, { message: '最大学生数至少为1' }).max(100, { message: '最大学生数不能超过100' }),
  grade: z.string().min(1, { message: '请选择年级' }),
  status: z.enum(['ongoing', 'completed', 'pending'], { message: '请选择班级状态' }),
  remark: z.string().optional(),
});

// 班级接口
interface Class {
  id: string;
  name: string;
  description?: string;
  maxStudents: number;
  currentStudents: number;
  grade: string;
  remark?: string;
  createdAt: string;
  status: 'ongoing' | 'completed' | 'pending';
  students: string[];
  // 同步相关字段
  taleGroupId?: string; // Tale 平台用户组 ID
  lastSyncTime?: string; // 最后同步时间
  syncStatus?: 'synced' | 'pending' | 'error'; // 同步状态
  syncError?: string; // 同步错误信息
}

// 学生接口
interface Student {
  id: string;
  username: string;
  phone: string;
  email?: string;
  joinDate: string;
  learningStatus: 'studying' | 'paused' | 'graduated' | 'dropped'; // 学习状态
  accountStatus: 'normal' | 'frozen' | 'pending'; // 账号状态
}

// 真实用户接口 - 从API获取的用户数据结构
interface ApiUser {
  user?: {
    user_id?: string;
    username?: string;
    phone?: string;
    email?: string;
    is_frozen?: boolean;
    created_at?: string;
  };
  // 直接属性（兼容不同的API响应格式）
  user_id?: string;
  username?: string;
  phone?: string;
  email?: string;
  is_frozen?: boolean;
  created_at?: string;
  id?: string;
  user_roles?: string[];
  user_groups?: any[];
}

// 模拟学生数据 - 仅用于演示，实际应该从真实用户数据转换
const mockStudents: Student[] = [
  {
    id: "1",
    username: "张三",
    phone: "13800138001",
    email: "zhangsan@example.com",
    joinDate: "2024-01-15",
    learningStatus: 'studying',
    accountStatus: 'normal'
  },
  {
    id: "2",
    username: "李四",
    phone: "13800138002",
    email: "lisi@example.com",
    joinDate: "2024-01-16",
    learningStatus: 'studying',
    accountStatus: 'normal'
  },
  {
    id: "3",
    username: "王五",
    phone: "13800138003",
    email: "wangwu@example.com",
    joinDate: "2024-01-17",
    learningStatus: 'paused',
    accountStatus: 'frozen'
  }
];

export default function ClassDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStudentSidebar, setShowAddStudentSidebar] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // 班级信息编辑相关状态
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classLoading, setClassLoading] = useState(false);

  // 批量移除相关状态
  const [batchRemoveMode, setBatchRemoveMode] = useState(false);
  const [selectedStudentsForRemoval, setSelectedStudentsForRemoval] = useState<string[]>([]);
  
  // 同步相关状态
  const [syncLoading, setSyncLoading] = useState(false);

  // 用户列表相关状态（用于添加学生）
  const [usersData, setUsersData] = useState<any>({
    total: 0,
    content: [],
    pageable: {
      sort: { orders: [] },
      pageNumber: 0,
      pageSize: 10,
    },
  });
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const classId = params.id as string;
  const className = searchParams.get('className') || '班级';

  // 年级选项
  const gradeOptions = [
    { value: "2025级", label: "2025级" },
    { value: "2024级", label: "2024级" },
    { value: "2023级", label: "2023级" },
    { value: "2022级", label: "2022级" },
    { value: "2021级", label: "2021级" },
  ];

  // 班级状态选项
  const statusOptions = [
    { value: "ongoing", label: "进行中" },
    { value: "completed", label: "已完成" },
    { value: "pending", label: "待开始" },
  ];

  // 班级信息编辑表单
  const classForm = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 30,
      grade: '2025级',
      status: 'pending',
      remark: '',
    },
  });

  // 加载班级信息
  const loadClassInfo = useCallback(async () => {
    try {
      setClassLoading(true);
      console.log('Loading class info for ID:', classId);
      
      // 从 localStorage 加载班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      console.log('Saved classes from localStorage:', savedClasses);
      
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        console.log('Parsed classes:', classes);
        
        const currentClass = classes.find((cls: Class) => cls.id === classId);
        console.log('Found current class:', currentClass);
        
                 if (currentClass) {
           setClassInfo(currentClass);
           classForm.reset({
             name: currentClass.name,
             description: currentClass.description || '',
             maxStudents: currentClass.maxStudents,
             grade: currentClass.grade,
             status: currentClass.status,
             remark: currentClass.remark || '',
           });
        } else {
          console.log('No class found with ID:', classId);
                     // 如果没有找到班级，设置一个默认的班级信息
           setClassInfo({
             id: classId,
             name: className || '未知班级',
             description: '班级信息加载中...',
             maxStudents: 30,
             currentStudents: 0,
             grade: '2025级',
             status: 'pending',
             remark: '',
             createdAt: new Date().toISOString().split('T')[0],
             students: []
           });
        }
      } else {
        console.log('No saved classes found in localStorage');
                 // 如果没有保存的班级数据，设置一个默认的班级信息
         setClassInfo({
           id: classId,
           name: className || '未知班级',
           description: '班级信息加载中...',
           maxStudents: 30,
           currentStudents: 0,
           grade: '2025级',
           status: 'pending',
           remark: '',
           createdAt: new Date().toISOString().split('T')[0],
           students: []
         });
      }
    } catch (error) {
      console.error('Failed to load class info:', error);
      toast.error('无法加载班级信息');
      
             // 设置默认班级信息
       setClassInfo({
         id: classId,
         name: className || '未知班级',
         description: '班级信息加载失败',
         maxStudents: 30,
         currentStudents: 0,
         grade: '2025级',
         status: 'pending',
         remark: '',
         createdAt: new Date().toISOString().split('T')[0],
         students: []
       });
    } finally {
      setClassLoading(false);
    }
  }, [classId, classForm, className]);

  // 同步所有班级的学生数量
  const syncAllClassesStudentCount = useCallback(() => {
    try {
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        let hasChanges = false;
        
        const updatedClasses = classes.map((cls: Class) => {
          // 计算实际的学生数量
          const actualStudentCount = cls.students ? cls.students.length : 0;
          
          // 如果数量不匹配，需要更新
          if (actualStudentCount !== cls.currentStudents) {
            hasChanges = true;
            return { ...cls, currentStudents: actualStudentCount };
          }
          return cls;
        });
        
        // 如果有变化，更新localStorage
        if (hasChanges) {
          localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
          console.log('已同步所有班级的学生数量');
        }
      }
    } catch (error) {
      console.error('同步班级学生数量失败:', error);
    }
  }, []);

  // 加载班级中的学生列表
  const loadStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      console.log('Loading students for class:', classId);
      
      // 从 localStorage 获取班级数据，找到当前班级的学生ID列表
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const currentClass = classes.find((cls: Class) => cls.id === classId);
        
        if (currentClass && currentClass.students && currentClass.students.length > 0) {
          // 如果有学生ID，从模拟数据中找到对应的学生信息
          const classStudents = mockStudents.filter(student => 
            currentClass.students.includes(student.id)
          );
          setStudents(classStudents);
          console.log('Loaded class students:', classStudents);
          
          // 同步更新班级的学生数量
          if (classStudents.length !== currentClass.currentStudents) {
            const updatedClasses = classes.map((cls: Class) => 
              cls.id === classId 
                ? { ...cls, currentStudents: classStudents.length }
                : cls
            );
            localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
            
            // 更新本地班级信息
            setClassInfo(prev => prev ? { ...prev, currentStudents: classStudents.length } : null);
          }
        } else {
          // 如果没有学生，设置为空数组
          setStudents([]);
          console.log('No students in class');
          
          // 同步更新班级的学生数量为0
          if (currentClass && currentClass.currentStudents !== 0) {
            const updatedClasses = classes.map((cls: Class) => 
              cls.id === classId 
                ? { ...cls, currentStudents: 0 }
                : cls
            );
            localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
            
            // 更新本地班级信息
            setClassInfo(prev => prev ? { ...prev, currentStudents: 0 } : null);
          }
        }
      } else {
        setStudents([]);
        console.log('No saved classes found');
      }
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('无法加载学生列表');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, [classId]);

  // 加载用户列表（用于添加学生）
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      console.log('Loading users from API...');
      
      // 调用用户列表API
      const usersResponse = await getUsers({
        page: currentPage,
        size: pageSize,
      });
      
      if (usersResponse && usersResponse.content) {
        console.log('✅ 成功加载用户列表:', usersResponse.content.length, '个用户');
        console.log('🔍 用户数据结构分析:');
        console.log('🔍 第一个用户对象:', usersResponse.content[0]);
        console.log('🔍 第一个用户的键名:', Object.keys(usersResponse.content[0]));
        if (usersResponse.content[0].user) {
          console.log('🔍 第一个用户的user对象:', usersResponse.content[0].user);
          console.log('🔍 user对象的键名:', Object.keys(usersResponse.content[0].user));
        }
        setUsersData(usersResponse);
      } else {
        console.log('❌ API返回数据格式不正确，使用模拟数据');
        // 使用模拟数据作为后备
        const fallbackData = {
          total: mockStudents.length,
          content: mockStudents.map(student => ({
            user: {
              user_id: student.id,
              username: student.username,
              phone: student.phone,
              email: student.email,
              is_frozen: student.accountStatus === 'frozen',
              created_at: student.joinDate
            },
            user_roles: ['学生'],
            user_groups: []
          })),
          pageable: {
            sort: { orders: [] },
            pageNumber: 0,
            pageSize: 10,
          },
        };
        setUsersData(fallbackData);
      }
    } catch (error) {
      console.error('加载用户列表失败，使用模拟数据:', error);
      // 使用模拟数据作为后备
      const fallbackData = {
        total: mockStudents.length,
        content: mockStudents.map(student => ({
          user: {
            user_id: student.id,
            username: student.username,
            phone: student.phone,
            email: student.email,
            is_frozen: student.accountStatus === 'frozen',
            created_at: student.joinDate
          },
          user_roles: ['学生'],
          user_groups: []
        })),
        pageable: {
          sort: { orders: [] },
          pageNumber: 0,
          pageSize: 10,
        },
      };
      setUsersData(fallbackData);
    } finally {
      setUsersLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    // 首先同步所有班级的学生数量
    syncAllClassesStudentCount();
    loadClassInfo();
    loadStudents();
  }, [syncAllClassesStudentCount, loadClassInfo, loadStudents]);

  useEffect(() => {
    if (showAddStudentSidebar) {
      loadUsers();
    }
  }, [loadUsers, showAddStudentSidebar]);

  // 初始化选中的学生（当前学生）
  useEffect(() => {
    const currentStudentIds = students.map(student => student.id);
    setSelectedStudents(currentStudentIds);
  }, [students]);

  // 编辑班级信息
  const onClassEditSubmit = async (values: z.infer<typeof classFormSchema>) => {
    try {
      // 更新 localStorage 中的班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const updatedClass: Class = { ...classInfo!, ...values };
        const updatedClasses = classes.map((cls: Class) => 
          cls.id === classId 
            ? updatedClass
            : cls
        );
        localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        
        // 更新本地状态
        setClassInfo(updatedClass);
        
        // 如果班级已同步到 Tale 平台，自动同步更新
        if (updatedClass.taleGroupId) {
          try {
            setSyncLoading(true);
            const syncResult = await classSyncService.syncClassToTale(updatedClass);
            
            if (syncResult.success) {
              // 更新同步信息
              const finalClass = {
                ...updatedClass,
                lastSyncTime: syncResult.data?.lastSyncTime,
                syncStatus: 'synced' as const
              };
              
              const finalClasses = classes.map((cls: Class) => 
                cls.id === classId ? finalClass : cls
              );
              localStorage.setItem('carbonlab-classes', JSON.stringify(finalClasses));
              setClassInfo(finalClass);
              
              toast.success(`班级 "${values.name}" 已成功更新并同步到 Tale 平台。`);
            } else {
              toast.warning(`班级 "${values.name}" 更新成功，但同步到 Tale 平台失败：${syncResult.message}`);
            }
          } catch (syncError) {
            console.error('同步失败:', syncError);
            toast.warning(`班级 "${values.name}" 更新成功，但同步到 Tale 平台失败`);
          } finally {
            setSyncLoading(false);
          }
        } else {
          toast.success(`班级 "${values.name}" 已成功更新。`);
        }
      }
      
      setIsEditingClass(false);
      loadClassInfo(); // 重新加载班级信息
    } catch (error) {
      console.error('Failed to update class:', error);
      toast.error('更新班级失败，请稍后重试');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditingClass(false);
         // 重置表单到原始值
     if (classInfo) {
       classForm.reset({
         name: classInfo.name || '',
         description: classInfo.description || '',
         maxStudents: classInfo.maxStudents,
         grade: classInfo.grade,
         status: classInfo.status,
         remark: classInfo.remark || '',
       });
     }
  };

  const filteredStudents = students.filter(
    student =>
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)
  );

  const handleStudentSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, userId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAddStudents = async () => {
    // 获取新选中的学生（不是已有学生）
    const newStudentIds = selectedStudents.filter(studentId => {
      return !students.some(s => s.id === studentId);
    });

    if (newStudentIds.length === 0) {
      toast.warning('请选择要添加的新学生');
      return;
    }

    try {
      // 从用户数据中找到选中的用户
      const newUsers = usersData.content.filter((user: any) => {
        const userId = user.user?.user_id || user.user?.id || user.id;
        return userId && newStudentIds.includes(userId);
      });
      
      // 转换为学生格式
      const newStudents: Student[] = newUsers.map((user: any) => ({
        id: user.user?.user_id || user.user?.id || user.id || '',
        username: user.user?.username || user.username || '未知用户',
        phone: user.user?.phone || user.phone || '未知',
        email: user.user?.email || user.email,
        joinDate: user.user?.created_at || user.created_at
          ? new Date(user.user?.created_at || user.created_at).toLocaleDateString('zh-CN')
          : new Date().toLocaleDateString('zh-CN'),
        learningStatus: 'studying', // 新加入班级的用户默认为在学状态
        accountStatus: 'normal' // 新加入班级的用户默认为正常账号状态
      }));
      
      // 更新学生列表
      const updatedStudents = [...students, ...newStudents];
      setStudents(updatedStudents);
      
      // 更新localStorage中的班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const updatedClass: Class = { 
          ...classInfo!, 
          students: updatedStudents.map(s => s.id), 
          currentStudents: updatedStudents.length 
        };
        const updatedClasses = classes.map((cls: Class) => 
          cls.id === classId ? updatedClass : cls
        );
        localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        
        // 同步更新本地班级信息
        setClassInfo(updatedClass);
        
        // 如果班级已同步到 Tale 平台，自动同步学生变更
        if (updatedClass.taleGroupId) {
          try {
            const syncResult = await classSyncService.syncClassToTale(updatedClass);
            if (syncResult.success) {
              toast.success(`已成功添加 ${newStudentIds.length} 个用户到班级并同步到 Tale 平台`);
            } else {
              toast.warning(`学生添加成功，但同步到 Tale 平台失败：${syncResult.message}`);
            }
          } catch (syncError) {
            console.error('同步失败:', syncError);
            toast.warning(`学生添加成功，但同步到 Tale 平台失败`);
          }
        } else {
          toast.success(`已成功添加 ${newStudentIds.length} 个用户到班级`);
        }
      }
      
      setShowAddStudentSidebar(false);
      setCurrentPage(0);
      setUserSearchTerm('');
    } catch (error) {
      console.error('Failed to add students:', error);
      toast.error('添加学生到班级失败');
    }
  };

  // 转换用户数据格式
  const transformedUsers = usersData.content.map((apiUser: any) => {
    // 添加安全检查
    if (!apiUser || !apiUser.user) {
      console.warn('跳过无效的用户数据:', apiUser);
      return null;
    }
    
    return {
      id: apiUser.user.user_id || apiUser.user.id || apiUser.id || '',
      username: apiUser.user.username || apiUser.username || '未知用户',
      phone: apiUser.user.phone || apiUser.phone || '',
      role: (apiUser.user_roles && apiUser.user_roles.length > 0) ? apiUser.user_roles[0] : '用户',
      // 添加用户组信息
      userGroups: apiUser.user_groups || [],
    };
  }).filter(Boolean); // 过滤掉null值

  // 前端搜索过滤
  const filteredUsers = transformedUsers.filter((user: { id: string; username: string; phone: string; role: string; userGroups: any[] }) => {
    if (!userSearchTerm) return true;
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower) ||
      (typeof user.role === 'string'
        ? user.role.toLowerCase()
        : String(user.role).toLowerCase()
      ).includes(searchLower)
    );
  });

  const totalPages = Math.ceil(usersData.total / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserSearchChange = (value: string) => {
    setUserSearchTerm(value);
  };

  // 添加一个处理关闭侧边栏的函数
  const handleCloseSidebar = () => {
    setShowAddStudentSidebar(false);
    // 保持selectedStudents状态，不清空
  };

  // 修改学生学习状态
  const handleChangeLearningStatus = async (studentId: string, newStatus: 'studying' | 'paused' | 'graduated' | 'dropped') => {
    try {
      const updatedStudents = students.map(s => 
        s.id === studentId 
          ? { ...s, learningStatus: newStatus }
          : s
      );
      setStudents(updatedStudents);
      
      // 更新localStorage中的班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const updatedClass: Class = { 
          ...classInfo!, 
          students: updatedStudents.map(s => s.id), 
          currentStudents: updatedStudents.length 
        };
        const updatedClasses = classes.map((cls: Class) => 
          cls.id === classId ? updatedClass : cls
        );
        localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        
        // 同步更新本地班级信息
        setClassInfo(updatedClass);
        
        // 如果班级已同步到 Tale 平台，自动同步学生变更
        if (updatedClass.taleGroupId) {
          try {
            const syncResult = await classSyncService.syncClassToTale(updatedClass);
            if (!syncResult.success) {
              console.warn('同步学生状态变更失败:', syncResult.message);
            }
          } catch (syncError) {
            console.error('同步失败:', syncError);
          }
        }
      }
      
      const statusText = {
        studying: '在学',
        paused: '暂停',
        graduated: '毕业',
        dropped: '退学'
      }[newStatus];
      
      toast.success(`已成功将学生状态修改为"${statusText}"`);
    } catch (error) {
      console.error('Failed to change learning status:', error);
      toast.error('修改学习状态失败，请稍后重试');
    }
  };

  // 修改学生账号状态
  const handleChangeAccountStatus = async (studentId: string, newStatus: 'normal' | 'frozen' | 'pending') => {
    try {
      const updatedStudents = students.map(s => 
        s.id === studentId 
          ? { ...s, accountStatus: newStatus }
          : s
      );
      setStudents(updatedStudents);
      
      // 更新localStorage中的班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const updatedClass: Class = { 
          ...classInfo!, 
          students: updatedStudents.map(s => s.id), 
          currentStudents: updatedStudents.length 
        };
        const updatedClasses = classes.map((cls: Class) => 
          cls.id === classId ? updatedClass : cls
        );
        localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        
        // 同步更新本地班级信息
        setClassInfo(updatedClass);
        
        // 如果班级已同步到 Tale 平台，自动同步学生变更
        if (updatedClass.taleGroupId) {
          try {
            const syncResult = await classSyncService.syncClassToTale(updatedClass);
            if (!syncResult.success) {
              console.warn('同步学生状态变更失败:', syncResult.message);
            }
          } catch (syncError) {
            console.error('同步失败:', syncError);
          }
        }
      }
      
      const statusText = {
        normal: '正常',
        frozen: '冻结',
        pending: '待激活'
      }[newStatus];
      
      toast.success(`已成功将学生账号状态修改为"${statusText}"`);
    } catch (error) {
      console.error('Failed to change account status:', error);
      toast.error('修改账号状态失败，请稍后重试');
    }
  };

  // 手动同步班级到 Tale 平台
  const handleSyncClass = async () => {
    if (!classInfo) return;
    
    try {
      setSyncLoading(true);
      const syncResult = await classSyncService.syncClassToTale(classInfo);
      
      if (syncResult.success) {
        // 更新班级的同步信息
        const updatedClass = {
          ...classInfo,
          taleGroupId: syncResult.data?.taleGroupId || classInfo.taleGroupId,
          lastSyncTime: syncResult.data?.lastSyncTime,
          syncStatus: 'synced' as const
        };
        
        // 更新 localStorage
        const savedClasses = localStorage.getItem('carbonlab-classes');
        if (savedClasses) {
          const classes = JSON.parse(savedClasses);
          const updatedClasses = classes.map((cls: Class) => 
            cls.id === classId ? updatedClass : cls
          );
          localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        }
        
        setClassInfo(updatedClass);
        toast.success(`班级 "${classInfo.name}" 同步成功`);
      } else {
        toast.error(`同步失败：${syncResult.message}`);
      }
    } catch (error) {
      console.error('同步失败:', error);
      toast.error('同步失败，请稍后重试');
    } finally {
      setSyncLoading(false);
    }
  };

  // 单独移除学生
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    try {
      const updatedStudents = students.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      
      // 更新localStorage中的班级数据
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        const classes = JSON.parse(savedClasses);
        const updatedClass: Class = { 
          ...classInfo!, 
          students: updatedStudents.map(s => s.id), 
          currentStudents: updatedStudents.length 
        };
        const updatedClasses = classes.map((cls: Class) => 
          cls.id === classId ? updatedClass : cls
        );
        localStorage.setItem('carbonlab-classes', JSON.stringify(updatedClasses));
        
        // 同步更新本地班级信息
        setClassInfo(updatedClass);
        
        // 如果班级已同步到 Tale 平台，自动同步学生变更
        if (updatedClass.taleGroupId) {
          try {
            const syncResult = await classSyncService.syncClassToTale(updatedClass);
            if (syncResult.success) {
              toast.success(`已成功从班级移除学生 "${studentName}" 并同步到 Tale 平台`);
            } else {
              toast.warning(`学生移除成功，但同步到 Tale 平台失败：${syncResult.message}`);
            }
          } catch (syncError) {
            console.error('同步失败:', syncError);
            toast.warning(`学生移除成功，但同步到 Tale 平台失败`);
          }
        } else {
          toast.success(`已成功从班级移除学生 "${studentName}"`);
        }
      }
    } catch (error) {
      console.error('Failed to remove student:', error);
      toast.error('从班级移除学生失败，请稍后重试');
    }
  };

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
      </div>
      <div className='mx-auto p-6'>
        <div className='mb-8 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/dashboard/classes')}
          >
            <ArrowLeft className='h-10 w-10 ' />
          </Button>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {className} - 班级学生管理
            </h1>
            {classInfo && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                {classInfo.syncStatus === 'synced' ? (
                  <div className='flex items-center gap-1 text-green-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span>已同步到 Tale 平台</span>
                  </div>
                ) : classInfo.syncStatus === 'pending' ? (
                  <div className='flex items-center gap-1 text-yellow-600'>
                    <Clock className='h-4 w-4' />
                    <span>待同步</span>
                  </div>
                ) : classInfo.syncStatus === 'error' ? (
                  <div className='flex items-center gap-1 text-red-600'>
                    <XCircleIcon className='h-4 w-4' />
                    <span>同步失败</span>
                  </div>
                ) : (
                  <div className='flex items-center gap-1 text-gray-500'>
                    <Cloud className='h-4 w-4' />
                    <span>未同步</span>
                  </div>
                )}
                {classInfo.lastSyncTime && (
                  <span className='text-xs'>
                    (最后同步: {new Date(classInfo.lastSyncTime).toLocaleString()})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={handleSyncClass}
              disabled={syncLoading || !classInfo}
              className='bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
              同步到 Tale 平台
            </Button>
          </div>
        </div>

                 

        {/* 班级信息编辑区域 */}
        <Card className='mb-6'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>班级信息</CardTitle>
              {!isEditingClass ? (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditingClass(true)}
                  disabled={classLoading}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  编辑
                </Button>
              ) : (
                <div className='flex space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleCancelEdit}
                  >
                    <XCircle className='h-4 w-4 mr-2' />
                    取消
                  </Button>
                  <Button
                    type='button'
                    size='sm'
                    disabled={classForm.formState.isSubmitting}
                    onClick={classForm.handleSubmit(onClassEditSubmit)}
                  >
                    <Save className='h-4 w-4 mr-2' />
                    保存
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {classLoading ? (
              <div className='text-center py-4'>加载中...</div>
            ) : !classInfo ? (
              <div className='text-center py-4 text-red-600'>班级信息加载失败</div>
            ) : isEditingClass ? (
              <Form {...classForm}>
                <form onSubmit={classForm.handleSubmit(onClassEditSubmit)} className='space-y-4'>
                  <FormField
                    control={classForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>班级名称</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入班级名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classForm.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>描述</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入描述' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={classForm.control}
                    name='maxStudents'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>最大学生数</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder='请输入最大学生数'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                                     <FormField
                     control={classForm.control}
                     name='grade'
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>年级</FormLabel>
                         <FormControl>
                           <select
                             {...field}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             {gradeOptions.map(option => (
                               <option key={option.value} value={option.value}>
                                 {option.label}
                               </option>
                             ))}
                           </select>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={classForm.control}
                     name='status'
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>班级状态</FormLabel>
                         <FormControl>
                           <select
                             {...field}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             {statusOptions.map(option => (
                               <option key={option.value} value={option.value}>
                                 {option.label}
                               </option>
                             ))}
                           </select>
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                  <FormField
                    control={classForm.control}
                    name='remark'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>备注</FormLabel>
                        <FormControl>
                          <Input placeholder='请输入备注' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className='space-y-2'>
                <div>
                  <span className='font-medium'>班级名称：</span>
                  <span>{classInfo?.name || '未设置'}</span>
                </div>
                <div>
                  <span className='font-medium'>描述：</span>
                  <span>{classInfo?.description || '未设置'}</span>
                </div>
                <div>
                  <span className='font-medium'>最大学生数：</span>
                  <span>{classInfo?.maxStudents || '未设置'}</span>
                </div>
                                 <div>
                   <span className='font-medium'>年级：</span>
                   <span>{classInfo?.grade || '未设置'}</span>
                 </div>
                 <div>
                   <span className='font-medium'>班级状态：</span>
                   <span>
                     {classInfo?.status === 'ongoing' ? '进行中' : 
                      classInfo?.status === 'completed' ? '已完成' : 
                      classInfo?.status === 'pending' ? '待开始' : '未设置'}
                   </span>
                 </div>
                 <div>
                   <span className='font-medium'>备注：</span>
                   <span>{classInfo?.remark || '未设置'}</span>
                 </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 学生列表 */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>班级学生</CardTitle>
              <Button
                className='bg-purple-600 hover:bg-purple-700'
                onClick={() => setShowAddStudentSidebar(true)}
              >
                <Plus className='h-4 w-4 mr-2' />
                添加学生
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className='text-center py-8'>加载中...</div>
            ) : students.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                暂无班级学生数据，点击"添加学生"按钮开始添加
              </div>
            ) : (
              <div className='space-y-4'>
                {students.map(student => (
                  <div key={student.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className='flex items-center gap-4'>
                      <div>
                        <h3 className='font-medium'>{student.username}</h3>
                        <p className='text-sm text-gray-600'>{student.phone}</p>
                      </div>
                                             <div className='flex gap-2'>
                         <Badge variant={student.learningStatus === 'studying' ? 'default' : 'secondary'}>
                           {student.learningStatus === 'studying' ? '在学' : 
                            student.learningStatus === 'paused' ? '暂停' :
                            student.learningStatus === 'graduated' ? '毕业' : '退学'}
                         </Badge>
                         <Badge variant={student.accountStatus === 'normal' ? 'outline' : 'destructive'}>
                           {student.accountStatus === 'normal' ? '正常' : 
                            student.accountStatus === 'frozen' ? '冻结' : '待激活'}
                         </Badge>
                       </div>
                    </div>
                                         <div className='flex items-center gap-2'>
                       <span className='text-sm text-gray-500'>加入日期: {student.joinDate}</span>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant='ghost' size='sm'>
                             <MoreHorizontal className='h-4 w-4' />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent>
                           <DropdownMenuItem onClick={() => handleChangeLearningStatus(student.id, 'studying')}>
                             设为在学
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeLearningStatus(student.id, 'paused')}>
                             设为暂停
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeLearningStatus(student.id, 'graduated')}>
                             设为毕业
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeLearningStatus(student.id, 'dropped')}>
                             设为退学
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeAccountStatus(student.id, 'normal')}>
                             账号正常
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeAccountStatus(student.id, 'frozen')}>
                             账号冻结
                           </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleChangeAccountStatus(student.id, 'pending')}>
                             账号待激活
                           </DropdownMenuItem>
                           <DropdownMenuItem
                             className='text-red-600'
                             onClick={() => handleRemoveStudent(student.id, student.username)}
                           >
                             移除学生
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Student Sidebar */}
        {showAddStudentSidebar && (
          <>
            <div
              className='fixed inset-0 bg-black bg-opacity-50 z-40'
              onClick={handleCloseSidebar}
            />
            <div className='fixed right-0 top-0 h-full w-1/2 bg-white z-50 shadow-xl'>
              <div className='p-4 border-b flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold mb-2'>
                    添加学生到班级
                  </h2>
                  <p className='text-sm text-muted-foreground mb-4'>
                    从系统用户中选择要添加到此班级的学生
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAddStudentSidebar(false)}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <div className='p-4'>
                <div className='mb-4'>
                  <Input
                    placeholder='搜索用户...'
                    value={userSearchTerm}
                    onChange={e => handleUserSearchChange(e.target.value)}
                  />
                </div>

                <div className='space-y-2 max-h-80 overflow-y-auto'>
                  {usersLoading ? (
                    <div className='text-center py-8'>加载中...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      {userSearchTerm ? '未找到匹配的用户' : '暂无用户数据'}
                    </div>
                  ) : (
                    filteredUsers.map((user: { id: string; username: string; phone: string; role: string; userGroups: any[] }) => {
                      const isSelected = selectedStudents.includes(user.id);
                      const isMember = students.some(s => s.id === user.id);
                      return (
                        <div
                          key={user.id}
                          className='flex items-center space-x-3 p-2 border rounded-lg'
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={checked =>
                              handleStudentSelection(user.id, checked as boolean)
                            }
                          />
                          <div className='flex-1 flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                              <span className='font-medium min-w-0 flex-shrink-0'>
                                {user.username}
                              </span>
                              <span className='text-sm text-gray-600 min-w-0 flex-shrink-0'>
                                {user.phone}
                              </span>
                              <Badge variant='secondary' className='text-xs'>
                                {typeof user.role === 'string'
                                  ? user.role
                                  : String(user.role)}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-2'>
                              {isMember && (
                                <Badge variant='outline' className='text-xs'>
                                  已加入
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 分页控件 */}
                {totalPages > 1 && (
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='text-sm text-gray-600'>
                      共 {usersData.total} 个用户，第 {currentPage + 1} 页，共{' '}
                      {totalPages} 页
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className='absolute bottom-0 left-0 right-0 p-4 border-t bg-white'>
                <div className='flex gap-3'>
                  <Button
                    variant='outline'
                    className='flex-1 bg-transparent'
                    onClick={() => setShowAddStudentSidebar(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className='flex-1 bg-purple-600 hover:bg-purple-700'
                    onClick={handleAddStudents}
                  >
                    添加选中用户 (
                    {
                      selectedStudents.filter(
                        id => !students.some(s => s.id === id)
                      ).length
                    }
                    )
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
