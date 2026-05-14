"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useChatStore } from "@/store/chat-store"

export default function Home() {
  const { clearChat } = useChatStore()

  const handleNewChat = () => {
    clearChat()
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar />
      <ChatInterface onNewChat={handleNewChat} />
    </div>
  )
}
