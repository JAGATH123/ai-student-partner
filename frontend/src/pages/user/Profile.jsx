import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { User, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-2xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Profile Settings
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  className="input-field pl-11"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  className="input-field pl-11 opacity-50 cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Bio
              </label>
              <textarea
                className="input-field min-h-[100px]"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Avatar URL
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
            </div>

            {/* Stats Display */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4">
                  <p className="text-sm text-gray-400">Total Attempts</p>
                  <p className="text-2xl font-bold">{user?.stats?.totalAttempts || 0}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-gray-400">Correct Answers</p>
                  <p className="text-2xl font-bold">{user?.stats?.totalCorrect || 0}</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-gray-400">Current Streak</p>
                  <p className="text-2xl font-bold">{user?.stats?.currentStreak || 0} days</p>
                </div>
                <div className="glass-card p-4">
                  <p className="text-sm text-gray-400">Longest Streak</p>
                  <p className="text-2xl font-bold">{user?.stats?.longestStreak || 0} days</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
}
