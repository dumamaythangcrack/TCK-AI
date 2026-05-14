import { prisma } from "@/lib/prisma"
import { ApiProvider, MODEL_CONFIGS } from "@/types"

interface ApiKeyWithHealth {
  id: string
  key: string
  provider: ApiProvider
  model: string
  isActive: boolean
  priority: number
  requestCount: number
  errorCount: number
  lastUsedAt: Date | null
  cooldownUntil: Date | null
  healthScore: number
}

export class ApiRouter {
  private static instance: ApiRouter
  private cache: Map<string, ApiKeyWithHealth[]> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_TTL = 60000 // 1 minute

  private constructor() {}

  static getInstance(): ApiRouter {
    if (!ApiRouter.instance) {
      ApiRouter.instance = new ApiRouter()
    }
    return ApiRouter.instance
  }

  private async getApiKeys(provider: ApiProvider, model: string): Promise<ApiKeyWithHealth[]> {
    const cacheKey = `${provider}_${model}`
    const now = Date.now()

    // Check cache
    if (this.cache.has(cacheKey) && this.cacheExpiry.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey)!
      if (now < expiry) {
        return this.cache.get(cacheKey)!
      }
    }

    // Fetch from database
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        provider,
        model,
        isActive: true,
        OR: [
          { cooldownUntil: null },
          { cooldownUntil: { lt: new Date() } },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { healthScore: "desc" },
        { errorCount: "asc" },
      ],
    })

    // Update cache
    this.cache.set(cacheKey, apiKeys)
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL)

    return apiKeys
  }

  private selectApiKey(apiKeys: ApiKeyWithHealth[]): ApiKeyWithHealth | null {
    if (apiKeys.length === 0) return null

    // Weighted random selection based on health score
    const totalScore = apiKeys.reduce((sum, key) => sum + key.healthScore, 0)
    let random = Math.random() * totalScore

    for (const key of apiKeys) {
      random -= key.healthScore
      if (random <= 0) {
        return key
      }
    }

    return apiKeys[0]
  }

  async getApiKey(modelId: string): Promise<{ apiKey: string; provider: ApiProvider } | null> {
    const modelConfig = MODEL_CONFIGS.find((m) => m.id === modelId)
    if (!modelConfig) return null

    const apiKeys = await this.getApiKeys(modelConfig.provider, modelConfig.originalModel)
    const selectedKey = this.selectApiKey(apiKeys)

    if (!selectedKey) return null

    return {
      apiKey: selectedKey.key,
      provider: selectedKey.provider,
    }
  }

  async getApiKeyForChat(chatId: string, modelId: string): Promise<{ apiKey: string; provider: ApiProvider } | null> {
    // Try to get the last used API key for this chat (sticky session)
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { lastUsedApiKey: true },
    })

    if (chat?.lastUsedApiKey) {
      const apiKey = await prisma.apiKey.findFirst({
        where: {
          id: chat.lastUsedApiKey,
          isActive: true,
          OR: [
            { cooldownUntil: null },
            { cooldownUntil: { lt: new Date() } },
          ],
        },
      })

      if (apiKey) {
        return {
          apiKey: apiKey.key,
          provider: apiKey.provider,
        }
      }
    }

    // Fallback to regular selection
    return this.getApiKey(modelId)
  }

  async updateChatApiKey(chatId: string, apiKeyId: string): Promise<void> {
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastUsedApiKey: apiKeyId },
    })
  }

  async recordApiUsage(
    apiKeyId: string,
    userId: string | null,
    chatId: string | null,
    model: string,
    tokens: number,
    creditsUsed: number,
    success: boolean,
    error?: string,
    duration?: number
  ): Promise<void> {
    await prisma.apiUsageLog.create({
      data: {
        apiKeyId,
        userId,
        chatId,
        model,
        tokens,
        creditsUsed,
        success,
        error,
        duration,
      },
    })

    // Update API key stats
    const updateData: any = {
      requestCount: { increment: 1 },
      lastUsedAt: new Date(),
    }

    if (!success) {
      updateData.errorCount = { increment: 1 }
      updateData.healthScore = { decrement: 10 }
    } else {
      updateData.healthScore = { increment: 1 }
    }

    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: updateData,
    })

    // If health score is too low, put in cooldown
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      select: { healthScore: true },
    })

    if (apiKey && apiKey.healthScore < 30) {
      await prisma.apiKey.update({
        where: { id: apiKeyId },
        data: {
          cooldownUntil: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes cooldown
        },
      })
    }

    // Clear cache
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  async getApiKeyById(apiKeyId: string): Promise<ApiKeyWithHealth | null> {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    })
    return apiKey as ApiKeyWithHealth | null
  }

  async getAllApiKeys(): Promise<ApiKeyWithHealth[]> {
    return await prisma.apiKey.findMany({
      orderBy: [
        { provider: "asc" },
        { model: "asc" },
        { priority: "desc" },
      ],
    }) as ApiKeyWithHealth[]
  }

  async addApiKey(
    provider: ApiProvider,
    model: string,
    key: string,
    priority: number = 0
  ): Promise<ApiKeyWithHealth> {
    const apiKey = await prisma.apiKey.create({
      data: {
        provider,
        model,
        key,
        priority,
        isActive: true,
        healthScore: 100,
      },
    })

    // Clear cache
    this.cache.clear()
    this.cacheExpiry.clear()

    return apiKey as ApiKeyWithHealth
  }

  async removeApiKey(apiKeyId: string): Promise<void> {
    await prisma.apiKey.delete({
      where: { id: apiKeyId },
    })

    // Clear cache
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  async updateApiKey(
    apiKeyId: string,
    updates: Partial<{
      isActive: boolean
      priority: number
      key: string
    }>
  ): Promise<ApiKeyWithHealth> {
    const apiKey = await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: updates,
    })

    // Clear cache
    this.cache.clear()
    this.cacheExpiry.clear()

    return apiKey as ApiKeyWithHealth
  }

  async resetApiKeyHealth(apiKeyId: string): Promise<void> {
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        healthScore: 100,
        errorCount: 0,
        cooldownUntil: null,
      },
    })

    // Clear cache
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  async getApiHealthStats(): Promise<{
    total: number
    active: number
    inCooldown: number
    averageHealthScore: number
    byProvider: Record<ApiProvider, { total: number; active: number; avgHealth: number }>
  }> {
    const apiKeys = await this.getAllApiKeys()

    const total = apiKeys.length
    const active = apiKeys.filter((k) => k.isActive && (!k.cooldownUntil || k.cooldownUntil < new Date())).length
    const inCooldown = apiKeys.filter((k) => k.cooldownUntil && k.cooldownUntil >= new Date()).length
    const averageHealthScore = apiKeys.reduce((sum, k) => sum + k.healthScore, 0) / total

    const byProvider: Record<ApiProvider, { total: number; active: number; avgHealth: number }> = {
      GLM: { total: 0, active: 0, avgHealth: 0 },
      GEMINI: { total: 0, active: 0, avgHealth: 0 },
      DEEPSEEK: { total: 0, active: 0, avgHealth: 0 },
    }

    for (const key of apiKeys) {
      byProvider[key.provider].total++
      if (key.isActive && (!key.cooldownUntil || key.cooldownUntil < new Date())) {
        byProvider[key.provider].active++
      }
      byProvider[key.provider].avgHealth += key.healthScore
    }

    for (const provider of Object.keys(byProvider) as ApiProvider[]) {
      if (byProvider[provider].total > 0) {
        byProvider[provider].avgHealth /= byProvider[provider].total
      }
    }

    return {
      total,
      active,
      inCooldown,
      averageHealthScore,
      byProvider,
    }
  }
}

export const apiRouter = ApiRouter.getInstance()
