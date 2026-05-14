import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và password là bắt buộc")
        }

        const { email, password } = loginSchema.parse(credentials)

        const user = await prisma.user.findUnique({
          where: { email },
          include: { subscription: true },
        })

        if (!user) {
          throw new Error("Email không tồn tại")
        }

        if (user.isBanned) {
          throw new Error(user.banReason || "Tài khoản đã bị khóa")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          throw new Error("Password không đúng")
        }

        // Check and reset daily credits
        const now = new Date()
        const lastReset = user.lastCreditReset
        const shouldReset = !lastReset || 
          (now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000)

        if (shouldReset) {
          const dailyCredits = user.subscription?.plan?.dailyCredits || 300
          await prisma.user.update({
            where: { id: user.id },
            data: {
              dailyCredits,
              lastCreditReset: now,
            },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
