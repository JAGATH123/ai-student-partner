import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { userAPI, recommendationAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { Target, Award, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userAPI.getStats
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationAPI.getRecommendations(3)
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-neon-cyan/50"></div>
            <p className="mt-4 text-neon-cyan font-rajdhani tracking-wider animate-pulse">&gt; INITIALIZING NEURAL INTERFACE...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-2 glitch-text bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta bg-clip-text text-transparent font-orbitron">
              {user?.name?.toUpperCase() || 'USER'}
            </h1>
            <p className="text-neon-cyan/70 font-rajdhani text-lg tracking-wider">
              &gt; NEURAL NETWORK STATUS: <span className="text-neon-green animate-pulse">CONNECTED</span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(57, 255, 20, 0.5)" }}
              className="glass-card p-6 relative overflow-hidden border border-neon-green/30"
            >
              <div className="absolute top-2 right-2 w-3 h-3 bg-neon-green animate-pulse rounded-full"></div>
              <Target className="w-8 h-8 text-neon-green mb-2" />
              <p className="text-gray-400 text-xs font-rajdhani tracking-wider uppercase">ACCURACY</p>
              <p className="text-4xl font-bold text-neon-green font-orbitron animate-glow-pulse">
                {stats?.stats?.overallAccuracy || 0}%
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)" }}
              className="glass-card p-6 relative overflow-hidden border border-neon-cyan/30"
            >
              <div className="absolute top-2 right-2 w-3 h-3 bg-neon-cyan animate-pulse rounded-full"></div>
              <Award className="w-8 h-8 text-neon-cyan mb-2" />
              <p className="text-gray-400 text-xs font-rajdhani tracking-wider uppercase">QUESTIONS</p>
              <p className="text-4xl font-bold text-neon-cyan font-orbitron animate-glow-pulse">
                {stats?.stats?.totalAttempts || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 0, 255, 0.5)" }}
              className="glass-card p-6 relative overflow-hidden border border-neon-magenta/30"
            >
              <div className="absolute top-2 right-2 w-3 h-3 bg-neon-magenta animate-pulse rounded-full"></div>
              <TrendingUp className="w-8 h-8 text-neon-magenta mb-2" />
              <p className="text-gray-400 text-xs font-rajdhani tracking-wider uppercase">TOPICS</p>
              <p className="text-4xl font-bold text-neon-magenta font-orbitron animate-glow-pulse">
                {stats?.stats?.topicsStudied || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 108, 0, 0.5)" }}
              className="glass-card p-6 relative overflow-hidden border border-neon-orange/30"
            >
              <div className="absolute top-2 right-2 w-3 h-3 bg-neon-orange animate-pulse rounded-full"></div>
              <Flame className="w-8 h-8 text-neon-orange mb-2 animate-flicker" />
              <p className="text-gray-400 text-xs font-rajdhani tracking-wider uppercase">STREAK</p>
              <p className="text-4xl font-bold text-neon-orange font-orbitron animate-glow-pulse">
                {stats?.stats?.currentStreak || 0}
                <span className="text-sm ml-1">DAYS</span>
              </p>
            </motion.div>
          </div>

          {/* Recommendations */}
          {recommendations?.recommendations && recommendations.recommendations.length > 0 && (
            <div className="glass-card p-6 mb-8 border border-neon-cyan/30 relative">
              <div className="absolute -top-3 left-6 bg-cyber-dark px-3 text-neon-cyan text-sm font-orbitron">
                &lt; AI RECOMMENDATIONS &gt;
              </div>
              <h2 className="text-2xl font-bold mb-6 text-neon-cyan font-orbitron">SUGGESTED TARGETS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.recommendations.map((rec, idx) => (
                  <motion.div
                    key={rec.topicId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }}
                    className="glass-card p-4 border border-neon-cyan/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-neon-cyan/10 blur-xl"></div>
                    <h3 className="font-semibold mb-1 text-white font-rajdhani text-lg">{rec.title}</h3>
                    <p className="text-sm text-neon-cyan/60 mb-3 font-mono">{rec.subjectName}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1 font-rajdhani">
                        <span className="text-gray-400">MASTERY LEVEL</span>
                        <span className="text-neon-cyan font-bold">{Math.round(rec.mastery * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-cyber-darker rounded-full overflow-hidden border border-neon-cyan/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${rec.mastery * 100}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                          className="h-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-magenta shadow-lg shadow-neon-cyan/50"
                        />
                      </div>
                    </div>
                    <Link to={`/quiz/${rec.topicId}`}>
                      <button className="btn-primary w-full text-sm font-rajdhani tracking-wider">
                        [ INITIATE ]
                      </button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/quiz">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255, 0, 255, 0.4)" }}
                className="glass-card p-8 cursor-pointer border border-neon-magenta/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-magenta/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2 text-neon-magenta font-orbitron">[ START QUIZ ]</h3>
                  <p className="text-gray-400 font-rajdhani">&gt; INITIATE KNOWLEDGE ASSESSMENT</p>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-neon-magenta/30"></div>
              </motion.div>
            </Link>

            <Link to="/progress">
              <motion.div
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)" }}
                className="glass-card p-8 cursor-pointer border border-neon-cyan/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2 text-neon-cyan font-orbitron">[ VIEW PROGRESS ]</h3>
                  <p className="text-gray-400 font-rajdhani">&gt; ACCESS NEURAL ANALYTICS</p>
                </div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-neon-cyan/30"></div>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
