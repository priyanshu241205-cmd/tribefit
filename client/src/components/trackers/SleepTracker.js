import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const SleepTracker = () => {
  const { authHeader } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ sleepTime: '', wakeTime: '', quality: 'Good', wakeups: 0, notes: '' });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/sleep', { headers: authHeader() });
      setRecords(res.data);
    } catch { toast.error('Failed to load sleep records'); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const getDuration = (sleep, wake) => {
    if (!sleep || !wake) return null;
    const diff = (new Date(wake) - new Date(sleep)) / 3600000;
    return diff > 0 ? diff.toFixed(1) : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sleepTime || !form.wakeTime) return toast.error('Sleep and wake times are required');
    setLoading(true);
    try {
      await axios.post('/api/sleep', form, { headers: authHeader() });
      toast.success('Sleep logged! 😴');
      setForm({ sleepTime: '', wakeTime: '', quality: 'Good', wakeups: 0, notes: '' });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/sleep/${id}`, { headers: authHeader() });
      toast.success('Record deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  const qualityColor = (q) => ({
    'Excellent': 'bg-green-100 text-green-600',
    'Good': 'bg-teal-100 text-teal-600',
    'Fair': 'bg-yellow-100 text-yellow-600',
    'Poor': 'bg-red-100 text-red-600',
  }[q] || 'bg-gray-100 text-gray-600');

  const qualityEmoji = (q) => ({ 'Excellent': '🌟', 'Good': '😊', 'Fair': '😐', 'Poor': '😞' }[q] || '💤');

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-5">😴 Log Sleep</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Sleep Time *</label>
            <input type="datetime-local" value={form.sleepTime} onChange={e => setForm({ ...form, sleepTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Wake Time *</label>
            <input type="datetime-local" value={form.wakeTime} onChange={e => setForm({ ...form, wakeTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          {form.sleepTime && form.wakeTime && getDuration(form.sleepTime, form.wakeTime) && (
            <div className="bg-indigo-50 rounded-xl px-4 py-2 text-sm text-indigo-700 font-medium">
              ⏱ Duration: {getDuration(form.sleepTime, form.wakeTime)} hours
            </div>
          )}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Sleep Quality</label>
            <div className="grid grid-cols-4 gap-2">
              {['Poor', 'Fair', 'Good', 'Excellent'].map(q => (
                <button type="button" key={q} onClick={() => setForm({ ...form, quality: q })}
                  className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.quality === q ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}>{qualityEmoji(q)}<br />{q}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Night Wakeups: {form.wakeups}</label>
            <input type="range" min="0" max="10" value={form.wakeups} onChange={e => setForm({ ...form, wakeups: Number(e.target.value) })}
              className="w-full accent-indigo-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="Dreams, disturbances..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : 'Log Sleep'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-4">Sleep History</h3>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">🌙</div><p className="text-sm">No sleep records yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {records.map(r => {
              const dur = getDuration(r.sleepTime, r.wakeTime);
              return (
                <div key={r._id} className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">{dur ? `${dur} hours` : 'Duration unknown'}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${qualityColor(r.quality)}`}>{r.quality}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        🛌 {new Date(r.sleepTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        {' → '}
                        ☀️ {new Date(r.wakeTime).toLocaleTimeString([], { timeStyle: 'short' })}
                      </p>
                      {r.wakeups > 0 && <p className="text-xs text-gray-400">Woke up {r.wakeups}x</p>}
                      {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg ml-2">×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepTracker;
