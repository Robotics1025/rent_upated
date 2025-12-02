/**
 * Get Socket.IO instance for use in API routes
 */
export function getIO() {
    if (typeof global.io === 'undefined') {
        throw new Error('Socket.IO not initialized')
    }
    return global.io
}

/**
 * Emit a message to a specific user
 */
export function emitToUser(userId: string, event: string, data: any) {
    const io = getIO()
    io.to(`user:${userId}`).emit(event, data)
}

/**
 * Emit to multiple users
 */
export function emitToUsers(userIds: string[], event: string, data: any) {
    const io = getIO()
    userIds.forEach(userId => {
        io.to(`user:${userId}`).emit(event, data)
    })
}
