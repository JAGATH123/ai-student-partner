import express from 'express';
import Progress from '../models/Progress.js';
import Attempt from '../models/Attempt.js';
import { protect } from '../middleware/auth.js';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Load all topic IDs
const getAllTopicIds = async () => {
  const dataPath = join(__dirname, '../../data/subjects.json');
  const data = await readFile(dataPath, 'utf-8');
  const subjects = JSON.parse(data).subjects;

  const topics = [];
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      topics.push({
        topicId: topic.topic_id,
        title: topic.title,
        subjectName: subject.subject_name
      });
    });
  });
  return topics;
};

// @route   GET /api/recommendations
// @desc    Get personalized topic recommendations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { n = 3 } = req.query;

    // Get all topics
    const allTopics = await getAllTopicIds();

    // Get user's progress
    const userProgress = await Progress.find({ userId });
    const progressMap = new Map(userProgress.map(p => [p.topicId, p]));

    // Get recent attempts for recency calculation
    const recentAttempts = await Attempt.find({ userId })
      .sort({ timestamp: -1 })
      .limit(100);

    const now = new Date();
    const scores = [];

    for (const topic of allTopics) {
      const progress = progressMap.get(topic.topicId);
      const mastery = progress ? progress.mastery : 0.2;
      const lastReview = progress ? progress.lastReview : null;

      // Calculate days since last review
      const daysSince = lastReview
        ? (now - new Date(lastReview)) / (1000 * 60 * 60 * 24)
        : 999;

      // Recency factor: older reviews get higher priority
      const recencyFactor = 1 + 0.5 * Math.min(daysSince / 30, 2);

      // Base score: lower mastery = higher priority
      const baseScore = (1 - mastery) * recencyFactor;

      // Get recent performance on this topic
      const topicAttempts = recentAttempts.filter(a => a.topicId === topic.topicId);
      const recentCorrect = topicAttempts.slice(0, 5).filter(a => a.isCorrect).length;
      const recentTotal = Math.min(topicAttempts.length, 5);

      // If struggling recently, boost priority
      const strugglingBonus = recentTotal > 0 && recentCorrect / recentTotal < 0.4 ? 0.3 : 0;

      const finalScore = baseScore + strugglingBonus;

      scores.push({
        topicId: topic.topicId,
        title: topic.title,
        subjectName: topic.subjectName,
        mastery,
        score: finalScore,
        daysSinceLastReview: Math.round(daysSince),
        recentPerformance: recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : null
      });
    }

    // Sort by score descending and get top N
    scores.sort((a, b) => b.score - a.score);
    const recommendations = scores.slice(0, parseInt(n));

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/recommendations/weak-areas
// @desc    Get topics where user is struggling
// @access  Private
router.get('/weak-areas', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find topics with low mastery and recent attempts
    const weakTopics = await Progress.find({
      userId,
      mastery: { $lt: 0.5 },
      attempts: { $gte: 3 }
    })
      .sort({ mastery: 1 })
      .limit(5);

    res.json({
      success: true,
      weakTopics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/recommendations/ready-for-review
// @desc    Get topics that haven't been reviewed recently
// @access  Private
router.get('/ready-for-review', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const reviewTopics = await Progress.find({
      userId,
      mastery: { $gte: 0.5 },
      lastReview: { $lt: sevenDaysAgo }
    })
      .sort({ lastReview: 1 })
      .limit(5);

    res.json({
      success: true,
      reviewTopics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
