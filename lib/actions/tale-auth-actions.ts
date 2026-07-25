'use server'

import { createTaleServerAppClient } from '@/lib/server/tale-client'

function toLegacyLoginResponse(
  result: Awaited<
    ReturnType<
      ReturnType<typeof createTaleServerAppClient>['auth']['login']
    >
  >
) {
  return {
    data: {
      app: {
        app_name: result.app.appName,
        app_key: result.app.appKey,
        org_id: result.app.orgId ?? '',
        app_id: result.app.appId,
      },
      user: {
        latest_login_time: result.user.updatedAt,
        registered_at: result.user.createdAt,
        is_frozen: result.user.isFrozen,
        user_id: result.user.userId,
        username: result.user.username,
      },
      token: {
        granted_at: result.token.grantedAt,
        scope: result.token.scope,
        expired_at: result.token.expiredAt,
        token: result.token.token,
      },
      third_party: {},
      user_roles: result.userRoles.map(role => ({
        role_id: role.roleId,
        role_name: role.roleName,
        role_type: role.roleType,
      })),
      user_privileges: result.userPrivileges.map(privilege => ({
        privilege_id: privilege.privilegeId,
        privilege_name: privilege.privilegeName,
        privilege_type: privilege.privilegeType,
      })),
      user_groups: result.userGroups,
    },
    code: 200,
    msg: 'OK',
  }
}

export async function loginWithUsernamePasswordAction(credentials: {
  username: string
  password: string
}) {
  const result = await createTaleServerAppClient().auth.login({
    username: credentials.username,
    password: credentials.password,
  })
  return toLegacyLoginResponse(result)
}

export async function validateTaleTokenAction(token: string): Promise<boolean> {
  return createTaleServerAppClient().auth.validateToken(token)
}

export async function sendLoginSmsAction(
  phone: string
): Promise<{ id: string }> {
  const result = await createTaleServerAppClient().auth.loginWithSms(phone)
  return { id: result.smsId }
}

export async function verifyLoginSmsAction(
  smsId: string,
  verificationCode: string
) {
  const result = await createTaleServerAppClient().auth.verifySmsCode({
    smsId,
    smsType: 'login',
    verificationCode,
  })
  return toLegacyLoginResponse(result)
}
