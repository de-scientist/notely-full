import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotesTable from "./pages/NotesTable";
import UserInbox from "./pages/UserInbox";
import RagUploader from "./pages/RagUploader";
import Sidebar from "./components/Sidebar";

export default function AdminApp() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<NotesTable />} />
          <Route path="/inbox" element={<UserInbox />} />
          <Route path="/rag" element={<RagUploader />} />
        </Routes>
      </div>
    </div>
  );
}
