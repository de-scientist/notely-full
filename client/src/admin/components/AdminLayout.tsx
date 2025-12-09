import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold">Notely Admin</h1>

        <nav className="space-y-2">
          <Link to="/admin/rag" className="block hover:underline">RAG Uploader</Link>
          <Link to="/admin/queries" className="block hover:underline">User Queries</Link>
          <Link to="/admin/messages" className="block hover:underline">User Messages</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
