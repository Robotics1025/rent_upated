'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { MessageSquare, Search, Send, MoreVertical, Phone, Video, CheckCheck, PhoneOff, Mic, MicOff } from 'lucide-react'
import { useSocket, useMessages } from '@/hooks/useSocket'
import { toast } from 'sonner'

interface Conversation {
    id: string
    otherUser: {
        id: string
        firstName: string
        lastName: string
        avatar?: string
        role: string
    }
    lastMessage?: {
        content: string
        createdAt: string
    }
}

interface Message {
    id: string
    content: string
    senderId: string
    createdAt: string
    sender: {
        firstName: string
        lastName: string
    }
    deliveryMethod?: string
    smsStatus?: string
}

export default function MessagesPage() {
    const { data: session } = useSession()
    const { socket, isConnected } = useSocket()

    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const { sendTyping, typing } = useMessages(selectedConversation)

    const [messageInput, setMessageInput] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Call/Video Dialog states
    const [showCallDialog, setShowCallDialog] = useState(false)
    const [showVideoDialog, setShowVideoDialog] = useState(false)
    const [callActive, setCallActive] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [callDuration, setCallDuration] = useState(0)

    // Call timer
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (callActive) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [callActive])

    const formatCallDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        fetchConversations()
    }, [])

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation)
        }
    }, [selectedConversation])

    useEffect(() => {
        if (!socket) return

        socket.on('new_message', (message: Message) => {
            setMessages(prev => [...prev, message])
            fetchConversations()
        })

        return () => {
            socket.off('new_message')
        }
    }, [socket])

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages/conversations', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            const data = await res.json()
            setConversations(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch conversations:', error)
            toast.error('Failed to fetch conversations')
            setConversations([])
        }
    }

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await fetch(`/api/messages/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            const data = await res.json()
            setMessages(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            toast.error('Failed to fetch messages')
            setMessages([])
        }
    }

    const searchUsers = async (query: string) => {
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        try {
            const res = await fetch(`/api/search/users?q=${encodeURIComponent(query)}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            const data = await res.json()
            setSearchResults(data)
        } catch (error) {
            console.error('Search failed:', error)
            toast.error('Search failed')
        }
    }

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return

        setLoading(true)
        try {
            const selectedConv = conversations.find(c => c.id === selectedConversation)
            const receiverId = selectedConv?.otherUser.id

            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    receiverId,
                    content: messageInput,
                    sendAsSMS: false
                })
            })

            if (res.ok) {
                setMessageInput('')
                const message = await res.json()
                setMessages(prev => [...prev, message])
            }
        } catch (error) {
            console.error('Failed to send message:', error)
            toast.error('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const startNewConversation = async (userId: string) => {
        setLoading(true)
        try {
            const res = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    receiverId: userId,
                    content: 'Hi!',
                    sendAsSMS: false
                })
            })

            if (res.ok) {
                await fetchConversations()
                setSearchQuery('')
                setSearchResults([])
            }
        } catch (error) {
            console.error('Failed to start conversation:', error)
            toast.error('Failed to start conversation')
        } finally {
            setLoading(false)
        }
    }

    const startCall = (isVideo: boolean) => {
        if (isVideo) {
            setShowVideoDialog(true)
        } else {
            setShowCallDialog(true)
        }
        setCallActive(true)
        setCallDuration(0)
    }

    const endCall = () => {
        setCallActive(false)
        setShowCallDialog(false)
        setShowVideoDialog(false)
        setIsMuted(false)
        setCallDuration(0)
    }

    const selectedConv = selectedConversation
        ? conversations.find(c => c.id === selectedConversation)
        : null

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } else if (diffInHours < 48) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }
    }

    return (
        <>
            {/* Main Container - No internal header, uses DashboardLayout header */}
            <div className="flex h-[calc(100vh-7rem)] bg-white">
                {/* Conversations Sidebar */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                    {/* Search Section */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search or start new chat..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    searchUsers(e.target.value)
                                }}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => startNewConversation(user.id)}
                                        className="w-full p-2 hover:bg-gray-50 text-left flex items-center gap-2 transition"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">{user.firstName} {user.lastName}</div>
                                            <div className="text-xs text-gray-500">{user.role}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">No conversations yet</p>
                                <p className="text-xs mt-1">Search to start messaging</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv.id)}
                                    className={`w-full p-3 hover:bg-gray-50 text-left border-b border-gray-100 transition ${selectedConversation === conv.id ? 'bg-emerald-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm">
                                            {conv.otherUser.firstName[0]}{conv.otherUser.lastName[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className="font-medium text-sm text-gray-900 truncate">
                                                    {conv.otherUser.firstName} {conv.otherUser.lastName}
                                                </span>
                                                {conv.lastMessage && (
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {formatTime(conv.lastMessage.createdAt)}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.lastMessage && (
                                                <div className="text-xs text-gray-600 truncate flex items-center gap-1">
                                                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                                                    {conv.lastMessage.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gray-50">
                    {selectedConv ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm">
                                        {selectedConv.otherUser.firstName[0]}{selectedConv.otherUser.lastName[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">
                                            {selectedConv.otherUser.firstName} {selectedConv.otherUser.lastName}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            {isConnected && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}
                                            {isConnected ? 'online' : 'offline'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => startCall(true)}
                                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                        title="Video Call"
                                    >
                                        <Video className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => startCall(false)}
                                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                        title="Voice Call"
                                    >
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[65%] px-3 py-2 rounded-2xl shadow-sm ${msg.senderId === session?.user?.id
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                                }`}
                                        >
                                            <div className="text-sm leading-relaxed mb-1">{msg.content}</div>
                                            <div className="flex items-center justify-end gap-1">
                                                <span className={`text-[10px] ${msg.senderId === session?.user?.id ? 'text-emerald-100' : 'text-gray-500'
                                                    }`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.senderId === session?.user?.id && (
                                                    <CheckCheck className="w-3 h-3 text-emerald-100" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {typing && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl shadow-sm">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="bg-white border-t border-gray-200 p-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => {
                                            setMessageInput(e.target.value)
                                            sendTyping(selectedConv.otherUser.id, e.target.value.length > 0)
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage()
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={loading || !messageInput.trim()}
                                        className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <MessageSquare className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-1">Messages</h3>
                                <p className="text-sm text-gray-600">Select a conversation to start</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Voice Call Dialog */}
            {showCallDialog && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white mx-auto flex items-center justify-center font-bold text-xl shadow-lg">
                                {selectedConv?.otherUser.firstName[0]}{selectedConv?.otherUser.lastName[0]}
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {selectedConv?.otherUser.firstName} {selectedConv?.otherUser.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{callActive ? 'Call in progress' : 'Calling...'}</p>
                        <p className="text-emerald-600 font-mono text-lg mb-6">{formatCallDuration(callDuration)}</p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3 rounded-full transition ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={endCall}
                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Call Dialog */}
            {showVideoDialog && (
                <div className="fixed inset-0 bg-black z-[100]">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white mx-auto mb-4 flex items-center justify-center font-bold text-3xl shadow-lg">
                                {selectedConv?.otherUser.firstName[0]}{selectedConv?.otherUser.lastName[0]}
                            </div>
                            <h3 className="text-2xl font-semibold text-white mb-2">
                                {selectedConv?.otherUser.firstName} {selectedConv?.otherUser.lastName}
                            </h3>
                            <p className="text-gray-400 mb-2">{callActive ? 'Video call in progress' : 'Connecting...'}</p>
                            <p className="text-emerald-400 font-mono text-lg">{formatCallDuration(callDuration)}</p>
                        </div>

                        {/* Self preview */}
                        <div className="absolute top-4 right-4 w-40 h-32 bg-gray-800 rounded-lg shadow-lg border-2 border-white overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center text-white text-xs">
                                Your camera
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-3 rounded-full transition ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur text-white hover:bg-white/30'
                                    }`}
                            >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={endCall}
                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                            >
                                <PhoneOff className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
