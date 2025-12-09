// AdminRoute.tsx
import AdminLayout from "./components/AdminLayout";
import RAGUploader from "./components/RAGUploader";
import QueriesTable from "./components/QueriesTable";
import MessagesInbox from "./components/MessagesInbox";
import { Routes, Route } from "react-router-dom";

export default function AdminRoute() {
  return (
    <Routes>
      {/* Parent path: /admin */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* FIX: Removed leading slash (/) from nested paths */}
        <Route path="rag" element={<RAGUploader />} />
        <Route path="queries" element={<QueriesTable />} />
        <Route path="messages" element={<MessagesInbox />} />
        
        {/* OPTIONAL: Add an index route to display content when visiting just /admin */}
        <Route index element={<h2 className="text-xl">Welcome to the Admin Dashboard! Select a section from the sidebar.</h2>} />
      </Route>
    </Routes>
  );
}