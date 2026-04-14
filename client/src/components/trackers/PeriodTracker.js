import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const symptomOptions = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Mood swings', 'Nausea', 'Back pain', 'Breast tenderness'];

const PeriodTracker = () => {
  const { authHeader } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', flow: 'Medium', symptoms: [], notes: '' });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/api/period', { headers: authHeader() });
      setRecords(res.data);
    } catch { toast.error('Failed to load period records'); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const toggleSymptom = (s) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate) return toast.error('Start date is required');
    setLoading(true);
    try {
      await axios.post('/api/period', form, { headers: authHeader() });
      toast.success('Period log saved! 🌸');
      setForm({ startDate: '', endDate: '', flow: 'Medium', symptoms: [], notes: '' });
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/period/${id}`, { headers: authHeader() });
      toast.success('Record deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-pink-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-5 flex items-center gap-2">🌸 Log Period</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Start Date *</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">End Date</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Flow</label>
            <select value={form.flow} onChange={e => setForm({ ...form, flow: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400">
              <option>Light</option><option>Medium</option><option>Heavy</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {symptomOptions.map(s => (
                <button type="button" key={s} onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.symptoms.includes(s) ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-pink-200'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="Any additional notes..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-pink-400 hover:bg-pink-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </div>

      {/* Records */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-display text-xl text-gray-800 mb-4">Recent Logs</h3>
        {records.length === 0 ? (
          <div className="text-center py-10 text-gray-400"><div className="text-4xl mb-2">📋</div><p className="text-sm">No records yet</p></div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {records.map(r => (
              <div key={r._id} className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(r.startDate).toLocaleDateString()} {r.endDate && `→ ${new Date(r.endDate).toLocaleDateString()}`}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      r.flow === 'Heavy' ? 'bg-red-100 text-red-600' : r.flow === 'Light' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>{r.flow} flow</span>
                    {r.symptoms?.length > 0 && <p className="text-xs text-gray-400 mt-1">{r.symptoms.join(', ')}</p>}
                    {r.notes && <p className="text-xs text-gray-500 mt-1 italic">{r.notes}</p>}
                  </div>
                  <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodTracker;
