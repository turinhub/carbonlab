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
import {
  addMembersToUserGroup,
  getUserGroup,
  getUserGroupMembers,
  removeMembersFromUserGroup,
  updateUserGroup,
  UpdateUserGroupRequest,
} from '@/lib/api/classes';
import type { AppUser, UsersResponse, UserGroup } from '@/lib/types/tale';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

// 班级成员接口
interface ClassMember {
  id: string;
  username: string;
  phone: string;
  userGroup: string;
  joinDate: string;
}

// 班级信息表单验证
const classFormSchema = z.object({
  name: z.string().min(2, { message: '班级名称至少需要2个字符' }),
  description: z.string().optional(),
  remark: z.string().optional(),
});

export default function ClassMembers() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMemberSidebar, setShowAddMemberSidebar] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [members, setMembers] = useState<ClassMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // 班级信息编辑相关状态
  const [classInfo, setClassInfo] = useState<UserGroup | null>(null);
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [classLoading, setClassLoading] = useState(false);

  // 批量移除相关状态
  const [batchRemoveMode, setBatchRemoveMode] = useState(false);
  const [selectedMembersForRemoval, setSelectedMembersForRemoval] = useState<
    string[]
  >([]);

  // 用户列表相关状态
  const [usersData, setUsersData] = useState<UsersResponse>({
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

  // 班级信息编辑表单
  const classForm = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      description: '',
      remark: '',
    },
  });

  // API 返回的班级成员数据结构
  interface ApiClassMember {
    userId?: string;
    username?: string;
    phone?: string;
    isFrozen?: boolean;
    createdAt?: string;
  }

  // 成员列表分页相关状态
  const [membersCurrentPage, setMembersCurrentPage] = useState(0);
  const [membersTotalPages, setMembersTotalPages] = useState(0);
  const [membersTotal, setMembersTotal] = useState(0);
  const membersPageSize = 10;

  // 加载班级信息
  const loadClassInfo = useCallback(async () => {
    try {
      setClassLoading(true);
      // 调用API获取班级详情
      const classData = await getUserGroup(classId);

      setClassInfo(classData);
      // 更新表单默认值
      classForm.reset({
        name: classData.name,
        description: classData.description || '',
        remark: classData.remark || '',
      });
    } catch (error) {
      console.error('Failed to load class info:', error);
      toast.error('无法加载班级信息');
    } finally {
      setClassLoading(false);
    }
  }, [classId, classForm]);

  // 修改 loadMembers 函数支持分页
  const loadMembers = useCallback(
    async (page: number = 0) => {
      try {
        setMembersLoading(true);
        const response = await getUserGroupMembers(
          classId,
          page,
          membersPageSize
        );
        console.log('getUserGroupMembers response:', response);
        if (response && response.data && Array.isArray(response.data.content)) {
          const transformedMembers: ClassMember[] =
            response.data.content.map((member: ApiClassMember) => ({
              id: member.userId || '',
              username: member.username || '未知用户',
              phone: member.phone || '未知',
              userGroup: member.isFrozen ? '已冻结' : '正常',
              joinDate: member.createdAt
                ? new Date(member.createdAt).toLocaleDateString('zh-CN')
                : '未知',
            }));
          setMembers(transformedMembers);
          setMembersTotal(response.data.total);
          setMembersTotalPages(
            Math.ceil(response.data.total / membersPageSize)
          );
          setMembersCurrentPage(page);
        } else {
          console.warn('Invalid members data structure:', response);
          setMembers([]);
          setMembersTotal(0);
          setMembersTotalPages(0);
        }
      } catch (error) {
        console.error('Failed to load members:', error);
        setMembers([]);
        setMembersTotal(0);
        setMembersTotalPages(0);
      } finally {
        setMembersLoading(false);
      }
    },
    [classId, membersPageSize]
  );

  // 加载用户列表（用于添加成员）
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await getUsers(
        {
          page: currentPage,
          size: pageSize,
        }
      );
      setUsersData(response);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('无法加载班级成员列表');
    } finally {
      setUsersLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    loadClassInfo();
    loadMembers();
  }, [loadClassInfo, loadMembers]);

  useEffect(() => {
    if (showAddMemberSidebar) {
      loadUsers();
    }
  }, [loadUsers, showAddMemberSidebar]);

  // 初始化选中的用户（当前成员）
  useEffect(() => {
    const currentMemberIds = members.map(member => member.id);
    setSelectedUsers(currentMemberIds);
  }, [members]);

  // 编辑班级信息
  const onClassEditSubmit = async (
    values: z.infer<typeof classFormSchema>
  ) => {
    try {
      await updateUserGroup(
        classId,
        values as UpdateUserGroupRequest
      );
      toast.success(`班级 "${values.name}" 已成功更新。`);
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
        remark: classInfo.remark || '',
      });
    }
  };

  const filteredMembers = members.filter(
    member =>
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleAddMembers = async () => {
    // 获取新选中的用户（不是已有成员）
    const newMemberIds = selectedUsers.filter(userId => {
      const user = transformedUsers.find(u => u.id === userId);
      if (!user) return false;
      // 检查用户是否已经在当前班级中
      return !user.userGroups.some(
        (group: { groupId: string }) => group.groupId === classId
      );
    });

    if (newMemberIds.length === 0) {
      toast.warning('请选择要添加的新成员');
      return;
    }

    try {
      await addMembersToUserGroup(classId, newMemberIds);
      toast.success(`已成功添加 ${newMemberIds.length} 个成员到班级`);
      setShowAddMemberSidebar(false);
      setCurrentPage(0);
      setUserSearchTerm('');
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to add members:', error);
      toast.error('添加成员到班级失败');
    }
  };

  // 转换用户数据格式
  const transformedUsers = usersData.content.map((apiUser: AppUser) => ({
    id: apiUser.user.user_id,
    username: apiUser.user.username || '',
    phone: apiUser.user.phone || '',
    role: apiUser.user_roles.length > 0 ? apiUser.user_roles[0].role_name : '用户',
    roleType: apiUser.user_roles.length > 0 ? apiUser.user_roles[0].role_type : null,
    // 添加用户组信息
    userGroups: apiUser.user_groups || [],
  }));

  // 前端搜索过滤
  const filteredUsers = transformedUsers.filter(user => {
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
    setShowAddMemberSidebar(false);
    // 保持selectedUsers状态，不清空
  };

  // 批量移除相关函数
  const handleToggleBatchRemoveMode = () => {
    setBatchRemoveMode(!batchRemoveMode);
    setSelectedMembersForRemoval([]);
  };

  const handleMemberSelectionForRemoval = (
    memberId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedMembersForRemoval(prev => [...prev, memberId]);
    } else {
      setSelectedMembersForRemoval(prev => prev.filter(id => id !== memberId));
    }
  };

  const handleSelectAllMembers = (checked: boolean) => {
    if (checked) {
      setSelectedMembersForRemoval(filteredMembers.map(member => member.id));
    } else {
      setSelectedMembersForRemoval([]);
    }
  };
  //单独移除成员
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeMembersFromUserGroup(classId, [memberId]);
      toast.success(`已成功从班级移除成员 "${memberName}"`);
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('从班级移除成员失败，请稍后重试');
    }
  };
  //批量移除成员
  const handleBatchRemoveMembers = async () => {
    if (selectedMembersForRemoval.length === 0) {
      toast.warning('请选择要移除的成员');
      return;
    }

    try {
      await removeMembersFromUserGroup(
        classId,
        selectedMembersForRemoval
      );
      toast.success(
        `已成功从班级移除 ${selectedMembersForRemoval.length} 个成员`
      );
      setSelectedMembersForRemoval([]);
      setBatchRemoveMode(false);
      // 重新加载成员列表，保持当前页
      loadMembers(membersCurrentPage);
    } catch (error) {
      console.error('Failed to batch remove members:', error);
      toast.error('从班级批量移除成员失败，请稍后重试');
    }
  };

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className='p-3'>
        <div className='mb-8 flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.push('/admin/classes')}
          >
            <ArrowLeft className='h-10 w-10 ' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              {className} - 班级成员管理
            </h1>
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
            ) : isEditingClass ? (
              <Form {...classForm}>
                <form
                  onSubmit={classForm.handleSubmit(onClassEditSubmit)}
                  className='space-y-4'
                >
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
                  <span className='font-medium'>备注：</span>
                  <span>{classInfo?.remark || '未设置'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='bg-white rounded-lg border'>
          <div className='p-6 border-b'>
            <div className='flex gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='搜索班级成员...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
              <Button variant='outline'>搜索</Button>
              <Button
                variant={batchRemoveMode ? 'destructive' : 'outline'}
                onClick={handleToggleBatchRemoveMode}
              >
                <Trash2 className='h-4 w-4 mr-2' />
                {batchRemoveMode ? '取消批量移除' : '批量移除'}
              </Button>
              <Button
                className='bg-purple-600 hover:bg-purple-700'
                onClick={() => setShowAddMemberSidebar(true)}
              >
                <Plus className='h-4 w-4 mr-2' />
                添加成员
              </Button>
            </div>

            {/* 批量操作栏 */}
            {batchRemoveMode && (
              <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <Checkbox
                      checked={
                        selectedMembersForRemoval.length ===
                          filteredMembers.length && filteredMembers.length > 0
                      }
                      onCheckedChange={handleSelectAllMembers}
                    />
                    <span className='text-sm text-gray-700'>
                      已选择 {selectedMembersForRemoval.length} 个成员
                      {selectedMembersForRemoval.length > 0 &&
                        filteredMembers.length > 0 &&
                        ` / 共 ${filteredMembers.length} 个`}
                    </span>
                  </div>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleBatchRemoveMembers}
                    disabled={selectedMembersForRemoval.length === 0}
                  >
                    移除选中成员 ({selectedMembersForRemoval.length})
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                {batchRemoveMode && (
                  <TableHead className='w-12'>
                    <Checkbox
                      checked={
                        selectedMembersForRemoval.length ===
                          filteredMembers.length && filteredMembers.length > 0
                      }
                      onCheckedChange={handleSelectAllMembers}
                    />
                  </TableHead>
                )}
                <TableHead>用户名</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>加入日期</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={batchRemoveMode ? 6 : 5}
                    className='text-center py-8'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={batchRemoveMode ? 6 : 5}
                    className='text-center py-8 text-gray-500'
                  >
                    {searchTerm
                      ? '未找到匹配的班级成员'
                      : '暂无班级成员数据'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map(member => (
                  <TableRow key={member.id}>
                    {batchRemoveMode && (
                      <TableCell>
                        <Checkbox
                          checked={selectedMembersForRemoval.includes(
                            member.id
                          )}
                          onCheckedChange={checked =>
                            handleMemberSelectionForRemoval(
                              member.id,
                              checked as boolean
                            )
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell className='font-medium'>
                      {member.username}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>{member.userGroup}</Badge>
                    </TableCell>
                    <TableCell>{member.joinDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className='text-red-600'
                            onClick={() =>
                              handleRemoveMember(member.id, member.username)
                            }
                          >
                            移除成员
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* 成员列表分页控件 - 临时修改显示条件用于测试 */}
        {membersTotal > 0 && (
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              共 {membersTotal} 个成员，第 {membersCurrentPage + 1} 页，共{' '}
              {membersTotalPages} 页
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newPage = membersCurrentPage - 1;
                  setMembersCurrentPage(newPage);
                  loadMembers(newPage);
                }}
                disabled={membersCurrentPage === 0}
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const newPage = membersCurrentPage + 1;
                  setMembersCurrentPage(newPage);
                  loadMembers(newPage);
                }}
                disabled={membersCurrentPage >= membersTotalPages - 1}
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
        {/* Add Member Sidebar */}
        {showAddMemberSidebar && (
          <>
            <div
              className='fixed inset-0 bg-black bg-opacity-50 z-40'
              onClick={handleCloseSidebar}
            />
            <div className='fixed right-0 top-0 h-full w-1/2 bg-white z-50 shadow-xl'>
              <div className='p-4 border-b flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold mb-2'>
                    添加成员到班级
                  </h2>
                  <p className='text-sm text-muted-foreground mb-4'>
                    选择要添加到此班级的用户
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowAddMemberSidebar(false)}
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
                    filteredUsers.map(user => {
                      const isSelected = selectedUsers.includes(user.id);
                      const isMember = user.userGroups.some(
                        (group: { groupId: string }) =>
                          group.groupId === classId
                      );
                      return (
                        <div
                          key={user.id}
                          className='flex items-center space-x-3 p-2 border rounded-lg'
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={checked =>
                              handleUserSelection(user.id, checked as boolean)
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
                                {user.roleType === 'admin' ? '管理员' : user.role}
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
                    onClick={() => setShowAddMemberSidebar(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className='flex-1 bg-purple-600 hover:bg-purple-700'
                    onClick={handleAddMembers}
                  >
                    添加选中成员 (
                    {
                      selectedUsers.filter(
                        id => !members.some(m => m.id === id)
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