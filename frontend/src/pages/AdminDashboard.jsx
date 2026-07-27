import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "users", label: "Users" },
  { key: "bookings", label: "Bookings" },
  { key: "location", label: "Location Issues" },
];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState("");

  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [locationIssues, setLocationIssues] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    if (!localStorage.getItem("token") || user?.role !== "admin") {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsError("");
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) {
      setStatsError(err.response?.data?.message || "Failed to load stats.");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { role: userRoleFilter || undefined, search: userSearch || undefined },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [userRoleFilter, userSearch]);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get("/admin/bookings", {
        params: { status: bookingStatusFilter || undefined },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  }, [bookingStatusFilter]);

  const fetchLocationIssues = useCallback(async () => {
    setLocationLoading(true);
    try {
      const res = await api.get("/admin/providers/location-issues");
      setLocationIssues(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === "users") fetchUsers();
    if (tab === "bookings") fetchBookings();
    if (tab === "location") fetchLocationIssues();
  }, [tab, fetchUsers, fetchBookings, fetchLocationIssues]);

  const toggleActive = async (user) => {
    setActioningId(user._id);
    try {
      const res = await api.patch(`/admin/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.data : u)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    } finally {
      setActioningId(null);
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This also removes their bookings.`)) return;
    setActioningId(user._id);
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActioningId(null);
    }
  };

  const removeBooking = async (booking) => {
    if (!window.confirm("Delete this booking?")) return;
    setActioningId(booking._id);
    try {
      await api.delete(`/admin/bookings/${booking._id}`);
      setBookings((prev) => prev.filter((b) => b._id !== booking._id));
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete booking.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
            <p className="text-sm text-slate-500">
              Manage users, bookings, and platform health.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Go to Home
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
              {t.key === "location" && stats?.providersWithoutLocation > 0 && (
                <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full w-5 h-5">
                  {stats.providersWithoutLocation}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            {statsError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {statsError}
              </div>
            )}
            {!stats && !statsError && (
              <div className="text-center py-12 text-slate-500">Loading stats...</div>
            )}
            {stats && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <StatCard label="Total Users" value={stats.totalUsers} />
                  <StatCard label="Finders" value={stats.finders} />
                  <StatCard label="Providers" value={stats.providers} />
                  <StatCard label="Admins" value={stats.admins} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <StatCard label="Pending Bookings" value={stats.bookingCounts.pending} />
                  <StatCard label="Confirmed" value={stats.bookingCounts.confirmed} />
                  <StatCard label="Completed" value={stats.bookingCounts.completed} />
                  <StatCard label="Cancelled" value={stats.bookingCounts.cancelled} />
                </div>
                {stats.providersWithoutLocation > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-center justify-between">
                    <span>
                      ⚠️ {stats.providersWithoutLocation} provider(s) have no saved
                      location and won't appear in "nearby" search results.
                    </span>
                    <button
                      onClick={() => setTab("location")}
                      className="font-semibold underline shrink-0 ml-4"
                    >
                      View
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="flex-1 p-2.5 border border-slate-200 rounded-xl outline-none text-sm"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="p-2.5 border border-slate-200 rounded-xl outline-none text-sm bg-white"
              >
                <option value="">All Roles</option>
                <option value="finder">Finder</option>
                <option value="provider">Provider</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {usersLoading ? (
              <div className="text-center py-12 text-slate-500">Loading users...</div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-400">
                          No users found.
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr key={u._id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3 capitalize">{u.role}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border font-semibold ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {u.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            disabled={actioningId === u._id}
                            onClick={() => toggleActive(u)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-60"
                          >
                            {u.isActive ? "Disable" : "Enable"}
                          </button>
                          <button
                            disabled={actioningId === u._id}
                            onClick={() => removeUser(u)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Bookings */}
        {tab === "bookings" && (
          <div>
            <div className="flex gap-3 mb-4">
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="p-2.5 border border-slate-200 rounded-xl outline-none text-sm bg-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {bookingsLoading ? (
              <div className="text-center py-12 text-slate-500">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
                No bookings found.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{b.finder?.name || "Unknown"}</span>
                        <span className="text-slate-400 text-xs">→</span>
                        <span className="font-semibold">{b.provider?.name || "Unknown"}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${STATUS_STYLES[b.status] || ""}`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        📅 {b.date} at {b.time} · {b.provider?.providerDetails?.category || "—"}
                      </p>
                    </div>
                    <button
                      disabled={actioningId === b._id}
                      onClick={() => removeBooking(b)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-60 self-start sm:self-center"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Location diagnostics */}
        {tab === "location" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              These providers have no saved coordinates, so they're excluded from
              "nearby" search results. Ask them to set their location from their
              provider dashboard.
            </p>
            {locationLoading ? (
              <div className="text-center py-12 text-slate-500">Checking...</div>
            ) : locationIssues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-500">
                All providers have a saved location. 🎉
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Category</th>
                      <th className="text-left px-4 py-3">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationIssues.map((p) => (
                      <tr key={p._id} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500">{p.email}</td>
                        <td className="px-4 py-3">{p.providerDetails?.category || "—"}</td>
                        <td className="px-4 py-3 text-slate-500">{p.phone || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
      <p className="text-xl font-bold">{value ?? 0}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
