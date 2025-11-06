import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Users, Activity, Target, BookOpen, TrendingUp, Award, Brain, ChevronDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminAPI.getDashboard
  });

  // Fetch all users for the dropdown
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers({ limit: 1000 })
  });

  // Fetch selected user's details
  const { data: selectedUserData, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user', selectedUserId],
    queryFn: () => adminAPI.getUser(selectedUserId),
    enabled: !!selectedUserId
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-neon-cyan/50"></div>
            <p className="mt-4 text-neon-cyan font-rajdhani tracking-wider animate-pulse">
              &gt; LOADING ADMIN PANEL...
            </p>
          </div>
        </div>
      </>
    );
  }

  const overview = data?.data?.overview || {};
  const users = usersData?.data?.users || [];
  const selectedUser = selectedUserData?.data;

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent font-orbitron">
          ADMIN DASHBOARD
        </h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 border border-neon-cyan/30 hover:border-neon-cyan/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-cyan/30"></div>
            <Users className="w-8 h-8 text-neon-cyan mb-2" />
            <p className="text-gray-400 text-sm font-rajdhani tracking-wider">TOTAL USERS</p>
            <p className="text-3xl font-bold text-neon-cyan font-orbitron">{overview.totalUsers || 0}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 border border-neon-green/30 hover:border-neon-green/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-green/30"></div>
            <Activity className="w-8 h-8 text-neon-green mb-2" />
            <p className="text-gray-400 text-sm font-rajdhani tracking-wider">ACTIVE USERS</p>
            <p className="text-3xl font-bold text-neon-green font-orbitron">{overview.activeUsers || 0}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 border border-neon-purple/30 hover:border-neon-purple/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-purple/30"></div>
            <BookOpen className="w-8 h-8 text-neon-purple mb-2" />
            <p className="text-gray-400 text-sm font-rajdhani tracking-wider">TOTAL ATTEMPTS</p>
            <p className="text-3xl font-bold text-neon-purple font-orbitron">{overview.totalAttempts || 0}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass-card p-6 border border-neon-orange/30 hover:border-neon-orange/50 transition-all relative overflow-hidden"
          >
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-neon-orange/30"></div>
            <Target className="w-8 h-8 text-neon-orange mb-2" />
            <p className="text-gray-400 text-sm font-rajdhani tracking-wider">AVG ACCURACY</p>
            <p className="text-3xl font-bold text-neon-orange font-orbitron">
              {Math.round(overview.averageAccuracy || 0)}%
            </p>
          </motion.div>
        </div>

        {/* User Selection Dropdown */}
        <div className="glass-card p-6 mb-8 border border-neon-cyan/30 relative">
          <div className="absolute -top-3 left-4 bg-cyber-dark px-2 text-neon-cyan text-xs font-orbitron">
            &lt; USER ANALYTICS &gt;
          </div>

          <label className="block text-sm font-rajdhani text-neon-cyan mb-3 tracking-wider">
            SELECT USER TO ANALYZE
          </label>

          <div className="relative">
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="w-full input-field appearance-none cursor-pointer pr-10"
            >
              <option value="">-- Select a user --</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} {user.email ? `(${user.email})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neon-cyan pointer-events-none" />
          </div>
        </div>

        {/* User Analytics Section */}
        {selectedUserId && userLoading && (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-neon-cyan font-rajdhani">Loading user analytics...</p>
          </div>
        )}

        {selectedUserId && selectedUser && !userLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Profile Card */}
            <div className="glass-card p-6 border border-neon-green/30">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-neon-green font-orbitron mb-2">
                    {selectedUser.user.name}
                  </h2>
                  {selectedUser.user.email && (
                    <p className="text-gray-400 font-mono text-sm">{selectedUser.user.email}</p>
                  )}
                  {selectedUser.user.usedInviteCode && (
                    <p className="text-gray-500 font-mono text-xs mt-1">
                      Used Invite: {selectedUser.user.usedInviteCode}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 font-rajdhani">ROLE</p>
                  <p className="text-lg font-bold text-neon-cyan uppercase font-orbitron">
                    {selectedUser.user.role}
                  </p>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 border border-neon-cyan/20">
                  <TrendingUp className="w-6 h-6 text-neon-cyan mb-1" />
                  <p className="text-xs text-gray-400 font-rajdhani">TOTAL TOPICS</p>
                  <p className="text-2xl font-bold text-neon-cyan font-orbitron">
                    {selectedUser.progress?.length || 0}
                  </p>
                </div>

                <div className="glass-card p-4 border border-neon-purple/20">
                  <BookOpen className="w-6 h-6 text-neon-purple mb-1" />
                  <p className="text-xs text-gray-400 font-rajdhani">ATTEMPTS</p>
                  <p className="text-2xl font-bold text-neon-purple font-orbitron">
                    {selectedUser.recentAttempts?.length || 0}
                  </p>
                </div>

                <div className="glass-card p-4 border border-neon-green/20">
                  <Award className="w-6 h-6 text-neon-green mb-1" />
                  <p className="text-xs text-gray-400 font-rajdhani">CORRECT</p>
                  <p className="text-2xl font-bold text-neon-green font-orbitron">
                    {selectedUser.recentAttempts?.filter(a => a.isCorrect).length || 0}
                  </p>
                </div>

                <div className="glass-card p-4 border border-neon-orange/20">
                  <Target className="w-6 h-6 text-neon-orange mb-1" />
                  <p className="text-xs text-gray-400 font-rajdhani">ACCURACY</p>
                  <p className="text-2xl font-bold text-neon-orange font-orbitron">
                    {selectedUser.recentAttempts?.length > 0
                      ? Math.round(
                          (selectedUser.recentAttempts.filter(a => a.isCorrect).length /
                            selectedUser.recentAttempts.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Over Time Chart */}
            {selectedUser.performanceOverTime && selectedUser.performanceOverTime.length > 0 && (
              <div className="glass-card p-6 border border-neon-purple/30">
                <h3 className="text-xl font-bold mb-4 text-neon-purple font-orbitron">
                  PERFORMANCE OVER TIME
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedUser.performanceOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1f2e" />
                    <XAxis
                      dataKey="date"
                      stroke="#888"
                      style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                    />
                    <YAxis
                      stroke="#888"
                      style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0d1117',
                        border: '1px solid #00ffff',
                        borderRadius: '8px',
                        fontFamily: 'Rajdhani'
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Rajdhani' }} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#00ffff"
                      strokeWidth={2}
                      dot={{ fill: '#00ffff', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Accuracy (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#39ff14"
                      strokeWidth={2}
                      dot={{ fill: '#39ff14', r: 4 }}
                      name="Total Attempts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Topic Breakdown Chart */}
            {selectedUser.topicBreakdown && selectedUser.topicBreakdown.length > 0 && (
              <div className="glass-card p-6 border border-neon-green/30">
                <h3 className="text-xl font-bold mb-4 text-neon-green font-orbitron">
                  TOPIC BREAKDOWN
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={selectedUser.topicBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1c1f2e" />
                    <XAxis
                      dataKey="topicId"
                      stroke="#888"
                      style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                    />
                    <YAxis
                      stroke="#888"
                      style={{ fontSize: '12px', fontFamily: 'Rajdhani' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0d1117',
                        border: '1px solid #39ff14',
                        borderRadius: '8px',
                        fontFamily: 'Rajdhani'
                      }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Rajdhani' }} />
                    <Bar
                      dataKey="accuracy"
                      fill="#39ff14"
                      name="Accuracy (%)"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="attempts"
                      fill="#b026ff"
                      name="Attempts"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Topic Mastery List */}
            {selectedUser.progress && selectedUser.progress.length > 0 && (
              <div className="glass-card p-6 border border-neon-cyan/30">
                <h3 className="text-xl font-bold mb-4 text-neon-cyan font-orbitron">
                  TOPIC MASTERY
                </h3>
                <div className="space-y-3">
                  {selectedUser.progress.slice(0, 10).map((prog) => (
                    <div key={prog._id} className="glass-card p-4 border border-neon-cyan/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-neon-cyan font-rajdhani">
                          {prog.topicTitle || prog.topicId}
                        </span>
                        <span className="text-sm text-gray-400 font-mono">
                          {prog.attempts} attempts
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 font-rajdhani">Mastery</span>
                        <span className="text-neon-green font-orbitron">
                          {Math.round(prog.mastery * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-cyber-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all"
                          style={{ width: `${prog.mastery * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Topic Performance Overview (Always Visible) */}
        {data?.data?.topicPerformance && data.data.topicPerformance.length > 0 && (
          <div className="glass-card p-6 border border-neon-purple/30 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-neon-purple font-orbitron">
              OVERALL TOPIC PERFORMANCE
            </h2>
            <div className="space-y-3">
              {data.data.topicPerformance.slice(0, 10).map((topic) => (
                <div key={topic._id} className="glass-card p-4 border border-neon-purple/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-neon-purple font-rajdhani">
                      {topic.topicId || topic._id}
                    </span>
                    <span className="text-sm text-gray-400 font-mono">
                      {topic.totalAttempts} attempts
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400 font-rajdhani">Accuracy</span>
                    <span className="text-neon-orange font-orbitron">
                      {Math.round(topic.accuracy || 0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cyber-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neon-purple to-neon-orange transition-all"
                      style={{ width: `${topic.accuracy || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
