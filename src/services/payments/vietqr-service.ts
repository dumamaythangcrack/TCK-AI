import { prisma } from "@/lib/prisma"
import { PLAN_CONFIGS } from "@/types"

export class VietQRService {
  private static instance: VietQRService

  private constructor() {}

  static getInstance(): VietQRService {
    if (!VietQRService.instance) {
      VietQRService.instance = new VietQRService()
    }
    return VietQRService.instance
  }

  async generatePaymentRequest(
    userId: string,
    planSlug: string
  ): Promise<{
    transferCode: string
    qrCode: string
    amount: number
    expiresAt: Date
  }> {
    const plan = PLAN_CONFIGS.find((p) => p.slug === planSlug)
    if (!plan) {
      throw new Error("Plan not found")
    }

    // Generate unique transfer code
    const transferCode = this.generateTransferCode(planSlug)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Generate QR code URL using VietQR API (free)
    const bankAccountNo = process.env.BANK_ACCOUNT_NO || ""
    const bankName = process.env.BANK_NAME || ""
    const accountName = process.env.BANK_ACCOUNT_NAME || ""

    const qrCode = this.generateVietQRUrl({
      bankAccountNo,
      bankName,
      accountName,
      amount: plan.price,
      transferCode,
    })

    // Save payment request to database
    const existingPlan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    })

    if (existingPlan) {
      await prisma.paymentRequest.create({
        data: {
          userId,
          planId: existingPlan.id,
          transferCode,
          amount: plan.price,
          currency: plan.currency,
          status: "PENDING",
          qrCode,
          expiresAt,
        },
      })
    }

    return {
      transferCode,
      qrCode,
      amount: plan.price,
      expiresAt,
    }
  }

  async approvePayment(transferCode: string, adminId: string): Promise<void> {
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { transferCode },
      include: {
        plan: true,
      },
    })

    if (!paymentRequest) {
      throw new Error("Payment request not found")
    }

    if (paymentRequest.status !== "PENDING") {
      throw new Error("Payment already processed")
    }

    await prisma.$transaction([
      prisma.paymentRequest.update({
        where: { transferCode },
        data: {
          status: "APPROVED",
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      }),
      prisma.subscription.update({
        where: { userId: paymentRequest.userId },
        data: {
          planId: paymentRequest.planId,
          status: "ACTIVE",
          startDate: new Date(),
          endDate: this.calculateEndDate(paymentRequest.plan.trialDays),
        },
      }),
      prisma.user.update({
        where: { id: paymentRequest.userId },
        data: {
          dailyCredits: paymentRequest.plan.dailyCredits,
          lastCreditReset: new Date(),
        },
      }),
    ])
  }

  async rejectPayment(transferCode: string, adminId: string, reason: string): Promise<void> {
    await prisma.paymentRequest.update({
      where: { transferCode },
      data: {
        status: "REJECTED",
        approvedBy: adminId,
        rejectedReason: reason,
      },
    })
  }

  async getPaymentRequests(filters?: {
    status?: string
    userId?: string
  }) {
    return await prisma.paymentRequest.findMany({
      where: filters,
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  async checkExpiredPayments(): Promise<void> {
    const expiredPayments = await prisma.paymentRequest.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    for (const payment of expiredPayments) {
      await prisma.paymentRequest.update({
        where: { id: payment.id },
        data: { status: "EXPIRED" },
      })
    }
  }

  private generateTransferCode(planSlug: string): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TCK-${planSlug.toUpperCase()}-${timestamp}-${random}`
  }

  private generateVietQRUrl(params: {
    bankAccountNo: string
    bankName: string
    accountName: string
    amount: number
    transferCode: string
  }): string {
    // VietQR API format (free API)
    const { bankAccountNo, bankName, accountName, amount, transferCode } = params

    // Encode parameters
    const encodedData = encodeURIComponent(
      `${bankAccountNo}|${bankName}|${accountName}|${amount}|${transferCode}`
    )

    // Using VietQR's free API endpoint
    return `https://img.vietqr.io/image/${bankAccountNo}-${bankName}-compact2.png?amount=${amount}&addInfo=${transferCode}&accountName=${encodeURIComponent(accountName)}`
  }

  private calculateEndDate(trialDays: number): Date | null {
    if (trialDays === 0) return null
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + trialDays)
    return endDate
  }
}

export const vietQRService = VietQRService.getInstance()
