const mongoose = require('mongoose');

const FormProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fields: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.FormProfile || mongoose.model('FormProfile', FormProfileSchema);
