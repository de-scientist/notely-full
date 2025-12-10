import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper

const Dashboard: FC = () => {
  const { data: stats } = useQuery(["adminStats"], () =>
    api.get("/admin/stats").then(res => res.data)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow">Users: {stats?.users}</div>
        <div className="bg-white p-4 rounded shadow">Notes: {stats?.notes}</div>
        <div className="bg-white p-4 rounded shadow">AI Notes: {stats?.aiNotes}</div>
        <div className="bg-white p-4 rounded shadow">Pending Messages: {stats?.messages}</div>
      </div>
    </div>
  );
};

export default Dashboard;
