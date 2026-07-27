import React from 'react';

export default function ServiceCard({ provider, onContact, onBook }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900">{provider.name}</h3>
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-semibold">
            {provider.providerDetails?.category || 'General'}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {provider.providerDetails?.description || 'Qualified local service professional.'}
        </p>
        <div className="text-sm font-bold text-slate-800 mb-6">
          💵 ${provider.providerDetails?.hourlyRate || 0} / hr
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onContact(provider)}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
        >
          Contact
        </button>
        <button 
          onClick={() => onBook(provider)}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}