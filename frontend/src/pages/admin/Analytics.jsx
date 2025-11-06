import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { BarChart3 } from 'lucide-react';

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics()
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

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Analytics
        </h1>

        {/* Active Users */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2" />
            Engagement Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <p className="text-sm text-gray-400 mb-1">Active Users</p>
              <p className="text-3xl font-bold">{data?.data?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Challenging Topics */}
        {data?.data?.challengingTopics && data.data.challengingTopics.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-4">Most Challenging Topics</h2>
            <div className="space-y-3">
              {data.data.challengingTopics.map((topic) => (
                <div key={topic.topicId} className="glass-card p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{topic.topicId}</span>
                    <span className="text-sm text-gray-400">{topic.attempts} attempts</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span className="text-red-400">{Math.round(topic.accuracy)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-600"
                      style={{ width: `${topic.accuracy}%` }}
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
