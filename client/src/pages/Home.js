import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero_bg.png';

const features = [
  { icon: '🏃', title: 'Workout Tracking', desc: 'Log every session, every rep, every milestone on your fitness journey.' },
  { icon: '😴', title: 'Sleep Analysis', desc: 'Understand your rest patterns and wake up feeling truly restored.' },
  { icon: '🥗', title: 'Calorie Tracker', desc: 'Track nutrition with real food data — no guesswork, just clarity.' },
  { icon: '⚖️', title: 'Weight Trends', desc: 'Visualize your progress over time with clean, insightful charts.' },
  { icon: '🌸', title: 'Period Tracking', desc: 'Compassionate cycle tracking with symptom logs and flow monitoring.' },
  { icon: '👥', title: 'Health Clubs', desc: 'Find your tribe. Join communities, share goals, grow together.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds with email or Google. Your data stays private.' },
  { num: '02', title: 'Log Your Activities', desc: 'Track workouts, sleep, meals, and more from the Activities page.' },
  { num: '03', title: 'View Your Dashboard', desc: 'See beautiful charts and weekly insights about your health trends.' },
  { num: '04', title: 'Join or Create Clubs', desc: 'Connect with like-minded people. Share, support, and grow together.' },
];

const Home = ({ onAuthOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-16">
      {/* ── HERO SECTION ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Soft overlay for text legibility */}
        <div className="absolute inset-0 bg-white/30"></div>

        {/* Hero Card */}
        <div className="relative z-10 mx-4 max-w-xl w-full">
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/80 px-10 py-12 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-xs text-teal-700 font-medium tracking-wide">Your wellness, your tribe</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl text-gray-800 leading-tight mb-4">
              Track. Grow.
              <br />
              <span className="text-teal-600 italic">Thrive.</span>
            </h1>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 font-light">
              TribeFit is your all-in-one health companion — track workouts, sleep, nutrition, and connect with a community that cares.
            </p>

            <button
              onClick={user ? () => navigate('/dashboard') : onAuthOpen}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-medium text-base transition-all duration-300 shadow-lg hover:shadow-teal-300/50 hover:scale-105 active:scale-95"
            >
              {user ? 'Explore Dashboard' : 'Get Started'}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <p className="text-xs text-gray-400 mt-4">Free to join · No credit card required</p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 z-10">
          <span className="text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent animate-bounce"></div>
        </div>
      </section>

      {/* ── FEATURE CAROUSEL ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl text-gray-800 mb-3">Everything you need</h2>
            <p className="text-gray-500 text-base">Six powerful modules, one beautiful app.</p>
          </div>

          {/* Featured card large */}
          <div className="mb-8 rounded-2xl bg-gradient-to-br from-teal-50 to-sage-50 border border-teal-100 p-10 text-center transition-all duration-500">
            <div className="text-6xl mb-4">{features[currentFeature].icon}</div>
            <h3 className="font-display text-2xl text-gray-800 mb-2">{features[currentFeature].title}</h3>
            <p className="text-gray-500 max-w-md mx-auto">{features[currentFeature].desc}</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-10">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFeature(i)}
                className={`rounded-full transition-all duration-300 ${i === currentFeature ? 'w-6 h-2 bg-teal-500' : 'w-2 h-2 bg-teal-200'}`}
              />
            ))}
          </div>

          {/* All features grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                onClick={() => setCurrentFeature(i)}
                className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 ${
                  i === currentFeature
                    ? 'border-teal-400 bg-teal-50 shadow-sm'
                    : 'border-gray-100 bg-gray-50 hover:border-teal-200 hover:bg-teal-50/50'
                }`}
              >
                <div className="text-2xl mb-2">{f.icon}</div>
                <h4 className="text-sm font-semibold text-gray-700">{f.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gradient-to-b from-sage-50 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl text-gray-800 mb-3">How it works</h2>
            <p className="text-gray-500">Simple steps, transformative results.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md shadow-teal-200">
                  <span className="font-display text-white text-sm">{step.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <button
              onClick={user ? () => navigate('/dashboard') : onAuthOpen}
              className="px-10 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-teal-200 hover:scale-105"
            >
              {user ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 pt-14 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-sage-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              <span className="font-display text-lg text-white">TribeFit</span>
            </div>
            <p className="text-sm leading-relaxed">Your all-in-one health monitoring companion. Track, connect, and thrive.</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-teal-400 transition-colors">🏠 Home</a></li>
              <li><a href="/activities" className="hover:text-teal-400 transition-colors">📊 Activities</a></li>
              <li><a href="/clubs" className="hover:text-teal-400 transition-colors">👥 Clubs</a></li>
              <li><a href="/dashboard" className="hover:text-teal-400 transition-colors">📈 Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/activities#workout" className="hover:text-teal-400 transition-colors">🏃 Workout Tracking</a></li>
              <li><a href="/activities#sleep" className="hover:text-teal-400 transition-colors">😴 Sleep Analysis</a></li>
              <li><a href="/activities#calorie" className="hover:text-teal-400 transition-colors">🥗 Calorie Tracker</a></li>
              <li><a href="/activities#period" className="hover:text-teal-400 transition-colors">🌸 Period Tracking</a></li>
              <li><a href="/activities#weight" className="hover:text-teal-400 transition-colors">⚖️ Weight Trends</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://mail.google.com/mail/?view=cm&to=priyanshu.241205@gmail.com" className="hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">📧 priyanshu.241205@gmail.com</a></li>
              <li><a href="https://wa.me/916367490074" className="hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">📱 WhatsApp</a></li>
              <li><a href="tel:+916367490074" className="hover:text-teal-400 transition-colors">📞 Call-6378647883</a></li>
              <li><a href="https://www.tribefit.app" className="hover:text-teal-400 transition-colors" target="_blank" rel="noopener noreferrer">🌐 www.tribefit.app</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs">© 2024 TribeFit. All rights reserved.</p>
          <div className="flex gap-4 text-xs">
            <a href="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
