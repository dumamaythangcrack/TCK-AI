"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 50

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth)
        this.y = Math.random() * (canvas?.height || window.innerHeight)
        this.size = Math.random() * 2 + 1
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.color = Math.random() > 0.5 ? "#8b5cf6" : "#3b82f6"
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (canvas && this.x > canvas.width) this.x = 0
        if (canvas && this.x < 0) this.x = canvas.width
        if (canvas && this.y > canvas.height) this.y = 0
        if (canvas && this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  )
}

export function AnimatedGradient() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 1 }}
      style={{
        background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
      }}
    />
  )
}

export function GlowBorder({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-20 animate-pulse" />
      <div className="relative bg-slate-900 rounded-lg border border-purple-500/20">
        {children}
      </div>
    </motion.div>
  )
}
