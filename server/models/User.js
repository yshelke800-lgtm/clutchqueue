const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['player', 'organizer'], default: 'player' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  favoriteGame: { type: String, enum: ['bgmi', 'valorant', 'freefire', 'fifa', ''], default: '' },
  stats: {
    tournamentsPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    kills: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  notifications: [{
    message: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
