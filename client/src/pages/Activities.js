import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import PeriodTracker from '../components/trackers/PeriodTracker';
import WorkoutTracker from '../components/trackers/WorkoutTracker';
import SleepTracker from '../components/trackers/SleepTracker';
import WeightTracker from '../components/trackers/WeightTracker';
import CalorieTracker from '../components/trackers/CalorieTracker';

const quotes = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
  { text: "It is health that is real wealth and not pieces of gold and silver.", author: "Mahatma Gandhi" },
  { text: "To keep the body in good health is a duty, otherwise we shall not be able to keep our mind strong and clear.", author: "Buddha" },
];

const tabs = [
  { id: 'period', label: 'Period', icon: '🌸' },
  { id: 'workout', label: 'Workout', icon: '🏋️' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'weight', label: 'Weight', icon: '⚖️' },
  { id: 'calories', label: 'Calories', icon: '🥗' },
];

const Activities = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workout');
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="font-display text-3xl text-gray-700 mb-2">Login Required</h2>
          <p className="text-gray-500">Please log in to track your activities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50/50 to-sage-50/50">
      {/* Quote Carousel */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-10 px-4">
        <div className="max-w-3xl mx-auto text-center transition-all duration-500">
          <div className="text-3xl mb-3">✨</div>
          <blockquote className="font-display text-xl md:text-2xl italic mb-3 leading-relaxed">
            "{quotes[quoteIndex].text}"
          </blockquote>
          <p className="text-teal-200 text-sm">— {quotes[quoteIndex].author}</p>
          <div className="flex justify-center gap-1.5 mt-5">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                className={`rounded-full transition-all duration-300 ${i === quoteIndex ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-teal-400'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-200'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'period' && <PeriodTracker />}
          {activeTab === 'workout' && <WorkoutTracker />}
          {activeTab === 'sleep' && <SleepTracker />}
          {activeTab === 'weight' && <WeightTracker />}
          {activeTab === 'calories' && <CalorieTracker />}
        </div>
      </div>
    </div>
  );
};

export default Activities;
