import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      setAuth(response.user, response.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 relative overflow-hidden">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-neon-magenta"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-neon-magenta"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-neon-cyan"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-neon-cyan"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-block p-4 bg-gradient-to-br from-neon-magenta to-neon-cyan rounded-2xl mb-4 shadow-lg shadow-neon-magenta/50"
            >
              <span className="text-4xl">🚀</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2 glitch-text bg-gradient-to-r from-neon-magenta via-neon-purple to-neon-cyan bg-clip-text text-transparent animate-glow-pulse">
              NEW USER INIT
            </h1>
            <p className="text-neon-magenta/70 font-rajdhani text-sm tracking-wider">
              &gt; ESTABLISHING NEURAL CONNECTION
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input-field pl-11"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-11"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength="6"
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 font-rajdhani">
              <span className="text-neon-magenta/50">///</span> EXISTING USER? {' '}
              <Link
                to="/login"
                className="text-neon-cyan hover:text-neon-magenta font-semibold transition-colors duration-300 font-orbitron"
              >
                [ ACCESS SYSTEM ]
              </Link>
            </p>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-magenta to-transparent animate-scan"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
