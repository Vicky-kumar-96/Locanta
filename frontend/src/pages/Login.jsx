import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Login to Locanta</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm mt-1" 
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm mt-1" 
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm">
            Sign In
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-4">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}