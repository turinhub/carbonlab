'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  Edit,
  Trash2,
  Settings,
  FileText,
  Music,
  Video,
  FileImage,
  Link,
  Eye,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import {
  getFiles,
  deleteFile,
  createFile,
  type FilesQueryParams,
  type CreateFileRequest,
} from '@/lib/api/files';
import { getFolderById, updateFolder, deleteFolder } from '@/lib/api/folders';

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

// 定义与DocumentEditor兼容的DocumentData接口
interface DocumentData {
  id?: string;
  title: string;
  citation: string;
  createTime: string;
  contentType: 'markdown' | 'file' | 'link';
  fileType:
    | 'pdf'
    | 'audio'
    | 'video'
    | 'image'
    | 'link'
    | 'markdown'
    | 'doc'
    | 'other';
  content: string;
  fileName: string;
  externalUrl: string;
  fileAttr?: Record<string, unknown>;
  linkUrl?: string;
  remark?: string;
}

// 修复 Document 接口，包含所有必需字段
interface Document {
  id: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  repositoryId: string;
  citation: string;
  createTime: string;
  contentType: 'markdown' | 'file' | 'link';
  fileType:
    | 'pdf'
    | 'audio'
    | 'video'
    | 'image'
    | 'link'
    | 'markdown'
    | 'doc'
    | 'other';
  content: string;
  fileName: string;
  externalUrl: string;
  fileAttr?: Record<string, unknown>;
  linkUrl?: string;
  remark?: string;
}

// 根据文件类型获取对应的图标和标签信息
const getFileTypeInfo = (fileType: string) => {
  // 后端返回大写格式，转换为小写进行匹配
  const normalizedType = fileType.toLowerCase();
  return (
    fileTypeOptions.find(option => option.value === normalizedType) || {
      value: 'other',
      label: '其他',
      icon: FileText,
      color: 'text-gray-600',
    }
  );
};

export default function LibraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const libraryId = params.libraryId as string;

  const [_currentPage, setCurrentPage] = useState<'documents' | 'editor'>('documents');
  const [_, setSelectedDocument] = useState<DocumentData | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [confirmDocName, setConfirmDocName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentType, setNewDocumentType] = useState('');
  // 删除资料库相关状态
  const [isDeleteRepoDialogOpen, setIsDeleteRepoDialogOpen] = useState(false);
  const [confirmRepoName, setConfirmRepoName] = useState('');

  // 加载资料库信息
  const loadRepository = async () => {
    try {
      const repo = await getFolderById(libraryId);

      if (repo) {
        setRepository({
          id: repo.id,
          folder_name: repo.folder_name,
          folder_type: repo.folder_type,
          folder_attr: repo.folder_attr,
          remark: repo.remark,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
          supportedFileTypes: repo.folder_type,
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '获取资料库信息失败');
    }
  };

  // 加载文件列表
  const loadDocuments = async (params?: FilesQueryParams) => {
    try {
      setLoading(true);
      const response = await getFiles(
        {
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          folder_id: libraryId,
          keyword: searchTerm || undefined,
          ...params,
        }
      );

      if (response.code === 200) {
        const docs: Document[] =
          response.data?.content?.map(file => ({
            id: file.id,
            title: file.file_name,
            createdAt: new Date(file.created_at).toLocaleString('zh-CN'),
            publishedAt: new Date(file.updated_at).toLocaleString('zh-CN'),
            repositoryId: file.folder_id,
            citation: file.remark || '',
            createTime: new Date(file.created_at).toLocaleString('zh-CN'),
            contentType: 'markdown' as const,
            fileType: file.file_type as Document['fileType'],
            content: file.content || '',
            fileName: file.file_name,
            externalUrl: file.link_url || '',
            fileAttr:
              (file.file_attr as Record<string, unknown>) ||
              ({} as Record<string, unknown>),
            linkUrl: file.link_url || '',
            remark: file.remark || '',
          })) || [];
        setDocuments(docs);
      } else {
        toast.error(response.msg || '获取文件列表失败');
        setDocuments([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '获取文件列表失败');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (libraryId) {
      loadRepository();
      loadDocuments();
    }
  }, [libraryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜索
  const handleSearch = () => {
    loadDocuments();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDocument = () => {
    // 打开创建资源对话框
    setIsCreateDialogOpen(true);
  };

  // 处理创建新文档
  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      toast.error('请输入资源标题');
      return;
    }

    if (!newDocumentType) {
      toast.error('请选择资源类型');
      return;
    }

    try {
      setLoading(true);

      // 创建文件请求数据
      const createData: CreateFileRequest = {
        folder_id: libraryId,
        file_name: newDocumentTitle.trim(),
        file_type: newDocumentType.toUpperCase(), // 转换为大写格式
        content: '', // 初始内容为空
        remark: '',
      };

      // 调用API创建文件
      const newFile = await createFile(createData);

      // 关闭对话框并重置表单
      setIsCreateDialogOpen(false);
      setNewDocumentTitle('');
      setNewDocumentType('');

      // 跳转到编辑页面
      router.push(
        `/admin/libraries/${libraryId}/files/${newFile.id}/editor`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = async (doc: Document) => {
    // 跳转到编辑文档页面
    router.push(`/admin/libraries/${libraryId}/files/${doc.id}/editor`);
  };

  const handleViewDocument = async (doc: Document) => {
    // 在新窗口中打开文件查看页面
    window.open(`/admin/libraries/${libraryId}/files/${doc.id}/viewer`, '_blank');
  };

  const handleDeleteClick = (doc: Document) => {
    setDeletingDocument(doc);
    setConfirmDocName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocument) return;

    if (confirmDocName !== deletingDocument.title) {
      toast.error('输入的文档标题不匹配');
      return;
    }

    try {
      setLoading(true);
      await deleteFile(deletingDocument.id);
      // 重新加载文档列表
      await loadDocuments();
      setIsDeleteDialogOpen(false);
      setDeletingDocument(null);
      setConfirmDocName('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除文件失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新资料库信息
  const handleUpdateRepository = async () => {
    if (!repository) return;

    try {
      setLoading(true);
      await updateFolder(
        repository.id,
        {
          folder_name: repository.folder_name,
          folder_type: repository.folder_type,
          folder_attr: repository.folder_attr || {},
          remark: repository.remark,
        }
      );

      setIsEditMode(false);
      // 重新加载资料库信息
      await loadRepository();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新资料库失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    if (!repository) return;

    // 将小写格式转换为大写格式以匹配后端
    const upperCaseType = fileType.toUpperCase();

    setRepository({
      ...repository,
      folder_type: checked
        ? [...repository.folder_type, upperCaseType]
        : repository.folder_type.filter((type: string) => type !== upperCaseType),
    });
  };

  // 删除资料库
  const handleDeleteRepository = async () => {
    if (!repository) return;

    if (confirmRepoName !== repository.folder_name) {
      toast.error('输入的资料库名称不匹配');
      return;
    }

    try {
      setLoading(true);
      await deleteFolder(repository.id);
      // 删除成功后跳转回资源列表页面
      router.push('/admin/libraries');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除资料库失败');
    } finally {
      setLoading(false);
      setIsDeleteRepoDialogOpen(false);
      setConfirmRepoName('');
    }
  };

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='flex items-center gap-2'
            >
              返回
            </Button>
            <h1 className='text-xl font-bold'>
              {repository?.folder_name || '资料库详情'}
            </h1>
          </div>
        </div>
      </div>
      <div className='p-6'>
        <div className='flex gap-6'>
          {/* 主内容区域 */}
          <div className='flex-1'>
            {/* 操作栏 */}
            <div className='flex items-center justify-between gap-4 mb-6'>
              <Button onClick={handleAddDocument}>添加资源</Button>
              <div className='flex-1 max-w-md'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    placeholder='搜索文档...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            </div>

            {/* Document Table */}
            <div className='bg-white rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文档标题</TableHead>
                    <TableHead>文件类型</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>发布时间</TableHead>
                    <TableHead className='text-right'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className='text-center py-8'>
                        <div className='flex items-center justify-center'>
                          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                          <span className='ml-2'>加载中...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className='text-center py-8 text-gray-500'
                      >
                        暂无文档
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map(doc => {
                      const fileTypeInfo = getFileTypeInfo(doc.fileType);
                      const IconComponent = fileTypeInfo.icon;
                      return (
                        <TableRow key={doc.id} className='hover:bg-gray-50'>
                          <TableCell className='font-medium max-w-md'>
                            <div className='truncate' title={doc.title}>
                              {doc.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <IconComponent
                                className={`w-4 h-4 ${fileTypeInfo.color}`}
                              />
                              <span className='text-sm text-gray-600'>
                                {fileTypeInfo.label}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className='text-gray-600'>
                            {doc.createdAt}
                          </TableCell>
                          <TableCell className='text-gray-600'>
                            {doc.publishedAt}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleViewDocument(doc)}
                                className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
                                title='查看文档'
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleEditDocument(doc)}
                                className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                title='编辑文档'
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteClick(doc)}
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                title='删除文档'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 右侧资料库信息 */}
          <div className='w-80 flex-shrink-0'>
            {repository && (
              <Card>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold text-gray-900'>资料库信息</h3>
                    <div className='flex items-center gap-2'>
                      {isEditMode ? (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setIsEditMode(false);
                              // 重新加载资料库信息以恢复原始数据
                              loadRepository();
                            }}
                            className='h-8 px-3'
                          >
                            取消
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleUpdateRepository}
                            disabled={loading}
                            className='h-8 px-3'
                          >
                            {loading ? '保存中...' : '保存'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsEditMode(true)}
                          className='h-8 px-3'
                        >
                          <Settings className='w-4 h-4 mr-2' />
                          编辑资料库
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='folderName'>资料库名称</Label>
                      {isEditMode ? (
                        <Input
                          id='folderName'
                          value={repository.folder_name}
                          onChange={e =>
                            setRepository({
                              ...repository,
                              folder_name: e.target.value,
                            })
                          }
                          placeholder='输入资料库名称'
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                          {repository.folder_name}
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='remark'>备注</Label>
                      {isEditMode ? (
                        <Input
                          id='remark'
                          value={repository.remark || ''}
                          onChange={e =>
                            setRepository({
                              ...repository,
                              remark: e.target.value,
                            })
                          }
                          placeholder='输入备注信息'
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                          {repository.remark || '无'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>支持的文件类型</Label>
                      {isEditMode ? (
                        <div className='grid grid-cols-1 gap-3 mt-2'>
                          {fileTypeOptions.map(option => (
                            <div
                              key={option.value}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={`edit-${option.value}`}
                                checked={repository.folder_type.includes(
                                  option.value.toUpperCase()
                                )}
                                onCheckedChange={checked =>
                                  handleFileTypeChange(
                                    option.value,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`edit-${option.value}`}
                                className='text-sm flex items-center gap-2'
                              >
                                <option.icon
                                  className={`w-4 h-4 ${option.color}`}
                                />
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {repository.folder_type.map((type: string) => {
                            const option = fileTypeOptions.find(
                              opt => opt.value === type.toLowerCase()
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
                          {repository.folder_type.length === 0 && (
                            <span className='text-gray-500 text-sm'>
                              未设置支持类型
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className='space-y-1 text-sm'>
                      <p>
                        <span className='text-gray-600'>创建时间：</span>
                        {new Date(repository.created_at).toLocaleDateString(
                          'zh-CN'
                        )}
                      </p>
                    </div>

                    {/* 删除资料库按钮 */}
                    {isEditMode && (
                      <div className='pt-4 border-t border-gray-200'>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => setIsDeleteRepoDialogOpen(true)}
                          className='w-full'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          删除资料库
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 创建资源对话框 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>创建新资源</DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                选择资源类型并输入标题来创建新的资源文件。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-3'>
                <Label>资源类型</Label>
                <RadioGroup
                  value={newDocumentType}
                  onValueChange={setNewDocumentType}
                  className='grid grid-cols-2 gap-3'
                >
                  {fileTypeOptions
                    .filter(
                      option =>
                        repository?.supportedFileTypes?.includes(
                          option.value.toUpperCase()
                        ) ||
                        repository?.folder_type?.includes(
                          option.value.toUpperCase()
                        )
                    )
                    .map(option => {
                      const IconComponent = option.icon;
                      return (
                        <div
                          key={option.value}
                          className='flex items-center space-x-2'
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <Label
                            htmlFor={option.value}
                            className='flex items-center gap-2 cursor-pointer'
                          >
                            <IconComponent
                              className={`w-4 h-4 ${option.color}`}
                            />
                            <span>{option.label}</span>
                          </Label>
                        </div>
                      );
                    })}
                </RadioGroup>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='document-title'>资源标题</Label>
                <Input
                  id='document-title'
                  placeholder='输入资源标题'
                  value={newDocumentTitle}
                  onChange={e => setNewDocumentTitle(e.target.value)}
                  className='bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewDocumentTitle('');
                  setNewDocumentType('');
                }}
              >
                取消
              </Button>
              <Button
                type='button'
                onClick={handleCreateDocument}
                disabled={
                  !newDocumentTitle.trim() || !newDocumentType || loading
                }
              >
                {loading ? '创建中...' : '创建并编辑'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                确认删除文档
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                此操作无法撤销。请输入文档标题「{deletingDocument?.title}
                」来确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  请输入文档标题确认
                </label>
                <Input
                  placeholder='输入文档标题'
                  value={confirmDocName}
                  onChange={e => setConfirmDocName(e.target.value)}
                  className='bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDeleteDocument}
                disabled={confirmDocName !== deletingDocument?.title}
              >
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除资料库确认对话框 */}
        <Dialog
          open={isDeleteRepoDialogOpen}
          onOpenChange={setIsDeleteRepoDialogOpen}
        >
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                确认删除资料库
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                此操作无法撤销，将删除资料库及其所有文档。请输入资料库名称「
                {repository?.folder_name}
                」来确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  请输入资料库名称确认
                </label>
                <Input
                  placeholder='输入资料库名称'
                  value={confirmRepoName}
                  onChange={e => setConfirmRepoName(e.target.value)}
                  className='bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsDeleteRepoDialogOpen(false);
                  setConfirmRepoName('');
                }}
              >
                取消
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDeleteRepository}
                disabled={confirmRepoName !== repository?.folder_name || loading}
              >
                {loading ? '删除中...' : '确认删除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}