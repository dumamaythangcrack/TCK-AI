import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, StopCircle, Mic, Image as ImageIcon, Paperclip } from "lucide-react"
import { useChatStore } from "@/store/chat-store"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onStopGeneration: () => void
  isLoading: boolean
}

export function ChatInput({ onSendMessage, onStopGeneration, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { selectedModel, selectedAiMode } = useChatStore()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [message])

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-end gap-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-purple-500/20"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-purple-500/20"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-purple-500/20"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn của bạn..."
              className="min-h-[44px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              disabled={isLoading}
            />

            {isLoading ? (
              <Button
                onClick={onStopGeneration}
                variant="destructive"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                size="icon"
                className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                {selectedModel}
              </span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                {selectedAiMode}
              </span>
            </div>
            <span>Enter để gửi, Shift + Enter để xuống dòng</span>
          </div>
        </div>
      </div>
    </div>
  )
}
