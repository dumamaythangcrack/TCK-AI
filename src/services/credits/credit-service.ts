import { prisma } from "@/lib/prisma"
import { PLAN_CONFIGS } from "@/types"

export class CreditService {
  private static instance: CreditService

  private constructor() {}

  static getInstance(): CreditService {
    if (!CreditService.instance) {
      CreditService.instance = new CreditService()
    }
    return CreditService.instance
  }

  async getUserCredits(userId: string): Promise<{
    totalCredits: number
    dailyCredits: number
    lastReset: Date | null
    subscriptionPlan: string
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    return {
      totalCredits: user.credits,
      dailyCredits: user.dailyCredits,
      lastReset: user.lastCreditReset,
      subscriptionPlan: user.subscription?.plan?.name || "Free",
    }
  }

  async checkDailyCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) return false

    // Check if credits need reset
    await this.resetDailyCreditsIfNeeded(userId)

    // Check again after potential reset
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    return (updatedUser?.dailyCredits || 0) >= requiredCredits
  }

  async deductCredits(userId: string, amount: number, reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: amount },
          dailyCredits: { decrement: amount },
        },
      }),
      prisma.creditLog.create({
        data: {
          userId,
          amount: -amount,
          type: "DEDUCT",
          reason,
        },
      }),
    ])
  }

  async addCredits(userId: string, amount: number, reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          credits: { increment: amount },
          dailyCredits: { increment: amount },
        },
      }),
      prisma.creditLog.create({
        data: {
          userId,
          amount,
          type: "ADD",
          reason,
        },
      }),
    ])
  }

  async resetDailyCreditsIfNeeded(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!user) return

    const now = new Date()
    const lastReset = user.lastCreditReset
    const dailyCredits = user.subscription?.plan?.dailyCredits || 300

    // Reset if never reset or more than 24 hours since last reset
    if (!lastReset || (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          dailyCredits,
          lastCreditReset: now,
        },
      })
    }
  }

  async getCreditUsage(userId: string, days: number = 30): Promise<{
    totalUsed: number
    byDay: { date: string; credits: number }[]
  }> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const creditLogs = await prisma.creditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    })

    const totalUsed = creditLogs
      .filter((log: any) => log.amount < 0)
      .reduce((sum: number, log: any) => sum + Math.abs(log.amount), 0)

    const byDay: Record<string, number> = {}
    creditLogs.forEach((log: any) => {
      const date = log.createdAt.toISOString().split("T")[0]
      if (!byDay[date]) byDay[date] = 0
      byDay[date] += Math.abs(log.amount)
    })

    return {
      totalUsed,
      byDay: Object.entries(byDay).map(([date, credits]) => ({ date, credits })),
    }
  }

  async initializePlans(): Promise<void> {
    for (const planConfig of PLAN_CONFIGS) {
      const existingPlan = await prisma.plan.findUnique({
        where: { slug: planConfig.slug },
      })

      if (!existingPlan) {
        await prisma.plan.create({
          data: {
            name: planConfig.name,
            slug: planConfig.slug,
            description: planConfig.description,
            price: planConfig.price,
            currency: planConfig.currency,
            dailyCredits: planConfig.dailyCredits,
            features: planConfig.features,
            isActive: true,
            trialDays: planConfig.trialDays,
          },
        })
      }
    }
  }

  async getUserSubscription(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    })
  }

  async upgradeSubscription(userId: string, planSlug: string): Promise<void> {
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    })

    if (!plan) {
      throw new Error("Plan not found")
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId },
        data: {
          planId: plan.id,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: null,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          planId: plan.id,
          status: "ACTIVE",
          startDate: new Date(),
        },
      })
    }

    // Reset daily credits to new plan's amount
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCredits: plan.dailyCredits,
        lastCreditReset: new Date(),
      },
    })
  }

  async checkSubscriptionExpiry(): Promise<void> {
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        endDate: {
          lt: new Date(),
        },
      },
    })

    for (const subscription of expiredSubscriptions) {
      // Downgrade to free plan
      const freePlan = await prisma.plan.findUnique({
        where: { slug: "free" },
      })

      if (freePlan) {
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              planId: freePlan.id,
              status: "EXPIRED",
            },
          }),
          prisma.user.update({
            where: { id: subscription.userId },
            data: {
              dailyCredits: freePlan.dailyCredits,
            },
          }),
        ])
      }
    }
  }
}

export const creditService = CreditService.getInstance()
