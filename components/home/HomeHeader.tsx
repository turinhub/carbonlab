"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HomeHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const mobileMenu = document.getElementById("mobile-menu")

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden")
      })
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const anchorElement = e.currentTarget as HTMLAnchorElement;
        const href = anchorElement?.getAttribute("href");
        if (href) {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
            })

            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
              mobileMenu.classList.add("hidden")
            }
          }
        }
      })
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="bg-green-50/80 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-green-800">
              <i className="fas fa-leaf mr-2 text-green-600"></i>
              碳经济与管理AI实训平台
            </span>
          </div>
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#about"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              关于平台
            </a>
            <a
              href="#consulting"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              碳经济资讯
            </a>
            <a
              href="#categories"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              四大模块
            </a>
            <a
              href="#courses"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              热门课程
            </a>
            <a
              href="#experiments"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              热门实验
            </a>
            <form onSubmit={handleSearch} className="relative flex gap-2">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="搜索课程、实验..."
                  className="w-[200px] pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              </div>
              <Button 
                type="submit"
                className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
              >
                搜索
              </Button>
            </form>
          </div>
          <div className="flex items-center md:hidden">
            <button
              id="mobile-menu-button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden md:hidden bg-white shadow-sm">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <form onSubmit={handleSearch} className="relative px-3 py-2 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="搜索课程、实验..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-5 top-4 h-4 w-4 text-gray-500" />
            </div>
            <Button 
              type="submit"
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              搜索
            </Button>
          </form>
          <a
            href="#about"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            关于平台
          </a>
          <a
            href="#consulting"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            碳经济资讯
          </a>
          <a
            href="#categories"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            四大模块
          </a>
          <a
            href="#courses"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            热门课程
          </a>
          <a
            href="#experiments"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            热门实验
          </a>
        </div>
      </div>
    </nav>
  )
}
