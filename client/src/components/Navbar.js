import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ onAuthOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/activities', label: 'Activities' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/dashboard', label: 'Dashboard' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-teal-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-sage-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-display text-xl text-teal-700 tracking-tight">TribeFit</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-200 ${
                location.pathname === link.to
                  ? 'text-teal-600 border-b-2 border-teal-500 pb-0.5'
                  : 'text-gray-600 hover:text-teal-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-teal-300" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center">
                    <span className="text-teal-700 font-semibold text-sm">{user.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="text-sm text-gray-700 font-medium">{user.name?.split(' ')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-full border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthOpen}
              className="text-sm px-5 py-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-200 font-medium shadow-sm"
            >
              Login / Signup
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-teal-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium py-2 ${location.pathname === link.to ? 'text-teal-600' : 'text-gray-600'}`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="text-left text-sm text-red-500 py-2">Logout</button>
          ) : (
            <button onClick={() => { setMenuOpen(false); onAuthOpen(); }} className="text-sm px-4 py-2 bg-teal-500 text-white rounded-full">
              Login / Signup
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
