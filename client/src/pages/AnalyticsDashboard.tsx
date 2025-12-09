// AnalyticsDashboard.tsx
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AnalyticsDashboard() {
  const [intents, setIntents] = useState<any[]>([]);
  const [hourly, setHourly] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/analytics/intents").then((r) => r.json()).then((d) => setIntents(d.intents || d));
    fetch("/api/analytics/hourly").then((r) => r.json()).then((d) => {
      const mapped = d.hourly?.map((h: any) => ({ hour: new Date(h.hour).toLocaleString(), count: Number(h.count) })) || [];
      setHourly(mapped);
    });
    fetch("/api/analytics/top-queries").then((r) => r.json()).then((d) => setRecent(d.top || d));
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0"];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Notely AI — Analytics</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Intents</h3>
          <PieChart width={300} height={220}>
            <Pie data={intents} dataKey="count" nameKey="intent" cx="50%" cy="50%" outerRadius={70} label>
              {intents.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Hourly (last 7 days)</h3>
          <LineChart width={500} height={200} data={hourly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-2">Top Queries</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Query</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r: any, i: number) => (
              <tr key={i}>
                <td className="py-2 pr-4">{r.query}</td>
                <td>{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
