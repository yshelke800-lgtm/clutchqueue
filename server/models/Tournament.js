const mongoose = require('mongoose')

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  game: { type: String, enum: ['bgmi', 'valorant', 'freefire', 'fifa'], required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  rules: { type: String, default: '' },
  format: { type: String, enum: ['single-elimination', 'double-elimination', 'round-robin'], default: 'single-elimination' },
  maxTeams: { type: Number, required: true, default: 16 },
  prizePool: { type: String, default: '' },
  registeredTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  brackets: [{
    round: Number,
    match: Number,
    team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    score: { team1: Number, team2: Number },
    status: { type: String, enum: ['pending', 'ongoing', 'completed'], default: 'pending' },
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  image: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Tournament', tournamentSchema)
