import { create } from "zustand"
import { Message, Chat } from "@/types"

interface ChatState {
  currentChat: Chat | null
  messages: Message[]
  isLoading: boolean
  selectedModel: string
  selectedAiMode: string
  isSidebarOpen: boolean
  
  // Actions
  setCurrentChat: (chat: Chat | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setIsLoading: (isLoading: boolean) => void
  setSelectedModel: (model: string) => void
  setSelectedAiMode: (mode: string) => void
  setIsSidebarOpen: (isOpen: boolean) => void
  clearChat: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  currentChat: null,
  messages: [],
  isLoading: false,
  selectedModel: "tck-45-flash",
  selectedAiMode: "CHAT",
  isSidebarOpen: true,

  setCurrentChat: (chat) => set({ currentChat: chat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setSelectedAiMode: (mode) => set({ selectedAiMode: mode }),
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  clearChat: () => set({ currentChat: null, messages: [] }),
}))
