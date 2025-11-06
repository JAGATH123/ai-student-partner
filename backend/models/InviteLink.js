import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteLinkSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null // null means never expires
  },
  maxUses: {
    type: Number,
    default: null // null means unlimited uses
  },
  usedCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    label: String,
    description: String
  }
}, {
  timestamps: true
});

// Check if link is valid
inviteLinkSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  if (this.maxUses && this.usedCount >= this.maxUses) return false;
  return true;
};

// Record link usage
inviteLinkSchema.methods.recordUse = async function(userId) {
  this.usedCount += 1;
  this.usedBy.push({ userId, usedAt: new Date() });
  await this.save();
};

const InviteLink = mongoose.model('InviteLink', inviteLinkSchema);

export default InviteLink;
