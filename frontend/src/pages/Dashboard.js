import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import GlobeComponent from '../components/GlobeComponent';

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsResponse, logsResponse] = await Promise.all([
        axios.get('/admin/stats', { headers }),
        axios.get('/admin/logs', { headers }),
      ]);

      setStats(statsResponse.data);
      setLogs(logsResponse.data.logs);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  if (loading) {
    return <div className="dashboard">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Server Management Dashboard</h1>
        <button onClick={handleLogout} className="btn">
          Logout
        </button>
      </div>

      {error && <div className="error">{error}</div>}

     <div className="stats-grid">
       <div className="stat-card">
         <h3>Total Requests</h3>
         <p>{stats.totalRequests || 0}</p>
         <small style={{ color: '#666', fontSize: '0.8rem' }}>All time requests</small>
       </div>
       <div className="stat-card">
         <h3>Unique IPs</h3>
         <p>{stats.uniqueIPs || 0}</p>
         <small style={{ color: '#666', fontSize: '0.8rem' }}>Distinct IP addresses</small>
       </div>
       <div className="stat-card">
         <h3>Unique Countries</h3>
         <p>{stats.uniqueCountries || 0}</p>
         <small style={{ color: '#666', fontSize: '0.8rem' }}>Countries with requests</small>
       </div>
     </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="map-container">
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>🌍 Request Locations (Map)</h3>
          <MapComponent logs={logs} />
        </div>

        <div className="globe-container">
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>🌐 Request Locations (3D Globe)</h3>
          <GlobeComponent logs={logs} />
        </div>
      </div>

      <div className="logs-table">
        <h3>Recent Request Logs</h3>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
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
                <tr key={log.id} style={{ backgroundColor: log.country ? '#f8f9fa' : 'white' }}>
                  <td>{new Date(log.time).toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: log.method === 'GET' ? '#28a745' :
                                     log.method === 'POST' ? '#007bff' :
                                     log.method === 'PUT' ? '#ffc107' :
                                     log.method === 'DELETE' ? '#dc3545' : '#6c757d',
                      color: 'white'
                    }}>
                      {log.method}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '14px' }}>{log.path}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '14px' }}>{log.ip}</td>
                  <td>
                    {log.country && (
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '10px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {log.country}
                      </span>
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
  );
}

export default Dashboard;