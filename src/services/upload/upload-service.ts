import { prisma } from "@/lib/prisma"

export class UploadService {
  private static instance: UploadService

  private constructor() {}

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService()
    }
    return UploadService.instance
  }

  async uploadFile(
    userId: string,
    file: File,
    type: "image" | "pdf" | "docx" | "code" | "other"
  ): Promise<{
    id: string
    url: string
    filename: string
  }> {
    // In production, this would use a proper file storage service
    // For now, we'll simulate the upload

    const filename = `${Date.now()}-${file.name}`
    const url = `/uploads/${filename}`

    const upload = await prisma.upload.create({
      data: {
        userId,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        status: "COMPLETED",
      },
    })

    return {
      id: upload.id,
      url: upload.url,
      filename: upload.originalName,
    }
  }

  async getUploads(userId: string) {
    return await prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  async deleteUpload(uploadId: string, userId: string): Promise<void> {
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
    })

    if (!upload || upload.userId !== userId) {
      throw new Error("Upload not found or unauthorized")
    }

    await prisma.upload.delete({
      where: { id: uploadId },
    })
  }

  async getUploadById(uploadId: string) {
    return await prisma.upload.findUnique({
      where: { id: uploadId },
    })
  }

  validateFile(file: File, type: string): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 10MB limit" }
    }

    const allowedTypes: Record<string, string[]> = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      pdf: ["application/pdf"],
      docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      code: [
        "text/javascript",
        "text/typescript",
        "text/python",
        "text/java",
        "text/cpp",
        "text/c",
        "application/json",
        "text/xml",
      ],
      other: [],
    }

    if (type !== "other") {
      const allowed = allowedTypes[type] || []
      if (allowed.length > 0 && !allowed.includes(file.type)) {
        return { valid: false, error: "File type not allowed" }
      }
    }

    return { valid: true }
  }
}

export const uploadService = UploadService.getInstance()
