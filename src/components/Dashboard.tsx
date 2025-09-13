import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, BarChart3, Settings, Plus, Clock, CheckCircle, Loader2 } from 'lucide-react';

interface DashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    subscription: 'free' | 'premium' | 'professional';
    avatar?: string;
  };
  onNavigate: (page: string) => void;
}

interface UserStats {
  resumes_tailored: number;
  average_match_score: number;
  applications_sent: number;
  recent_activity: Array<{
    id: number;
    action: string;
    time: string;
    status: string;
  }>;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStats();
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/user/${user.id}/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error('Failed to load stats');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Ready to optimize your job applications with AI?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('resume')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tailor Resume</h3>
            <p className="text-gray-600 text-sm">
              Upload your resume and job description to get AI-optimized content
            </p>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              View your application success rates and optimization insights
            </p>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
          >
            <div className="flex items-center justify-between mb-4">
              <Settings className="w-8 h-8 text-gray-600" />
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">
              Manage your profile, preferences, and subscription
            </p>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">Error loading dashboard: {error}</p>
            <button 
              onClick={fetchUserStats}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Overview */}
        {stats && !loading && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Resumes Tailored</h3>
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.resumes_tailored}</div>
                <p className="text-gray-600 text-sm">Total resumes processed</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Average Match Score</h3>
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.average_match_score > 0 ? `${stats.average_match_score}%` : 'N/A'}
                </div>
                <p className="text-gray-600 text-sm">Across all tailored resumes</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Applications Sent</h3>
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.applications_sent}</div>
                <p className="text-gray-600 text-sm">Job applications submitted</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
              {stats.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_activity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{activity.action}</p>
                        <p className="text-gray-600 text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No activity yet. Start by tailoring your first resume!</p>
                  <button
                    onClick={() => onNavigate('resume')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tailor Resume
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};