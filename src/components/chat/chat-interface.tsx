import React, { useEffect, useRef, useState } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useChatStore } from "@/store/chat-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus, Menu, Sparkles } from "lucide-react"
import { MODEL_CONFIGS } from "@/types"

interface ChatInterfaceProps {
  onNewChat: () => void
}

export function ChatInterface({ onNewChat }: ChatInterfaceProps) {
  const { messages, isLoading, selectedModel, setSelectedModel, currentChat } = useChatStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSendMessage = async (message: string) => {
    setIsTyping(true)
    // API call will be handled by parent component
    // For now, this is a placeholder
    setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleStopGeneration = () => {
    setIsTyping(false)
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-blue-500/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              TCK AI
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {MODEL_CONFIGS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.creditCost} credits)
              </option>
            ))}
          </select>
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="sm"
            className="bg-purple-500/10 hover:bg-purple-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Chat mới
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6 pb-32">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Chào mừng đến với TCK AI
              </h2>
              <p className="text-muted-foreground max-w-md">
                Trợ lý AI thế hệ mới với nhiều chế độ thông minh. Hãy bắt đầu cuộc trò chuyện!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {isTyping && (
            <div className="flex gap-4 p-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isLoading={isLoading || isTyping}
      />
    </div>
  )
}
