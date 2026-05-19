const express = require('express')
const router = express.Router()
const Team = require('../models/Team')
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// GET /api/teams
router.get('/', async (req, res) => {
  try {
    const { game } = req.query
    const filter = game ? { game } : {}
    const teams = await Team.find(filter).populate('captain', 'name avatar').populate('members', 'name avatar')
    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/teams/my
router.get('/my', protect, async (req, res) => {
  try {
    const teams = await Team.find({ $or: [{ captain: req.user._id }, { members: req.user._id }] })
      .populate('captain', 'name avatar')
      .populate('members', 'name avatar')
    res.json(teams)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name avatar email')
      .populate('members', 'name avatar email')
    if (!team) return res.status(404).json({ message: 'Team not found' })
    res.json(team)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/teams
router.post('/', protect, async (req, res) => {
  try {
    const { name, game, description } = req.body
    const exists = await Team.findOne({ name })
    if (exists) return res.status(400).json({ message: 'Team name already taken' })
    const team = await Team.create({
      name, game, description,
      captain: req.user._id,
      members: [req.user._id],
    })
    res.status(201).json(team)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/teams/:id/join
router.put('/:id/join', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (team.members.includes(req.user._id)) return res.status(400).json({ message: 'Already a member' })
    team.members.push(req.user._id)
    await team.save()
    res.json({ message: 'Joined team successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/teams/:id/leave
router.put('/:id/leave', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (team.captain.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Captain cannot leave. Transfer ownership first.' })
    }
    team.members = team.members.filter(m => m.toString() !== req.user._id.toString())
    await team.save()
    res.json({ message: 'Left team successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/teams/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    if (team.captain.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only captain can delete team' })
    await team.deleteOne()
    res.json({ message: 'Team deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
