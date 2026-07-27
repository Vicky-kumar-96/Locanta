import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [locationCoords, setLocationCoords] = useState({ lat: "", lng: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchBookings();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/mine");
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data);
      setProfileForm({
        category: res.data.providerDetails?.category || "",
        hourlyRate: res.data.providerDetails?.hourlyRate || "",
        description: res.data.providerDetails?.description || "",
        availability: res.data.providerDetails?.availability ?? true,
      });
      // populate location coords if available
      if (res.data.location && Array.isArray(res.data.location.coordinates)) {
        const [lng, lat] = res.data.location.coordinates;
        setLocationCoords({ lat, lng });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        ...profileForm,
        latitude: locationCoords.lat,
        longitude: locationCoords.lng,
      };
      const res = await api.patch("/auth/profile", payload);
      setProfile(res.data);
      // update local coords from response if provided
      if (res.data.location && Array.isArray(res.data.location.coordinates)) {
        const [lng, lat] = res.data.location.coordinates;
        setLocationCoords({ lat, lng });
      }
      // TODO: Replace with react-hot-toast if installed
      alert("Profile updated!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("Location captured successfully.");
      },
      () => alert("Unable to fetch location. Please allow access."),
    );
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update booking.");
    } finally {
      setUpdatingId(null);
    }
  };

  const stats = {
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
  const earnings =
    stats.completed * (profile?.providerDetails?.hourlyRate || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Bookings From Customers</h1>
            <p className="text-sm text-slate-500">
              Manage the services customers have booked with you.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Go to Home
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <p className="text-xl font-bold">{stats.pending}</p>
            <p className="text-xs text-slate-500">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <p className="text-xl font-bold">{stats.confirmed}</p>
            <p className="text-xs text-slate-500">Confirmed</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <p className="text-xl font-bold">{stats.completed}</p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <p className="text-xl font-bold">{stats.cancelled}</p>
            <p className="text-xs text-slate-500">Cancelled</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
            <p className="text-xl font-bold">${earnings}</p>
            <p className="text-xs text-slate-500">Est. Earnings</p>
          </div>
        </div>

        {/* Profile editor */}
        {profileForm && (
          <form
            onSubmit={saveProfile}
            className="bg-white p-6 rounded-2xl border border-slate-200 mb-10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">My Provider Profile</h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={profileForm.availability}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        availability: e.target.checked,
                      })
                    }
                  />
                  Available for bookings
                </label>

                <button
                  type="button"
                  onClick={handleUseLocation}
                  className="px-3 py-2 text-sm rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  {locationCoords.lat ? "Location Set" : "Set My Location"}
                </button>
                <div className="text-xs text-slate-500 ml-2">
                  {locationCoords.lat
                    ? `Saved coords: ${locationCoords.lat.toFixed ? locationCoords.lat.toFixed(6) : locationCoords.lat}, ${locationCoords.lng.toFixed ? locationCoords.lng.toFixed(6) : locationCoords.lng}`
                    : "No saved coordinates"}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <select
                value={profileForm.category}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, category: e.target.value })
                }
                className="p-3 border border-slate-200 rounded-xl outline-none text-sm bg-white"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical Repair</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Tutoring">Private Tutoring</option>
                <option value="Mechanic">Auto Mechanic</option>
              </select>
              <input
                type="number"
                placeholder="Hourly Rate ($)"
                value={profileForm.hourlyRate}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, hourlyRate: e.target.value })
                }
                className="p-3 border border-slate-200 rounded-xl outline-none text-sm"
              />
            </div>

            <textarea
              rows="3"
              placeholder="Describe your services..."
              value={profileForm.description}
              onChange={(e) =>
                setProfileForm({ ...profileForm, description: e.target.value })
              }
              className="w-full p-3 border border-slate-200 rounded-xl outline-none text-sm resize-none"
            />

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </form>
        )}

        {/* Bookings list */}
        {loading && (
          <div className="text-center py-12 text-slate-500">
            Loading bookings...
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12 bg-white rounded-2xl border border-red-200 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
            No bookings yet. Once a customer books you, it will show up here.
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">
                      {b.finder?.name}
                    </h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[b.status] || ""}`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    📅 {b.date} at {b.time}
                  </p>
                  {b.details && (
                    <p className="text-sm text-slate-500 mt-1">
                      📝 {b.details}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Contact: {b.finder?.phone || b.finder?.email || "N/A"}
                  </p>
                </div>

                {(b.status === "pending" || b.status === "confirmed") && (
                  <div className="flex gap-2 shrink-0">
                    {b.status === "pending" && (
                      <button
                        disabled={updatingId === b._id}
                        onClick={() => updateStatus(b._id, "confirmed")}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60"
                      >
                        Confirm
                      </button>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        disabled={updatingId === b._id}
                        onClick={() => updateStatus(b._id, "completed")}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-60"
                      >
                        Mark Completed
                      </button>
                    )}
                    <button
                      disabled={updatingId === b._id}
                      onClick={() => updateStatus(b._id, "cancelled")}
                      className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
