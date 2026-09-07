const mongoose = require('mongoose');

const SharedRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    toolId: {
      type: String,
      required: true,
      default: 'mindmap',
    },
    title: {
      type: String,
      default: 'Collaborative Workspace',
    },
    ownerId: {
      type: String,
      default: 'guest',
    },
    accessRole: {
      type: String,
      enum: ['public_edit', 'public_view', 'private'],
      default: 'public_edit',
    },
    dataState: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    version: {
      type: Number,
      default: 1,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SharedRoom || mongoose.model('SharedRoom', SharedRoomSchema);
