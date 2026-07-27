import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2">
        <span>📍</span> Locanta
      </Link>
      <div className="flex gap-3 items-center">
        {token && user ? (
          <>
            <span className="text-sm text-slate-600 font-medium">Hi, {user.name}</span>
            <Link
              to="/dashboard"
              className={
                user.role === 'admin'
                  ? "px-4 py-2 border border-blue-200 bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 font-semibold transition text-sm"
                  : "px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-sm"
              }
            >
              {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-sm"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition text-sm"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}