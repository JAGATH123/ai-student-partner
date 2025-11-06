import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { ArrowLeft, Mail, Calendar, TrendingUp } from 'lucide-react';
import { formatDateTime, getMasteryColor } from '../../lib/utils';

export default function UserDetail() {
  const { userId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminAPI.getUser(userId)
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  const user = data?.data?.user;
  const progress = data?.data?.progress || [];
  const recentAttempts = data?.data?.recentAttempts || [];

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <Link to="/admin/users" className="inline-flex items-center text-cosmic-400 hover:text-cosmic-300 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          User Details
        </h1>

        {/* User Info */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-500 to-cosmic-700 flex items-center justify-center text-2xl mr-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="flex items-center text-sm text-gray-400">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email}
                  </span>
                  <span className="flex items-center text-sm text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {formatDateTime(user?.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              user?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="glass-card p-4">
              <p className="text-sm text-gray-400">Total Attempts</p>
              <p className="text-2xl font-bold">{user?.stats?.totalAttempts || 0}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-gray-400">Correct</p>
              <p className="text-2xl font-bold text-green-400">{user?.stats?.totalCorrect || 0}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-orange-400">{user?.stats?.currentStreak || 0}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-sm text-gray-400">Longest Streak</p>
              <p className="text-2xl font-bold text-purple-400">{user?.stats?.longestStreak || 0}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Topic Progress
          </h2>
          {progress.length > 0 ? (
            <div className="space-y-3">
              {progress.map((prog) => (
                <div key={prog._id} className="glass-card p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{prog.topicTitle}</h3>
                      <p className="text-sm text-gray-400">{prog.subjectName}</p>
                    </div>
                    <span className="text-sm">
                      {prog.corrects}/{prog.attempts}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mastery</span>
                    <span>{Math.round(prog.mastery * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${getMasteryColor(prog.mastery)}`}
                      style={{ width: `${prog.mastery * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No progress data available</p>
          )}
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {recentAttempts.map((attempt) => (
                <div key={attempt._id} className="flex items-center justify-between p-3 glass-card">
                  <div>
                    <p className="font-medium">{attempt.topicId}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(attempt.timestamp)}</p>
                  </div>
                  <div className={`font-semibold ${attempt.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {attempt.isCorrect ? '✓' : '✗'}
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
