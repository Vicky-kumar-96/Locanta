import React from 'react';

export default function ContactModal({ provider, onClose }) {
  if (!provider) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-1">Contact {provider.name}</h3>
        <p className="text-xs text-slate-500 mb-4">Direct contact information provided below:</p>
        
        <div className="bg-slate-50 p-4 rounded-xl space-y-2 mb-6 border border-slate-100 text-sm">
          <p>📞 <strong>Phone:</strong> {provider.phone || 'Not provided'}</p>
          <p>✉️ <strong>Email:</strong> {provider.email}</p>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}