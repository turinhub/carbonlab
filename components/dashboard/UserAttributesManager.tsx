"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface UserAttribute {
  id: string
  key: string
  value: string
  description?: string
  createdAt: string
  updatedAt: string
}

interface UserAttributesManagerProps {
  userId: string
}

export default function UserAttributesManager({ userId }: UserAttributesManagerProps) {
  const [attributes, setAttributes] = useState<UserAttribute[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAttribute, setNewAttribute] = useState({
    key: "",
    value: "",
    description: ""
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // 加载用户属性
  const loadAttributes = async () => {
    try {
      setLoading(true)
      // TODO: 调用真实的API获取用户属性
      // const response = await getUserAttributes(userId)
      // setAttributes(response.data || [])
      
      // 模拟数据
      setAttributes([
        {
          id: "1",
          key: "department",
          value: "技术部",
          description: "用户所属部门",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "2",
          key: "position",
          value: "前端工程师",
          description: "用户职位",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to load attributes:', error)
      toast.error("加载用户属性失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttributes()
  }, [userId])

  // 添加新属性
  const handleAddAttribute = async () => {
    if (!newAttribute.key.trim() || !newAttribute.value.trim()) {
      toast.error("请填写属性键和值")
      return
    }

    try {
      // TODO: 调用真实的API添加属性
      // await addUserAttribute(userId, newAttribute)
      
      const attribute: UserAttribute = {
        id: Date.now().toString(),
        key: newAttribute.key.trim(),
        value: newAttribute.value.trim(),
        description: newAttribute.description.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setAttributes(prev => [...prev, attribute])
      setNewAttribute({ key: "", value: "", description: "" })
      setShowAddForm(false)
      toast.success("属性添加成功")
    } catch (error) {
      console.error('Failed to add attribute:', error)
      toast.error("添加属性失败")
    }
  }

  // 更新属性
  const handleUpdateAttribute = async (id: string, updates: Partial<UserAttribute>) => {
    try {
      // TODO: 调用真实的API更新属性
      // await updateUserAttribute(userId, id, updates)
      
      setAttributes(prev => prev.map(attr => 
        attr.id === id 
          ? { ...attr, ...updates, updatedAt: new Date().toISOString() }
          : attr
      ))
      setEditingId(null)
      toast.success("属性更新成功")
    } catch (error) {
      console.error('Failed to update attribute:', error)
      toast.error("更新属性失败")
    }
  }

  // 删除属性
  const handleDeleteAttribute = async (id: string) => {
    try {
      // TODO: 调用真实的API删除属性
      // await deleteUserAttribute(userId, id)
      
      setAttributes(prev => prev.filter(attr => attr.id !== id))
      toast.success("属性删除成功")
    } catch (error) {
      console.error('Failed to delete attribute:', error)
      toast.error("删除属性失败")
    }
  }

  // 开始编辑
  const startEditing = (attribute: UserAttribute) => {
    setEditingId(attribute.id)
  }

  // 取消编辑
  const cancelEditing = () => {
    setEditingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-8 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 添加新属性表单 */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">添加新属性</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">属性键</Label>
                <Input
                  id="new-key"
                  placeholder="例如：department"
                  value={newAttribute.key}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, key: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-value">属性值</Label>
                <Input
                  id="new-value"
                  placeholder="例如：技术部"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-description">描述（可选）</Label>
              <Textarea
                id="new-description"
                placeholder="属性的描述信息"
                value={newAttribute.description}
                onChange={(e) => setNewAttribute(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddAttribute} size="sm">
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)} 
                size="sm"
              >
                <X className="h-4 w-4 mr-1" />
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 属性列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">用户属性列表</h3>
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            disabled={showAddForm}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加属性
          </Button>
        </div>

        {attributes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无用户属性，点击"添加属性"开始配置
          </div>
        ) : (
          <div className="grid gap-4">
            {attributes.map((attribute) => (
              <Card key={attribute.id}>
                <CardContent className="p-4">
                  {editingId === attribute.id ? (
                    // 编辑模式
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>属性键</Label>
                          <Input
                            value={attribute.key}
                            onChange={(e) => {
                              const updated = { ...attribute, key: e.target.value }
                              setAttributes(prev => prev.map(attr => 
                                attr.id === attribute.id ? updated : attr
                              ))
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>属性值</Label>
                          <Input
                            value={attribute.value}
                            onChange={(e) => {
                              const updated = { ...attribute, value: e.target.value }
                              setAttributes(prev => prev.map(attr => 
                                attr.id === attribute.id ? updated : attr
                              ))
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>描述</Label>
                        <Textarea
                          value={attribute.description || ""}
                          onChange={(e) => {
                            const updated = { ...attribute, description: e.target.value }
                            setAttributes(prev => prev.map(attr => 
                              attr.id === attribute.id ? updated : attr
                            ))
                          }}
                          rows={2}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleUpdateAttribute(attribute.id, attribute)} 
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          保存
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={cancelEditing} 
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 显示模式
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {attribute.key}
                          </Badge>
                          <span className="text-sm text-muted-foreground">=</span>
                          <span className="font-medium">{attribute.value}</span>
                        </div>
                        {attribute.description && (
                          <p className="text-sm text-muted-foreground">
                            {attribute.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>创建: {new Date(attribute.createdAt).toLocaleDateString()}</span>
                          <span>更新: {new Date(attribute.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(attribute)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAttribute(attribute.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
