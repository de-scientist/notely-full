import { useQuery } from "@tanstack/react-query";
import { downloadCSV } from "@/lib/csv";
import { useQueryStream } from "../hooks/useQueryStream";
import { Button } from "@/components/ui/button";

export default function QueriesTable() {
  useQueryStream();

  const { data = [], refetch } = useQuery({
    queryKey: ["admin-queries"],
    queryFn: () => fetch("/admin/queries").then(res => res.json()),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Queries</h1>
        <Button onClick={() => downloadCSV(data, "queries.csv")}>Export CSV</Button>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">User</th>
            <th className="p-2 border">Query</th>
            <th className="p-2 border">Time</th>
          </tr>
        </thead>

        <tbody>
          {data.map((q) => (
            <tr key={q.id}>
              <td className="border p-2">{q.userId}</td>
              <td className="border p-2">{q.question}</td>
              <td className="border p-2">{new Date(q.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
