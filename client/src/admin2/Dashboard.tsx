import { useEffect, useState } from "react";
import { exportCsv } from "./utils/exportCsv";

export default function Dashboard() {
  const [queries, setQueries] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const evt = new EventSource("/admin/queries/stream");
    evt.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setQueries((prev) => [...prev, data]);
    };
    return () => evt.close();
  }, []);

  const filtered = queries.filter((q) =>
    q.text.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Real-time User Queries</h2>

      <div className="flex gap-4">
        <input
          placeholder="Filter by text"
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => exportCsv(filtered, "queries.csv")}
        >
          Export CSV
        </button>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">User</th>
            <th className="p-3">Message</th>
            <th className="p-3">Time</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q, i) => (
            <tr key={i} className="border-b">
              <td className="p-3">{q.userId}</td>
              <td className="p-3">{q.text}</td>
              <td className="p-3">{new Date(q.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
