const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
const prisma = new PrismaClient()

// Store Socket.IO instance globally
let io

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    io = new Server(httpServer, {
        cors: {
            origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    })

    // Socket.IO authentication middleware
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token
        if (!token) {
            return next(new Error('Authentication error'))
        }

        try {
            const session = await prisma.session.findUnique({
                where: { token },
                include: { user: true }
            })

            if (!session || session.expiresAt < new Date()) {
                return next(new Error('Invalid or expired token'))
            }

            socket.userId = session.user.id
            socket.userRole = session.user.role
            socket.userName = `${session.user.firstName} ${session.user.lastName}`
            next()
        } catch (error) {
            console.error('Socket auth error:', error)
            next(new Error('Authentication error'))
        }
    })

    // Socket.IO connection handling
    io.on('connection', (socket) => {
        console.log(`✓ User connected: ${socket.userName} (${socket.userId})`)

        // Join user-specific room
        socket.join(`user:${socket.userId}`)

        // Handle typing indicator
        socket.on('typing', (data) => {
            socket.to(`user:${data.receiverId}`).emit('user_typing', {
                senderId: socket.userId,
                conversationId: data.conversationId,
                isTyping: data.isTyping
            })
        })

        // Handle message read status
        socket.on('mark_read', async (data) => {
            try {
                await prisma.message.updateMany({
                    where: {
                        conversationId: data.conversationId,
                        receiverId: socket.userId,
                        isRead: false
                    },
                    data: { isRead: true }
                })

                // Update last read timestamp
                await prisma.conversationParticipant.updateMany({
                    where: {
                        conversationId: data.conversationId,
                        userId: socket.userId
                    },
                    data: { lastReadAt: new Date() }
                })

                socket.to(`user:${data.senderId}`).emit('messages_read', {
                    conversationId: data.conversationId,
                    readBy: socket.userId
                })
            } catch (error) {
                console.error('Mark read error:', error)
            }
        })

        socket.on('disconnect', () => {
            console.log(`✗ User disconnected: ${socket.userName}`)
        })
    })

    // Expose io instance globally for API routes
    global.io = io

    httpServer
        .once('error', (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
            console.log(`> Socket.IO server running`)
        })
})

// Export for use in API routes
module.exports = { io }
