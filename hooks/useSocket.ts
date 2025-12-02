'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        // Get auth token from session storage or cookies
        const token = localStorage.getItem('authToken')

        if (!token) {
            return
        }

        // Initialize socket connection
        const newSocket = io('http://localhost:3000', {
            auth: {
                token
            },
            autoConnect: true
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setIsConnected(false)
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        return () => {
            newSocket.close()
        }
    }, [])

    return { socket, isConnected }
}

export function useMessages(conversationId: string | null) {
    const { socket } = useSocket()
    const [messages, setMessages] = useState<any[]>([])
    const [typing, setTyping] = useState(false)

    useEffect(() => {
        if (!socket || !conversationId) return

        // Listen for new messages
        const handleNewMessage = (message: any) => {
            if (message.conversationId === conversationId) {
                setMessages(prev => [...prev, message])
            }
        }

        // Listen for typing indicator
        const handleTyping = (data: any) => {
            if (data.conversationId === conversationId) {
                setTyping(data.isTyping)
            }
        }

        socket.on('new_message', handleNewMessage)
        socket.on('user_typing', handleTyping)

        return () => {
            socket.off('new_message', handleNewMessage)
            socket.off('user_typing', handleTyping)
        }
    }, [socket, conversationId])

    const sendTyping = (receiverId: string, isTyping: boolean) => {
        if (socket && conversationId) {
            socket.emit('typing', { receiverId, conversationId, isTyping })
        }
    }

    return { messages, setMessages, typing, sendTyping }
}
