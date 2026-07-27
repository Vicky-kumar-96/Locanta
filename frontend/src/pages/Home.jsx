import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import HeroSearch from '../components/HeroSearch';
import ServiceCard from '../components/ServiceCard';
import ContactModal from '../components/ContactModal';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const [providers, setProviders] = useState([]);
  const [category, setCategory] = useState('');
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(25000);
  const [locationDenied, setLocationDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactProvider, setContactProvider] = useState(null);
  const [bookingProvider, setBookingProvider] = useState(null);

  const handleGetLocation = (silent = false) => {
    if (!navigator.geolocation) {
      if (!silent) alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationDenied(false);
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (!silent) alert('Location set!');
      },
      () => {
        setLocationDenied(true);
        if (!silent) alert('Unable to fetch location. You can still browse all providers below.');
      }
    );
  };

  // Try to silently grab the browser's location once on load, so results are
  // relevant right away instead of requiring a manual click first.
  useEffect(() => {
    handleGetLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = { category: category || undefined };
      if (coords.lat != null && coords.lng != null) {
        params.lat = coords.lat;
        params.lng = coords.lng;
        params.maxDistance = radius;
      }
      const res = await api.get('/services/nearby', { params });
      setProviders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, coords, radius]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <HeroSearch 
        category={category} 
        setCategory={setCategory} 
        coords={coords} 
        radius={radius}
        setRadius={setRadius}
        onGetLocation={() => handleGetLocation(false)} 
        onSearch={fetchProviders} 
      />

      <main className="max-w-7xl mx-auto py-12 px-6">
        <h2 className="text-2xl font-bold mb-2">
          {coords.lat != null ? 'Nearby Service Providers' : 'All Service Providers'}
        </h2>
        {coords.lat == null && (
          <p className="text-sm text-slate-500 mb-6">
            {locationDenied
              ? "We couldn't access your location, so we're showing everyone. Use \"Use Current Location\" above to sort by distance."
              : 'Showing all providers. Share your location above to sort by distance.'}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Loading...</div>
          ) : providers.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
              {coords.lat != null
                ? `No providers found within ${radius / 1000} km. Try a larger radius or a different category.`
                : 'No service providers found. Adjust your search.'}
            </div>
          ) : (
            providers.map((p) => (
              <ServiceCard 
                key={p._id} 
                provider={p} 
                onContact={setContactProvider} 
                onBook={setBookingProvider} 
              />
            ))
          )}
        </div>
      </main>

      <ContactModal provider={contactProvider} onClose={() => setContactProvider(null)} />
      <BookingModal provider={bookingProvider} onClose={() => setBookingProvider(null)} />
    </div>
  );
}