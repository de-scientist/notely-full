// src/admin/AnalyticsDashboard.tsx
import { useEffect, useState, useRef } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Papa from "papaparse";

type Chat = {
  id: string;
  userId?: string;
  query: string;
  reply: string;
  intent?: string;
  channel: string;
  createdAt: string;
};

export default function AnalyticsDashboard() {
  const [intents, setIntents] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [results, setResults] = useState<Chat[]>([]);
  const [filters, setFilters] = useState({ start: "", end: "", intent: "", channel: "", search: "" });
  const [page, setPage] = useState(0);
  const [limit] = useState(50);
  const evtSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchIntents();
    fetchHourly();
    fetchResults();
    startSSE();
    return () => stopSSE();
  }, []);

  async function fetchIntents() {
    const r = await fetch("/api/analytics/intents");
    const d = await r.json();
    setIntents(d.intents || d);
  }

  async function fetchHourly() {
    const r = await fetch("/api/analytics/hourly");
    const d = await r.json();
    const mapped = (d.hourly || d).map((h: any) => ({ hour: new Date(h.hour).toLocaleString(), count: Number(h.count) }));
    setHourly(mapped);
  }

  async function fetchResults(p = 0) {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    qs.set("offset", String(p * limit));
    if (filters.start) qs.set("start", filters.start);
    if (filters.end) qs.set("end", filters.end);
    if (filters.intent) qs.set("intent", filters.intent);
    if (filters.channel) qs.set("channel", filters.channel);
    if (filters.search) qs.set("search", filters.search);

    const r = await fetch(`/api/analytics/query?${qs.toString()}`);
    const d = await r.json();
    setResults(d.results || d.results);
  }

  function startSSE() {
    const s = new EventSource("/api/analytics/stream");
    s.addEventListener("new_chat", (e: any) => {
      const parsed = JSON.parse(e.data);
      setResults((prev) => [parsed, ...prev].slice(0, 200)); // keep recent
    });
    evtSourceRef.current = s;
  }

  function stopSSE() {
    evtSourceRef.current?.close();
    evtSourceRef.current = null;
  }

  function onExportCSV() {
    const data = results.map((r) => ({
      id: r.id,
      userId: r.userId || "",
      query: r.query,
      reply: r.reply,
      intent: r.intent || "",
      channel: r.channel,
      createdAt: r.createdAt,
    }));
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notely_chats_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notely Admin — Analytics</h1>
        <div className="flex gap-2">
          <button onClick={onExportCSV} className="bg-black text-white px-3 py-1 rounded">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Intents</h3>
          <PieChart width={300} height={220}>
            <Pie data={intents} dataKey="count" nameKey="intent" cx="50%" cy="50%" outerRadius={70} label>
              {intents.map((entry, idx) => <Cell key={idx} fill={["#0088FE","#00C49F","#FFBB28","#FF8042","#A28FD0"][idx % 5]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Hourly</h3>
          <LineChart width={500} height={200} data={hourly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Filters</h3>
        <div className="flex gap-3 items-center">
          <input type="date" value={filters.start} onChange={(e) => setFilters((s) => ({ ...s, start: e.target.value }))} className="border p-2 rounded" />
          <input type="date" value={filters.end} onChange={(e) => setFilters((s) => ({ ...s, end: e.target.value }))} className="border p-2 rounded" />
          <input placeholder="intent" value={filters.intent} onChange={(e) => setFilters((s) => ({ ...s, intent: e.target.value }))} className="border p-2 rounded" />
          <select value={filters.channel} onChange={(e) => setFilters((s) => ({ ...s, channel: e.target.value }))} className="border p-2 rounded">
            <option value="">All channels</option>
            <option value="web">Web</option>
            <option value="voice">Voice</option>
            <option value="api">API</option>
          </select>
          <input placeholder="search" value={filters.search} onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))} className="border p-2 rounded" />
          <button onClick={() => { setPage(0); fetchResults(0); }} className="bg-black text-white px-3 py-1 rounded">Apply</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Recent Queries</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="pr-4">Time</th>
              <th className="pr-4">Query</th>
              <th className="pr-4">Intent</th>
              <th className="pr-4">Channel</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td className="py-2 pr-4">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="py-2 pr-4 max-w-xl truncate">{r.query}</td>
                <td>{r.intent}</td>
                <td>{r.channel}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-3">
          <div>Page {page + 1}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded" onClick={() => { if (page > 0) { setPage(p => p - 1); fetchResults(page - 1); }}}>Prev</button>
            <button className="px-3 py-1 border rounded" onClick={() => { setPage(p => p + 1); fetchResults(page + 1); }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
