"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: number
  title: string
  description: string
  type: string
  url: string
  tags: string[]
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&type=${activeTab}`)
      const data = await response.json()
      setResults(data.results)
    } catch (error) {
      console.error("搜索出错：", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery) {
      handleSearch(new Event("submit") as any)
    }
  }, [activeTab])

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course: "课程",
      experiment: "实验",
      article: "文章",
      news: "资讯"
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      course: "bg-blue-100 text-blue-800",
      experiment: "bg-green-100 text-green-800",
      article: "bg-purple-100 text-purple-800",
      news: "bg-orange-100 text-orange-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">搜索结果</h1>
        
        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="搜索课程、实验、文章、资讯..."
                className="w-full pl-10 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            </div>
            <Button 
              type="submit"
              className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              搜索
            </Button>
          </div>
        </form>

        {/* 分类标签 */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="course">课程</TabsTrigger>
            <TabsTrigger value="experiment">实验</TabsTrigger>
            <TabsTrigger value="article">文章</TabsTrigger>
            <TabsTrigger value="news">资讯</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 搜索结果 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在搜索...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      <a href={result.url} className="text-indigo-600 hover:text-indigo-800">
                        {result.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 mb-4">{result.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(result.type)}>
                        {getTypeLabel(result.type)}
                      </Badge>
                      {result.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">未找到相关结果</p>
          </div>
        )}
      </div>
    </div>
  )
} 