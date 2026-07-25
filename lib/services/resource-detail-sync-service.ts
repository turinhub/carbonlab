import { 
  getFiles, 
  createFile, 
  updateFile, 
  deleteFile,
  CreateFileRequest,
  UpdateFileRequest,
  FileData
} from '@/lib/api/files';
import { 
  getRepositories, 
  createRepository, 
  updateRepository, 
  deleteRepository,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  Repository
} from '@/lib/api/resources';

// 同步结果接口
export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 数据一致性检查结果
export interface ConsistencyResult {
  isConsistent: boolean;
  localCount: number;
  remoteCount: number;
  inconsistencies: string[];
}

// 资源库详情同步服务
export class ResourceDetailSyncService {
  /**
   * 同步资源库详情到 Tale 平台
   */
  async syncRepositoryDetailToTale(repositoryId: string): Promise<SyncResult> {
    try {
      console.log('🔄 开始同步资源库详情到 Tale 平台:', repositoryId);

      // 获取本地资源库数据
      const localRepository = this.getLocalRepository(repositoryId);
      if (!localRepository) {
        return {
          success: false,
          message: '本地资源库不存在'
        };
      }

      // 检查是否有 Tale 文件夹 ID
      if (!localRepository.taleFolderId) {
        return {
          success: false,
          message: '资源库未关联 Tale 文件夹，请先同步资源库'
        };
      }

      // 获取本地文件数据
      const localFiles = this.getLocalFiles(repositoryId);
      console.log(`📁 找到 ${localFiles.length} 个文件需要同步`);

      // 同步文件到 Tale 平台
      const syncResults = [];
      for (const file of localFiles) {
        try {
          const fileResult = await this.syncFileToTale(file, localRepository.taleFolderId!);
          syncResults.push(fileResult);
          
          // 添加延迟避免 API 限制
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error('同步文件失败:', file.fileName, error);
          syncResults.push({
            success: false,
            message: `同步文件 "${file.fileName}" 失败`,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      const successCount = syncResults.filter(r => r.success).length;
      const totalCount = syncResults.length;

      // 更新本地同步状态
      this.updateLocalRepositorySyncStatus(repositoryId, 'synced', new Date().toISOString());

      return {
        success: true,
        message: `资源库详情同步完成：成功 ${successCount}/${totalCount} 个文件`,
        data: {
          filesSynced: successCount,
          totalFiles: totalCount,
          syncResults
        }
      };
    } catch (error) {
      console.error('❌ 同步资源库详情失败:', error);
      return {
        success: false,
        message: '同步资源库详情失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 同步单个文件到 Tale 平台
   */
  private async syncFileToTale(file: any, taleFolderId: string): Promise<SyncResult> {
    try {
      // 检查文件是否已经同步过
      if (file.taleFileId) {
        // 更新现有文件
        const updateData: UpdateFileRequest = {
          id: file.taleFileId,
          folder_id: taleFolderId,
          file_name: file.fileName,
          file_type: file.fileType,
          link_url: file.fileUrl,
          remark: file.remark || '',
          file_attr: file.fileAttr || {}
        };

        const updatedFile = await updateFile(file.taleFileId, updateData);
        console.log('✅ 文件更新成功:', file.fileName);

        return {
          success: true,
          message: `文件 "${file.fileName}" 已更新`,
          data: {
            taleFileId: updatedFile.id,
            lastSyncTime: new Date().toISOString()
          }
        };
      } else {
        // 创建新文件
        const createData: CreateFileRequest = {
          folder_id: taleFolderId,
          file_name: file.fileName,
          file_type: file.fileType,
          link_url: file.fileUrl,
          remark: file.remark || '',
          file_attr: file.fileAttr || {}
        };

        const createdFile = await createFile(createData);
        console.log('✅ 文件创建成功:', file.fileName);

        // 更新本地文件的 Tale ID
        this.updateLocalFileTaleId(file.id, createdFile.id);

        return {
          success: true,
          message: `文件 "${file.fileName}" 已创建`,
          data: {
            taleFileId: createdFile.id,
            lastSyncTime: new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error('❌ 同步文件失败:', file.fileName, error);
      return {
        success: false,
        message: `同步文件 "${file.fileName}" 失败`,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 检查数据一致性
   */
  async checkDataConsistency(): Promise<ConsistencyResult> {
    try {
      console.log('🔄 开始检查数据一致性...');

      // 获取本地资源库数据
      const localRepositories = this.getAllLocalRepositories();
      const localFiles = this.getAllLocalFiles();

      // 获取远程资源库数据
      const remoteRepositories = await this.getAllTaleRepositories();
      const remoteFiles = await this.getAllTaleFiles();

      const inconsistencies: string[] = [];

      // 检查资源库一致性
      const localRepoCount = localRepositories.length;
      const remoteRepoCount = remoteRepositories.length;

      if (localRepoCount !== remoteRepoCount) {
        inconsistencies.push(`资源库数量不一致：本地 ${localRepoCount} 个，远程 ${remoteRepoCount} 个`);
      }

      // 检查文件一致性
      const localFileCount = localFiles.length;
      const remoteFileCount = remoteFiles.length;

      if (localFileCount !== remoteFileCount) {
        inconsistencies.push(`文件数量不一致：本地 ${localFileCount} 个，远程 ${remoteFileCount} 个`);
      }

      // 检查具体的资源库和文件匹配
      for (const localRepo of localRepositories) {
        if (localRepo.taleFolderId) {
          const remoteRepo = remoteRepositories.find(r => r.id === localRepo.taleFolderId);
          if (!remoteRepo) {
            inconsistencies.push(`本地资源库 "${localRepo.folderName}" 在远程不存在`);
          }
        }
      }

      return {
        isConsistent: inconsistencies.length === 0,
        localCount: localRepoCount,
        remoteCount: remoteRepoCount,
        inconsistencies
      };
    } catch (error) {
      console.error('❌ 检查数据一致性失败:', error);
      return {
        isConsistent: false,
        localCount: 0,
        remoteCount: 0,
        inconsistencies: ['检查失败：' + (error instanceof Error ? error.message : '未知错误')]
      };
    }
  }

  /**
   * 获取本地资源库数据
   */
  private getLocalRepository(repositoryId: string): any {
    try {
      const savedRepos = localStorage.getItem('mockRepositories');
      if (savedRepos) {
        const repos = JSON.parse(savedRepos);
        return repos.find((repo: any) => repo.id === repositoryId);
      }
    } catch (error) {
      console.error('获取本地资源库数据失败:', error);
    }
    return null;
  }

  /**
   * 获取所有本地资源库数据
   */
  private getAllLocalRepositories(): any[] {
    try {
      const savedRepos = localStorage.getItem('mockRepositories');
      if (savedRepos) {
        return JSON.parse(savedRepos);
      }
    } catch (error) {
      console.error('获取本地资源库数据失败:', error);
    }
    return [];
  }

  /**
   * 获取本地文件数据
   */
  private getLocalFiles(repositoryId: string): any[] {
    try {
      const savedFiles = localStorage.getItem(`mockFiles_${repositoryId}`);
      if (savedFiles) {
        return JSON.parse(savedFiles);
      }
    } catch (error) {
      console.error('获取本地文件数据失败:', error);
    }
    return [];
  }

  /**
   * 获取所有本地文件数据
   */
  private getAllLocalFiles(): any[] {
    try {
      const allFiles: any[] = [];
      const repositories = this.getAllLocalRepositories();
      
      for (const repo of repositories) {
        const files = this.getLocalFiles(repo.id);
        allFiles.push(...files);
      }
      
      return allFiles;
    } catch (error) {
      console.error('获取所有本地文件数据失败:', error);
      return [];
    }
  }

  /**
   * 获取所有 Tale 平台资源库
   */
  private async getAllTaleRepositories(): Promise<Repository[]> {
    try {
      const response = await getRepositories({ page: 0, size: 1000 });
      return response.data.content || [];
    } catch (error) {
      console.error('获取远程资源库失败:', error);
      return [];
    }
  }

  /**
   * 获取所有 Tale 平台文件
   */
  private async getAllTaleFiles(): Promise<FileData[]> {
    try {
      // 这里需要实现获取所有文件的逻辑
      // 由于 API 可能没有直接获取所有文件的接口，这里返回空数组
      console.log('获取远程文件列表（暂未实现）');
      return [];
    } catch (error) {
      console.error('获取远程文件失败:', error);
      return [];
    }
  }

  /**
   * 更新本地资源库同步状态
   */
  private updateLocalRepositorySyncStatus(repositoryId: string, status: string, lastSyncTime: string): void {
    try {
      const savedRepos = localStorage.getItem('mockRepositories');
      if (savedRepos) {
        const repos = JSON.parse(savedRepos);
        const updatedRepos = repos.map((repo: any) => 
          repo.id === repositoryId 
            ? { ...repo, syncStatus: status, lastSyncTime }
            : repo
        );
        localStorage.setItem('mockRepositories', JSON.stringify(updatedRepos));
      }
    } catch (error) {
      console.error('更新本地资源库同步状态失败:', error);
    }
  }

  /**
   * 更新本地文件的 Tale ID
   */
  private updateLocalFileTaleId(fileId: string, taleFileId: string): void {
    try {
      // 这里需要实现更新本地文件 Tale ID 的逻辑
      // 由于文件存储结构可能不同，这里只是示例
      console.log('更新本地文件 Tale ID:', fileId, '->', taleFileId);
    } catch (error) {
      console.error('更新本地文件 Tale ID 失败:', error);
    }
  }
}

// 创建默认实例
export const resourceDetailSyncService = new ResourceDetailSyncService();


