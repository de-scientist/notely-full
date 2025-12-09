import { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { Loader2, TrendingUp, Zap, MessageSquare } from "lucide-react"; // Icons for better visual hierarchy

// FIX 1: Update data types to include an index signature for Recharts compatibility
interface ChartDataInput {
  [key: string]: any; // Add index signature
  count: number;
}

interface IntentData extends ChartDataInput {
  intent: string;
}

interface HourlyData extends ChartDataInput {
  hour: string;
}

interface QueryData extends ChartDataInput {
  query: string;
}

export default function AnalyticsDashboard() {
  const [intents, setIntents] = useState<IntentData[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [topQueries, setTopQueries] = useState<QueryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#3B82F6", "#F97316"]; // Tailwind-inspired colors

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [intentsRes, hourlyRes, topRes] = await Promise.all([
        fetch("/api/analytics/intents"),
        fetch("/api/analytics/hourly"),
        fetch("/api/analytics/top-queries"),
      ]);

      if (!intentsRes.ok || !hourlyRes.ok || !topRes.ok) {
        throw new Error("Failed to fetch all analytics data.");
      }

      const [intentsData, hourlyData, topData] = await Promise.all([
        intentsRes.json(),
        hourlyRes.json(),
        topData.json(),
      ]);

      // Intents Data
      setIntents(intentsData.intents || intentsData);

      // Hourly Data Mapping and Sorting
      const mappedHourly = hourlyData.hourly?.map((h: any) => ({
        hour: new Date(h.hour).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        count: Number(h.count)
      })) || [];
      setHourly(mappedHourly);

      // Top Queries Data
      setTopQueries(topData.top || topData);

    } catch (e) {
      console.error(e);
      setError("Error loading dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <div className="p-12 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg m-6">
        ❌ {error} Please check the server logs.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Zap className="w-7 h-7 mr-3 text-indigo-600" />
          Notely AI — Analytics Dashboard
        </h2>
        <p className="text-gray-500">Insights into user engagement with the AI assistant.</p>
      </header>
      
      {isLoading && (
        <div className="flex justify-center items-center h-64 text-indigo-600">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          Loading Analytics...
        </div>
      )}

      {!isLoading && (
        <section className="space-y-8">
          {/* --- TOP ROW: INTENTS AND HOURLY TRAFFIC --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Intents Distribution (Pie Chart) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-indigo-500" /> Intent Distribution
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={intents} 
                      dataKey="count" 
                      nameKey="intent" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={50}
                      outerRadius={100} 
                      paddingAngle={5}
                      fill="#8884d8"
                      labelLine={false}
                      // FIX 2: Added null check for 'percent'
                      label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {intents.map((_, idx) => ( // FIX 3: Changed 'entry' to '_' to ignore the unused variable
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [`Count: ${value}`, name]} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Hourly Traffic (Line Chart) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" /> Hourly Traffic (Last 7 Days)
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={hourly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="hour" angle={-30} textAnchor="end" height={60} interval="preserveStartEnd" stroke="#666" />
                  <YAxis allowDecimals={false} stroke="#666" />
                  <Tooltip labelFormatter={(value) => `Time: ${value}`} />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={false} name="Requests" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* --- BOTTOM ROW: TOP QUERIES TABLE --- */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="font-bold text-xl mb-4 text-gray-800">🔥 Top 30 User Queries</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/4">Query</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topQueries.map((r, i) => (
                    <tr key={i} className="hover:bg-indigo-50/50 transition duration-150 ease-in-out">
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">{r.query}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 font-bold">{r.count}</td>
                    </tr>
                  ))}
                  {topQueries.length === 0 && (
                    <tr>
                       <td colSpan={2} className="px-6 py-4 text-center text-gray-500 italic">No queries logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}