import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import crypto from "crypto"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function generateOTP(userId: string, type: "LOGIN" | "REGISTER" | "RESET_PASSWORD"): Promise<string> {
  const code = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await prisma.otpCode.create({
    data: {
      userId,
      code,
      type,
      expiresAt,
    },
  })

  return code
}

export async function sendOTPEmail(email: string, code: string, type: string): Promise<void> {
  const subject = type === "LOGIN" ? "Mã OTP đăng nhập TCK AI" : "Mã OTP xác thực TCK AI"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">TCK AI</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
        <h2 style="color: #333; margin-top: 0;">${subject}</h2>
        <p style="color: #666; font-size: 16px;">Mã OTP của bạn là:</p>
        <div style="background: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">Mã OTP sẽ hết hạn sau 5 phút.</p>
        <p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@tckai.com",
    to: email,
    subject,
    html,
  })
}

export async function verifyOTP(userId: string, code: string, type: string): Promise<boolean> {
  const otpCode = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      type,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!otpCode) {
    return false
  }

  // Increment attempts
  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: {
      attempts: { increment: 1 },
    },
  })

  if (otpCode.attempts >= 3) {
    return false
  }

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otpCode.id },
    data: {
      usedAt: new Date(),
    },
  })

  return true
}

export async function cleanupExpiredOTPs(): Promise<void> {
  await prisma.otpCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
