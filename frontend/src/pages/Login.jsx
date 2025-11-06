import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      setAuth(response.user, response.token);
      toast.success('Welcome back!');
      navigate(response.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      console.error('Login error:', error);
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
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-neon-cyan"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-neon-cyan"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-neon-magenta"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-neon-magenta"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-block p-4 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-2xl mb-4 shadow-lg shadow-neon-cyan/50"
            >
              <span className="text-4xl">🧠</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-2 glitch-text bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-purple bg-clip-text text-transparent animate-glow-pulse">
              NEURAL ACCESS
            </h1>
            <p className="text-neon-cyan/70 font-rajdhani text-sm tracking-wider">
              &gt; AUTHENTICATE TO ENTER THE GRID
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 glass-card rounded-lg text-sm space-y-2 border border-neon-cyan/30 relative">
            <div className="absolute -top-3 left-4 bg-cyber-dark px-2 text-neon-cyan text-xs font-orbitron">
              &lt; DEMO ACCESS &gt;
            </div>
            <p className="text-neon-cyan/80 font-semibold mb-2 font-rajdhani flex items-center">
              <span className="inline-block w-2 h-2 bg-neon-green animate-pulse mr-2"></span>
              SYSTEM CREDENTIALS
            </p>
            <p className="text-gray-400 font-mono text-xs">
              ADMIN: <span className="text-neon-cyan">admin@aistudent.com</span> / <span className="text-neon-magenta">admin123</span>
            </p>
            <p className="text-gray-400 font-mono text-xs">
              USER: <span className="text-neon-cyan">john@example.com</span> / <span className="text-neon-magenta">password123</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="input-field pl-11"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
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
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 font-rajdhani">
              <span className="text-neon-cyan/50">///</span> NEW USER? {' '}
              <Link
                to="/register"
                className="text-neon-magenta hover:text-neon-cyan font-semibold transition-colors duration-300 font-orbitron"
              >
                [ REGISTER NOW ]
              </Link>
            </p>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scan"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
