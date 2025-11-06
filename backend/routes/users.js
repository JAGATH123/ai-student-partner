import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Attempt from '../models/Attempt.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users/stats
// @desc    Get current user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get overall accuracy
    const totalAttempts = await Attempt.countDocuments({ userId });
    const correctAttempts = await Attempt.countDocuments({ userId, isCorrect: true });
    const overallAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    // Get topics studied
    const topicsStudied = await Progress.countDocuments({ userId, attempts: { $gte: 1 } });

    // Get this week's activity
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekActivity = await Attempt.countDocuments({
      userId,
      timestamp: { $gte: weekAgo }
    });

    // Get performance trend (last 7 days)
    const dailyPerformance = await Attempt.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          date: '$_id',
          total: 1,
          correct: 1,
          accuracy: {
            $multiply: [
              { $divide: ['$correct', '$total'] },
              100
            ]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        overallAccuracy: Math.round(overallAccuracy),
        totalAttempts,
        correctAttempts,
        topicsStudied,
        weekActivity,
        currentStreak: req.user.stats.currentStreak,
        longestStreak: req.user.stats.longestStreak,
        dailyPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard (top performers)
// @access  Private
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const leaderboard = await Attempt.aggregate([
      { $match: { timestamp: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          userId: '$_id',
          totalAttempts: 1,
          correctAnswers: 1,
          accuracy: {
            $multiply: [
              { $divide: ['$correctAnswers', '$totalAttempts'] },
              100
            ]
          }
        }
      },
      { $match: { totalAttempts: { $gte: 10 } } },
      { $sort: { accuracy: -1, totalAttempts: -1 } },
      { $limit: 10 }
    ]);

    // Populate user details
    const userIds = leaderboard.map(l => l.userId);
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const enrichedLeaderboard = leaderboard.map((entry, index) => {
      const user = userMap.get(entry.userId.toString());
      return {
        rank: index + 1,
        userId: entry.userId,
        name: user?.name || 'Unknown',
        avatar: user?.avatar || null,
        totalAttempts: entry.totalAttempts,
        correctAnswers: entry.correctAnswers,
        accuracy: Math.round(entry.accuracy)
      };
    });

    res.json({
      success: true,
      leaderboard: enrichedLeaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
