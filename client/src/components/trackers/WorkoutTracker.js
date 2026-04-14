import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const workoutTypes = ['Running', 'Cycling', 'Swimming', 'Yoga', 'Strength Training', 'HIIT', 'Pilates', 'Walking', 'Boxing', 'Custom'];

const WorkoutTracker = () => {
  const { authHeader } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'Running', customType: '', duration: '', intensity: 'Medium', caloriesBurned: '', notes: '', date: new Date().toISOString().split('T')[0] });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/workout', { headers: authHeader() });
      setRecords(res.data);
    } catch { toast.error('Failed to load workouts'); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.duration) return toast.error('Duration is required');
    setLoading(true);
    try {
      const payload = { ...form, type: form.type === 'Custom' ? form.customType : form.type };
      await axios.post('/api/workout', payload, { headers: authHeader() });
      toast.success('Workout logged! 💪');
      setForm({ type: 'Running', customType: '', duration: '', intensity: 'Medium', caloriesBurned: '', notes: '', date: new Date().toISOString().split('T')[0] });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/workout/${id}`, { headers: authHeader() });
      toast.success('Workout deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  const intensityColor = (i) => i === 'High' ? 'bg-red-100 text-red-600' : i === 'Low' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600';

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-5">🏋️ Log Workout</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Workout Type *</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
              {workoutTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {form.type === 'Custom' && (
            <input type="text" placeholder="Enter workout name" value={form.customType}
              onChange={e => setForm({ ...form, customType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Duration (mins) *</label>
              <input type="number" min="1" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Calories Burned</label>
              <input type="number" min="0" value={form.caloriesBurned} onChange={e => setForm({ ...form, caloriesBurned: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Intensity</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map(level => (
                <button type="button" key={level} onClick={() => setForm({ ...form, intensity: level })}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.intensity === level ? 'bg-teal-500 border-teal-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-teal-300'
                  }`}>{level}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="How did it feel?"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : 'Log Workout'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-4">Recent Workouts</h3>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">🏃</div><p className="text-sm">No workouts logged yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {records.map(r => (
              <div key={r._id} className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-700">{r.type}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${intensityColor(r.intensity)}`}>{r.intensity}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">⏱ {r.duration} mins {r.caloriesBurned ? `· 🔥 ${r.caloriesBurned} kcal` : ''}</p>
                    <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                    {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                  </div>
                  <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg ml-2">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
