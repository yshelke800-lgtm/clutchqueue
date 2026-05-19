const express = require('express')
const router = express.Router()
const Tournament = require('../models/Tournament')
const Team = require('../models/Team')
const User = require('../models/User')
const { protect, organizerOnly } = require('../middleware/auth')

// GET /api/tournaments
router.get('/', async (req, res) => {
  try {
    const { game, status } = req.query
    const filter = {}
    if (game) filter.game = game
    if (status) filter.status = status
    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name avatar')
      .populate('registeredTeams', 'name logo')
      .sort({ startDate: 1 })
    res.json(tournaments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/tournaments/my (organizer's tournaments)
router.get('/my', protect, organizerOnly, async (req, res) => {
  try {
    const tournaments = await Tournament.find({ organizer: req.user._id })
      .populate('registeredTeams', 'name logo')
      .sort({ createdAt: -1 })
    res.json(tournaments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/tournaments/:id
router.get('/:id', async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
      .populate('organizer', 'name avatar')
      .populate('registeredTeams', 'name logo game captain')
      .populate('winner', 'name logo')
      .populate('brackets.team1', 'name logo')
      .populate('brackets.team2', 'name logo')
      .populate('brackets.winner', 'name logo')
    if (!t) return res.status(404).json({ message: 'Tournament not found' })
    res.json(t)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/tournaments
router.post('/', protect, organizerOnly, async (req, res) => {
  try {
    const tournament = await Tournament.create({ ...req.body, organizer: req.user._id })
    res.status(201).json(tournament)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/tournaments/:id
router.put('/:id', protect, organizerOnly, async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })
    if (t.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' })
    const updated = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/tournaments/:id/register
router.post('/:id/register', protect, async (req, res) => {
  try {
    const { teamId } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' })
    if (tournament.status !== 'upcoming') return res.status(400).json({ message: 'Registration closed' })
    if (tournament.registeredTeams.length >= tournament.maxTeams) return res.status(400).json({ message: 'Tournament is full' })
    if (tournament.registeredTeams.includes(teamId)) return res.status(400).json({ message: 'Team already registered' })
    const team = await Team.findById(teamId)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (team.captain.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only team captain can register' })
    tournament.registeredTeams.push(teamId)
    await tournament.save()
    // Notify team members
    const notification = { message: `Your team ${team.name} is registered for ${tournament.title}!` }
    await User.updateMany({ _id: { $in: team.members } }, { $push: { notifications: notification } })
    res.json({ message: 'Team registered successfully!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/tournaments/:id/result
router.put('/:id/result', protect, organizerOnly, async (req, res) => {
  try {
    const { bracketIndex, winnerId, score } = req.body
    const tournament = await Tournament.findById(req.params.id)
    if (!tournament) return res.status(404).json({ message: 'Not found' })
    if (bracketIndex !== undefined) {
      tournament.brackets[bracketIndex].winner = winnerId
      tournament.brackets[bracketIndex].score = score
      tournament.brackets[bracketIndex].status = 'completed'
    }
    if (req.body.winner) {
      tournament.winner = req.body.winner
      tournament.status = 'completed'
      // Update winning team stats
      await Team.findByIdAndUpdate(req.body.winner, { $inc: { wins: 1 } })
    }
    await tournament.save()
    res.json(tournament)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/tournaments/:id
router.delete('/:id', protect, organizerOnly, async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
    if (!t) return res.status(404).json({ message: 'Not found' })
    if (t.organizer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' })
    await t.deleteOne()
    res.json({ message: 'Tournament deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
