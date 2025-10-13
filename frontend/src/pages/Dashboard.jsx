import React, { useState, useEffect } from "react";
import axios from "axios";
import MapComponent from "../components/MapComponent";
import GlobeComponent from "../components/GlobeComponent";
import {
  Activity,
  Globe as GlobeIcon,
  MapPin,
  LogOut,
  TrendingUp,
  Users,
  Globe,
  Server
} from "lucide-react";

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsResponse, logsResponse] = await Promise.all([
        axios.get("/admin/stats", { headers }),
        axios.get("/admin/logs", { headers }),
      ]);

      setStats(statsResponse.data);
      setLogs(logsResponse.data.logs);
    } catch (err) {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 animate-pulse" />
            <span className="text-lg">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme="light" className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="flex items-center gap-2">
            <Server className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Server Management Dashboard</h1>
          </div>
        </div>
        <div className="navbar-end">
          <button onClick={handleLogout} className="btn btn-outline btn-error">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="card-title text-sm opacity-70 uppercase tracking-wide">
                    Total Requests
                  </h3>
                  <p className="text-4xl font-bold text-primary">
                    {stats.totalRequests || 0}
                  </p>
                  <p className="text-sm opacity-60">All time requests</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="card-title text-sm opacity-70 uppercase tracking-wide">
                    Unique IPs
                  </h3>
                  <p className="text-4xl font-bold text-secondary">
                    {stats.uniqueIPs || 0}
                  </p>
                  <p className="text-sm opacity-60">Distinct IP addresses</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <GlobeIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="card-title text-sm opacity-70 uppercase tracking-wide">
                    Unique Countries
                  </h3>
                  <p className="text-4xl font-bold text-accent">
                    {stats.uniqueCountries || 0}
                  </p>
                  <p className="text-sm opacity-60">Countries with requests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maps Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h3 className="card-title">Request Locations (Map)</h3>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapComponent logs={logs} />
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-secondary" />
                <h3 className="card-title">Request Locations (3D Globe)</h3>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                <GlobeComponent logs={logs} />
              </div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-accent" />
              <h3 className="card-title">Recent Request Logs</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="table table-zebra w-full">
                <thead className="sticky top-0 bg-base-100">
                  <tr>
                    <th>Time</th>
                    <th>Method</th>
                    <th>Path</th>
                    <th>IP</th>
                    <th>Country</th>
                    <th>City</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className={log.country ? "bg-base-200/50" : ""}>
                      <td className="text-sm font-mono">
                        {new Date(log.time).toLocaleString()}
                      </td>
                      <td>
                        <div
                          className={`badge ${
                            log.method === "GET"
                              ? "badge-success"
                              : log.method === "POST"
                              ? "badge-primary"
                              : log.method === "PUT"
                              ? "badge-warning"
                              : log.method === "DELETE"
                              ? "badge-error"
                              : "badge-neutral"
                          }`}
                        >
                          {log.method}
                        </div>
                      </td>
                      <td className="font-mono text-sm max-w-xs truncate">
                        {log.path}
                      </td>
                      <td className="font-mono text-sm">{log.ip}</td>
                      <td>
                        {log.country && (
                          <div className="badge badge-info badge-sm">
                            {log.country}
                          </div>
                        )}
                      </td>
                      <td>{log.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;