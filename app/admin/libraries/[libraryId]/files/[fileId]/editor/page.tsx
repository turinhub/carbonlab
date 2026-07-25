'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Settings,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import JsonVisualEditor from '@/components/json-visual-editor';
import { type JsonObject } from '@/lib/json-editor-utils';
import DocumentEditor from '@/components/document-editor';
import {
  getFileById,
  updateFile,
  deleteFile,
  type FileData,
} from '@/lib/api/files';
import { getFolderById } from '@/lib/api/folders';
import { truncateDocumentTitle } from '@/lib/utils/text';
import { toast } from 'sonner';
import { uploadFilePreviewImage } from '@/lib/api/files';

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

// 内容类型定义
const contentTypes = [
  { value: 'pdf', label: 'PDF文档', icon: FileText, color: 'text-red-600' },
  {
    value: 'audio',
    label: '音频文件',
    icon: FileText,
    color: 'text-green-600',
  },
  {
    value: 'video',
    label: '视频文件',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    value: 'image',
    label: '图片文件',
    icon: FileText,
    color: 'text-yellow-600',
  },
  { value: 'link', label: '外部链接', icon: FileText, color: 'text-blue-600' },
  {
    value: 'markdown',
    label: 'Markdown文档',
    icon: FileText,
    color: 'text-indigo-600',
  },
  { value: 'doc', label: 'Word文档', icon: FileText, color: 'text-orange-600' },
  { value: 'other', label: '其他文件', icon: FileText, color: 'text-gray-600' },
];

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();

  const libraryId = params.libraryId as string;
  const fileId = params.fileId as string;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [document, setDocument] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDocument, setEditedDocument] = useState<FileData | null>(null);
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmFileName, setConfirmFileName] = useState('');

  // 封面图上传相关状态
  const [coverImageUploading, setCoverImageUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 同步预览URL
  useEffect(() => {
    if (editedDocument?.preview_image_url !== undefined) {
      setPreviewUrl(editedDocument.preview_image_url);
    } else if (editedDocument === null && document?.preview_image_url) {
      setPreviewUrl(document.preview_image_url);
    }
  }, [editedDocument, document]);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!libraryId || !fileId) return;

      setLoading(true);

      try {
        // 加载资料库信息
        const repoResponse = await getFolderById(libraryId);
        const mappedRepository: Repository = {
          id: repoResponse.id,
          folder_name: repoResponse.folder_name,
          folder_type: repoResponse.folder_type,
          folder_attr: repoResponse.folder_attr,
          remark: repoResponse.remark,
          created_at: repoResponse.created_at,
          updated_at: repoResponse.updated_at,
          supportedFileTypes: repoResponse.folder_type || [],
        };
        setRepository(mappedRepository);

        // 加载文件信息
        const fileResponse = await getFileById(fileId);
        setDocument(fileResponse);
      } catch (err) {
        console.error('加载数据失败:', err);
        toast.error('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [libraryId, fileId]);

  // 保存文件信息
  const handleSaveDocument = async () => {
    if (!editedDocument) {
      return;
    }

    setSaving(true);
    try {
      await updateFile(
        editedDocument.id,
        {
          id: editedDocument.id,
          folder_id: editedDocument.folder_id,
          file_name: editedDocument.file_name,
          file_type: editedDocument.file_type,
          file_attr: editedDocument.file_attr,
          link_url: editedDocument.link_url,
          content: editedDocument.content,
          remark: editedDocument.remark,
        }
      );

      // 更新本地状态
      setDocument(editedDocument);
      setIsEditMode(false);
      setEditedDocument(null);

      toast.success('文件信息更新成功');
    } catch (error) {
      console.error('保存文件信息失败:', error);
      toast.error('保存文件信息失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 打开删除确认对话框
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // 删除文件
  const handleDeleteDocument = async () => {
    if (!document?.id) {
      return;
    }

    setSaving(true);
    try {
      await deleteFile(document.id);
      toast.success('文件删除成功');
      // 删除成功后返回文件列表
      router.push(`/admin/libraries/${libraryId}`);
    } catch (error) {
      console.error('删除文件失败:', error);
      toast.error('删除文件失败，请重试');
    } finally {
      setSaving(false);
      setIsDeleteDialogOpen(false);
      setConfirmFileName('');
    }
  };

  // 封面图上传处理函数
  const handleCoverImageUpload = async (file: File) => {
    if (!file || !document?.id) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片文件大小不能超过5MB');
      return;
    }

    setCoverImageUploading(true);

    try {
      // 创建临时预览URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 上传文件
      const result = await uploadFilePreviewImage(
        document.id,
        file
      );

      // 清理临时URL
      URL.revokeObjectURL(objectUrl);

      // 更新文档的 preview_image_url
      setEditedDocument({
        ...editedDocument || document,
        preview_image_url: result.preview_image_url,
      });

      setPreviewUrl(result.preview_image_url);
      toast.success('封面图上传成功');
    } catch (error) {
      console.error('上传封面图失败:', error);
      toast.error(error instanceof Error ? error.message : '上传封面图失败');

      // 恢复原来的预览图
      setPreviewUrl((editedDocument || document)?.preview_image_url || null);
    } finally {
      setCoverImageUploading(false);
    }
  };

  // 删除封面图
  const handleRemoveCoverImage = () => {
    if (!editedDocument && !document) return;

    setPreviewUrl(null);
    setEditedDocument({
      ...editedDocument || document,
      preview_image_url: undefined,
    });

    toast.success('封面图已删除');
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleCoverImageUpload(file);
      // 清空文件输入，允许重复选择同一文件
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <>
        <div className='flex h-16 items-center border-b px-4'>
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
              {document?.file_name || '编辑文档'}
            </h1>
          </div>
        </div>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
            <p className='text-gray-600'>加载中...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className='flex h-16 items-center border-b px-6'>
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
            {truncateDocumentTitle(
              document?.file_name || '编辑文档'
            )}
          </h1>
        </div>
        <div className='ml-auto'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() =>
              router.push(
                `/admin/libraries/${libraryId}/files/${fileId}/viewer`
              )
            }
            className='h-8 w-8'
            title='查看文件'
          >
            <Eye className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='p-6'>
        <div className='flex gap-6 h-[calc(100vh-8rem)]'>
          {/* 主内容区域 */}
          <div className='flex-1 overflow-hidden'>
            <DocumentEditor
              document={
                document
                  ? {
                      id: document.id,
                      title: document.file_name,
                      citation: document.remark || '',
                      createTime: document.created_at,
                      contentType: 'file' as const,
                      fileType: document.file_type.toLowerCase() as
                        | 'pdf'
                        | 'audio'
                        | 'video'
                        | 'image'
                        | 'link'
                        | 'markdown'
                        | 'doc'
                        | 'other',
                      content: document.content || '',
                      fileName: document.file_name,
                      externalUrl: document.link_url || '',
                      fileAttr: document.file_attr as
                        | Record<string, unknown>
                        | undefined,
                      ossKey: document.oss_url || '',
                      remark: document.remark,
                    }
                  : null
              }
              repository={
                repository
                  ? {
                      id: repository.id,
                      supportedFileTypes: repository.supportedFileTypes || [],
                      folder_name: repository.folder_name,
                      folder_attr: repository.folder_attr,
                    }
                  : null
              }
              onBack={() => router.push(`/admin/libraries/${libraryId}`)}
            />
          </div>

          {/* 右侧文件信息面板 */}
          <div className='w-80 flex-shrink-0'>
            {document && (
              <Card className='h-full'>
                <CardContent className='p-6 h-full overflow-y-auto'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold text-gray-900'>文件信息</h3>
                    <div className='flex items-center gap-2'>
                      {isEditMode ? (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setIsEditMode(false);
                              setEditedDocument(null);
                            }}
                            className='h-8 px-3'
                          >
                            取消
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleSaveDocument}
                            disabled={saving}
                            className='h-8 px-3'
                          >
                            {saving ? '保存中...' : '保存'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setIsEditMode(true);
                            setEditedDocument({ ...document });
                          }}
                          className='h-8 px-3'
                        >
                          <Settings className='w-4 h-4 mr-2' />
                          编辑信息
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {/* 封面图上传和显示 */}
                    <div className='space-y-2'>
                      <Label>封面图</Label>
                      {isEditMode ? (
                        <div className='space-y-3'>
                          {/* 当前封面图预览 */}
                          {previewUrl ? (
                            <div className='relative'>
                              <div className='flex justify-center'>
                                <img
                                  src={previewUrl}
                                  alt={`${document.file_name} 封面图`}
                                  width={160}
                                  height={224}
                                  className='max-w-32 max-h-44 object-contain rounded-lg shadow-sm border'
                                />
                              </div>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleRemoveCoverImage}
                                className='mt-2 w-full'
                                disabled={coverImageUploading}
                              >
                                <X className='w-4 h-4 mr-2' />
                                删除封面图
                              </Button>
                            </div>
                          ) : (
                            <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                              <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                              <p className='text-sm text-gray-600 mb-3'>
                                上传封面图
                              </p>
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={triggerFileSelect}
                                disabled={coverImageUploading}
                              >
                                {coverImageUploading ? (
                                  <>
                                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                                    上传中...
                                  </>
                                ) : (
                                  <>
                                    <Upload className='w-4 h-4 mr-2' />
                                    选择图片
                                  </>
                                )}
                              </Button>
                              <p className='text-xs text-gray-500 mt-2'>
                                支持 JPG、PNG、GIF、WebP 格式，最大 5MB
                              </p>
                            </div>
                          )}

                          {/* 隐藏的文件输入 */}
                          <input
                            ref={fileInputRef}
                            type='file'
                            accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                            onChange={handleFileSelect}
                            className='hidden'
                            disabled={coverImageUploading}
                          />
                        </div>
                      ) : (
                        // 查看模式下的封面图显示
                        document.preview_image_url && (
                          <div className='text-center'>
                            <div className='flex justify-center'>
                              <img
                                src={document.preview_image_url}
                                alt={`${document.file_name} 封面图`}
                                width={160}
                                height={224}
                                className='max-w-32 max-h-44 object-contain rounded-lg shadow-sm border'
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    {/* 文件名 */}
                    <div className='space-y-2'>
                      <Label htmlFor='fileName'>文件名</Label>
                      {isEditMode ? (
                        <Input
                          id='fileName'
                          value={editedDocument?.file_name || ''}
                          onChange={e =>
                            setEditedDocument({
                              ...editedDocument!,
                              file_name: e.target.value,
                            })
                          }
                          placeholder='输入文件名'
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                          {document.file_name}
                        </div>
                      )}
                    </div>

                    {/* 内容类型 */}
                    {repository?.supportedFileTypes &&
                      repository.supportedFileTypes.length > 0 && (
                        <div className='space-y-2'>
                          <Label>内容类型</Label>
                          {document.id ? (
                            // 编辑模式：以 Badge 标签形式显示当前类型
                            <div className='flex items-center gap-2'>
                              {(() => {
                                const currentType = contentTypes.find(
                                  type =>
                                    type.value ===
                                    document.file_type.toLowerCase()
                                );
                                if (currentType) {
                                  const Icon = currentType.icon;
                                  return (
                                    <Badge
                                      variant='secondary'
                                      className='flex items-center gap-1'
                                    >
                                      <Icon
                                        className={`w-3 h-3 ${currentType.color}`}
                                      />
                                      {currentType.label}
                                    </Badge>
                                  );
                                }
                                return (
                                  <Badge variant='secondary'>
                                    {document.file_type}
                                  </Badge>
                                );
                              })()}
                            </div>
                          ) : (
                            // 新建模式：允许选择类型
                            isEditMode && (
                              <RadioGroup
                                value={
                                  editedDocument?.file_type ||
                                  document.file_type
                                }
                                onValueChange={value =>
                                  setEditedDocument({
                                    ...editedDocument!,
                                    file_type: value,
                                  })
                                }
                              >
                                <div className='grid grid-cols-1 gap-2'>
                                  {repository.supportedFileTypes
                                    .map(type =>
                                      contentTypes.find(ct => ct.value === type)
                                    )
                                    .filter(Boolean)
                                    .map(type => {
                                      if (!type) return null;
                                      const Icon = type.icon;
                                      return (
                                        <div
                                          key={type.value}
                                          className='flex items-center space-x-2'
                                        >
                                          <RadioGroupItem
                                            value={type.value}
                                            id={type.value}
                                          />
                                          <label
                                            htmlFor={type.value}
                                            className='flex items-center gap-2 cursor-pointer text-sm font-medium'
                                          >
                                            <Icon className='w-4 h-4' />
                                            {type.label}
                                          </label>
                                        </div>
                                      );
                                    })}
                                </div>
                              </RadioGroup>
                            )
                          )}
                        </div>
                      )}

                    {/* 备注 */}
                    <div className='space-y-2'>
                      <Label htmlFor='citation'>备注</Label>
                      {isEditMode ? (
                        <Textarea
                          id='citation'
                          value={editedDocument?.remark || ''}
                          onChange={e =>
                            setEditedDocument({
                              ...editedDocument!,
                              remark: e.target.value,
                            })
                          }
                          placeholder='请输入备注信息'
                          rows={3}
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md min-h-[80px]'>
                          {document.remark || '无备注'}
                        </div>
                      )}
                    </div>

                    {/* JSON属性编辑器 */}
                    {isEditMode && (
                      <Collapsible
                        open={isBasicInfoOpen}
                        onOpenChange={setIsBasicInfoOpen}
                      >
                        <CollapsibleTrigger asChild>
                          <div className='flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors p-2 rounded-md'>
                            <Label className='flex items-center gap-2 text-sm font-medium text-gray-800'>
                              <FileText className='w-4 h-4' />
                              JSON属性
                            </Label>
                            {isBasicInfoOpen ? (
                              <ChevronUp className='w-4 h-4' />
                            ) : (
                              <ChevronDown className='w-4 h-4' />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className='space-y-2 mt-2'>
                            <div className='border rounded-md'>
                              <JsonVisualEditor
                                data={
                                  (editedDocument?.file_attr as JsonObject) ||
                                  {}
                                }
                                onDataChange={(value: JsonObject) => {
                                  setEditedDocument({
                                    ...editedDocument!,
                                    file_attr: value,
                                  });
                                  setJsonError(null);
                                }}
                                className='min-h-[150px] max-h-[300px] w-full'
                              />
                              {jsonError && (
                                <p className='text-sm text-red-600 mt-1 px-3 pb-2'>
                                  {jsonError}
                                </p>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* 文件系统信息 */}
                    <div className='space-y-1 text-sm pt-4 border-t border-gray-200'>
                      <p>
                        <span className='text-gray-600'>创建时间：</span>
                        {document.created_at
                          ? new Date(document.created_at).toLocaleDateString(
                              'zh-CN'
                            )
                          : '未知'}
                      </p>
                      <p>
                        <span className='text-gray-600'>更新时间：</span>
                        {document.updated_at
                          ? new Date(document.updated_at).toLocaleDateString(
                              'zh-CN'
                            )
                          : '未知'}
                      </p>
                    </div>

                    {/* 删除文件按钮 */}
                    {isEditMode && (
                      <div className='pt-4 border-t border-gray-200'>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={handleDeleteClick}
                          disabled={saving}
                          className='w-full'
                        >
                          <Trash2 className='w-4 h-4 mr-2' />
                          删除文件
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除文件</DialogTitle>
            <DialogDescription>
              此操作将永久删除文件 &ldquo;{document?.file_name}
              &rdquo;，且无法撤销。
              <br />
              请输入文件名以确认删除：
            </DialogDescription>
          </DialogHeader>
          <div className='py-4'>
            <Input
              value={confirmFileName}
              onChange={e => setConfirmFileName(e.target.value)}
              placeholder={document?.file_name || ''}
            />
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setConfirmFileName('');
              }}
            >
              取消
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteDocument}
              disabled={saving || confirmFileName !== document?.file_name}
            >
              {saving ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
