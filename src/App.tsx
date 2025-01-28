import React, { useState, useEffect } from 'react';
import { MessageSquare, Upload, Video, Zap, Menu, X, LayoutDashboard } from 'lucide-react';
import { Logo } from './components/Logo';
import { AuthForm } from './components/AuthForm';
import { InterviewSimulator } from './components/InterviewSimulator';
import { Dashboard } from './components/Dashboard';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-secondary/20">
      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowSimulator(false);
    setShowDashboard(false);
  };

  const startPractice = () => {
    if (user) {
      setShowSimulator(true);
      setShowDashboard(false);
    }
  };

  const navigateToDashboard = () => {
    setShowDashboard(true);
    setShowSimulator(false);
  };

  const navigateToHome = () => {
    setShowDashboard(false);
    setShowSimulator(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (showSimulator) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary-light to-white">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-3">
                <Logo className="w-10 h-10 text-primary" />
                <span className="text-2xl font-bold text-gray-900">ProMock</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={navigateToHome}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  Back to Home
                </button>
                <button
                  onClick={navigateToDashboard}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </nav>
        <InterviewSimulator />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary-light to-white">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-3">
                <Logo className="w-10 h-10 text-primary" />
                <span className="text-2xl font-bold text-gray-900">ProMock</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={navigateToHome}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  Back to Home
                </button>
                <button
                  onClick={startPractice}
                  className="px-4 py-2 text-gray-600 hover:text-primary transition-colors"
                >
                  Practice Interview
                </button>
              </div>
            </div>
          </div>
        </nav>
        <Dashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-light to-white">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-secondary">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Logo className="w-10 h-10 text-primary" />
              <span className="text-2xl font-bold text-gray-900">ProMock</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How It Works</a>
              <button
                onClick={navigateToDashboard}
                className="text-gray-600 hover:text-primary transition-colors flex items-center space-x-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-secondary">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">How It Works</a>
                <button
                  onClick={navigateToDashboard}
                  className="text-gray-600 hover:text-primary transition-colors flex items-center space-x-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors w-full text-left"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-32 pb-16 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Logo className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Master Your Interviews with
            <span className="text-primary"> ProMock</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Prepare for your dream job with personalized mock interviews, real-time feedback, and AI-driven insights. Practice with intelligent avatars that simulate real interview scenarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Features */}
      <section id="features" className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Video}
            title="AI-Powered Interviews"
            description="Experience realistic interviews with AI avatars that adapt to your responses and industry."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Smart Analysis"
            description="Get instant feedback on your tone, confidence, and content with advanced AI analysis."
          />
          <FeatureCard
            icon={Upload}
            title="Role-Specific Practice"
            description="Access tailored questions and scenarios based on your target role and industry."
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/20 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Upload Job Description</h3>
              <p className="text-gray-600">Or select from our pre-defined roles</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Practice Interview</h3>
              <p className="text-gray-600">Engage with AI interviewers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Receive Feedback</h3>
              <p className="text-gray-600">Get detailed analysis and tips</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-full mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Improve & Excel</h3>
              <p className="text-gray-600">Track progress and refine skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted by Job Seekers</h2>
          <p className="text-gray-600">Join thousands who have landed their dream jobs</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary/20">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-semibold">Sarah Chen</h4>
                <p className="text-gray-600">Software Engineer at Google</p>
              </div>
            </div>
            <p className="text-gray-600">"The AI feedback helped me identify areas for improvement I hadn't even considered. Landed my dream job after just 2 weeks of practice!"</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary/20">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-semibold">Michael Rodriguez</h4>
                <p className="text-gray-600">Product Manager at Meta</p>
              </div>
            </div>
            <p className="text-gray-600">"The role-specific questions were spot on. The platform helped me feel confident and well-prepared for my actual interviews."</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-secondary/20">
            <div className="flex items-center mb-4">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-semibold">Emily Thompson</h4>
                <p className="text-gray-600">Data Scientist at Amazon</p>
              </div>
            </div>
            <p className="text-gray-600">"The AI avatars made the practice feel incredibly realistic. The instant feedback helped me improve rapidly."</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
          <p className="text-xl mb-8">Start practicing with our AI interview platform today.</p>
          <button 
            onClick={startPractice}
            className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-secondary transition-colors"
          >
            Start Practice Interview
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo className="w-8 h-8 text-primary" />
                <h3 className="font-semibold text-lg">ProMock</h3>
              </div>
              <p className="text-gray-400">Empowering job seekers with AI-driven interview preparation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mock Interviews</li>
                <li>AI Analysis</li>
                <li>Role-Specific Practice</li>
                <li>Progress Tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ProMock. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;