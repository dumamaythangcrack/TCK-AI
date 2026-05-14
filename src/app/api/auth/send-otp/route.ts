import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP, sendOTPEmail } from "@/lib/otp"
import { z } from "zod"

const sendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(["LOGIN", "REGISTER", "RESET_PASSWORD"]),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, type } = sendOtpSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Email không tồn tại" },
        { status: 400 }
      )
    }

    // Generate and send OTP
    const otp = await generateOTP(user.id, type)
    await sendOTPEmail(email, otp, type)

    return NextResponse.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn",
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Gửi OTP thất bại" },
      { status: 500 }
    )
  }
}
