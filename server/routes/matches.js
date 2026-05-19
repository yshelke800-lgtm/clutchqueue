const express = require('express')
const router = express.Router()
const Match = require('../models/Match')
const { protect, organizerOnly } = require('../middleware/auth')

router.get('/tournament/:tournamentId', async (req, res) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('team1', 'name logo')
      .populate('team2', 'name logo')
      .populate('winner', 'name logo')
      .sort({ round: 1, scheduledAt: 1 })
    res.json(matches)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, organizerOnly, async (req, res) => {
  try {
    const match = await Match.create(req.body)
    res.status(201).json(match)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', protect, organizerOnly, async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(match)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
