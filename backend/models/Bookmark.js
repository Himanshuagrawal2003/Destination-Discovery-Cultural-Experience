const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    itemType: {
      type:     String,
      required: true,
      enum:     ['destination', 'experience', 'event', 'hidden-gem'],
    },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    experience:  { type: mongoose.Schema.Types.ObjectId, ref: 'Experience' },
    event:       { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    hiddenGem:   { type: mongoose.Schema.Types.ObjectId, ref: 'HiddenGem' },
    notes:       { type: String, maxlength: 500, default: '' },
    collection:  { type: String, default: 'Default' },
  },
  { timestamps: true }
);

// One bookmark per user per item
bookmarkSchema.index({ user: 1, destination: 1 }, { unique: true, sparse: true });
bookmarkSchema.index({ user: 1, experience: 1 },  { unique: true, sparse: true });
bookmarkSchema.index({ user: 1, event: 1 },        { unique: true, sparse: true });
bookmarkSchema.index({ user: 1, hiddenGem: 1 },    { unique: true, sparse: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
