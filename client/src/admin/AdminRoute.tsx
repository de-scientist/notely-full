import AdminLayout from "./components/AdminLayout";
import RAGUploader from "./components/RAGUploader";
import QueriesTable from "./components/QueriesTable";
import MessagesInbox from "./components/MessagesInbox";
import { Routes, Route } from "react-router-dom";

export default function AdminRoute() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="rag" element={<RAGUploader />} />
        <Route path="queries" element={<QueriesTable />} />
        <Route path="messages" element={<MessagesInbox />} />
      </Route>
    </Routes>
  );
}
