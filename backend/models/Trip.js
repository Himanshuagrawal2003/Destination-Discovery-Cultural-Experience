const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Trip name is required'],
      trim:     true,
      maxlength: [120, 'Trip name cannot exceed 120 characters'],
    },
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    startDate: { type: Date },
    endDate:   { type: Date },
    days:      { type: Number, min: 1, max: 365, default: 1 },
    budget: {
      total:    { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      breakdown: {
        accommodation: { type: Number, default: 0 },
        transport:     { type: Number, default: 0 },
        food:          { type: Number, default: 0 },
        activities:    { type: Number, default: 0 },
        shopping:      { type: Number, default: 0 },
        emergency:     { type: Number, default: 0 },
        other:         { type: Number, default: 0 },
      },
    },
    itinerary: [
      {
        day:    { type: Number, required: true },
        date:   { type: Date },
        title:  { type: String, default: '' },
        activities: [
          {
            time:        { type: String },
            title:       { type: String, required: true },
            description: { type: String, default: '' },
            type:        { type: String, enum: ['sightseeing', 'food', 'transport', 'accommodation', 'activity', 'other'], default: 'activity' },
            location:    { type: String, default: '' },
            cost:        { type: Number, default: 0 },
            notes:       { type: String, default: '' },
          },
        ],
        accommodation: { type: String, default: '' },
        notes:         { type: String, default: '' },
      },
    ],
    transport: {
      type:    { type: String, enum: ['flight', 'train', 'bus', 'car', 'ship', 'mixed'], default: 'mixed' },
      details: { type: String, default: '' },
    },
    travelStyle: {
      type:    String,
      enum:    ['solo', 'couple', 'family', 'group'],
      default: 'solo',
    },
    groupSize:   { type: Number, default: 1 },
    notes:       { type: String, maxlength: 5000, default: '' },
    coverImage:  { type: String, default: '' },
    isPublic:    { type: Boolean, default: false },
    isAIGenerated:{ type: Boolean, default: false },
    status: {
      type: String,
      enum: ['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'planning',
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;
