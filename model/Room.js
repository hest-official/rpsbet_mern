const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  game_type: {
    type: Schema.Types.ObjectId,
    ref: 'GameType'
  },
  selected_rps: {
    type: Number,
    default: 0
  },
  game_level: {
    type: Number,
    required: true,
    default: 0
  },
  bet_amount: {
    type: Number,
    default: 0
  },
  pr: {
    type: Number,
    default: 0
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  end_game_type: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    default: ''
  },
  is_private: {
    type: Boolean,
    default: false
  },
  room_password: {
    type: String,
    default: ''
  },
  status: { type: String },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = Room = mongoose.model('rps_rooms', RoomSchema);
