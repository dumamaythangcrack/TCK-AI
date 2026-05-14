import { prisma } from "@/lib/prisma"

export class VectorMemoryService {
  private static instance: VectorMemoryService

  private constructor() {}

  static getInstance(): VectorMemoryService {
    if (!VectorMemoryService.instance) {
      VectorMemoryService.instance = new VectorMemoryService()
    }
    return VectorMemoryService.instance
  }

  async addMemory(
    userId: string,
    content: string,
    embedding: number[],
    metadata?: any
  ): Promise<void> {
    await prisma.vectorMemory.create({
      data: {
        userId,
        content,
        embedding: embedding as any, // pgvector will handle this
        metadata: metadata || {},
      },
    })
  }

  async searchMemories(
    userId: string,
    queryEmbedding: number[],
    limit: number = 5
  ): Promise<any[]> {
    // This would use pgvector's cosine similarity search
    // For now, return a placeholder implementation
    const memories = await prisma.vectorMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return memories
  }

  async getMemories(userId: string, limit: number = 20): Promise<any[]> {
    return await prisma.vectorMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  async deleteMemory(memoryId: string, userId: string): Promise<void> {
    const memory = await prisma.vectorMemory.findUnique({
      where: { id: memoryId },
    })

    if (!memory || memory.userId !== userId) {
      throw new Error("Memory not found or unauthorized")
    }

    await prisma.vectorMemory.delete({
      where: { id: memoryId },
    })
  }

  async updateMemory(
    memoryId: string,
    userId: string,
    updates: {
      content?: string
      embedding?: number[]
      metadata?: any
    }
  ): Promise<void> {
    const memory = await prisma.vectorMemory.findUnique({
      where: { id: memoryId },
    })

    if (!memory || memory.userId !== userId) {
      throw new Error("Memory not found or unauthorized")
    }

    await prisma.vectorMemory.update({
      where: { id: memoryId },
      data: {
        ...updates,
        embedding: updates.embedding as any,
      },
    })
  }

  async clearMemories(userId: string): Promise<void> {
    await prisma.vectorMemory.deleteMany({
      where: { userId },
    })
  }

  async getMemoryStats(userId: string): Promise<{
    totalMemories: number
    oldestMemory: Date | null
    newestMemory: Date | null
  }> {
    const memories = await prisma.vectorMemory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    })

    return {
      totalMemories: memories.length,
      oldestMemory: memories[0]?.createdAt || null,
      newestMemory: memories[memories.length - 1]?.createdAt || null,
    }
  }
}

export const vectorMemoryService = VectorMemoryService.getInstance()
