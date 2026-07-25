'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderOpen,
  FileText,
  Music,
  Video,
  FileImage,
  Link,
  MoreHorizontal,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import JsonVisualEditor from '@/components/json-visual-editor';
import {
  getFolders,
  createFolder,
  deleteFolder,
  type FoldersQueryParams,
} from '@/lib/api/folders';

interface Repository {
  id: string;
  folder_name: string;
  folder_type: string[];
  folder_attr?: {
    icon?: string;
    color?: string;
  };
  remark: string;
  created_at: string;
  updated_at: string;
  supportedFileTypes: string[];
}

const fileTypeOptions = [
  {
    value: 'audio',
    label: '音频',
    icon: Music,
    description: 'MP3, WAV, AAC 等格式',
    color: 'text-green-600',
  },
  {
    value: 'video',
    label: '视频',
    icon: Video,
    description: 'MP4, AVI, MOV 等格式',
    color: 'text-purple-600',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    description: 'PDF 文档格式',
    color: 'text-red-600',
  },
  {
    value: 'image',
    label: '图片',
    icon: FileImage,
    description: 'JPG, PNG, GIF 等格式',
    color: 'text-yellow-600',
  },
  {
    value: 'link',
    label: '外部链接',
    icon: Link,
    description: '网页链接、在线文档等',
    color: 'text-blue-600',
  },
  {
    value: 'markdown',
    label: 'Markdown',
    icon: FileText,
    description: 'MD 文档格式',
    color: 'text-indigo-600',
  },
  {
    value: 'doc',
    label: '文档',
    icon: FileText,
    description: 'DOC, DOCX 等格式',
    color: 'text-orange-600',
  },
];

export default function LibrariesManagement() {
  const router = useRouter();
  const [currentPage] = useState<'repositories' | 'documents' | 'editor'>('repositories');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRepoDialog, setShowAddRepoDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRepo, setDeletingRepo] = useState<Repository | null>(null);
  const [confirmRepoName, setConfirmRepoName] = useState('');

  const [newRepo, setNewRepo] = useState({
    folderName: '',
    remark: '',
    folderType: [] as string[],
    folderAttr: {},
  });

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    try {
      const params: FoldersQueryParams = {
        page: 0,
        size: 100,
      };
      const response = await getFolders(params);
      const transformedRepos: Repository[] = response.data.content.map(
        folder => ({
          id: folder.id,
          folder_name: folder.folder_name,
          folder_type: folder.folder_type || [],
          folder_attr: folder.folder_attr,
          remark: folder.remark || '',
          created_at: folder.created_at,
          updated_at: folder.updated_at,
          supportedFileTypes: folder.folder_type || [],
        })
      );
      setRepositories(transformedRepos);
    } catch (err) {
      toast.error('加载资料库失败');
      console.error('Failed to load repositories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setNewRepo(prev => ({
      ...prev,
      folderType: checked
        ? [...prev.folderType, fileType]
        : prev.folderType.filter(type => type !== fileType),
    }));
  };

  const handleAddRepository = async () => {
    try {
      await createFolder(
        {
          folder_name: newRepo.folderName,
          folder_type: newRepo.folderType,
          folder_attr: newRepo.folderAttr,
          remark: newRepo.remark,
        }
      );
      setShowAddRepoDialog(false);
      setNewRepo({
        folderName: '',
        remark: '',
        folderType: [],
        folderAttr: {},
      });
      loadRepositories();
    } catch {
      toast.error('添加资料库失败');
    }
  };

  const handleViewRepository = (repo: Repository) => {
    // 导航到资料库详情页面
    router.push(`/admin/libraries/${repo.id}`);
  };

  const handleDeleteClick = (repo: Repository) => {
    setDeletingRepo(repo);
    setConfirmRepoName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRepository = async () => {
    if (!deletingRepo) return;

    if (confirmRepoName !== deletingRepo?.folder_name) {
      toast.error('输入的资料库名称不匹配');
      return;
    }

    try {
      await deleteFolder(deletingRepo.id);
      setIsDeleteDialogOpen(false);
      setDeletingRepo(null);
      setConfirmRepoName('');
      loadRepositories();
    } catch {
      toast.error('删除资料库失败');
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      repo.folder_name.toLowerCase().includes(searchLower) ||
      repo.remark.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <div className='flex items-center justify-between w-full'>
          <h1 className='text-2xl font-bold'>资料库管理</h1>
        </div>
      </div>
      <div className='p-6'>
        {currentPage === 'editor' ? (
          <div className='text-center py-8'>
            <p className='text-gray-500'>编辑功能开发中...</p>
          </div>
        ) : (
          <div className='w-full max-w-7xl mx-auto space-y-6'>
            {/* 头部区域 */}
            <div className='flex items-center justify-between gap-4'>
              <Button
                onClick={() => {
                  setNewRepo({
                    folderName: '',
                    remark: '',
                    folderType: [],
                    folderAttr: {},
                  });
                  setShowAddRepoDialog(true);
                }}
                disabled={loading}
              >
                添加资料库
              </Button>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='搜索资料库名称、备注...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>

            {/* 数据表格 */}
            <Card>
              <CardContent className='p-0'>
                {loading ? (
                  <div className='flex items-center justify-center h-64'>
                    <div className='text-lg'>加载中...</div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='font-semibold text-gray-900'>
                          资料库名称
                        </TableHead>
                        <TableHead className='font-semibold text-gray-900'>
                          支持类型
                        </TableHead>
                        <TableHead className='font-semibold text-gray-900'>
                          创建时间
                        </TableHead>
                        <TableHead className='font-semibold text-gray-900'>
                          备注
                        </TableHead>
                        <TableHead className='font-semibold text-gray-900 w-20'>
                          操作
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRepositories.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className='text-center py-8 text-gray-500'
                          >
                            {searchTerm
                              ? '未找到匹配的资料库'
                              : '暂无资料库数据'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRepositories.map(repo => (
                          <TableRow
                            key={repo.id}
                            className='cursor-pointer hover:bg-muted/50 transition-colors'
                            onClick={() => handleViewRepository(repo)}
                          >
                            <TableCell>
                              <div className='flex items-center space-x-3'>
                                <FolderOpen className='w-5 h-5 text-blue-600' />
                                <span className='font-medium text-gray-900'>
                                  {repo.folder_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-wrap gap-1'>
                                {repo.folder_type.slice(0, 3).map(type => {
                                  const option = fileTypeOptions.find(
                                    opt => opt.value === type
                                  );
                                  return option ? (
                                    <Badge
                                      key={type}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      <option.icon
                                        className={`w-3 h-3 mr-1 ${option.color}`}
                                      />
                                      {option.label}
                                    </Badge>
                                  ) : null;
                                })}
                                {repo.folder_type.length > 3 && (
                                  <Badge variant='outline' className='text-xs'>
                                    +{repo.folder_type.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className='text-gray-600'>
                              {new Date(repo.created_at).toLocaleDateString(
                                'zh-CN'
                              )}
                            </TableCell>
                            <TableCell className='text-gray-600'>
                              {repo.remark || '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    className='h-8 w-8 p-0'
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuItem
                                    onClick={e => {
                                      e.stopPropagation();
                                      window.open(
                                        `/admin/libraries/${repo.id}`,
                                        '_blank'
                                      );
                                    }}
                                  >
                                    <ExternalLink className='mr-2 h-4 w-4' />
                                    在新页面中打开
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleDeleteClick(repo);
                                    }}
                                    className='text-red-600'
                                  >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    删除资料库
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* 添加资料库对话框 */}
        <Dialog open={showAddRepoDialog} onOpenChange={setShowAddRepoDialog}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>添加资料库</DialogTitle>
              <DialogDescription>
                创建一个新的资料库来管理文档
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='folderName'>资料库名称</Label>
                <Input
                  id='folderName'
                  value={newRepo.folderName}
                  onChange={e =>
                    setNewRepo({ ...newRepo, folderName: e.target.value })
                  }
                  placeholder='输入资料库名称'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='remark'>备注</Label>
                <Input
                  id='remark'
                  value={newRepo.remark}
                  onChange={e =>
                    setNewRepo({ ...newRepo, remark: e.target.value })
                  }
                  placeholder='输入备注信息'
                />
              </div>
              <div className='space-y-2'>
                <Label>支持的文件类型</Label>
                <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto'>
                  {fileTypeOptions.map(option => (
                    <div
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={option.value}
                        checked={newRepo.folderType.includes(option.value)}
                        onCheckedChange={checked =>
                          handleFileTypeChange(option.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={option.value}
                        className='flex items-center gap-2'
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className='space-y-2'>
                <Label>文件夹属性 (JSON)</Label>
                <div className='max-h-40 overflow-y-auto'>
                  <JsonVisualEditor
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={(newRepo.folderAttr as any) || {}}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onDataChange={(value: any) =>
                      setNewRepo({ ...newRepo, folderAttr: value })
                    }
                    className='h-full w-full'
                  />
                </div>
              </div>
            </div>
            <DialogFooter className='sticky bottom-0 bg-white pt-4 border-t'>
              <Button
                variant='outline'
                onClick={() => setShowAddRepoDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleAddRepository}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>删除资料库</DialogTitle>
              <DialogDescription>
                此操作将永久删除资料库及其所有内容，此操作不可撤销。请输入资料库名称以确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='confirmName'>资料库名称</Label>
                <Input
                  id='confirmName'
                  value={confirmRepoName}
                  onChange={e => setConfirmRepoName(e.target.value)}
                  placeholder={`请输入【${deletingRepo?.folder_name}】以确认删除`}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingRepo(null);
                  setConfirmRepoName('');
                }}
              >
                取消
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteRepository}
                disabled={confirmRepoName !== deletingRepo?.folder_name}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}