import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = "https://crm-backend-53ac.onrender.com";

function App() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({ name: "", email: "", source: "", notes: "" });

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${API_URL}/leads`);
      setLeads(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  const loadLeads = async () => {
    if (loggedIn) {
      await fetchLeads();
    }
  };

  loadLeads();
}, [loggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "neo@gmail.com" && password === "admin123") {
      setLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setEmail("");
    setPassword("");
    setLeads([]);
    setShowAnalytics(false);
    setShowNewLeadForm(false);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/leads/${id}`, { status: newStatus });
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === id ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateNotes = async (id, notes) => {
    try {
      await axios.put(`${API_URL}/leads/${id}/notes`, { notes });
      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, notes } : l))
      );
    } catch (err) {
      console.log(err);
    }
  };

  const addNewLead = async () => {
    try {
      const res = await axios.post(`${API_URL}/leads`, { ...newLead, status: "new" });
      setLeads((prev) => [...prev, res.data]);
      setNewLead({ name: "", email: "", source: "", notes: "" });
      setShowNewLeadForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteLead = async (id) => {
    try {
      // Make sure this URL matches your backend route
      await axios.delete(`${API_URL}/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete lead. Check backend route.");
    }
  };

  // Analytics calculations
  const totalLeads = leads.length;
  const statusCounts = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  const chartData = {
    labels: ["New", "Contacted", "Converted"],
    datasets: [
      {
        label: "Leads by Status",
        data: [statusCounts.new, statusCounts.contacted, statusCounts.converted],
        backgroundColor: ["#f0ad4e", "#5bc0de", "#5cb85c"],
      },
    ],
  };

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="login-container">
          <h1>Neo's CRM</h1>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div className="dashboard">
          <div className="dashboard-header">
            <h1>Dashboard</h1>
            <button className="logout" onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* Add New Lead Button */}
          <button className="show-analytics" onClick={() => setShowNewLeadForm((prev) => !prev)}>
            {showNewLeadForm ? "Cancel New Lead" : "Add New Lead"}
          </button>

          {showNewLeadForm && (
            <div className="new-lead-form">
              <input
                placeholder="Name"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              />
              <input
                placeholder="Email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
              <input
                placeholder="Source"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              />
              <textarea
                placeholder="Notes"
                value={newLead.notes}
                onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
              />
              <button onClick={addNewLead}>Save Lead</button>
            </div>
          )}

          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="leads-list">
            {leads
              .filter((lead) =>
                lead.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((lead) => (
                <div key={lead._id} className="lead-card">
                  <p><strong>Name:</strong> {lead.name}</p>
                  <p><strong>Email:</strong> {lead.email}</p>
                  <p><strong>Source:</strong> {lead.source}</p>
                  <p>
                    <strong>Status:</strong>
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                    </select>
                  </p>
                  <p><strong>Notes:</strong></p>
                  <textarea
                    value={lead.notes}
                    onChange={(e) =>
                      setLeads((prev) =>
                        prev.map((l) =>
                          l._id === lead._id ? { ...l, notes: e.target.value } : l
                        )
                      )
                    }
                  />
                  <button onClick={() => updateNotes(lead._id, lead.notes)}>Save Notes</button>
                  <button onClick={() => deleteLead(lead._id)} style={{ backgroundColor: "#d9534f", marginTop: "5px" }}>Delete Lead</button>
                  <p><small>Created: {new Date(lead.createdAt).toLocaleString()}</small></p>
                  <p><small>Last Updated: {new Date(lead.updatedAt || lead.createdAt).toLocaleString()}</small></p>
                </div>
              ))}
          </div>

          <button
            className="show-analytics"
            onClick={() => setShowAnalytics((prev) => !prev)}
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </button>

          {showAnalytics && (
            <div className="analytics">
              <p>Total Leads: {totalLeads}</p>
              <p>New: {statusCounts.new}</p>
              <p>Contacted: {statusCounts.contacted}</p>
              <p>Converted: {statusCounts.converted}</p>
              <Bar data={chartData} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;