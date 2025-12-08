import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

export interface Class {
  groupId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  remark: string;
  memberCount: number;
}

export interface UserGroup {
  groupId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  remark: string;
  memberCount: number;
}

export interface ClassesResponse {
  total: number;
  content: Class[];
  pageable: {
    sort: { orders: unknown[] };
    pageNumber: number;
    pageSize: number;
  };
}

export interface ClassesQueryParams {
  page: number;
  size: number;
  keyword?: string;
  search?: string;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  remark?: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  remark?: string;
}

// 获取班级列表
export async function getClasses(
  params?: ClassesQueryParams,
  appKey?: string
): Promise<ClassesResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(
    `${API_BASE_URL}/user-group/v1?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 获取单个班级详情
export async function getClass(
  classId: string,
  appKey?: string
): Promise<Class & { memberCount?: number }> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${classId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 创建班级
export async function createClass(
  classData: CreateClassRequest,
  appKey?: string
): Promise<Class> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 更新班级
export async function updateClass(
  classId: string,
  classData: UpdateClassRequest,
  appKey?: string
): Promise<Class> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${classId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 获取用户组详情（别名函数，用于向后兼容）
export async function getUserGroup(
  groupId: string,
  appKey?: string
): Promise<UserGroup> {
  return await getClass(groupId, appKey);
}

// 更新用户组（别名函数，用于向后兼容）
export async function updateUserGroup(
  groupId: string,
  groupData: UpdateClassRequest,
  appKey?: string
): Promise<UserGroup> {
  return await updateClass(groupId, groupData, appKey);
}

// 删除班级
export async function deleteClass(
  classId: string,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 获取班级成员列表
export interface UserGroupMember {
  userId: string;
  username: string;
  phone: string;
  isFrozen: boolean;
  createdAt: string;
}

export interface UserGroupMembersResponse {
  data: {
    total: number;
    content: UserGroupMember[];
    pageable: {
      sort: {
        orders: unknown[];
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

// 获取班级成员列表（支持分页）
export async function getUserGroupMembers(
  groupId: string,
  page: number = 0,
  size: number = 10,
  appKey?: string
): Promise<UserGroupMembersResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const url = new URL(`${API_BASE_URL}/user-group/v1/${groupId}/members`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('size', size.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const result = await response.json();
  return result;
}

// 添加成员到班级
export async function addMembersToUserGroup(
  groupId: string,
  userIds: string[],
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/user-group/v1/${groupId}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Add members API Error:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
}

// 移除班级成员
export async function removeMembersFromUserGroup(
  groupId: string,
  userIds: string[],
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/user-group/v1/${groupId}/members`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Remove members API Error:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
}