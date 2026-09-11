const mongoose = require('mongoose');

const FormProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fields: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.FormProfile || mongoose.model('FormProfile', FormProfileSchema);
