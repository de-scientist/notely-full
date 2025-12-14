import { useQuery } from "@tanstack/react-query";
import { downloadCSV } from "@/lib/csv";
import { useQueryStream } from "@/admin/hooks/useQueryStream";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Shadcn Table components
import {
  Loader2,
  Download,
  Search,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming Badge component is available

// Define the expected type for a UserQuery object
type UserQuery = {
  id: string;
  userId: string | null;
  question: string;
  createdAt: string; // ISO Date String
};

// Define the API URL base for port 5000
const API_URL = "http://localhost:5000/admin/queries";

export default function QueryTable() {
  // Use the stream hook to update the cache in real-time
  useQueryStream();

  const {
    data: queries = [],
    isLoading,
    error,
  } = useQuery<UserQuery[]>({
    queryKey: ["admin-queries"],
    // ✅ FIX: Update queryFn to fetch from port 5000
    queryFn: () =>
      fetch(API_URL).then((res) => {
        if (!res.ok) {
          // Throw an error if the server response is not OK
          throw new Error(
            `Failed to fetch queries. Server status: ${res.status}`,
          );
        }
        return res.json();
      }),
  });

  // --- UI State Handlers ---

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="p-8 bg-white border rounded-xl shadow-lg flex justify-center items-center h-48 text-indigo-600">
        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        <span className="text-lg font-medium">Fetching recent queries...</span>
      </div>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-300 rounded-xl shadow-lg">
        <div className="flex items-center text-red-700">
          <AlertTriangle className="h-6 w-6 mr-3" />
          <h2 className="text-xl font-bold">Data Fetching Error</h2>
        </div>
        <p className="mt-2 text-red-600">
          Could not connect to the API server at **{API_URL}**.
        </p>
        <p className="text-sm mt-1 text-red-500">
          **Error Details:** {error.message}
        </p>
      </div>
    );
  }

  // Handle Empty State
  if (queries.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-100 border border-gray-300 rounded-xl shadow-lg">
        <MessageSquare className="h-10 w-10 text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">No Queries Yet</h2>
        <p className="text-gray-500 mt-2">
          The knowledge base hasn't received any user queries to log.
        </p>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <Search className="mr-3 h-7 w-7 text-indigo-600" />
          User Query Log
          <Badge
            variant="secondary"
            className="ml-3 text-lg font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
          >
            {queries.length}
          </Badge>
        </h1>

        <Button
          onClick={() => downloadCSV(queries, "user_queries.csv")}
          variant="outline"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="overflow-x-auto rounded-lg border">
        <Table className="w-full">
          <TableHeader className="bg-indigo-50 border-b">
            <TableRow className="hover:bg-indigo-50">
              <TableHead className="w-[150px] text-left text-xs font-bold uppercase text-indigo-700">
                User ID
              </TableHead>
              <TableHead className="text-left text-xs font-bold uppercase text-indigo-700">
                Query Text
              </TableHead>
              <TableHead className="w-[200px] text-left text-xs font-bold uppercase text-indigo-700">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {queries.map((q) => (
              <TableRow
                key={q.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <TableCell className="font-mono text-xs font-medium text-gray-900">
                  {q.userId ? q.userId.substring(0, 8) + "..." : "Guest"}
                </TableCell>
                <TableCell className="py-4 text-sm text-gray-800 font-medium">
                  {q.question}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(q.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption className="text-gray-500 py-3">
            Displaying {queries.length} recent queries logged by the system.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
