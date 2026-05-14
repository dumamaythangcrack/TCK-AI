import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, sendOTPEmail } from "@/lib/otp"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email đã được sử dụng" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        credits: 100,
        dailyCredits: 100,
      },
    })

    // Create free trial subscription
    const freeTrialPlan = await prisma.plan.findFirst({
      where: { slug: "free-trial" },
    })

    if (freeTrialPlan) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: freeTrialPlan.id,
          status: "TRIAL",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      })
    }

    // Generate and send OTP
    const otp = await generateOTP(user.id, "REGISTER")
    await sendOTPEmail(email, otp, "REGISTER")

    return NextResponse.json({
      success: true,
      message: "Đăng ký thành công. Vui lòng nhập mã OTP đã gửi đến email của bạn.",
      userId: user.id,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Đăng ký thất bại" },
      { status: 500 }
    )
  }
}
