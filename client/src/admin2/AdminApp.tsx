// src/admin2/AdminApp.tsx

import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import RagUploader from "./RagUploader";
import UserInbox from "./UserInbox";
import QueryTable from "./QueryTable";
// Import the new components
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; 
import { SidebarNav } from "./SidebarNav"; // New wrapper component

export default function AdminApp() {
    return (
        // The SidebarProvider manages the state (open/closed)
        // and handles the keyboard shortcut (cmd+b / ctrl+b).
        <SidebarProvider defaultOpen={true}> 
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
                
                {/* --- Sidebar Component --- */}
                {/* This component will render the actual sidebar structure */}
                <SidebarNav /> 

                {/* --- Main Content Area --- */}
                {/* The main content area shifts dynamically based on the sidebar state (handled by the Sidebar component itself) */}
                <main className="flex-1 p-6 overflow-auto">
                    {/* Optional: Add a trigger button, usually in a top header */}
                    {/* <SidebarTrigger /> */} 

                    <Routes>
                        {/* Paths are relative to the parent /admin/* route */}
                        <Route path="/" element={<Dashboard />} /> 
                        <Route path="/rag" element={<RagUploader />} /> 
                        <Route path="/inbox" element={<UserInbox />} />
                        <Route path="/table" element={<QueryTable />} /> 
                        <Route index element={<Dashboard />} /> 
                    </Routes>
                </main>
            </div>
        </SidebarProvider>
    );
}