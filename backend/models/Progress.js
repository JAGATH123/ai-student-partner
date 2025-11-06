import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  topicTitle: {
    type: String,
    required: true
  },
  mastery: {
    type: Number,
    default: 0.2,
    min: 0,
    max: 1
  },
  attempts: {
    type: Number,
    default: 0
  },
  corrects: {
    type: Number,
    default: 0
  },
  lastReview: {
    type: Date,
    default: null
  },
  nextReview: {
    type: Date,
    default: null
  },
  // EMA specific
  emaAlpha: {
    type: Number,
    default: 0.3
  },
  // SM2 specific
  easinessFactor: {
    type: Number,
    default: 2.5
  },
  interval: {
    type: Number,
    default: 0
  },
  repetitions: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for faster queries
progressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
