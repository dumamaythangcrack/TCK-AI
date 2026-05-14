import { NextRequest } from "next/server"

export class SecurityService {
  private static instance: SecurityService
  private rateLimits: Map<string, { count: number; resetTime: number }> = new Map()

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService()
    }
    return SecurityService.instance
  }

  // Rate limiting
  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const record = this.rateLimits.get(identifier)

    if (!record || now > record.resetTime) {
      this.rateLimits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (record.count >= maxRequests) {
      return false
    }

    record.count++
    return true
  }

  clearRateLimit(identifier: string): void {
    this.rateLimits.delete(identifier)
  }

  // XSS protection
  sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  }

  sanitizeMarkdown(markdown: string): string {
    // Basic markdown sanitization
    // In production, use a proper sanitizer like DOMPurify
    return markdown
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
  }

  // CSRF protection
  generateCSRFToken(): string {
    return crypto.randomUUID()
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    // In production, validate against stored session token
    return token === sessionToken
  }

  // IP-based rate limiting
  getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")
    
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return "unknown"
  }

  // Abuse detection
  detectAbuse(identifier: string, threshold: number = 100): boolean {
    const record = this.rateLimits.get(identifier)
    if (!record) return false
    
    return record.count > threshold
  }

  // Input validation
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters")
    }

    if (password.length > 128) {
      errors.push("Password must be less than 128 characters")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[0-9]{10,15}$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ""))
  }

  // SQL injection prevention (basic)
  sanitizeSQL(input: string): string {
    return input
      .replace(/['";\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
  }

  // File upload validation
  validateFileName(filename: string): boolean {
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    
    return !invalidChars.test(filename) && !reservedNames.test(filename)
  }

  // Content security policy headers
  getCSPHeaders(): HeadersInit {
    return {
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ].join("; "),
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    }
  }
}

export const securityService = SecurityService.getInstance()
