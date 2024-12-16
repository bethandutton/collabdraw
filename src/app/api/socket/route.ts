import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { NextResponse } from 'next/server'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

// Declare global variable for socket server
declare global {
  var io: SocketIOServer | undefined
}

export async function GET() {
  try {
    if (!global.io) {
      console.log('New Socket.io server...')
      
      global.io = new SocketIOServer({
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      global.io.on('connection', socket => {
        console.log('Socket connected:', socket.id)
        
        socket.on('draw', (data) => {
          socket.broadcast.emit('draw', data)
        })

        socket.on('disconnect', () => {
          console.log('Socket disconnected:', socket.id)
        })
      })
    }

    return new NextResponse('Socket server initialized', { status: 200 })
  } catch (error) {
    console.error('Socket initialization error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}