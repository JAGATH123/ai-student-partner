import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topicId: {
    type: String,
    required: true,
    index: true
  },
  questionId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for analytics queries
attemptSchema.index({ userId: 1, timestamp: -1 });
attemptSchema.index({ topicId: 1, isCorrect: 1 });

const Attempt = mongoose.model('Attempt', attemptSchema);

export default Attempt;
