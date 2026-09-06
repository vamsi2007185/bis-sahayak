import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, Building2, Filter, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import LabCard from '../components/labs/LabCard';

export default function Labs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lon: 77.2090, city: 'New Delhi (Default)' });
  const [locating, setLocating] = useState(false);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'drinking_water', label: 'Drinking Water' },
    { id: 'electrical', label: 'Electrical & Power' },
    { id: 'electronics', label: 'Electronics & IT' },
    { id: 'mechanical', label: 'Mechanical & Metallurgy' },
    { id: 'chemical', label: 'Chemical' },
    { id: 'textile', label: 'Textiles' },
  ];

  const fetchLabs = async (lat, lon, cat) => {
    setLoading(true);
    try {
      const data = await api.findLabs(lat, lon, cat);
      setLabs(data);
    } catch (err) {
      console.error('Failed to load labs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs(userLocation.lat, userLocation.lon, category);
  }, [category, userLocation]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: 'Your GPS Location',
        };
        setUserLocation(newLoc);
        setLocating(false);
      },
      (err) => {
        alert('Could not obtain location. Defaulting to New Delhi coordinates.');
        setLocating(false);
      }
    );
  };

  const handleSelectCity = (city, lat, lon) => {
    setUserLocation({ lat, lon, city });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Hyper-Local BIS Testing Laboratory Router
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Locate nearest BIS Recognized & NABL Accredited testing facilities from the official CARE registry using Great-Circle Haversine proximity.
        </p>
      </div>

      {/* Control Bar: Location & Category */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="text-slate-500">Current Search Origin:</span>
            <strong className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
              {userLocation.city} ({userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)})
            </strong>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUseMyLocation}
              disabled={locating}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{locating ? 'Detecting GPS...' : 'Use My GPS Location'}</span>
            </button>

            {/* Quick City Presets */}
            <button
              onClick={() => handleSelectCity('Mumbai', 19.0760, 72.8777)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600"
            >
              Mumbai
            </button>
            <button
              onClick={() => handleSelectCity('Bengaluru', 12.9716, 77.5946)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600"
            >
              Bengaluru
            </button>
            <button
              onClick={() => handleSelectCity('Kolkata', 22.5726, 88.3639)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600"
            >
              Kolkata
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                category === cat.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
          <span>Computing Haversine distances to accredited labs...</span>
        </div>
      ) : labs.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No laboratories found for this category in range. Try selecting "All Categories".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <LabCard key={lab.lab_id} lab={lab} />
          ))}
        </div>
      )}
    </div>
  );
}
