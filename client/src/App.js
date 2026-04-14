import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#f0fdfa', color: '#134e4a', border: '1px solid #99f6e4' },
          }}
        />
        <Navbar onAuthOpen={() => setShowAuth(true)} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        <Routes>
          <Route path="/" element={<Home onAuthOpen={() => setShowAuth(true)} />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/clubs/:id" element={<ClubDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
