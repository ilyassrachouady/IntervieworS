import React, { useState, useEffect } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Clock, Target, Award, Brain, BarChart, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  completedQuestions: number;
  averageResponseTime: number;
  topPerformingTopics: { topic: string; score: number }[];
  recentScores: { date: string; score: number }[];
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInterviews: 0,
    averageScore: 0,
    completedQuestions: 0,
    averageResponseTime: 0,
    topPerformingTopics: [],
    recentScores: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      // Fetch user's interview data
      const { data: interviews, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data for dashboard stats
      const processedStats = processInterviewData(interviews || []);
      setStats(processedStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processInterviewData = (interviews: any[]): DashboardStats => {
    // This is a mock implementation - replace with real data processing
    return {
      totalInterviews: interviews.length,
      averageScore: 85,
      completedQuestions: interviews.length * 5,
      averageResponseTime: 120,
      topPerformingTopics: [
        { topic: 'React', score: 90 },
        { topic: 'JavaScript', score: 85 },
        { topic: 'System Design', score: 80 },
      ],
      recentScores: [
        { date: '2024-01', score: 75 },
        { date: '2024-02', score: 82 },
        { date: '2024-03', score: 88 },
        { date: '2024-04', score: 85 },
        { date: '2024-05', score: 90 },
      ],
    };
  };

  const performanceChartData = {
    labels: stats.recentScores.map(score => score.date),
    datasets: [
      {
        label: 'Performance Score',
        data: stats.recentScores.map(score => score.score),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const topicsChartData = {
    labels: stats.topPerformingTopics.map(topic => topic.topic),
    datasets: [
      {
        data: stats.topPerformingTopics.map(topic => topic.score),
        backgroundColor: [
          'rgba(124, 58, 237, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(167, 139, 250, 0.8)',
        ],
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Performance Dashboard</h1>
        <p className="text-gray-600">Track your progress and improve your interview skills</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500">Total Interviews</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalInterviews}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500">Average Score</span>
          </div>
          <p className="text-2xl font-bold">{stats.averageScore}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500">Questions Completed</span>
          </div>
          <p className="text-2xl font-bold">{stats.completedQuestions}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500">Avg Response Time</span>
          </div>
          <p className="text-2xl font-bold">{stats.averageResponseTime}s</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <Line data={performanceChartData} options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Performing Topics</h3>
          <div className="aspect-square">
            <Doughnut data={topicsChartData} options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </div>
      </div>

      {/* Practice Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Custom Practice Session</h3>
          <button className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors">
            <Settings className="w-5 h-5" />
            <span>Configure</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Focus
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
              <option>DevOps Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Focus Topics
            </label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>All Topics</option>
              <option>System Design</option>
              <option>Algorithms</option>
              <option>Database Design</option>
            </select>
          </div>
        </div>

        <button className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors">
          Start Custom Practice
        </button>
      </div>
    </div>
  );
}