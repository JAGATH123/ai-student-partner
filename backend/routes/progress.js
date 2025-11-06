import express from 'express';
import Progress from '../models/Progress.js';
import Attempt from '../models/Attempt.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Load subjects for answer verification
let subjectsData = null;
const loadSubjects = async () => {
  if (!subjectsData) {
    const dataPath = join(__dirname, '../../data/subjects.json');
    const data = await readFile(dataPath, 'utf-8');
    subjectsData = JSON.parse(data);
  }
  return subjectsData;
};

// @route   POST /api/progress/submit-answer
// @desc    Submit an answer and update progress
// @access  Private
router.post('/submit-answer', protect, async (req, res) => {
  try {
    const { topicId, questionId, userAnswer, timeTaken } = req.body;
    const userId = req.user._id;

    // Load subjects to verify answer
    const data = await loadSubjects();
    let correctAnswer = null;
    let topicTitle = null;
    let subjectName = null;

    for (const subject of data.subjects) {
      const topic = subject.topics.find(t => t.topic_id === topicId);
      if (topic) {
        subjectName = subject.subject_name;
        topicTitle = topic.title;
        // Extract question index from questionId
        const qIndex = parseInt(questionId.split('_Q')[1]) - 1;
        correctAnswer = topic.questions[qIndex]?.answer;
        break;
      }
    }

    if (!correctAnswer) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

    // Create attempt record
    const attempt = await Attempt.create({
      userId,
      topicId,
      questionId,
      userAnswer,
      correctAnswer,
      isCorrect,
      timeTaken,
      timestamp: new Date()
    });

    // Update or create progress record
    let progress = await Progress.findOne({ userId, topicId });

    if (!progress) {
      progress = await Progress.create({
        userId,
        topicId,
        subjectName,
        topicTitle,
        mastery: 0.2,
        attempts: 0,
        corrects: 0
      });
    }

    // Update progress with EMA
    const alpha = progress.emaAlpha;
    const newMastery = alpha * (isCorrect ? 1 : 0) + (1 - alpha) * progress.mastery;

    progress.mastery = newMastery;
    progress.attempts += 1;
    progress.corrects += isCorrect ? 1 : 0;
    progress.lastReview = new Date();
    await progress.save();

    // Update user stats
    const user = await User.findById(userId);
    user.stats.totalAttempts += 1;
    user.stats.totalCorrect += isCorrect ? 1 : 0;

    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastStudy = user.stats.lastStudyDate ? new Date(user.stats.lastStudyDate).setHours(0, 0, 0, 0) : null;

    if (lastStudy) {
      const daysDiff = (today - lastStudy) / (1000 * 60 * 60 * 24);
      if (daysDiff === 1) {
        user.stats.currentStreak += 1;
      } else if (daysDiff > 1) {
        user.stats.currentStreak = 1;
      }
    } else {
      user.stats.currentStreak = 1;
    }

    user.stats.longestStreak = Math.max(user.stats.longestStreak, user.stats.currentStreak);
    user.stats.lastStudyDate = new Date();
    await user.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('progress-updated', {
      topicId,
      mastery: progress.mastery,
      attempts: progress.attempts,
      corrects: progress.corrects
    });

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer,
        progress: {
          mastery: progress.mastery,
          attempts: progress.attempts,
          corrects: progress.corrects
        },
        userStats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/my-progress
// @desc    Get current user's progress across all topics
// @access  Private
router.get('/my-progress', protect, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .sort({ mastery: -1 });

    const recentAttempts = await Attempt.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        progress,
        recentAttempts,
        totalTopics: progress.length,
        averageMastery: progress.reduce((acc, p) => acc + p.mastery, 0) / progress.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/topic/:topicId
// @desc    Get progress for a specific topic
// @access  Private
router.get('/topic/:topicId', protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      userId: req.user._id,
      topicId: req.params.topicId
    });

    const attempts = await Attempt.find({
      userId: req.user._id,
      topicId: req.params.topicId
    }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        progress: progress || {
          mastery: 0.2,
          attempts: 0,
          corrects: 0
        },
        attempts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/topic/:topicId/reset
// @desc    Reset progress for a topic
// @access  Private
router.delete('/topic/:topicId/reset', protect, async (req, res) => {
  try {
    await Progress.deleteOne({
      userId: req.user._id,
      topicId: req.params.topicId
    });

    res.json({
      success: true,
      message: 'Topic progress reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
