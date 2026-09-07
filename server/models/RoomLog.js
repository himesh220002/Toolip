const mongoose = require('mongoose');

const RoomLogSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    toolId: {
      type: String,
      default: 'mindmap',
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    action: {
      type: String,
      enum: ['create', 'join', 'state_save', 'commit', 'node_add', 'node_update', 'node_delete', 'edge_add', 'edge_delete', 'bulk_update'],
      default: 'state_save',
    },
    summary: {
      type: String,
      default: '',
    },
    commitMessage: {
      type: String,
      default: '',
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    nodeId: {
      type: String,
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-room history queries
RoomLogSchema.index({ roomId: 1, createdAt: -1 });
RoomLogSchema.index({ roomId: 1, userId: 1 });

module.exports = mongoose.models.RoomLog || mongoose.model('RoomLog', RoomLogSchema);
