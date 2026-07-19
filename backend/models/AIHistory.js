const mongoose = require('mongoose');

const aiHistorySchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'recommendation', 'storytelling', 'hidden-gems', 'food-guide',
        'festival-guide', 'cultural-guide', 'language-helper',
        'budget-planner', 'itinerary', 'chatbot', 'route-planner',
      ],
    },
    prompt:     { type: String, required: true },
    response:   { type: String, required: true },
    metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
    tokens:     { type: Number, default: 0 },
    isSaved:    { type: Boolean, default: false },
    title:      { type: String, default: '' },
  },
  { timestamps: true }
);

aiHistorySchema.index({ user: 1, type: 1 });

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);
module.exports = AIHistory;
