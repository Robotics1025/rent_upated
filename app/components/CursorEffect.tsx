'use client'

import { useEffect, useRef, useState } from 'react'

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let width = window.innerWidth
        let height = window.innerHeight
        canvas.width = width
        canvas.height = height

        let mouseX = width / 2
        let mouseY = height / 2
        let isMoving = false
        let moveTimeout: NodeJS.Timeout

        const particles: Particle[] = []
        const particleCount = 40 // Number of particles in the trail

        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            life: number
            maxLife: number
            color: string

            constructor(x: number, y: number) {
                this.x = x
                this.y = y
                this.size = Math.random() * 3 + 1
                this.speedX = (Math.random() - 0.5) * 1.5
                this.speedY = (Math.random() - 0.5) * 1.5
                this.maxLife = Math.random() * 50 + 30
                this.life = this.maxLife
                // Emerald/Teal colors
                const colors = ['#10b981', '#34d399', '#059669', '#6ee7b7']
                this.color = colors[Math.floor(Math.random() * colors.length)]
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY
                this.life--
                this.size = Math.max(0, this.size - 0.05)
            }

            draw() {
                if (!ctx) return
                ctx.fillStyle = this.color
                ctx.globalAlpha = this.life / this.maxLife
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
                ctx.globalAlpha = 1
            }
        }

        const onMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX
            mouseY = e.clientY
            isMoving = true

            // Add new particles on move
            for (let i = 0; i < 2; i++) {
                particles.push(new Particle(mouseX, mouseY))
            }

            clearTimeout(moveTimeout)
            moveTimeout = setTimeout(() => {
                isMoving = false
            }, 100)
        }

        const onResize = () => {
            width = window.innerWidth
            height = window.innerHeight
            canvas.width = width
            canvas.height = height
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height)

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update()
                particles[i].draw()

                if (particles[i].life <= 0 || particles[i].size <= 0) {
                    particles.splice(i, 1)
                    i--
                }
            }

            // Limit max particles for performance
            if (particles.length > 150) {
                particles.splice(0, particles.length - 150)
            }

            requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('resize', onResize)

        const animationId = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('resize', onResize)
            cancelAnimationFrame(animationId)
            clearTimeout(moveTimeout)
        }
    }, [mounted])

    if (!mounted) return null

    return (
        <>
            <style jsx global>{`
        body {
          cursor: default; /* Keep default cursor but add trail */
        }
        /* Optional: Hide default cursor if desired */
        /*
        body {
          cursor: none;
        }
        a, button, [role="button"] {
          cursor: none;
        }
        */
      `}</style>
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
            />
        </>
    )
}
