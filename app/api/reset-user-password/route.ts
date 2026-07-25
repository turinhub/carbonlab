import { createTaleAdminClient } from '@turinhub/tale-js-sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  createTaleServerAppClient,
  getTaleServerConfig,
} from '@/lib/server/tale-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id: userId, new_password: newPassword } = body

    if (!userId || !newPassword) {
      return NextResponse.json(
        {
          code: 400,
          message: '缺少必要参数：user_id, new_password',
        },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { code: 400, message: '新密码长度至少6位' },
        { status: 400 }
      )
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { code: 401, message: '未授权访问' },
        { status: 401 }
      )
    }

    const config = getTaleServerConfig()
    const operator = await createTaleAdminClient({
      baseUrl: config.baseUrl,
      taleToken: authHeader.slice(7),
    }).currentUser.get()
    const canManageUsers = operator.userRoles.some(
      role =>
        role.roleName === 'admin' ||
        role.roleType === 'admin' ||
        role.roleType === 'teacher'
    )
    if (!canManageUsers) {
      return NextResponse.json(
        { code: 403, message: '没有重置用户密码的权限' },
        { status: 403 }
      )
    }

    await createTaleServerAppClient().users.updatePassword({
      userId,
      passwordEncrypted: newPassword,
    })

    return NextResponse.json({ code: 200, message: '密码重置成功' })
  } catch (error) {
    console.error('密码重置失败:', error)
    return NextResponse.json(
      { code: 500, message: '密码重置失败' },
      { status: 500 }
    )
  }
}
