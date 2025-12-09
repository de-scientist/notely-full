import { Routes, Route } from "react-router-dom"; // Removed BrowserRouter
import { SidebarNav } from "./SidebarNav"; 
import Dashboard from "./Dashboard";
import RagUploader from "./RagUploader";
import UserInbox from "./UserInbox";
import QueryTable from "./QueryTable";
import { Separator } from "@/components/ui/separator"; 
import { LogOut, Home } from "lucide-react"; 

export default function AdminApp() {
    return (
        // REMOVED: <BrowserRouter> - The router is now provided by the parent component (e.g., App.tsx)

        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
            
            {/* --- Sidebar (Fixed Width, Dark Theme) --- */}
            <aside className="fixed w-64 h-full bg-gray-900 text-white flex flex-col p-4 z-10 shadow-2xl">
                <div className="flex items-center space-x-2 px-2 py-4">
                    <Home className="h-6 w-6 text-fuchsia-400" />
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Notely Admin
                    </h1>
                </div>

                <Separator className="bg-gray-700/50 my-2" />

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto">
                    <SidebarNav />
                </div>

                {/* Sidebar Footer (e.g., Logout or User Info) */}
                <Separator className="bg-gray-700/50 my-2" />
                <div className="p-2">
                    <button className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-gray-400 transition-all hover:bg-gray-700/50 hover:text-white">
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* --- Main Content Area --- */}
            <main className="flex-1 ml-64 p-6 overflow-auto">
                <Routes>
                    {/* FIX: Paths are now RELATIVE to the parent route path="/admin/*" */}
                    <Route path="/" element={<Dashboard />} /> 
                    <Route path="/rag" element={<RagUploader />} /> 
                    <Route path="/inbox" element={<UserInbox />} />
                    <Route path="/table" element={<QueryTable />} /> 
                    
                    {/* The original redirect path="/" is now path="" for relative indexing */}
                    <Route index element={<Dashboard />} /> 
                </Routes>
            </main>
        </div>
        // REMOVED: </BrowserRouter>
    );
}