import { Server } from 'socket.io'

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      console.log('a user connected')
      
      socket.on('disconnect', () => {
        console.log('user disconnected')
      })

      // Add your socket event handlers here
      socket.on('message', (data) => {
        // Broadcast to all clients
        io.emit('message', data)
      })
    })
  }
  res.end()
}

export default ioHandler

export const config = {
  api: {
    bodyParser: false
  }
}