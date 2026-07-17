const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    type: {
      type:     String,
      required: [true, 'Type is required'],
      enum: [
        'cooking-class', 'temple-tour', 'village-tour', 'dance-workshop',
        'craft-workshop', 'festival-experience', 'food-tour', 'hiking',
        'photography-tour', 'language-class', 'meditation', 'other',
      ],
    },
    description: { type: String, required: true, maxlength: 3000 },
    coverImage:  { type: String, default: '' },
    images:      { type: [String], default: [] },
    price: {
      amount:   { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'INR' },
      per:      { type: String, enum: ['person', 'group', 'session'], default: 'person' },
    },
    duration: {
      value: { type: Number, required: true },
      unit:  { type: String, enum: ['hours', 'days'], default: 'hours' },
    },
    host: {
      name:  { type: String, default: '' },
      bio:   { type: String, default: '' },
      photo: { type: String, default: '' },
      contact: { type: String, default: '' },
    },
    location: {
      country: { type: String, required: true },
      city:    { type: String, default: '' },
      address: { type: String, default: '' },
      lat:     { type: Number, default: 0 },
      lng:     { type: Number, default: 0 },
    },
    maxGroupSize:   { type: Number, default: 10 },
    languages:      { type: [String], default: ['English'] },
    includes:       { type: [String], default: [] },
    requirements:   { type: [String], default: [] },
    rating: {
      average: { type: Number, default: 0 },
      count:   { type: Number, default: 0 },
    },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    bookingCount:{ type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

experienceSchema.index({ title: 'text', description: 'text' });

const Experience = mongoose.model('Experience', experienceSchema);
module.exports = Experience;
