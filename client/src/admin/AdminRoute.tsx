// AdminRoute.tsx
import AdminLayout from "./components/AdminLayout";
import RAGUploader from "./components/RAGUploader";
import QueriesTable from "./components/QueriesTable";
import MessagesInbox from "./components/MessagesInbox";
import { Routes, Route } from "react-router-dom";

// New: Placeholder for the Dashboard Index Page
const AdminDashboardIndex = () => (
    <div className="flex flex-col items-center justify-center h-full p-10 bg-white rounded-xl shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-50 mb-4">Welcome to the Notely Admin Dashboard!</h2>
        <p className="text-gray-500 dark:text-gray-400">
            Use the navigation panel on the left to manage the system: view user queries, respond to messages, or update the RAG knowledge base.
        </p>
    </div>
);


export default function AdminRoute() {
  return (
    <Routes>
      {/* Parent path: /admin, using empty path "" to inherit the parent router's path segment */}
      <Route path="" element={<AdminLayout />}>
        <Route path="rag" element={<RAGUploader />} />
        <Route path="queries" element={<QueriesTable />} />
        <Route path="messages" element={<MessagesInbox />} />
        
        {/* Index route uses the new placeholder component */}
        <Route index element={<AdminDashboardIndex />} />
      </Route>
    </Routes>
  );
}