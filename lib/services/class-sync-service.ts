import {
  createClass as createUserGroup,
  getClasses as getUserGroups,
  getClass as getUserGroup,
  updateClass as updateUserGroup,
  deleteClass as deleteUserGroup,
  addMembersToUserGroup,
  removeMembersFromUserGroup,
  getUserGroupMembers,
  CreateClassRequest as CreateUserGroupRequest,
  UpdateClassRequest as UpdateUserGroupRequest
} from '@/lib/api/classes';
import { UserGroup } from '@/lib/types/tale';

// 班级接口（本地）
export interface Class {
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

// 同步结果接口
export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 班级同步服务
export class ClassSyncService {
  private appKey: string;

  constructor(appKey: string) {
    this.appKey = appKey;
  }

  /**
   * 同步单个班级到 Tale 平台
   */
  async syncClassToTale(classData: Class): Promise<SyncResult> {
    try {
      console.log('🔄 开始同步班级到 Tale 平台:', classData.name);

      // 检查班级是否已经同步过
      if (classData.taleGroupId) {
        // 更新现有用户组
        return await this.updateClassInTale(classData);
      } else {
        // 创建新的用户组
        return await this.createClassInTale(classData);
      }
    } catch (error) {
      console.error('❌ 同步班级失败:', error);
      return {
        success: false,
        message: '同步班级失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 在 Tale 平台创建班级用户组
   */
  private async createClassInTale(classData: Class): Promise<SyncResult> {
    try {
      const groupData: CreateUserGroupRequest = {
        name: classData.name,
        description: classData.description || `班级：${classData.name}（${classData.grade}）`,
        remark: `年级：${classData.grade}，最大学生数：${classData.maxStudents}，状态：${classData.status}${classData.remark ? `，备注：${classData.remark}` : ''}`
      };

      console.log('📝 创建用户组数据:', groupData);

      const createdGroup = await createUserGroup(groupData, this.appKey);
      console.log('✅ 用户组创建成功:', createdGroup);

      // 如果有学生，添加到用户组
      if (classData.students && classData.students.length > 0) {
        await this.syncStudentsToGroup(createdGroup.groupId, classData.students);
      }

      return {
        success: true,
        message: `班级 "${classData.name}" 已成功同步到 Tale 平台`,
        data: {
          taleGroupId: createdGroup.groupId,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced'
        }
      };
    } catch (error) {
      console.error('❌ 创建用户组失败:', error);
      return {
        success: false,
        message: '创建用户组失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 在 Tale 平台更新班级用户组
   */
  private async updateClassInTale(classData: Class): Promise<SyncResult> {
    try {
      if (!classData.taleGroupId) {
        throw new Error('班级未关联 Tale 用户组');
      }

      const groupData: UpdateUserGroupRequest = {
        name: classData.name,
        description: classData.description || `班级：${classData.name}（${classData.grade}）`,
        remark: `年级：${classData.grade}，最大学生数：${classData.maxStudents}，状态：${classData.status}${classData.remark ? `，备注：${classData.remark}` : ''}`
      };

      console.log('📝 更新用户组数据:', groupData);

      const updatedGroup = await updateUserGroup(classData.taleGroupId, groupData, this.appKey);
      console.log('✅ 用户组更新成功:', updatedGroup);

      // 同步学生到用户组
      await this.syncStudentsToGroup(classData.taleGroupId, classData.students);

      return {
        success: true,
        message: `班级 "${classData.name}" 已成功更新到 Tale 平台`,
        data: {
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced'
        }
      };
    } catch (error) {
      console.error('❌ 更新用户组失败:', error);
      return {
        success: false,
        message: '更新用户组失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 同步学生到用户组
   */
  private async syncStudentsToGroup(groupId: string, studentIds: string[]): Promise<void> {
    try {
      if (!studentIds || studentIds.length === 0) {
        console.log('📝 没有学生需要同步');
        return;
      }

      // 获取当前用户组成员
      const currentMembers = await getUserGroupMembers(groupId, 0, 1000, this.appKey);
      const currentMemberIds = currentMembers.data.content.map(member => member.userId);

      // 找出需要添加的学生
      const studentsToAdd = studentIds.filter(id => !currentMemberIds.includes(id));
      
      // 找出需要移除的学生
      const studentsToRemove = currentMemberIds.filter(id => !studentIds.includes(id));

      // 添加新学生
      if (studentsToAdd.length > 0) {
        console.log('➕ 添加学生到用户组:', studentsToAdd);
        await addMembersToUserGroup(groupId, studentsToAdd, this.appKey);
      }

      // 移除不在班级中的学生
      if (studentsToRemove.length > 0) {
        console.log('➖ 从用户组移除学生:', studentsToRemove);
        await removeMembersFromUserGroup(groupId, studentsToRemove, this.appKey);
      }

      console.log('✅ 学生同步完成');
    } catch (error) {
      console.error('❌ 同步学生失败:', error);
      throw error;
    }
  }

  /**
   * 从 Tale 平台删除班级用户组
   */
  async deleteClassFromTale(taleGroupId: string): Promise<SyncResult> {
    try {
      console.log('🗑️ 删除用户组:', taleGroupId);
      
      await deleteUserGroup(taleGroupId, this.appKey);
      
      return {
        success: true,
        message: '班级已从 Tale 平台删除'
      };
    } catch (error) {
      console.error('❌ 删除用户组失败:', error);
      return {
        success: false,
        message: '删除用户组失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量同步所有班级到 Tale 平台
   */
  async syncAllClassesToTale(classes: Class[]): Promise<SyncResult[]> {
    console.log('🔄 开始批量同步班级，共', classes.length, '个班级');
    
    const results: SyncResult[] = [];
    
    for (const classData of classes) {
      try {
        const result = await this.syncClassToTale(classData);
        results.push(result);
        
        // 添加延迟避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('❌ 同步班级失败:', classData.name, error);
        results.push({
          success: false,
          message: `同步班级 "${classData.name}" 失败`,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量同步完成，成功 ${successCount}/${classes.length} 个班级`);
    
    return results;
  }

  /**
   * 检查班级同步状态
   */
  async checkClassSyncStatus(classData: Class): Promise<{
    isSynced: boolean;
    taleGroupId?: string;
    lastSyncTime?: string;
    memberCount?: number;
  }> {
    try {
      if (!classData.taleGroupId) {
        return { isSynced: false };
      }

      // 获取用户组信息
      const groupInfo = await getUserGroup(classData.taleGroupId, this.appKey);
      
      return {
        isSynced: true,
        taleGroupId: classData.taleGroupId,
        lastSyncTime: classData.lastSyncTime,
        memberCount: groupInfo.memberCount
      };
    } catch (error) {
      console.error('❌ 检查同步状态失败:', error);
      return { isSynced: false };
    }
  }

  /**
   * 从 Tale 平台获取所有用户组（用于对比）
   */
  async getAllTaleGroups(): Promise<UserGroup[]> {
    try {
      const response = await getUserGroups({ page: 0, size: 1000 }, this.appKey);
      return response.content;
    } catch (error) {
      console.error('❌ 获取用户组列表失败:', error);
      return [];
    }
  }

  /**
   * 从 Tale 平台拉取班级信息到本地
   */
  async pullClassesFromTale(): Promise<SyncResult> {
    try {
      console.log('🔄 开始从 Tale 平台拉取班级信息...');
      
      // 获取 Tale 平台的所有用户组
      const taleGroups = await this.getAllTaleGroups();
      console.log('📥 从 Tale 平台获取到', taleGroups.length, '个用户组');
      
      // 获取本地班级数据
      const localClasses = this.getLocalClasses();
      
      // 转换 Tale 用户组为班级格式
      const pulledClasses: Class[] = taleGroups.map(group => {
        // 从用户组名称和描述中提取班级信息
        const classInfo = this.parseClassInfoFromGroup(group);
        
        return {
          id: `tale_${group.groupId}`, // 使用 Tale 的 groupId 作为本地 ID
          name: classInfo.name,
          description: classInfo.description,
          maxStudents: classInfo.maxStudents,
          currentStudents: group.memberCount || 0,
          grade: classInfo.grade,
          remark: classInfo.remark,
          createdAt: group.createdAt || new Date().toISOString().split('T')[0],
          status: classInfo.status,
          students: [], // 需要单独获取成员列表
          taleGroupId: group.groupId,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced' as const
        };
      });
      
      // 获取每个用户组的成员信息
      for (const pulledClass of pulledClasses) {
        try {
          const members = await getUserGroupMembers(pulledClass.taleGroupId!, 0, 1000, this.appKey);
          pulledClass.students = members.data.content.map(member => member.userId);
          pulledClass.currentStudents = members.data.content.length;
        } catch (error) {
          console.warn(`获取用户组 ${pulledClass.taleGroupId} 成员失败:`, error);
        }
      }
      
      // 合并本地和远程班级数据
      const mergedClasses = this.mergeClasses(localClasses, pulledClasses);
      
      // 保存到本地存储
      this.saveLocalClasses(mergedClasses);
      
      console.log('✅ 成功拉取并合并班级信息');
      
      return {
        success: true,
        message: `成功从 Tale 平台拉取 ${pulledClasses.length} 个班级`,
        data: {
          pulledClasses: pulledClasses.length,
          mergedClasses: mergedClasses.length,
          classes: mergedClasses
        }
      };
    } catch (error) {
      console.error('❌ 从 Tale 平台拉取班级失败:', error);
      return {
        success: false,
        message: '从 Tale 平台拉取班级失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 从用户组信息中解析班级信息
   */
  private parseClassInfoFromGroup(group: UserGroup): {
    name: string;
    description?: string;
    maxStudents: number;
    grade: string;
    remark?: string;
    status: 'ongoing' | 'completed' | 'pending';
  } {
    // 默认值
    let name = group.name;
    let description = group.description;
    let maxStudents = 30;
    let grade = '2025级';
    let remark = group.remark;
    let status: 'ongoing' | 'completed' | 'pending' = 'pending';
    
    // 尝试从描述中解析信息
    if (group.description) {
      // 解析年级信息
      const gradeMatch = group.description.match(/年级：([^，]+)/);
      if (gradeMatch) {
        grade = gradeMatch[1];
      }
      
      // 解析最大学生数
      const maxStudentsMatch = group.description.match(/最大学生数：(\d+)/);
      if (maxStudentsMatch) {
        maxStudents = parseInt(maxStudentsMatch[1]);
      }
      
      // 解析状态
      const statusMatch = group.description.match(/状态：([^，]+)/);
      if (statusMatch) {
        const statusText = statusMatch[1];
        if (statusText.includes('进行中')) {
          status = 'ongoing';
        } else if (statusText.includes('已完成')) {
          status = 'completed';
        } else {
          status = 'pending';
        }
      }
    }
    
    return {
      name,
      description,
      maxStudents,
      grade,
      remark,
      status
    };
  }

  /**
   * 合并本地和远程班级数据
   */
  private mergeClasses(localClasses: Class[], pulledClasses: Class[]): Class[] {
    const mergedMap = new Map<string, Class>();
    
    // 添加本地班级
    localClasses.forEach(cls => {
      mergedMap.set(cls.id, cls);
    });
    
    // 添加或更新远程班级
    pulledClasses.forEach(pulledClass => {
      // 检查是否已存在相同的班级（通过 taleGroupId 或名称匹配）
      const existingClass = Array.from(mergedMap.values()).find(cls => 
        cls.taleGroupId === pulledClass.taleGroupId || 
        (cls.name === pulledClass.name && cls.grade === pulledClass.grade)
      );
      
      if (existingClass) {
        // 更新现有班级的远程信息
        mergedMap.set(existingClass.id, {
          ...existingClass,
          taleGroupId: pulledClass.taleGroupId,
          currentStudents: pulledClass.currentStudents,
          students: pulledClass.students,
          lastSyncTime: pulledClass.lastSyncTime,
          syncStatus: 'synced'
        });
      } else {
        // 添加新的远程班级
        mergedMap.set(pulledClass.id, pulledClass);
      }
    });
    
    return Array.from(mergedMap.values());
  }

  /**
   * 获取本地班级数据
   */
  private getLocalClasses(): Class[] {
    try {
      const savedClasses = localStorage.getItem('carbonlab-classes');
      if (savedClasses) {
        return JSON.parse(savedClasses);
      }
    } catch (error) {
      console.error('获取本地班级数据失败:', error);
    }
    return [];
  }

  /**
   * 保存班级数据到本地存储
   */
  private saveLocalClasses(classes: Class[]): void {
    try {
      localStorage.setItem('carbonlab-classes', JSON.stringify(classes));
    } catch (error) {
      console.error('保存本地班级数据失败:', error);
      throw error;
    }
  }

  /**
   * 同步本地和远程班级数据（双向同步）
   */
  async syncBidirectional(): Promise<SyncResult> {
    try {
      console.log('🔄 开始双向同步班级数据...');
      
      // 1. 先推送本地班级到 Tale 平台
      const localClasses = this.getLocalClasses();
      const pushResults = await this.syncAllClassesToTale(localClasses);
      
      // 2. 再从 Tale 平台拉取班级信息
      const pullResult = await this.pullClassesFromTale();
      
      const successCount = pushResults.filter(r => r.success).length;
      const totalCount = pushResults.length;
      
      return {
        success: true,
        message: `双向同步完成：推送 ${successCount}/${totalCount} 个班级，拉取 ${pullResult.data?.pulledClasses || 0} 个班级`,
        data: {
          pushResults,
          pullResult,
          totalClasses: pullResult.data?.mergedClasses || 0
        }
      };
    } catch (error) {
      console.error('❌ 双向同步失败:', error);
      return {
        success: false,
        message: '双向同步失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 检查数据一致性
   */
  async checkDataConsistency(): Promise<{
    isConsistent: boolean;
    localCount: number;
    remoteCount: number;
    inconsistencies: string[];
  }> {
    try {
      const localClasses = this.getLocalClasses();
      const remoteGroups = await this.getAllTaleGroups();
      
      const inconsistencies: string[] = [];
      
      // 检查本地有但远程没有的班级
      const localWithTaleId = localClasses.filter(cls => cls.taleGroupId);
      const remoteGroupIds = new Set(remoteGroups.map(g => g.groupId));
      
      localWithTaleId.forEach(cls => {
        if (cls.taleGroupId && !remoteGroupIds.has(cls.taleGroupId)) {
          inconsistencies.push(`本地班级 "${cls.name}" 在远程不存在`);
        }
      });
      
      // 检查远程有但本地没有的班级
      const localTaleIds = new Set(localClasses.map(cls => cls.taleGroupId).filter(Boolean));
      
      remoteGroups.forEach(group => {
        if (!localTaleIds.has(group.groupId)) {
          inconsistencies.push(`远程班级 "${group.name}" 在本地不存在`);
        }
      });
      
      return {
        isConsistent: inconsistencies.length === 0,
        localCount: localClasses.length,
        remoteCount: remoteGroups.length,
        inconsistencies
      };
    } catch (error) {
      console.error('检查数据一致性失败:', error);
      return {
        isConsistent: false,
        localCount: 0,
        remoteCount: 0,
        inconsistencies: ['检查失败：' + (error instanceof Error ? error.message : '未知错误')]
      };
    }
  }
}

// 创建默认实例
export const classSyncService = new ClassSyncService('oa_HBamFxnA');
