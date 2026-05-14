import { prisma } from "@/lib/prisma"
import { MODEL_CONFIGS } from "@/types"

export interface QueueItem {
  userId: string
  chatId: string
  modelId: string
  priority: number
  timestamp: number
}

export class LoadBalancer {
  private static instance: LoadBalancer
  private queues: Map<string, QueueItem[]> = new Map()
  private processing: Set<string> = new Set()

  private constructor() {
    this.initializeQueues()
  }

  static getInstance(): LoadBalancer {
    if (!LoadBalancer.instance) {
      LoadBalancer.instance = new LoadBalancer()
    }
    return LoadBalancer.instance
  }

  private initializeQueues(): void {
    this.queues.set("free", [])
    this.queues.set("pro", [])
    this.queues.set("ultra", [])
    this.queues.set("max", [])
  }

  private getUserQueue(userId: string): string {
    // Get user's subscription to determine queue
    return "free" // Simplified for now, should check subscription
  }

  async addToQueue(userId: string, chatId: string, modelId: string): Promise<number> {
    const queueName = this.getUserQueue(userId)
    const priority = this.getPriority(queueName)

    const item: QueueItem = {
      userId,
      chatId,
      modelId,
      priority,
      timestamp: Date.now(),
    }

    const queue = this.queues.get(queueName)!
    queue.push(item)
    this.queues.set(queueName, queue)

    return queue.length
  }

  private getPriority(queueName: string): number {
    const priorities: Record<string, number> = {
      max: 4,
      ultra: 3,
      pro: 2,
      free: 1,
    }
    return priorities[queueName] || 1
  }

  async getNextFromQueue(): Promise<QueueItem | null> {
    // Check queues in priority order
    const queueOrder = ["max", "ultra", "pro", "free"]

    for (const queueName of queueOrder) {
      const queue = this.queues.get(queueName)!
      if (queue.length > 0) {
        const item = queue.shift()!
        this.queues.set(queueName, queue)
        return item
      }
    }

    return null
  }

  isProcessing(userId: string): boolean {
    return this.processing.has(userId)
  }

  setProcessing(userId: string, processing: boolean): void {
    if (processing) {
      this.processing.add(userId)
    } else {
      this.processing.delete(userId)
    }
  }

  getQueueStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const [name, queue] of this.queues.entries()) {
      stats[name] = queue.length
    }
    return stats
  }

  removeFromQueue(userId: string): void {
    for (const [name, queue] of this.queues.entries()) {
      const filtered = queue.filter((item) => item.userId !== userId)
      this.queues.set(name, filtered)
    }
  }
}

export const loadBalancer = LoadBalancer.getInstance()
