import 'server-only'

import type {
  AppInfo,
  CreateUserResponse,
  File as TaleFile,
  Folder as TaleFolder,
  PageResponse,
  Privilege,
  Role,
  User,
  UserGroup,
  UserListItem,
} from '@turinhub/tale-js-sdk'

import type {
  AppUser,
  RolesResponse,
  UserPrivilege,
  UserRole,
  UsersResponse,
} from '@/lib/types/tale'

function legacyPageable<T>(page: PageResponse<T>) {
  return {
    sort: {
      orders: (page.sort ?? []).map(order => ({
        ...order,
        ignoreCase: false,
        nullHandling: 'NATIVE',
      })),
    },
    pageNumber: page.page,
    pageSize: page.size,
  }
}

export function toLegacyPage<TInput, TOutput>(
  page: PageResponse<TInput>,
  mapItem: (item: TInput) => TOutput
) {
  return {
    total: page.total,
    content: page.content.map(mapItem),
    pageable: legacyPageable(page),
  }
}

function toLegacyApp(app: AppInfo) {
  return {
    app_name: app.appName,
    app_key: app.appKey,
    org_id: app.orgId ?? '',
    app_id: app.appId,
  }
}

function toLegacyUser(user: User) {
  return {
    latest_login_time: user.updatedAt,
    registered_at: user.createdAt,
    is_frozen: user.isFrozen,
    user_id: user.userId,
    phone: user.phone,
    username: user.username,
    email: user.email,
    nick_name: user.nickname,
    remark: user.remark,
    avatar_url: user.avatarUrl,
  }
}

export function toLegacyRole(role: Role): UserRole {
  return {
    role_id: role.roleId,
    role_name: role.roleName,
    role_type: role.roleType ?? '',
    role_property: role.roleProperty ?? {},
    expired_at: role.expiredAt,
    remark: role.remark,
  }
}

export function toLegacyPrivilege(privilege: Privilege): UserPrivilege {
  return {
    privilege_id: privilege.privilegeId,
    privilege_name: privilege.privilegeName,
    privilege_type: privilege.privilegeType ?? '',
    privilege_property: privilege.privilegeProperty ?? {},
    expired_at: privilege.expiredAt,
  }
}

export function toLegacyUserGroup(group: UserGroup) {
  return {
    groupId: group.groupId,
    name: group.name,
    description: group.description ?? '',
    createdAt: '',
    updatedAt: '',
    remark: group.remark ?? '',
    memberCount: 0,
  }
}

export function toLegacyAppUser(
  item: UserListItem | CreateUserResponse
): AppUser {
  return {
    app: toLegacyApp(item.app),
    user: toLegacyUser(item.user),
    third_party: {},
    user_roles: item.userRoles.map(toLegacyRole),
    user_privileges: item.userPrivileges.map(toLegacyPrivilege),
    user_groups: item.userGroups.map(toLegacyUserGroup),
  }
}

export function toLegacyUsersResponse(
  page: PageResponse<UserListItem>
): UsersResponse {
  return toLegacyPage(page, toLegacyAppUser)
}

export function toLegacyRolesResponse(
  page: PageResponse<Role>
): RolesResponse {
  return toLegacyPage(page, toLegacyRole)
}

export function toLegacyFolder(folder: TaleFolder) {
  return {
    id: folder.id,
    app_id: folder.appKey,
    appId: folder.appKey,
    folder_name: folder.folderName,
    folderName: folder.folderName,
    folder_type: folder.folderType,
    folderType: folder.folderType,
    folder_attr: folder.folderAttr ?? undefined,
    folderAttr: folder.folderAttr ?? undefined,
    remark: folder.remark ?? '',
    created_at: folder.createdAt,
    createdAt: folder.createdAt,
    updated_at: folder.updatedAt,
    updatedAt: folder.updatedAt,
  }
}

export function toLegacyFile(file: TaleFile) {
  return {
    id: file.id,
    folder_id: file.folderId,
    file_name: file.fileName,
    file_type: file.fileType,
    file_attr: file.fileAttr ?? undefined,
    link_url: file.linkUrl ?? undefined,
    content: file.content ?? undefined,
    oss_url: file.ossUrl ?? undefined,
    preview_image_url: file.previewImageUrl ?? undefined,
    remark: file.remark ?? undefined,
    created_at: file.createdAt,
    updated_at: file.updatedAt,
  }
}
