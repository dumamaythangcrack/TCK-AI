import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeKatex from "rehype-katex"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"
import { Message } from "@/types"
import "highlight.js/styles/github-dark.css"
import "katex/dist/katex.min.css"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "USER"

  return (
    <div className={`flex gap-4 p-6 ${isUser ? "bg-transparent" : "bg-gradient-to-r from-purple-500/5 to-blue-500/5"}`}>
      <div className="flex-shrink-0">
        <Avatar className={`h-10 w-10 ${isUser ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-purple-600 to-pink-600"}`}>
          {isUser ? (
            <>
              <AvatarImage src={message.userId ? undefined : undefined} />
              <AvatarFallback className="text-white">
                <User className="h-5 w-5" />
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback className="text-white">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-sm">
            {isUser ? "Bạn" : "TCK AI"}
          </span>
          {message.model && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {message.model}
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {message.reasoning && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Thinking Process
              </span>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {message.reasoning}
            </div>
          </div>
        )}

        <div className="prose prose-invert max-w-none dark">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "")
                return !inline && match ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                    {children}
                  </code>
                )
              },
              pre({ children }) {
                return (
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    {children}
                  </pre>
                )
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.citations && message.citations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.citations.map((citation, index) => (
              <a
                key={index}
                href={citation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 underline"
              >
                [{index + 1}] {citation}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
