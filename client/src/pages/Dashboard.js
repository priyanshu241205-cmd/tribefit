import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const { user, authHeader } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [calories, setCalories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [w, s, wt, c] = await Promise.all([
          axios.get('/api/workout', { headers: authHeader() }),
          axios.get('/api/sleep', { headers: authHeader() }),
          axios.get('/api/weight', { headers: authHeader() }),
          axios.get('/api/calories', { headers: authHeader() }),
        ]);
        setWorkouts(w.data);
        setSleepData(s.data);
        setWeightData(wt.data);
        setCalories(c.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="font-display text-3xl text-gray-700 mb-2">Login to view Dashboard</h2>
          <p className="text-gray-500">Your health insights are waiting.</p>
        </div>
      </div>
    );
  }

  // Last 7 workouts
  const last7Workouts = workouts.slice(0, 7).reverse();
  const workoutChartData = {
    labels: last7Workouts.map(w => new Date(w.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Duration (mins)',
      data: last7Workouts.map(w => w.duration),
      backgroundColor: 'rgba(20, 184, 166, 0.2)',
      borderColor: '#14b8a6',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#14b8a6',
    }],
  };

  // Last 7 sleep records
  const last7Sleep = sleepData.slice(0, 7).reverse();
  const sleepChartData = {
    labels: last7Sleep.map(s => new Date(s.date).toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      label: 'Hours Slept',
      data: last7Sleep.map(s => {
        const diff = (new Date(s.wakeTime) - new Date(s.sleepTime)) / 3600000;
        return diff > 0 ? parseFloat(diff.toFixed(1)) : 0;
      }),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
    }],
  };

  // Last 10 weight entries
  const last10Weight = weightData.slice(0, 10).reverse();
  const weightChartData = {
    labels: last10Weight.map(w => new Date(w.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: `Weight (${last10Weight[0]?.unit || 'kg'})`,
      data: last10Weight.map(w => w.weight),
      backgroundColor: 'rgba(110, 160, 85, 0.2)',
      borderColor: '#6ea055',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#6ea055',
    }],
  };

  const chartOptions = (yLabel) => ({
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: false, grid: { color: '#f0fdfa' }, ticks: { font: { size: 11 } }, title: { display: true, text: yLabel, font: { size: 11 } } },
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    },
  });

  // Weekly stats
  const thisWeekWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return d >= weekAgo;
  });
  const totalWorkoutMins = thisWeekWorkouts.reduce((s, w) => s + w.duration, 0);
  const avgSleep = sleepData.slice(0, 7).reduce((sum, s) => {
    const h = (new Date(s.wakeTime) - new Date(s.sleepTime)) / 3600000;
    return sum + (h > 0 ? h : 0);
  }, 0) / (sleepData.slice(0, 7).length || 1);

  const todayCalories = calories.filter(c => new Date(c.date).toDateString() === new Date().toDateString()).reduce((s, c) => s + c.calories, 0);

  // Calendar – last 30 days with emojis
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });

  const getEmoji = (date) => {
    const ds = date.toDateString();
    const hasWorkout = workouts.some(w => new Date(w.date).toDateString() === ds);
    const hasSleep = sleepData.some(s => new Date(s.date).toDateString() === ds);
    const hasCalorie = calories.some(c => new Date(c.date).toDateString() === ds);
    if (hasWorkout && hasSleep) return '🌟';
    if (hasWorkout) return '💪';
    if (hasSleep) return '😴';
    if (hasCalorie) return '🥗';
    return null;
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50/30 to-sage-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-gray-800">
            Hello, {user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your health overview</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Workouts This Week', value: thisWeekWorkouts.length, sub: `${totalWorkoutMins} mins total`, icon: '🏋️', color: 'border-teal-200 bg-teal-50' },
            { label: 'Avg Sleep (7d)', value: `${avgSleep.toFixed(1)}h`, sub: 'per night', icon: '😴', color: 'border-indigo-200 bg-indigo-50' },
            { label: "Today's Calories", value: todayCalories, sub: 'kcal consumed', icon: '🥗', color: 'border-orange-200 bg-orange-50' },
            { label: 'Weight Entries', value: weightData.length, sub: weightData[0] ? `Latest: ${weightData[0].weight}${weightData[0].unit}` : 'No entries yet', icon: '⚖️', color: 'border-sage-200 bg-sage-50' },
          ].map((s, i) => (
            <div key={i} className={`rounded-2xl border p-5 ${s.color}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Workout Duration (last 7)</h3>
            {last7Workouts.length > 0 ? <Line data={workoutChartData} options={chartOptions('mins')} /> : <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No workout data yet</div>}
          </div>
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Sleep Hours (last 7)</h3>
            {last7Sleep.length > 0 ? <Line data={sleepChartData} options={chartOptions('hours')} /> : <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No sleep data yet</div>}
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm md:col-span-2">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Weight Trend (last 10)</h3>
            {last10Weight.length > 0 ? <Line data={weightChartData} options={chartOptions(last10Weight[0]?.unit || 'kg')} /> : <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No weight data yet</div>}
          </div>
        </div>

        {/* Activity Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">Activity Calendar (last 30 days)</h3>
          <div className="grid grid-cols-10 gap-2">
            {calendarDays.map((day, i) => {
              const emoji = getEmoji(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} title={day.toDateString()}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all ${
                    isToday ? 'ring-2 ring-teal-400 bg-teal-50' : emoji ? 'bg-teal-50' : 'bg-gray-50'
                  }`}>
                  <span className="text-base leading-none">{emoji || '·'}</span>
                  <span className="text-gray-300 text-[9px] mt-0.5">{day.getDate()}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-400">
            <span>💪 Workout</span><span>😴 Sleep</span><span>🥗 Food</span><span>🌟 Both</span>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-teal-50 to-sage-50 rounded-2xl border border-teal-100 p-6">
          <h3 className="font-display text-xl text-gray-800 mb-4">Weekly Insights ✨</h3>
          <div className="space-y-3">
            {thisWeekWorkouts.length >= 3
              ? <p className="text-sm text-teal-700 bg-teal-100 rounded-xl px-4 py-2.5">🎉 Great job! You've worked out {thisWeekWorkouts.length} times this week.</p>
              : <p className="text-sm text-orange-700 bg-orange-50 rounded-xl px-4 py-2.5">💡 Aim for at least 3 workouts per week. You've done {thisWeekWorkouts.length} so far.</p>
            }
            {avgSleep >= 7
              ? <p className="text-sm text-indigo-700 bg-indigo-50 rounded-xl px-4 py-2.5">🌙 Your average sleep of {avgSleep.toFixed(1)} hours is on track. Keep it up!</p>
              : avgSleep > 0
              ? <p className="text-sm text-orange-700 bg-orange-50 rounded-xl px-4 py-2.5">😴 Your average sleep is {avgSleep.toFixed(1)} hours. Adults need 7–9 hours for optimal health.</p>
              : null
            }
            {weightData.length >= 2 && (() => {
              const diff = (weightData[0].weight - weightData[1].weight).toFixed(1);
              return Number(diff) < 0
                ? <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5">📉 Weight trend: down {Math.abs(diff)} {weightData[0].unit} since last entry. Steady progress!</p>
                : Number(diff) > 0
                ? <p className="text-sm text-yellow-700 bg-yellow-50 rounded-xl px-4 py-2.5">📈 Weight is up {diff} {weightData[0].unit} since last entry. Stay consistent!</p>
                : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
