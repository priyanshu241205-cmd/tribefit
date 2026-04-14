import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ClubDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authHeader } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [joining, setJoining] = useState(false);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', description: '', dateTime: '' });
  const [addingEvent, setAddingEvent] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchClub = async () => {
    try {
      const res = await axios.get(`/api/clubs/${id}`, { headers: authHeader() });
      setClub(res.data);
    } catch { toast.error('Club not found'); navigate('/clubs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchClub(); }, [id, user]);
  useEffect(() => { if (activeTab === 'discussions') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [club?.discussions, activeTab]);

  if (!user) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center"><div className="text-6xl mb-3">🔐</div><p className="text-gray-500">Please log in to view clubs</p></div>
    </div>
  );

  if (loading) return <div className="pt-16 min-h-screen flex items-center justify-center text-gray-400">Loading club...</div>;
  if (!club) return null;

  const isMember = club.members?.some(m => m._id === user._id || m === user._id);
  const isHost = club.host?._id === user._id || club.host === user._id;

  const handleJoin = async () => {
    setJoining(true);
    try {
      await axios.post(`/api/clubs/${id}/join`, {}, { headers: authHeader() });
      toast.success('Joined the club! 🎉');
      fetchClub();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(false); }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`/api/clubs/${id}/leave`, {}, { headers: authHeader() });
      toast.success('Left the club');
      fetchClub();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to leave'); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!message.trim() && !imageFile) return toast.error('Write something or add an image');
    setPosting(true);
    try {
      const data = new FormData();
      if (message) data.append('text', message);
      if (imageFile) data.append('image', imageFile);
      await axios.post(`/api/clubs/${id}/discussions`, data, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      setMessage('');
      setImageFile(null);
      fetchClub();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post'); }
    finally { setPosting(false); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.description || !eventForm.dateTime) return toast.error('All event fields are required');
    setAddingEvent(true);
    try {
      await axios.post(`/api/clubs/${id}/events`, eventForm, { headers: authHeader() });
      toast.success('Event added! 📅');
      setEventForm({ title: '', description: '', dateTime: '' });
      setShowEventForm(false);
      fetchClub();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add event'); }
    finally { setAddingEvent(false); }
  };

  const markEventDone = async (eventId) => {
    try {
      await axios.patch(`/api/clubs/${id}/events/${eventId}/complete`, {}, { headers: authHeader() });
      toast.success('Event marked complete ✅');
      fetchClub();
    } catch { toast.error('Failed to update event'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    ...(isMember ? [
      { id: 'discussions', label: 'Discussions', icon: '💬' },
      { id: 'events', label: 'Events', icon: '📅' },
      { id: 'members', label: 'Members', icon: '👥' },
    ] : []),
  ];

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-teal-50/30 to-sage-50/30">
      {/* Club Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="h-40 bg-gradient-to-br from-teal-200 to-sage-200 overflow-hidden relative">
          {club.coverImage
            ? <img src={`http://localhost:5000${club.coverImage}`} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl">👥</div>
          }
        </div>
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl text-gray-800">{club.name}</h1>
              {club.overview && <p className="text-teal-600 text-sm font-medium mt-0.5">{club.overview}</p>}
              <p className="text-gray-500 text-sm mt-1">👥 {club.members?.length || 0} members · Host: {club.host?.name}</p>
            </div>
            <div>
              {!isMember ? (
                <button onClick={handleJoin} disabled={joining}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-60">
                  {joining ? 'Joining...' : 'Join Club'}
                </button>
              ) : !isHost ? (
                <button onClick={handleLeave} className="px-6 py-2.5 border border-gray-200 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 rounded-xl text-sm font-medium transition-colors">
                  Leave Club
                </button>
              ) : (
                <span className="px-4 py-2 bg-teal-100 text-teal-700 rounded-xl text-sm font-medium">👑 Host</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
            {!isMember && (
              <div className="flex items-center ml-4 text-xs text-gray-400 italic">Join to unlock Discussions, Events & Members</div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">About this Club</h3>
              <p className="text-gray-600 leading-relaxed">{club.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-2xl border border-teal-100 p-5">
                <p className="text-xs text-teal-600 font-medium">Members</p>
                <p className="text-3xl font-bold text-teal-700 mt-1">{club.members?.length || 0}</p>
              </div>
              <div className="bg-sage-50 rounded-2xl border border-sage-100 p-5" style={{ backgroundColor: '#f8faf5', borderColor: '#d8e5cb' }}>
                <p className="text-xs font-medium" style={{ color: '#567f41' }}>Events</p>
                <p className="text-3xl font-bold mt-1" style={{ color: '#436234' }}>{club.events?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* DISCUSSIONS */}
        {activeTab === 'discussions' && isMember && (
          <div className="flex flex-col gap-4">
            {/* Messages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm max-h-[480px] overflow-y-auto">
              {club.discussions?.length === 0 ? (
                <div className="text-center py-16 text-gray-300"><div className="text-5xl mb-3">💬</div><p>Be the first to post!</p></div>
              ) : (
                <div className="space-y-4">
                  {club.discussions.map((d, i) => {
                    const isMe = d.user?._id === user._id;
                    return (
                      <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center text-sm font-semibold text-teal-700 flex-shrink-0 overflow-hidden">
                          {d.user?.avatar ? <img src={d.user.avatar} alt="" className="w-full h-full object-cover" /> : d.user?.name?.charAt(0)}
                        </div>
                        <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          {!isMe && <p className="text-xs text-gray-400 font-medium">{d.user?.name}</p>}
                          {d.text && (
                            <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                              {d.text}
                            </div>
                          )}
                          {d.image && (
                            <img src={`http://localhost:5000${d.image}`} alt="post" className="max-w-xs rounded-2xl border border-gray-100" />
                          )}
                          <p className="text-xs text-gray-300">{new Date(d.createdAt).toLocaleTimeString([], { timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Post input */}
            <form onSubmit={handlePost} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Write a message..."
                rows={2}
                className="w-full text-sm text-gray-700 resize-none focus:outline-none placeholder-gray-300 mb-3" />
              <div className="flex items-center justify-between">
                <label className="cursor-pointer text-xs text-gray-400 hover:text-teal-500 transition-colors flex items-center gap-1.5">
                  📷 {imageFile ? imageFile.name.slice(0, 20) + '...' : 'Add image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files[0])} />
                </label>
                <button type="submit" disabled={posting}
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
                  {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* EVENTS */}
        {activeTab === 'events' && isMember && (
          <div className="space-y-4">
            {isHost && (
              <div>
                {!showEventForm ? (
                  <button onClick={() => setShowEventForm(true)}
                    className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">
                    + Add Event
                  </button>
                ) : (
                  <form onSubmit={handleAddEvent} className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">New Event</h3>
                    <div className="space-y-3">
                      <input type="text" placeholder="Event title *" value={eventForm.title}
                        onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
                      <textarea placeholder="Event description *" value={eventForm.description}
                        onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                        rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
                      <input type="datetime-local" value={eventForm.dateTime}
                        onChange={e => setEventForm({ ...eventForm, dateTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400" />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button type="button" onClick={() => setShowEventForm(false)}
                        className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                      <button type="submit" disabled={addingEvent}
                        className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-60">
                        {addingEvent ? 'Adding...' : 'Add Event'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {club.events?.length === 0 ? (
              <div className="text-center py-16 text-gray-300"><div className="text-5xl mb-3">📅</div><p>No events yet</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {club.events.slice().reverse().map((ev) => (
                  <div key={ev._id} className={`bg-white rounded-2xl border p-5 shadow-sm ${ev.completed ? 'border-green-100 opacity-70' : 'border-teal-100'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{ev.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{ev.description}</p>
                        <p className="text-xs text-teal-600 mt-2">📅 {new Date(ev.dateTime).toLocaleString()}</p>
                      </div>
                      {ev.completed
                        ? <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full whitespace-nowrap">✅ Done</span>
                        : isHost && (
                          <button onClick={() => markEventDone(ev._id)}
                            className="text-xs border border-teal-300 text-teal-600 hover:bg-teal-50 px-3 py-1 rounded-full transition-colors whitespace-nowrap">
                            Mark Done
                          </button>
                        )
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MEMBERS */}
        {activeTab === 'members' && isMember && (
          <div className="max-w-xl">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Host first */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-200 flex items-center justify-center text-teal-700 font-bold">
                  {club.host?.avatar ? <img src={club.host.avatar} alt="" className="w-full h-full object-cover" /> : club.host?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{club.host?.name}</p>
                  <p className="text-xs text-gray-400">{club.host?.email}</p>
                </div>
                <span className="ml-auto text-xs bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">👑 Host</span>
              </div>
              {club.members?.filter(m => m._id !== club.host?._id).map(m => (
                <div key={m._id} className="px-5 py-4 border-b border-gray-100 last:border-0 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-100 flex items-center justify-center text-teal-600 font-semibold">
                    {m.avatar ? <img src={m.avatar} alt="" className="w-full h-full object-cover" /> : m.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                  {m._id === user._id && <span className="ml-auto text-xs text-teal-500 font-medium">You</span>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClubDetail;
