import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Register() {
  const [role, setRole] = useState("finder");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    category: "Plumbing",
    hourlyRate: "",
    description: "",
  });
  const [coords, setCoords] = useState({ lat: "", lng: "" });
  const navigate = useNavigate();

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("Location captured successfully.");
      },
      () => {
        alert("Unable to fetch location. Please allow location access.");
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        ...formData,
        role,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
          Join Locanta
        </h2>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 font-semibold text-xs rounded-lg transition ${role === "finder" ? "bg-white shadow-xs text-blue-600" : "text-slate-500"}`}
            onClick={() => setRole("finder")}
          >
            Service Finder
          </button>
          <button
            type="button"
            className={`flex-1 py-2 font-semibold text-xs rounded-lg transition ${role === "provider" ? "bg-white shadow-xs text-blue-600" : "text-slate-500"}`}
            onClick={() => setRole("provider")}
          >
            Service Provider
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            required
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full p-3 border border-slate-200 rounded-xl outline-none"
          />

          {role === "provider" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <select
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-white"
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
                required
                onChange={(e) =>
                  setFormData({ ...formData, hourlyRate: e.target.value })
                }
                className="w-full p-3 border border-slate-200 rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleUseLocation}
                className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition"
              >
                {coords.lat ? "Location Set" : "Use My Current Location"}
              </button>
              {!coords.lat && (
                <p className="text-xs text-slate-500">
                  If you do not share your location, your profile may not appear
                  in nearby provider searches.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 mt-4">
          Already registered?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
