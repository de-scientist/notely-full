import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import RagUploader from "./RagUploader";
import UserInbox from "./UserInbox";
import QueryTable from "./QueryTable";

export default function AdminApp() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <aside className="w-64 bg-gray-900 text-white p-6 space-y-6">
          <h1 className="text-xl font-bold">Notely Admin</h1>

          <a href="/admin" className="block">Dashboard</a>
          <a href="/admin/rag" className="block">RAG Manager</a>
          <a href="/admin/inbox" className="block">User Messages</a>
          <a href="/admin/table" className="block">Query Table</a>
        </aside>

        <main className="flex-1 bg-gray-100">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/rag" element={<RagUploader />} />
            <Route path="/admin/inbox" element={<UserInbox />} />
            <Route path="/admin/table" element={<QueryTable />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
