const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: [true, 'Event title is required'],
      trim:     true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: ['festival', 'concert', 'food-fair', 'religious', 'traditional-performance', 'cultural', 'sports', 'other'],
    },
    description: { type: String, required: true, maxlength: 5000 },
    coverImage:  { type: String, default: '' },
    images:      { type: [String], default: [] },
    startDate:   { type: Date, required: [true, 'Start date is required'] },
    endDate:     { type: Date, required: [true, 'End date is required'] },
    time:        { type: String, default: '' },
    location: {
      country:   { type: String, required: true },
      city:      { type: String, default: '' },
      venue:     { type: String, default: '' },
      address:   { type: String, default: '' },
      lat:       { type: Number, default: 0 },
      lng:       { type: Number, default: 0 },
    },
    price: {
      isFree:   { type: Boolean, default: false },
      amount:   { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
    organizer: {
      name:    { type: String, default: '' },
      website: { type: String, default: '' },
      contact: { type: String, default: '' },
    },
    tags:         { type: [String], default: [] },
    highlights:   { type: [String], default: [] },
    dressCode:    { type: String, default: '' },
    culturalNote: { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
    isFeatured:   { type: Boolean, default: false },
    viewCount:    { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ startDate: 1 });

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
