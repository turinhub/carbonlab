import { createTaleAdminClient } from '@turinhub/tale-js-sdk'
import { NextRequest, NextResponse } from 'next/server'
import {
  createTaleServerAppClient,
  getTaleServerConfig,
} from '@/lib/server/tale-client'

export async function POST(request: NextRequest) {
  try {
    const { current_password: currentPassword, new_password: newPassword } =
      await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { code: 400, message: '缺少必要参数' },
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

    const taleToken = authHeader.slice(7)
    const config = getTaleServerConfig()
    const currentUser = await createTaleAdminClient({
      baseUrl: config.baseUrl,
      taleToken,
    }).currentUser.get()

    if (!currentUser.user.username) {
      throw new Error('当前用户缺少用户名')
    }

    const appClient = createTaleServerAppClient()
    await appClient.auth.login({
      username: currentUser.user.username,
      password: currentPassword,
    })
    await appClient.users.updatePassword({
      userId: currentUser.user.userId,
      passwordEncrypted: newPassword,
    })

    return NextResponse.json({ code: 200, message: '密码修改成功' })
  } catch (error) {
    console.error('修改密码失败:', error)
    return NextResponse.json(
      { code: 400, message: '当前密码错误或密码修改失败' },
      { status: 400 }
    )
  }
}
