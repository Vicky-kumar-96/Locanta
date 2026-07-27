import React from 'react';

export default function HeroSearch({ category, setCategory, coords, radius, setRadius, onGetLocation, onSearch }) {
  return (
    <section className="bg-slate-900 text-white py-16 px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Find Local Experts Near You</h1>
      <p className="text-slate-400 mb-8 max-w-xl mx-auto">
        Discover trusted plumbers, electricians, tutors, mechanics, and carpenters in your neighborhood.
      </p>

      <div className="max-w-4xl mx-auto bg-white p-3 rounded-2xl flex flex-col sm:flex-row gap-3 shadow-2xl text-slate-800">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 p-3 bg-slate-100 rounded-xl outline-none font-medium text-slate-700 text-sm"
        >
          <option value="">All Categories</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical Repair</option>
          <option value="Carpentry">Carpentry</option>
          <option value="Tutoring">Private Tutoring</option>
          <option value="Mechanic">Auto Mechanic</option>
        </select>

        {coords.lat != null && (
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="p-3 bg-slate-100 rounded-xl outline-none font-medium text-slate-700 text-sm"
          >
            <option value={5000}>Within 5 km</option>
            <option value={10000}>Within 10 km</option>
            <option value={25000}>Within 25 km</option>
            <option value={50000}>Within 50 km</option>
            <option value={100000}>Within 100 km</option>
          </select>
        )}

        <button 
          type="button"
          onClick={onGetLocation}
          className="px-4 py-3 bg-slate-200 hover:bg-slate-300 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          🎯 {coords.lat ? "Location Active" : "Use Current Location"}
        </button>

        <button 
          type="button"
          onClick={onSearch}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition text-sm"
        >
          Search
        </button>
      </div>
    </section>
  );
}