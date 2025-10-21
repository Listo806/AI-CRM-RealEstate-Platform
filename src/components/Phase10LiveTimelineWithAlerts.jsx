
// Ultimate MVP – Phase 10–14 Integrated
// =====================================================
// React (Vite) + Node/Express + Mongo + PWA stack
// This single file contains frontend routes, components, server controllers,
// serverless backend integration for Phase 10 timeline, and Phase 11–14 features.

///////////////////////////
// CLIENT / FRONTEND CODE
///////////////////////////

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// -------------------- Phase 10 – Live Timeline & Alerts --------------------
import axios from "axios";

export function Phase10LiveTimelineWithAlerts() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await axios.get("/api/fetchAsanaTasks"); // serverless backend
        setTasks(res.data.tasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError(err);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">AI CRM Live Timeline</h1>
      {error && <div className="text-red-500">Error fetching tasks</div>}
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            {t.name} - {t.completed ? "✅ Completed" : t.due_on < new Date().toISOString() ? "❌ Overdue" : "🕒 Remaining"}
          </li>
        ))}
      </ul>
    </div>
  );
}

// -------------------- Phase 11 – AI Chat & Task Executor --------------------
function LeadWidget() {
  const [q, setQ] = useState("");
  const [intent, setIntent] = useState(null);

  async function askAI() {
    const r = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "demo", message: q }),
    }).then((r) => r.json());
    setIntent(r.intent);
  }

  return (
    <div style={{ fontFamily: "system-ui", width: 320, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 600 }}>Listo Qasa – AI Assistant</div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ask about a property…"
        style={{ width: "100%", marginTop: 8, padding: 8, border: "1px solid #ddd", borderRadius: 8 }}
      />
      <button onClick={askAI} style={{ marginTop: 8, padding: "8px 12px" }}>
        Ask
      </button>
      {intent && <pre style={{ background: "#fafafa", padding: 8, marginTop: 8, maxHeight: 200, overflow: "auto" }}>{JSON.stringify(intent, null, 2)}</pre>}
    </div>
  );
}

// -------------------- Phase 12 – CMA & Predict --------------------
function AnalyticsCMA() {
  const [form, setForm] = useState({ address: "", beds: 3, baths: 2, sqft: 1200 });
  const [res, setRes] = useState(null);

  async function runCMA() {
    const r = await fetch("/api/analytics/cma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }).then(
      (r) => r.json()
    );
    setRes(r);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">AI CMA & Predictions</h1>
      <div className="grid gap-2 my-4">
        {["address", "beds", "baths", "sqft"].map((k) => (
          <input
            key={k}
            className="border p-2"
            placeholder={k}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
        ))}
        <button className="btn" onClick={runCMA}>
          Run CMA
        </button>
      </div>
      {res && <pre className="bg-gray-50 p-4 rounded max-h-96 overflow-auto">{JSON.stringify(res, null, 2)}</pre>}
    </div>
  );
}

// -------------------- Phase 13 – Marketing Studio --------------------
function MarketingStudio() {
  const [task, setTask] = useState({ channel: "instagram", content: "New listing!", runAt: "" });
  const [ok, setOk] = useState(null);

  async function schedule() {
    const r = await fetch("/api/marketing/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(task) }).then(
      (r) => r.json()
    );
    setOk(r);
  }

  async function runDue() {
    const r = await fetch("/api/marketing/run-due", { method: "POST" }).then((r) => r.json());
    setOk(r);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Marketing Studio v2</h1>
      <select className="border p-2" value={task.channel} onChange={(e) => setTask({ ...task, channel: e.target.value })}>
        <option>instagram</option>
        <option>facebook</option>
        <option>email</option>
      </select>
      <textarea
        className="border p-2 w-full my-2"
        rows={4}
        placeholder="Content"
        value={task.content}
        onChange={(e) => setTask({ ...task, content: e.target.value })}
      />
      <input className="border p-2" type="datetime-local" onChange={(e) => setTask({ ...task, runAt: e.target.value })} />
      <div className="my-3 flex gap-2">
        <button className="btn" onClick={schedule}>
          Schedule
        </button>
        <button className="btn" onClick={runDue}>
          Run Due Now
        </button>
      </div>
      {ok && <pre className="bg-gray-50 p-3">{JSON.stringify(ok, null, 2)}</pre>}
    </div>
  );
}

// -------------------- Phase 13 – Broker Dashboard --------------------
function BrokerDashboard() {
  const [org, setOrg] = useState(null);
  useEffect(() => {
    fetch("/api/organization/me")
      .then((r) => r.json())
      .then(setOrg);
  }, []);
  if (!org) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Brokerage Dashboard</h1>
      <p className="text-gray-600">
        {org.name} • {org.country}
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {org.agents?.map((a) => (
          <div key={a.userId} className="border rounded p-3">
            <div className="font-medium">Agent: {a.userId}</div>
            <div className="text-sm text-gray-500">Role: {a.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------- ROUTER / APP --------------------
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Phase10LiveTimelineWithAlerts />} />
        <Route path="/analytics/cma" element={<AnalyticsCMA />} />
        <Route path="/marketing" element={<MarketingStudio />} />
        <Route path="/broker" element={<BrokerDashboard />} />
        <Route path="/lead-widget" element={<LeadWidget />} />
      </Routes>
    </Router>
  );
}

///////////////////////////
// SERVER / BACKEND CODE
///////////////////////////
const express = require("express");
const app = express();
app.use(express.json({ limit: "10mb" }));

// --- Phase 10 Serverless backend for Asana ---
app.get("/api/fetchAsanaTasks", async (req, res) => {
  const axios = require("axios");
  const ASANA_API_KEY = process.env.ASANA_API_KEY;
  const PROJECT_ID = process.env.ASANA_PROJECT_ID;
  try {
    const r = await axios.get(`https://app.asana.com/api/1.0/projects/${PROJECT_ID}/tasks`, {
      headers: { Authorization: `Bearer ${ASANA_API_KEY}` },
    });
    res.json({ tasks: r.data.data });
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Phase 11 AI ---
const MemoryVector = require("mongoose").model("MemoryVector") || require("./server/models/MemoryVector");
async function addMemory({ userId, text, tags = [] }) {
  // placeholder embedding function
  const vector = text.split("").map((c) => c.charCodeAt(0));
  return MemoryVector.create({ userId, text, tags, vector });
}
async function searchMemory({ userId, query, k = 5 }) {
  return MemoryVector.find({ userId }).limit(k);
}
app.post("/api/ai/chat", async (req, res) => {
  const { userId, message } = req.body;
  const memories = await searchMemory({ userId, query: message });
  const intent = { type: "UNKNOWN", data: { message } };
  await addMemory({ userId, text: message, tags: ["chat"] });
  res.json({ intent });
});
app.post("/api/ai/execute", async (req, res) => {
  const { userId, intent } = req.body;
  await addMemory({ userId, text: `Executed intent ${intent.type}`, tags: ["action"] });
  res.json({ ok: true });
});

// --- Phase 12 Analytics ---
app.post("/api/analytics/cma", async (req, res) => {
  res.json({ comps: [], analysis: "Mock CMA" });
});
app.post("/api/analytics/predict", async (req, res) => {
  res.json({ prediction: "Mock Predict" });
});

// --- Phase 13 Marketing ---
app.post("/api/marketing/tasks", async (req, res) => {
  res.json({ ok: true });
});
app.post("/api/marketing/run-due", async (req, res) => {
  res.json({ ok: true });
});

// --- Phase 13 Brokerage ---
app.get("/api/organization/me", async (req, res) => {
  res.json({ name: "Demo Org", country: "Ecuador", agents: [{ userId: "Agent1", role: "ADMIN" }] });
});

// --- Phase 14 Finance ---
app.post("/api/finance/advance", async (req, res) => {
  res.json({ ok: true });
});

module.exports = app;

     

