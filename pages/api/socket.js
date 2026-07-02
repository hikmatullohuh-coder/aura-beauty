import { Server } from 'socket.io'

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Initializing socket.io')
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    global.io = io

    io.on('connection', socket => {
      console.log('socket connected', socket.id)
    })
  }
  res.end()
}
