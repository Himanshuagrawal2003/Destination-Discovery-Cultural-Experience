const mongoose = require('mongoose');

const hiddenGemSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type:     String,
      required: [true, 'Description is required'],
      maxlength: 3000,
    },
    image:  { type: String, default: '' },
    images: { type: [String], default: [] },
    travelTips: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'extreme'],
      default: 'easy',
    },
    location: {
      country:     { type: String, required: true },
      city:        { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
      address: { type: String, default: '' },
    },
    bestTime:    { type: String, default: '' },
    whyUnique:   { type: String, default: '' },
    howToGet:    { type: String, default: '' },
    tags:        { type: [String], default: [] },
    isActive:    { type: Boolean, default: true },
    viewCount:   { type: Number, default: 0 },
    rating: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

hiddenGemSchema.index({ name: 'text', description: 'text' });

const HiddenGem = mongoose.model('HiddenGem', hiddenGemSchema);
module.exports = HiddenGem;
