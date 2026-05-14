import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Star,
  Pin,
  Folder,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Edit2,
  MoreVertical,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatStore } from "@/store/chat-store"

interface ChatItem {
  id: string
  title: string
  isPinned: boolean
  isFavorite: boolean
  updatedAt: Date
}

interface FolderItem {
  id: string
  name: string
  color?: string
  chatCount: number
}

export function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen, currentChat, setCurrentChat } = useChatStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const mockChats: ChatItem[] = [
    { id: "1", title: "Giải bài toán toán học", isPinned: true, isFavorite: false, updatedAt: new Date() },
    { id: "2", title: "Tạo code React component", isPinned: false, isFavorite: true, updatedAt: new Date() },
    { id: "3", title: "Phân tích dữ liệu", isPinned: false, isFavorite: false, updatedAt: new Date() },
  ]

  const mockFolders: FolderItem[] = [
    { id: "1", name: "Lập trình", color: "#8b5cf6", chatCount: 5 },
    { id: "2", name: "Học tập", color: "#3b82f6", chatCount: 3 },
    { id: "3", name: "Công việc", color: "#10b981", chatCount: 2 },
  ]

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  if (!isSidebarOpen) return null

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-slate-950 via-purple-950/10 to-slate-950 border-r border-purple-500/20 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/20">
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => {/* Create new chat */}}
        >
          <Plus className="h-4 w-4 mr-2" />
          Chat mới
        </Button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-purple-500/10 border-purple-500/20 focus-visible:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        {/* Pinned Chats */}
        {mockChats.filter((c) => c.isPinned).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Pin className="h-4 w-4" />
              Đã ghim
            </div>
            {mockChats
              .filter((c) => c.isPinned)
              .map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
          </div>
        )}

        {/* Favorites */}
        {mockChats.filter((c) => c.isFavorite).length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Star className="h-4 w-4" />
              Yêu thích
            </div>
            {mockChats
              .filter((c) => c.isFavorite)
              .map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
          </div>
        )}

        {/* Folders */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <Folder className="h-4 w-4" />
            Thư mục
          </div>
          {mockFolders.map((folder) => (
            <div key={folder.id} className="mb-2">
              <div
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/10 cursor-pointer"
                onClick={() => toggleFolder(folder.id)}
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 text-sm">{folder.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {folder.chatCount}
                </Badge>
              </div>
              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1">
                  <div className="p-2 text-sm text-muted-foreground hover:bg-purple-500/10 rounded-lg cursor-pointer">
                    Chat trong thư mục...
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* All Chats */}
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <MessageSquare className="h-4 w-4" />
            Tất cả chat
          </div>
          {mockChats
            .filter((c) => !c.isPinned && !c.isFavorite)
            .map((chat) => (
              <ChatItem key={chat.id} chat={chat} />
            ))}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-purple-500/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar.png" />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">User Name</div>
            <div className="text-xs text-muted-foreground">Free Plan</div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

function ChatItem({ chat }: { chat: ChatItem }) {
  const { currentChat, setCurrentChat } = useChatStore()
  const isActive = currentChat?.id === chat.id

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group ${
        isActive ? "bg-purple-500/20" : "hover:bg-purple-500/10"
      }`}
      onClick={() => setCurrentChat(chat as any)}
    >
      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="flex-1 text-sm truncate">{chat.title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit2 className="h-4 w-4 mr-2" />
            Đổi tên
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pin className="h-4 w-4 mr-2" />
            Ghim
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star className="h-4 w-4 mr-2" />
            Yêu thích
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
