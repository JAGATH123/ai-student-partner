import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Attempt from '../models/Attempt.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({
      role: 'user',
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    const totalAttempts = await Attempt.countDocuments();
    const totalQuestions = await Attempt.distinct('questionId').then(arr => arr.length);

    // Get recent activity
    const recentAttempts = await Attempt.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('userId', 'name email avatar');

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          role: 'user'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get topic performance
    const topicPerformance = await Attempt.aggregate([
      {
        $group: {
          _id: '$topicId',
          totalAttempts: { $sum: 1 },
          correctAttempts: {
            $sum: { $cond: ['$isCorrect', 1, 0] }
          }
        }
      },
      {
        $project: {
          topicId: '$_id',
          totalAttempts: 1,
          correctAttempts: 1,
          accuracy: {
            $multiply: [
              { $divide: ['$correctAttempts', '$totalAttempts'] },
              100
            ]
          }
        }
      },
      { $sort: { totalAttempts: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalAttempts,
          totalQuestions,
          averageAccuracy: topicPerformance.reduce((acc, t) => acc + t.accuracy, 0) / topicPerformance.length || 0
        },
        recentAttempts,
        userGrowth,
        topicPerformance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get detailed user profile with progress
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's progress across all topics
    const progress = await Progress.find({ userId: req.params.id })
      .sort({ mastery: -1 });

    // Get user's recent attempts
    const recentAttempts = await Attempt.find({ userId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(20);

    // Get performance over time
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const performanceOverTime = await Attempt.aggregate([
      {
        $match: {
          userId: user._id,
          timestamp: { $gte: thirtyDaysAgo }
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

    // Get topic breakdown
    const topicBreakdown = await Attempt.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$topicId',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          topicId: '$_id',
          attempts: 1,
          correct: 1,
          accuracy: {
            $multiply: [
              { $divide: ['$correct', '$attempts'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        progress,
        recentAttempts,
        performanceOverTime,
        topicBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/toggle-status
// @desc    Activate/Deactivate user
// @access  Private/Admin
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Emit socket event to notify user
    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('account-status-changed', {
      isActive: user.isActive
    });

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user and all associated data
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete all associated data
    await Progress.deleteMany({ userId: req.params.id });
    await Attempt.deleteMany({ userId: req.params.id });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get comprehensive analytics
// @access  Private/Admin
router.get('/analytics/overview', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // Engagement metrics
    const activeUsers = await Attempt.aggregate([
      { $match: { timestamp: { $gte: daysAgo } } },
      { $group: { _id: '$userId' } },
      { $count: 'total' }
    ]);

    // Study time distribution
    const studyTimeDistribution = await Attempt.aggregate([
      { $match: { timestamp: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most challenging topics
    const challengingTopics = await Attempt.aggregate([
      { $match: { timestamp: { $gte: daysAgo } } },
      {
        $group: {
          _id: '$topicId',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      {
        $project: {
          topicId: '$_id',
          attempts: 1,
          accuracy: {
            $multiply: [
              { $divide: ['$correct', '$attempts'] },
              100
            ]
          }
        }
      },
      { $match: { attempts: { $gte: 5 } } },
      { $sort: { accuracy: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        activeUsers: activeUsers[0]?.total || 0,
        studyTimeDistribution,
        challengingTopics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
