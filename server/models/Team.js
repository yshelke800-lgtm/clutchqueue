const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  game: { type: String, enum: ['bgmi', 'valorant', 'freefire', 'fifa'], required: true },
  captain: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  isRecruiting: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Team', teamSchema)
