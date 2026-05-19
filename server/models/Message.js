const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)
