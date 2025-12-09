import { useQuery } from "@tanstack/react-query";
import { downloadCSV } from "@/lib/csv";
import { useQueryStream } from "../hooks/useQueryStream";
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react'; // Assuming lucide icons are available

// FIX 1: Define the expected type for a UserQuery object
type UserQuery = {
  id: string;
  userId: string | null;
  question: string;
  createdAt: string; // ISO Date String
};

export default function QueriesTable() {
  // Use the stream hook to update the cache in real-time
  useQueryStream();

  const { data = [], isLoading, error } = useQuery<UserQuery[]>({
    queryKey: ["admin-queries"],
    queryFn: () => fetch("/admin/queries").then(res => res.json()),
    // FIX 2: Removed `refetch` from destructuring since it wasn't used
  });

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-gray-600">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Fetching recent queries...
      </div>
    );
  }

  // Handle Error State
  if (error) {
    return <div className="p-4 text-red-600 border border-red-300 rounded-lg">Error loading queries: {error.message}</div>;
  }
  
  // Handle Empty State
  if (data.length === 0) {
    return <div className="p-4 text-gray-600 border rounded-lg bg-gray-50">No user queries recorded yet.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Recent User Queries ({data.length})</h1>
        <Button 
          onClick={() => downloadCSV(data, "user_queries.csv")} 
          variant="outline" 
          className="bg-green-500 hover:bg-green-600 text-white transition-colors"
        >
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 rounded-tl-lg">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Query Text</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 rounded-tr-lg w-1/5">Time</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {/* FIX 1: The 'q' parameter is now correctly typed as UserQuery */}
            {data.map((q) => (
              <tr key={q.id} className="hover:bg-indigo-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {q.userId || 'Guest'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-lg truncate">
                  {q.question}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(q.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}