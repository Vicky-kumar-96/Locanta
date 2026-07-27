import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/mine");
      setBookings(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [navigate, fetchBookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="max-w-5xl mx-auto py-12 px-6 text-center text-slate-500">
          Loading bookings...
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <main className="max-w-5xl mx-auto py-12 px-6 text-center">
          <div className="py-12 bg-white rounded-2xl border border-red-200 text-red-600">
            {error}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Bookings</h1>
            <p className="text-sm text-slate-500">
              Services you have booked with local providers.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Go to Home
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No bookings yet. Head to the home page to find and book a provider.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">
                    {b.provider?.name || "Unknown Provider"}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${
                      STATUS_STYLES[b.status] || ""
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  📅 {b.date} at {b.time}
                </p>
                {b.details && (
                  <p className="text-sm text-slate-500 mt-1">📝 {b.details}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Provider: {b.provider?.providerDetails?.category || "General"}{" "}
                  • ${b.provider?.providerDetails?.hourlyRate || 0}/hr
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
