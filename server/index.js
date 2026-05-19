const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config()

const app = express()
const server = http.createServer(app)

// Allow both local dev and deployed Vercel frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
  'https://clutchqueue.vercel.app',
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
})

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/teams', require('./routes/teams'))
app.use('/api/tournaments', require('./routes/tournaments'))
app.use('/api/matches', require('./routes/matches'))
app.use('/api/messages', require('./routes/messages'))

// Socket.io
const rooms = {}

io.on('connection', (socket) => {
  socket.on('join_team', (teamId) => {
    socket.join(teamId)
  })

  socket.on('send_message', ({ teamId, message }) => {
    io.to(teamId).emit('receive_message', message)
  })

  socket.on('disconnect', () => {})
})

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected')
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err)
    process.exit(1)
  })

module.exports = { io }
