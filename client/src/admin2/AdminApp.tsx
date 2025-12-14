// src/admin2/AdminApp.tsx

import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import RagUploader from "./RagUploader";
import UserInbox from "./UserInbox";
import QueryTable from "./QueryTable";

// Assuming you have these global components
//import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

// Sidebar components
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./SidebarNav"; // The component you just updated

export default function AdminApp() {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* 1. Main Application Wrapper: Use flex-col and h-screen */}
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
        {/* 2. Global Header (Fixed Height) */}
        {/* <AppHeader />  */}

        {/* 3. Main Body Container: flex-1 takes up all remaining vertical space */}
        <div className="flex flex-1 overflow-hidden">
          {/* 4. Sidebar: Fixed to the side. Its height is constrained by this flex container. */}
          <AdminSidebar />

          {/* 5. Main Content Area: Takes up remaining horizontal space and allows scrolling of page content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rag" element={<RagUploader />} />
              <Route path="/inbox" element={<UserInbox />} />
              <Route path="/table" element={<QueryTable />} />
              <Route index element={<Dashboard />} />
            </Routes>
          </main>
        </div>

        {/* 6. Global Footer (Fixed Height) */}
        <AppFooter />
      </div>
    </SidebarProvider>
  );
}
