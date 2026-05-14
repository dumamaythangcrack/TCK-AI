import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { apiRouter } from "@/services/api-router/api-router"
import { MODEL_CONFIGS, AiMode } from "@/types"
import { z } from "zod"

const chatSchema = z.object({
  message: z.string(),
  modelId: z.string(),
  aiMode: z.enum(["CHAT", "THINKING", "SEARCH", "STUDY", "CODING", "VISION", "IMAGE_GENERATION"]),
  chatId: z.string().optional(),
  uploadIds: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { message, modelId, aiMode, chatId, uploadIds } = chatSchema.parse(body)

    const userId = session.user.id

    // Check user credits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.dailyCredits <= 0) {
      return NextResponse.json(
        { error: "Hết credits. Vui lòng nâng cấp gói." },
        { status: 403 }
      )
    }

    // Get model config
    const modelConfig = MODEL_CONFIGS.find((m) => m.id === modelId)
    if (!modelConfig) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Check if user has enough credits
    if (user.dailyCredits < modelConfig.creditCost) {
      return NextResponse.json(
        { error: "Không đủ credits" },
        { status: 403 }
      )
    }

    // Create or get chat
    let chat: any = null
    if (chatId) {
      chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { messages: true },
      })
      if (!chat || chat.userId !== userId) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
      }
   } else {
  chat = await prisma.chat.create({
    data: {
      userId,
      model: modelConfig.name,
      aiMode: aiMode as AiMode,
      title: message.substring(0, 50),
    },
    include: {
      messages: true,
    },
  })
}

    // Save user message
    await prisma.message.create({
      data: {
        chatId: chat.id,
        userId,
        role: "USER",
        content: message,
        uploadIds: uploadIds || [],
        creditsUsed: 0,
      },
    })

    // Get API key
    const apiKeyData = await apiRouter.getApiKeyForChat(chat.id, modelId)
    if (!apiKeyData) {
      return NextResponse.json(
        { error: "Không có API key khả dụng" },
        { status: 503 }
      )
    }

    // Generate AI response
    const response = await generateAIResponse(
      message,
      modelConfig,
      apiKeyData,
      (chat as any).messages || [],
      aiMode
    )

    // Deduct credits
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCredits: { decrement: modelConfig.creditCost },
        credits: { decrement: modelConfig.creditCost },
      },
    })

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        chatId: chat.id,
        userId,
        role: "ASSISTANT",
        content: response.content,
        reasoning: response.reasoning,
        citations: response.citations || [],
        creditsUsed: modelConfig.creditCost,
        model: modelConfig.name,
        apiKey: apiKeyData.apiKey,
      },
    })

    // Update chat
    await prisma.chat.update({
      where: { id: chat.id },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      messageId: aiMessage.id,
      content: response.content,
      reasoning: response.reasoning,
      citations: response.citations,
      creditsUsed: modelConfig.creditCost,
      remainingCredits: user.dailyCredits - modelConfig.creditCost,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: "Lỗi khi xử lý chat" },
      { status: 500 }
    )
  }
}

async function generateAIResponse(
  message: string,
  modelConfig: any,
  apiKeyData: { apiKey: string; provider: string },
  chatHistory: any[],
  aiMode: string
): Promise<{ content: string; reasoning?: string; citations?: string[] }> {
  // This is a placeholder - in production, you would call the actual AI APIs
  // For now, return a mock response
  
  const responses: Record<string, string> = {
    CHAT: `Đây là phản hồi từ ${modelConfig.name}. Bạn đã hỏi: "${message}". Đây là chế độ Chat thông thường.`,
    THINKING: `Đây là phản hồi từ ${modelConfig.name} với chế độ Thinking.\n\n**Reasoning:**\nTôi đang phân tích câu hỏi của bạn...\n- Bước 1: Hiểu ngữ cảnh\n- Bước 2: Xử lý thông tin\n- Bước 3: Tạo phản hồi\n\n**Kết quả:**\nBạn đã hỏi: "${message}"`,
    SEARCH: `Đây là phản hồi từ ${modelConfig.name} với chế độ Search.\n\n**Nguồn:**\n- Source 1: example.com\n- Source 2: example.org\n\n**Tóm tắt:**\nBạn đã hỏi: "${message}"`,
    STUDY: `Đây là phản hồi từ ${modelConfig.name} với chế độ Study.\n\n**Giải thích chi tiết:**\nBạn đã hỏi: "${message}"\n\nĐây là chế độ hỗ trợ học tập với giải thích từng bước.`,
    CODING: `Đây là phản hồi từ ${modelConfig.name} với chế độ Coding.\n\n\`\`\`javascript\n// Code example\nfunction example() {\n  return "Hello World";\n}\n\`\`\`\n\nBạn đã hỏi: "${message}"`,
    VISION: `Đây là phản hồi từ ${modelConfig.name} với chế độ Vision.\n\nBạn đã hỏi: "${message}"\n\nĐây là chế độ phân tích hình ảnh.`,
    IMAGE_GENERATION: `Đây là chế độ Image Generation từ ${modelConfig.name}.\n\nBạn đã yêu cầu: "${message}"\n\nTính năng này đang được phát triển.`,
  }

  const content = responses[aiMode] || responses.CHAT

  return {
    content,
    reasoning: aiMode === "THINKING" ? "Đây là quá trình suy nghĩ của AI..." : undefined,
    citations: aiMode === "SEARCH" ? ["example.com", "example.org"] : undefined,
  }
}
