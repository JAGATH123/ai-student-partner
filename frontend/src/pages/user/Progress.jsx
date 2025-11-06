import { useQuery } from '@tanstack/react-query';
import { progressAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { getMasteryLabel, getMasteryColor, formatDateTime } from '../../lib/utils';

export default function Progress() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-progress'],
    queryFn: progressAPI.getMyProgress
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your progress...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Your Progress
        </h1>
        <p className="text-gray-400 mb-8">Track your learning journey</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <p className="text-gray-400 text-sm mb-1">Total Topics</p>
            <p className="text-3xl font-bold">{data?.data.totalTopics || 0}</p>
          </div>
          <div className="glass-card p-6">
            <p className="text-gray-400 text-sm mb-1">Average Mastery</p>
            <p className="text-3xl font-bold">
              {Math.round((data?.data.averageMastery || 0) * 100)}%
            </p>
          </div>
          <div className="glass-card p-6">
            <p className="text-gray-400 text-sm mb-1">Recent Activity</p>
            <p className="text-3xl font-bold">{data?.data.recentAttempts?.length || 0}</p>
          </div>
        </div>

        {/* Progress by Topic */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Topics Mastery
          </h2>

          {data?.data.progress && data.data.progress.length > 0 ? (
            <div className="space-y-4">
              {data.data.progress.map((prog) => {
                const masteryInfo = getMasteryLabel(prog.mastery);
                return (
                  <motion.div
                    key={prog._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{prog.topicTitle}</h3>
                        <p className="text-sm text-gray-400">{prog.subjectName}</p>
                      </div>
                      <span className={`text-sm font-semibold ${masteryInfo.color}`}>
                        {masteryInfo.label}
                      </span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mastery: {Math.round(prog.mastery * 100)}%</span>
                        <span>
                          {prog.corrects}/{prog.attempts} correct
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getMasteryColor(prog.mastery)}`}
                          style={{ width: `${prog.mastery * 100}%` }}
                        />
                      </div>
                    </div>

                    {prog.lastReview && (
                      <p className="text-xs text-gray-500">
                        Last review: {formatDateTime(prog.lastReview)}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No progress yet. Start taking quizzes to track your learning!</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {data?.data.recentAttempts && data.data.recentAttempts.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {data.data.recentAttempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="flex items-center justify-between p-3 glass-card"
                >
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
