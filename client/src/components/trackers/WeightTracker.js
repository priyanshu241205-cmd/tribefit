import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const WeightTracker = () => {
  const { authHeader } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ weight: '', unit: 'kg', notes: '', date: new Date().toISOString().split('T')[0] });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/weight', { headers: authHeader() });
      setRecords(res.data);
    } catch { toast.error('Failed to load weight records'); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight) return toast.error('Weight is required');
    setLoading(true);
    try {
      await axios.post('/api/weight', form, { headers: authHeader() });
      toast.success('Weight logged! ⚖️');
      setForm({ weight: '', unit: 'kg', notes: '', date: new Date().toISOString().split('T')[0] });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/weight/${id}`, { headers: authHeader() });
      toast.success('Record deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  const getTrend = () => {
    if (records.length < 2) return null;
    const latest = records[0].weight;
    const prev = records[1].weight;
    const diff = (latest - prev).toFixed(1);
    return { diff, up: diff > 0 };
  };

  const trend = getTrend();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-sage-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-5">⚖️ Log Weight</h3>

        {trend && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${trend.up ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
            {trend.up ? '↑' : '↓'} {Math.abs(trend.diff)} {records[0]?.unit} since last entry
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Weight *</label>
            <div className="flex gap-2">
              <input type="number" step="0.1" min="1" value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                placeholder="0.0"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </select>
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
              rows={2} placeholder="Post-workout, morning weight..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-sage-500 hover:bg-sage-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            style={{ backgroundColor: '#6ea055' }}>
            {loading ? 'Saving...' : 'Log Weight'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-4">Weight History</h3>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">📊</div><p className="text-sm">No weight entries yet</p></div>
        ) : (
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {records.map((r, idx) => {
              const prev = records[idx + 1];
              const diff = prev ? (r.weight - prev.weight).toFixed(1) : null;
              return (
                <div key={r._id} className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold text-gray-800">{r.weight} <span className="text-sm font-normal text-gray-500">{r.unit}</span></p>
                      <p className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString()}</p>
                      {diff !== null && (
                        <span className={`text-xs ${Number(diff) > 0 ? 'text-orange-500' : Number(diff) < 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {Number(diff) > 0 ? '↑' : Number(diff) < 0 ? '↓' : '→'} {Math.abs(diff)} {r.unit}
                        </span>
                      )}
                      {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg">×</button>
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

export default WeightTracker;
