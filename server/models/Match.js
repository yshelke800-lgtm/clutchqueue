const mongoose = require('mongoose')

const matchSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  score: { team1: { type: Number, default: 0 }, team2: { type: Number, default: 0 } },
  round: { type: Number, default: 1 },
  scheduledAt: { type: Date },
  status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
}, { timestamps: true })

module.exports = mongoose.model('Match', matchSchema)
