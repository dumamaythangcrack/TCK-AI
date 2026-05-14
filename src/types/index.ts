import { UserRole, SubscriptionStatus, PaymentStatus, ApiProvider, AiMode, MessageRole } from "@prisma/client"

export type { AiMode, MessageRole, UserRole, SubscriptionStatus, PaymentStatus, ApiProvider }

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  credits: number
  dailyCredits: number
  lastCreditReset: Date | null
  isBanned: boolean
  banReason: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  userId: string
  title: string | null
  model: string
  aiMode: AiMode
  isPinned: boolean
  isFavorite: boolean
  folderId: string | null
  lastUsedApiKey: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  chatId: string
  userId: string
  role: MessageRole
  content: string
  reasoning: string | null
  citations: string[]
  uploadIds: string[]
  tokens: number
  creditsUsed: number
  model: string | null
  apiKey: string | null
  createdAt: Date
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  startDate: Date
  endDate: Date | null
  autoRenew: boolean
}

export interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  currency: string
  dailyCredits: number
  features: string[]
  isActive: boolean
  trialDays: number
}

export interface ApiKey {
  id: string
  provider: ApiProvider
  key: string
  model: string
  isActive: boolean
  priority: number
  requestCount: number
  errorCount: number
  lastUsedAt: Date | null
  cooldownUntil: Date | null
  healthScore: number
}

export interface ModelConfig {
  id: string
  name: string
  provider: ApiProvider
  originalModel: string
  creditCost: number
  supportsStreaming: boolean
  supportsVision: boolean
  supportsImageGeneration: boolean
  maxTokens: number
}

export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "tck-45-flash",
    name: "TCK 4.5 Flash",
    provider: "GLM",
    originalModel: "GLM-4.5-Flash",
    creditCost: 1,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-47-flash",
    name: "TCK 4.7 Flash",
    provider: "GLM",
    originalModel: "GLM-4.7-Flash",
    creditCost: 2,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-vision-flash",
    name: "TCK Vision Flash",
    provider: "GLM",
    originalModel: "GLM-4.6V-Flash",
    creditCost: 5,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-25-flash-lite",
    name: "TCK 2.5 Flash Lite",
    provider: "GEMINI",
    originalModel: "gemini-2.5-flash-lite",
    creditCost: 2,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 1000000,
  },
  {
    id: "tck-25-pro",
    name: "TCK 2.5 Pro",
    provider: "GEMINI",
    originalModel: "gemini-2.5-pro",
    creditCost: 8,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 1000000,
  },
  {
    id: "tck-image-flash",
    name: "TCK Image Flash",
    provider: "GEMINI",
    originalModel: "gemini-2.5-flash-image",
    creditCost: 15,
    supportsStreaming: false,
    supportsVision: false,
    supportsImageGeneration: true,
    maxTokens: 0,
  },
  {
    id: "tck-v3",
    name: "TCK V3",
    provider: "DEEPSEEK",
    originalModel: "DeepSeek-V3",
    creditCost: 3,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-r1-lite",
    name: "TCK R1 Lite",
    provider: "DEEPSEEK",
    originalModel: "DeepSeek-R1-Distill",
    creditCost: 5,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-r1",
    name: "TCK R1",
    provider: "DEEPSEEK",
    originalModel: "DeepSeek-R1",
    creditCost: 10,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
  {
    id: "tck-coder",
    name: "TCK Coder",
    provider: "DEEPSEEK",
    originalModel: "DeepSeek-Coder-V2",
    creditCost: 6,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGeneration: false,
    maxTokens: 128000,
  },
]

export const PLAN_CONFIGS = [
  {
    name: "TCK Free Trial",
    slug: "free-trial",
    description: "Thử nghiệm miễn phí",
    price: 0,
    currency: "VND",
    dailyCredits: 100,
    features: ["100 credits/ngày", "Mô hình cơ bản", "Lịch sử chat"],
    trialDays: 7,
  },
  {
    name: "TCK Free",
    slug: "free",
    description: "Gói miễn phí",
    price: 0,
    currency: "VND",
    dailyCredits: 300,
    features: ["300 credits/ngày", "Mô hình cơ bản", "Lịch sử chat"],
    trialDays: 0,
  },
  {
    name: "TCK Pro",
    slug: "pro",
    description: "Gói Pro",
    price: 99000,
    currency: "VND",
    dailyCredits: 3000,
    features: ["3000 credits/ngày", "Mô hình nâng cao", "Lịch sử chat không giới hạn", "Ưu tiên hỗ trợ"],
    trialDays: 0,
  },
  {
    name: "TCK Ultra",
    slug: "ultra",
    description: "Gói Ultra",
    price: 199000,
    currency: "VND",
    dailyCredits: 10000,
    features: ["10000 credits/ngày", "Tất cả mô hình", "Lịch sử chat không giới hạn", "Ưu tiên cao", "Vision AI"],
    trialDays: 0,
  },
  {
    name: "TCK Max",
    slug: "max",
    description: "Gói Max",
    price: 499000,
    currency: "VND",
    dailyCredits: 50000,
    features: ["50000 credits/ngày", "Tất cả mô hình", "Lịch sử chat không giới hạn", "Ưu tiên cao nhất", "Vision AI", "Image Generation"],
    trialDays: 0,
  },
]
