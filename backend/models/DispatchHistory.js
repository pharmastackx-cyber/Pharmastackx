const mongoose = require("mongoose");

const DispatchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.models.DispatchHistory || mongoose.model("DispatchHistory", DispatchHistorySchema);
