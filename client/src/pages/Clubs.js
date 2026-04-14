import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Clubs = () => {
  const { user, authHeader } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', overview: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const fetchClubs = async () => {
    try {
      const res = await axios.get('/api/clubs', { headers: authHeader() });
      setClubs(res.data);
    } catch { toast.error('Failed to load clubs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchClubs(); else setLoading(false); }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) return toast.error('Name and description are required');
    setCreating(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (coverFile) data.append('coverImage', coverFile);
      await axios.post('/api/clubs', data, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Club created! 🎉');
      setShowCreate(false);
      setForm({ name: '', description: '', overview: '' });
      setCoverFile(null);
      fetchClubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club');
    } finally { setCreating(false); }
  };

  const filtered = clubs.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const isMember = (club) => club.members?.some(m => m._id === user?._id || m === user?._id);

  if (!user) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50 to-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="font-display text-3xl text-gray-700 mb-2">Login to explore Clubs</h2>
          <p className="text-gray-500">Join communities and grow together.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50/30 to-sage-50/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-gray-800">Health Clubs</h1>
            <p className="text-gray-500 text-sm mt-1">Find your tribe and grow together</p>
          </div>
          <div className="flex gap-3">
            <input type="text" placeholder="Search clubs..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 w-52" />
            <button onClick={() => setShowCreate(true)}
              className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
              + Create Club
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading clubs...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="font-display text-2xl text-gray-600 mb-2">No clubs yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create a health community!</p>
            <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium">Create First Club</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(club => (
              <Link to={`/clubs/${club._id}`} key={club._id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
                {/* Cover */}
                <div className="h-28 bg-gradient-to-br from-teal-100 to-sage-100 flex items-center justify-center overflow-hidden relative">
                  {club.coverImage ? (
                    <img src={`http://localhost:5000${club.coverImage}`} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👥</span>
                  )}
                  {isMember(club) && (
                    <span className="absolute top-2 right-2 bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">✓ Member</span>
                  )}
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 group-hover:text-teal-600 transition-colors">{club.name}</h3>
                  {club.overview && <p className="text-xs text-teal-600 font-medium mt-0.5">{club.overview}</p>}
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{club.description}</p>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {club.host?.avatar ? (
                        <img src={club.host.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-teal-200 flex items-center justify-center text-[10px] text-teal-700">{club.host?.name?.charAt(0)}</div>
                      )}
                      <span className="text-xs text-gray-400">{club.host?.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-auto">👥 {club.members?.length || 0} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Club Modal */}
      {showCreate && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="bg-gradient-to-br from-teal-50 to-sage-50 px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-gray-800">Create a Club</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Club Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Morning Runners"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Overview (tagline)</label>
                <input type="text" value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })}
                  placeholder="e.g. For early risers who love to run"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="What is this club about?"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Cover Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-50 file:text-teal-700 file:text-xs hover:file:bg-teal-100" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clubs;
