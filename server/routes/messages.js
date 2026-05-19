const express = require('express')
const router = express.Router()
const Message = require('../models/Message')
const { protect } = require('../middleware/auth')

// GET /api/messages/:teamId
router.get('/:teamId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100)
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/messages
router.post('/', protect, async (req, res) => {
  try {
    const { teamId, content } = req.body
    const message = await Message.create({ team: teamId, sender: req.user._id, content })
    const populated = await message.populate('sender', 'name avatar')
    res.status(201).json(populated)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
