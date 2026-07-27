import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function BookingModal({ provider, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!provider) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('token')) {
      alert('Please log in as a service finder before booking.');
      onClose();
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        providerId: provider._id,
        date,
        time,
        details
      });
      alert(`Booking confirmed with ${provider.name} for ${date} at ${time}!`);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-1">Book Service</h3>
        <p className="text-xs text-slate-500 mb-4">Service Provider: <strong>{provider.name}</strong></p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
            <input 
              type="date" 
              required 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
            <input 
              type="time" 
              required 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Address / Task Details</label>
            <textarea 
              rows="3" 
              required 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
              placeholder="Describe your issue or location details..." 
              className="w-full p-3 border border-slate-200 rounded-xl outline-none resize-none"
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-60"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}