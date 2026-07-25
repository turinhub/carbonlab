export interface TaleBaseResponse<T> {
  data: T;
  code: number;
  msg: string;
}

export interface TaleAppToken {
  access_token: string;
  id: number;
  appKey: string;
  token: string;
  tokenScope: string | null;
  expired_time: string;
}

export interface TaleApp {
  appKey: string;
  appName: string;
  appProperty: JSON | null;
  appRoles: string[];
  appPrivileges: string[];
}

export interface TaleOrg {
  org_id: string;
  org_name: string;
}

export interface TaleUser {
  nick_name?: string;
  avatar_url?: string;
  registered_at: string;
  user_id: string;
  phone?: string;
  username: string;
  email?: string;
  remark?: string;
}

export interface TaleUserToken {
  granted_at: string;
  scope: string;
  expired_at: string;
  token: string;
}

// 推送记录相关类型
export interface SmsRecord {
  id: string;
  appId: string;
  smsType: string;
  phoneNumber: string;
  templateName: string;
  verificationCode: string;
  serialNumber: string;
  resultMessage: string;
  createdAt: string;
  expiredAt: string;
  verifiedAt?: string;
}

export interface SmsRecordsResponse {
  data: {
    total: number;
    content: SmsRecord[];
    pageable: {
      sort: {
        orders: Array<{
          direction: string;
          property: string;
          ignoreCase: boolean;
          nullHandling: string;
        }>;
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
  total?: number;
  content?: SmsRecord[];
}

export interface SmsQueryParams {
  page?: number;
  size?: number;
  verifiedStatus?: boolean;
  sms_type?: string;
  search?: string;
}

// 用户信息响应类型
export interface UserInfoResponse {
  app: {
    org_id?: string;
    [key: string]: unknown; // 允许其他未知属性
  } | null;
  org_id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  phone: string;
  registered_at: string;
}

// 应用信息类型
export interface AppInfo {
  app_key: string;
  app_name: string;
  id: string;
  name: string;
  description?: string;
  icon: string;
  plan: string;
  created_at: string;
  updated_at: string;
}

// 应用列表响应类型
export interface AppsResponse {
  apps: AppInfo[];
  total: number;
}

// 创建应用请求类型
export interface CreateAppRequest {
  app_name: string;
  org_id: string;
  remark?: string;
}

// 更新应用请求类型
export interface UpdateAppRequest {
  app_id: string;
  app_name?: string;
  remark?: string;
  app_property?: Record<string, unknown>;
  app_config?: Record<string, unknown>;
  wechat_config?: Record<string, unknown>;
  app_admins?: Record<string, unknown>;
  role_config?: Record<string, unknown>;
  user_group_config?: Record<string, unknown>;
  feishu_config?: Record<string, unknown>;
  openai_config?: Record<string, unknown>;
}

// 创建应用响应类型
export interface CreateAppResponse {
  app_id: string;
  app_name: string;
  org_id: string;
  app_key: string;
  created_at: string;
}

// 用户管理相关类型
// 添加角色类型定义
export interface UserRole {
  role_id: string;
  role_name: string;
  role_type: string;
  role_property: Record<string, unknown>;
  expired_at?: string;
  remark?: string;
}

export interface UserPrivilege {
  privilege_id: string;
  privilege_name: string;
  privilege_type: string;
  privilege_property: Record<string, unknown>;
  expired_at?: string;
}

// 角色相关类型别名和补充定义
export type Role = UserRole;

export interface RolesResponse {
  total: number;
  content: Role[];
  pageable: {
    sort: {
      orders: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
      }>;
    };
    pageNumber: number;
    pageSize: number;
  };
  data?: {
    total: number;
    content: Role[];
  };
}

export interface RolesQueryParams {
  page: number;
  size: number;
  role_type?: string;
  search?: string;
}

export interface CreateRoleRequest {
  role_name: string;
  role_type: string;
  role_property?: Record<string, unknown>;
  description?: string;
  remark?: string;
}

export interface UpdateRoleRequest {
  role_id: string;
  role_name?: string;
  role_type?: string;
  role_property?: Record<string, unknown>;
  description?: string;
  remark?: string;
}

// 修复AppUser接口
export interface AppUser {
  user_groups: UserGroup[];
  app: {
    app_name: string;
    app_key: string;
    org_id: string;
    app_id: string;
  };
  user: {
    latest_login_time?: string;
    registered_at: string;
    is_frozen?: boolean;
    user_id: string;
    phone?: string;
    username?: string;
    email?: string;
    nick_name?: string;
    remark?: string;
    avatar_url?: string;
  };
  third_party: Record<string, unknown>;
  // 修复：user_roles应该是对象数组而不是字符串数组
  user_roles: UserRole[];
  user_privileges: UserPrivilege[];
}

export interface UsersResponse {
  total: number;
  content: AppUser[];
  pageable: {
    sort: {
      orders: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
      }>;
    };
    pageNumber: number;
    pageSize: number;
  };
  data?: {
    total: number;
    content: AppUser[];
  };
}

export interface UsersQueryParams {
  page?: number;
  size?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  keyword?: string;
  user_roles?: string;
}

// 组织管理相关类型
export interface UserGroup {
  groupId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  remark: string;
  memberCount: number;
}

export interface UserGroupsResponse {
  total: number;
  content: UserGroup[];
  pageable: {
    sort: {
      orders: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
      }>;
    };
    pageNumber: number;
    pageSize: number;
  };
}

export interface UserGroupsQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
}

// App Token 相关类型定义
export interface AppToken {
  type: string;
  app_key: string;
  token: string;
  status: string;
  expired_at: string;
}

export interface AppTokensResponse {
  total: number;
  content: AppToken[];
  pageable: {
    sort: {
      orders: Array<{
        direction: string;
        property: string;
        ignoreCase: boolean;
        nullHandling: string;
      }>;
    };
    pageNumber: number;
    pageSize: number;
  };
}

export interface AppTokensQueryParams {
  page?: number;
  size?: number;
  is_valid?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
}

// App Secret 相关类型定义
export interface AppSecretResponse {
  app_secret: string;
}

export interface AppSecretApiResponse {
  data: AppSecretResponse;
  code: number;
  msg: string;
}

// 应用详细信息相关类型
export interface AppRole {
  role_id: string;
  role_name: string;
  role_type: string;
  role_property: Record<string, unknown>;
  remark: string;
}

export interface AppPrivilege {
  privilege_id: string;
  privilege_name: string;
  privilege_type: string;
  privilege_property: Record<string, unknown>;
  remark: string;
}

export interface AppDetail {
  app_id: string;
  app_key: string;
  app_name: string;
  app_property: Record<string, unknown>;
  app_roles: AppRole[];
  app_privileges: AppPrivilege[];
  app_admins: Record<string, unknown>;
  role_config: Record<string, unknown>;
  user_group_config: Record<string, unknown>;
  remark: string;
}

export interface AppDetailResponse {
  data: AppDetail;
  code: number;
  msg: string;
}

// 任务管理相关类型
export interface Task {
  task_id: string;
  app_id: string;
  user_id: string;
  task_title?: string;
  task_input: Record<string, unknown>;
  task_output: Record<string, unknown>;
  task_type: string;
  task_status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TasksResponse {
  data: {
    total: number;
    content: Task[];
    pageable: {
      sort: {
        orders: Array<{
          direction: string;
          property: string;
          ignoreCase: boolean;
          nullHandling: string;
        }>;
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

export interface TaskQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  task_status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  task_type?: string;
  user_id?: string;
  app_id?: string;
}

export interface CreateTaskRequest {
  task_input: Record<string, unknown>;
  task_type: string;
  task_title?: string;
  user_id?: string;
}

export interface UpdateTaskRequest {
  task_input?: Record<string, unknown>;
  task_output?: Record<string, unknown>;
  task_status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  task_type?: string;
  task_title?: string;
}

// Task Type 相关类型定义
export interface TaskType {
  type_id: string;
  app_id: string;
  type_code: string;
  type_name: string;
  description?: string;
  is_enabled: boolean;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskTypesResponse {
  data: {
    total: number;
    content: TaskType[];
    pageable: {
      sort: {
        orders: Array<{
          direction: string;
          property: string;
          ignoreCase: boolean;
          nullHandling: string;
        }>;
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

export interface TaskTypeResponse {
  data: TaskType;
  code: number;
  msg: string;
}

export interface TaskTypeQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  type_name?: string;
  is_enabled?: boolean;
}

export interface CreateTaskTypeRequest {
  type_name: string;
  type_code: string;
  description?: string;
  is_enabled: boolean;
  remark?: string;
}

export interface UpdateTaskTypeRequest {
  type_name?: string;
  type_code?: string;
  description?: string;
  is_enabled?: boolean;
  remark?: string;
}

export interface EnabledTaskTypesResponse {
  data: TaskType[];
  code: number;
  msg: string;
}

export interface CreateUserRequest {
  username: string;
  password_encrypted: string;
  nickname?: string;
  phone?: string;
  email?: string;
}
