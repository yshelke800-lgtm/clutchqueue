const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user)
})

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio, avatar, favoriteGame } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar, favoriteGame },
      { new: true, select: '-password' }
    )
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { game } = req.query
    const filter = { role: 'player' }
    if (game) filter.favoriteGame = game
    const users = await User.find(filter)
      .select('name avatar favoriteGame stats')
      .sort({ 'stats.wins': -1 })
      .limit(50)
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/users/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications')
    res.json(user.notifications.reverse())
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT /api/users/notifications/read
router.put('/notifications/read', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
