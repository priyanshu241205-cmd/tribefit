import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CalorieTracker = () => {
  const { authHeader } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ foodName: '', portionSize: '', calories: '', mealType: 'Snack' });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/calories', { headers: authHeader() });
      setRecords(res.data);
    } catch { toast.error('Failed to load calorie records'); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const lookupFood = async () => {
    if (!form.foodName.trim()) return toast.error('Enter a food name first');
    setLookupLoading(true);
    try {
      const res = await axios.get(`/api/calories/lookup?foodName=${encodeURIComponent(form.foodName)}`, { headers: authHeader() });
      setSuggestions(res.data);
      if (res.data.length === 0) toast.error('No calorie data found for this food');
    } catch { toast.error('Lookup failed'); }
    finally { setLookupLoading(false); }
  };

  const selectSuggestion = (s) => {
    setForm({ ...form, calories: s.calories.toString(), portionSize: '100g' });
    setSuggestions([]);
    toast.success(`Found: ${s.calories} kcal per 100g`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.foodName || !form.portionSize || !form.calories) return toast.error('All fields are required');
    setLoading(true);
    try {
      await axios.post('/api/calories', form, { headers: authHeader() });
      toast.success('Meal logged! 🥗');
      setForm({ foodName: '', portionSize: '', calories: '', mealType: 'Snack' });
      setSuggestions([]);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/calories/${id}`, { headers: authHeader() });
      toast.success('Entry deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  const todayTotal = records
    .filter(r => new Date(r.date).toDateString() === new Date().toDateString())
    .reduce((sum, r) => sum + r.calories, 0);

  const mealTypeColor = (m) => ({
    'Breakfast': 'bg-yellow-100 text-yellow-600',
    'Lunch': 'bg-orange-100 text-orange-600',
    'Dinner': 'bg-purple-100 text-purple-600',
    'Snack': 'bg-green-100 text-green-600',
  }[m] || 'bg-gray-100 text-gray-500');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-5">🥗 Log Meal</h3>

        {/* Today total */}
        <div className="bg-orange-50 rounded-xl px-4 py-3 mb-5 border border-orange-100">
          <p className="text-xs text-orange-600 font-medium">Today's Total</p>
          <p className="text-2xl font-bold text-orange-700">{todayTotal} <span className="text-sm font-normal">kcal</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Food Name *</label>
            <div className="flex gap-2">
              <input type="text" value={form.foodName} onChange={e => setForm({ ...form, foodName: e.target.value })}
                placeholder="e.g. Apple, Chicken breast"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              <button type="button" onClick={lookupFood} disabled={lookupLoading}
                className="px-3 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-xs font-medium transition-colors disabled:opacity-60 whitespace-nowrap">
                {lookupLoading ? '...' : '🔍 Lookup'}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                {suggestions.map((s, i) => (
                  <button type="button" key={i} onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-orange-50 border-b border-orange-100 last:border-0 transition-colors">
                    <span className="font-medium">{s.name}</span> — <span className="text-orange-600">{s.calories} kcal/{s.per}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Portion Size *</label>
              <input type="text" value={form.portionSize} onChange={e => setForm({ ...form, portionSize: e.target.value })}
                placeholder="e.g. 100g, 1 cup"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Calories (kcal) *</label>
              <input type="number" min="0" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(m => (
                <button type="button" key={m} onClick={() => setForm({ ...form, mealType: m })}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.mealType === m ? 'bg-orange-400 border-orange-400 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : 'Log Meal'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-4">Food Log</h3>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">🍽️</div><p className="text-sm">No meals logged yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {records.map(r => (
              <div key={r._id} className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-700">{r.foodName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${mealTypeColor(r.mealType)}`}>{r.mealType}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{r.portionSize} · <span className="font-medium text-orange-600">{r.calories} kcal</span></p>
                    <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
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

export default CalorieTracker;
