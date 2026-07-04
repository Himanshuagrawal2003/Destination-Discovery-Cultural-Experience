const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Destination name is required'],
      trim:     true,
      maxlength:[100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type:   String,
      unique: true,
      lowercase: true,
    },
    country: { type: String, required: [true, 'Country is required'], trim: true },
    city:    { type: String, required: [true, 'City is required'],    trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['beach', 'mountain', 'city', 'desert', 'forest', 'historical', 'adventure', 'cultural', 'wildlife', 'other'],
    },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    history:     { type: String, default: '' },
    culture:     { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    budget: {
      currency: { type: String, default: 'USD' },
      min:      { type: Number, default: 0 },
      max:      { type: Number, default: 0 },
      level:    { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
    },
    bestSeason: {
      type: [String],
      enum: ['spring', 'summer', 'autumn', 'winter', 'year-round'],
      default: ['year-round'],
    },
    coverImage:  { type: String, default: '' },
    images:      { type: [String], default: [] },
    gallery:     { type: [String], default: [] },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },
    openingHours: { type: String, default: '' },
    entryFee: {
      amount:   { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      notes:    { type: String, default: '' },
    },
    highlights:     { type: [String], default: [] },
    travelTips:     { type: [String], default: [] },
    nearbyAttractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    tags:           { type: [String], default: [] },
    isFeatured:     { type: Boolean, default: false },
    isTrending:     { type: Boolean, default: false },
    isActive:       { type: Boolean, default: true },
    viewCount:      { type: Number, default: 0 },
    bookmarkCount:  { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Geospatial index
destinationSchema.index({ location: '2dsphere' });
destinationSchema.index({ country: 1, category: 1 });
destinationSchema.index({ name: 'text', description: 'text', city: 'text', country: 'text' });

// Auto-generate slug from name
destinationSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Destination = mongoose.model('Destination', destinationSchema);
module.exports = Destination;
