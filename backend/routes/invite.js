import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import InviteLink from '../models/InviteLink.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/invite/create
// @desc    Admin creates invite link
// @access  Admin only
router.post('/create', protect, authorize('admin'), async (req, res) => {
  try {
    const { label, description, maxUses, expiresInDays } = req.body;

    const inviteData = {
      createdBy: req.user.id,
      metadata: { label, description }
    };

    if (maxUses) inviteData.maxUses = maxUses;
    if (expiresInDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      inviteData.expiresAt = expiryDate;
    }

    const inviteLink = await InviteLink.create(inviteData);

    res.status(201).json({
      success: true,
      inviteLink: {
        id: inviteLink._id,
        code: inviteLink.code,
        url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${inviteLink.code}`,
        isActive: inviteLink.isActive,
        expiresAt: inviteLink.expiresAt,
        maxUses: inviteLink.maxUses,
        usedCount: inviteLink.usedCount,
        metadata: inviteLink.metadata,
        createdAt: inviteLink.createdAt
      }
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invite link',
      error: error.message
    });
  }
});

// @route   GET /api/invite/list
// @desc    Get all invite links (admin only)
// @access  Admin only
router.get('/list', protect, authorize('admin'), async (req, res) => {
  try {
    const Attempt = (await import('../models/Attempt.js')).default;

    const inviteLinks = await InviteLink.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('usedBy.userId', 'name _id');

    const linksWithPerformance = await Promise.all(
      inviteLinks.map(async (link) => {
        // Get user IDs who used this invite
        const userIds = link.usedBy.map(u => u.userId?._id).filter(Boolean);

        // Get performance data for these users
        const topPerformers = await Attempt.aggregate([
          { $match: { userId: { $in: userIds } } },
          {
            $group: {
              _id: '$userId',
              totalAttempts: { $sum: 1 },
              correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } }
            }
          },
          {
            $project: {
              userId: '$_id',
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
          { $sort: { accuracy: -1, totalAttempts: -1 } },
          { $limit: 5 }
        ]);

        // Populate user names for top performers
        const User = (await import('../models/User.js')).default;
        const topPerformersWithNames = await Promise.all(
          topPerformers.map(async (perf) => {
            const user = await User.findById(perf.userId).select('name');
            return {
              ...perf,
              userName: user?.name || 'Unknown'
            };
          })
        );

        return {
          id: link._id,
          code: link.code,
          url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/join/${link.code}`,
          isActive: link.isActive,
          isValid: link.isValid(),
          expiresAt: link.expiresAt,
          maxUses: link.maxUses,
          usedCount: link.usedCount,
          metadata: link.metadata,
          usedBy: link.usedBy,
          createdAt: link.createdAt,
          topPerformers: topPerformersWithNames
        };
      })
    );

    res.json({
      success: true,
      count: linksWithPerformance.length,
      inviteLinks: linksWithPerformance
    });
  } catch (error) {
    console.error('List invites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invite links',
      error: error.message
    });
  }
});

// @route   GET /api/invite/validate/:code
// @desc    Validate invite code
// @access  Public
router.get('/validate/:code', async (req, res) => {
  try {
    const inviteLink = await InviteLink.findOne({ code: req.params.code });

    if (!inviteLink) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    if (!inviteLink.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'This invite link has expired or reached its usage limit'
      });
    }

    res.json({
      success: true,
      valid: true,
      metadata: inviteLink.metadata
    });
  } catch (error) {
    console.error('Validate invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating invite code',
      error: error.message
    });
  }
});

// @route   POST /api/invite/join
// @desc    User joins with name only using invite code
// @access  Public
router.post('/join', async (req, res) => {
  try {
    const { name, inviteCode } = req.body;

    if (!name || !inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and invite code'
      });
    }

    // Validate invite link
    const inviteLink = await InviteLink.findOne({ code: inviteCode });

    if (!inviteLink) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    if (!inviteLink.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'This invite link has expired or reached its usage limit'
      });
    }

    // Generate unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Create user without password
    const user = await User.create({
      name: name.trim(),
      usedInviteCode: inviteCode,
      sessionToken,
      role: 'user',
      lastLogin: new Date()
    });

    // Record invite usage
    await inviteLink.recordUse(user._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    console.error('Join with invite error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This name is already taken. Please choose another name.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error joining with invite code',
      error: error.message
    });
  }
});

// @route   POST /api/invite/quick-login
// @desc    Quick login with session token (for returning users)
// @access  Public
router.post('/quick-login', async (req, res) => {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(400).json({
        success: false,
        message: 'Session token required'
      });
    }

    const user = await User.findOne({ sessionToken, isActive: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session. Please use invite link again.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate new JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    console.error('Quick login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during quick login',
      error: error.message
    });
  }
});

// @route   DELETE /api/invite/:id
// @desc    Deactivate invite link
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const inviteLink = await InviteLink.findById(req.params.id);

    if (!inviteLink) {
      return res.status(404).json({
        success: false,
        message: 'Invite link not found'
      });
    }

    if (inviteLink.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this invite link'
      });
    }

    inviteLink.isActive = false;
    await inviteLink.save();

    res.json({
      success: true,
      message: 'Invite link deactivated'
    });
  } catch (error) {
    console.error('Delete invite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating invite link',
      error: error.message
    });
  }
});

export default router;
