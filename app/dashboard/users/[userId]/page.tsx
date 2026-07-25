"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Shield, Settings, X, Edit, Tag, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { getUserDetail } from "@/lib/api/users"

// 用户详情页面
export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")
  const [userDetail, setUserDetail] = useState<any>(null)

  // 获取用户详情
  const fetchUserDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('=== 开始获取用户详情 ===')
      console.log('用户ID:', userId)
      const response = await getUserDetail(userId)
      console.log('用户详情API响应:', response)
      
      if (response.data) {
        // 标准化用户数据
        const userData = {
          user_id: response.data.user?.user_id || userId,
          username: response.data.user?.username || '未知用户',
          phone: response.data.user?.phone || '未设置',
          email: response.data.user?.email || '未设置',
          registered_at: response.data.user?.registered_at || new Date().toISOString(),
          last_login: response.data.user?.latest_login_time || response.data.user?.last_login || null,
          status: '活跃',
          roles: response.data.user_roles || [],
          avatar_url: response.data.user?.avatar_url || null
        }
        
        console.log('标准化的用户数据:', userData)
        setUserDetail(userData)
      } else {
        console.error('❌ 用户详情数据为空')
        throw new Error('用户详情数据为空')
      }
    } catch (error: any) {
      console.error('❌ 获取用户详情失败:', error)
      setError(error.message || '获取用户详情失败')
      toast.error(`获取用户详情失败: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      console.log('用户详情页面加载，用户ID:', userId)
      fetchUserDetail()
    } else {
      console.error('❌ 用户ID为空')
      setError('用户ID无效')
      setLoading(false)
    }
  }, [userId, fetchUserDetail])

  // 如果正在加载，显示骨架屏
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">用户详情</h1>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // 如果出现错误，显示错误页面
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">用户详情</h1>
            <p className="text-red-600">加载失败</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-red-500 text-lg">❌ 无法加载用户详情</div>
              <div className="text-gray-600">{error}</div>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">用户ID: {userId}</div>
                <Button onClick={fetchUserDetail} className="flex items-center gap-2 mx-auto">
                  <Loader2 className="h-4 w-4" />
                  重试
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 如果没有用户数据，显示空状态
  if (!userDetail) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">用户详情</h1>
            <p className="text-gray-600">用户不存在</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-600">用户不存在或已被删除</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      {/* 头部导航 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold">用户详情</h1>
          <p className="text-gray-600">管理用户的基础信息和权限设置</p>
        </div>
      </div>

          {/* 调试信息 */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-yellow-800">调试信息</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-700">
              <div className="space-y-2">
                <div>用户ID: {userId}</div>
                <div>加载状态: {loading ? '加载中' : '完成'}</div>
                <div>错误状态: {error ? '有错误' : '无错误'}</div>
                <div>用户数据: {userDetail ? '已加载' : '未加载'}</div>
                {userDetail && (
                  <div className="mt-2 p-2 bg-white rounded border">
                    <div>用户名: {userDetail.username}</div>
                    <div>手机号: {userDetail.phone}</div>
                    <div>邮箱: {userDetail.email}</div>
                    <div>注册时间: {userDetail.registered_at}</div>
                    <div>角色数量: {userDetail.roles?.length || 0}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 用户概览卡片 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {userDetail.username?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{userDetail.username || '未知用户'}</h2>
                  <p className="text-gray-600">{userDetail.phone || '未设置手机号'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="default">
                      {userDetail.status || '未知状态'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      注册时间: {userDetail.registered_at ? new Date(userDetail.registered_at).toLocaleString() : '未知'}
                    </span>
                    <span className="text-sm text-gray-500">
                      最后登录: {userDetail.last_login ? new Date(userDetail.last_login).toLocaleString() : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 详情标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                基本信息
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                角色权限
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                账户设置
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                活动记录
              </TabsTrigger>
            </TabsList>

            {/* 基本信息标签页 */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>用户ID</Label>
                      <Input value={userDetail.user_id || userDetail.id || '未知'} disabled />
                    </div>
                    <div>
                      <Label>用户名</Label>
                      <Input value={userDetail.username || '未知'} disabled />
                    </div>
                    <div>
                      <Label>手机号</Label>
                      <Input value={userDetail.phone || '未设置'} disabled />
                    </div>
                    <div>
                      <Label>邮箱</Label>
                      <Input value={userDetail.email || '未设置'} disabled />
                    </div>
                    <div>
                      <Label>注册时间</Label>
                      <Input value={userDetail.registered_at ? new Date(userDetail.registered_at).toLocaleString() : '未知'} disabled />
                    </div>
                    <div>
                      <Label>最后登录</Label>
                      <Input value={userDetail.last_login ? new Date(userDetail.last_login).toLocaleString() : '未知'} disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 角色权限标签页 */}
            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>角色权限</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetail.roles && userDetail.roles.length > 0 ? (
                    <div className="space-y-2">
                      {userDetail.roles.map((role: any, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-2">
                          {role.role_name || role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">暂无角色分配</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 账户设置标签页 */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>账户设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500">账户设置功能开发中...</div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 活动记录标签页 */}
            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>活动记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500">活动记录功能开发中...</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )
    }
