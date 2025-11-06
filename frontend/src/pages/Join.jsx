import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { inviteAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Join() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const [inviteMetadata, setInviteMetadata] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    validateInviteCode();
  }, [inviteCode]);

  const validateInviteCode = async () => {
    try {
      setValidating(true);
      const response = await inviteAPI.validateCode(inviteCode);
      if (response.valid) {
        setInviteValid(true);
        setInviteMetadata(response.metadata);
      } else {
        setError('Invalid or expired invite link');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await inviteAPI.joinWithInvite({ name, inviteCode });

      // Save session token to localStorage for quick re-login
      localStorage.setItem('sessionToken', response.user.sessionToken || '');

      setAuth(response.user, response.token);
      toast.success(`Welcome, ${response.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-neon-cyan/50"></div>
          <p className="mt-4 text-neon-cyan font-rajdhani tracking-wider animate-pulse">
            &gt; VALIDATING ACCESS CODE...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 border border-neon-magenta/30 relative overflow-hidden">
            <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-neon-magenta"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-neon-magenta"></div>

            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-neon-magenta mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2 text-neon-magenta font-orbitron">
                ACCESS DENIED
              </h1>
              <p className="text-gray-400 font-rajdhani mb-6">
                {error || 'This invite link is invalid or has expired'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                [ GO TO LOGIN ]
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-neon-green"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-neon-green"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="inline-block p-4 bg-gradient-to-br from-neon-cyan via-neon-green to-neon-purple rounded-2xl mb-4 shadow-lg shadow-neon-cyan/50"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2 glitch-text bg-gradient-to-r from-neon-cyan via-neon-green to-neon-purple bg-clip-text text-transparent animate-glow-pulse">
              ACCESS GRANTED
            </h1>
            <p className="text-neon-cyan/70 font-rajdhani text-sm tracking-wider">
              &gt; INVITATION VERIFIED
            </p>
          </div>

          {/* Invite Info */}
          {inviteMetadata && (
            <div className="mb-6 p-4 glass-card rounded-lg border border-neon-green/30 relative">
              <div className="absolute -top-3 left-4 bg-cyber-dark px-2 text-neon-green text-xs font-orbitron">
                &lt; INVITE DETAILS &gt;
              </div>
              {inviteMetadata.label && (
                <p className="text-neon-green font-semibold mb-1 font-rajdhani">
                  {inviteMetadata.label}
                </p>
              )}
              {inviteMetadata.description && (
                <p className="text-gray-400 text-sm font-mono">
                  {inviteMetadata.description}
                </p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-rajdhani text-neon-cyan mb-2 tracking-wider">
                ENTER YOUR NAME
              </label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan" />
                <input
                  type="text"
                  required
                  minLength="2"
                  maxLength="50"
                  className="input-field pl-11"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 font-mono">
                &gt; No password required. Just enter your name to start.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-neon-magenta/10 border border-neon-magenta/30 rounded text-sm text-neon-magenta font-rajdhani">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>[ INITIATE SESSION ]</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-rajdhani">
              <span className="text-neon-cyan/50">///</span> Quick access enabled. Your session will be saved on this device.
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
