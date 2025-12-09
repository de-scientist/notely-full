// src/admin2/AdminSidebar.tsx (New File)

import { LogOut, Home, ChevronDown } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";

// We'll import the navigation links from a separate file below
import { SidebarNavContent } from "./SidebarNavContent"; 

export function SidebarNav() {
    return (
        // Set collapsible="icon" to make it collapse to just icons (great UX)
        <Sidebar 
            collapsible="icon" 
            className="dark:bg-gray-900 border-r dark:border-gray-800"
        >
            
            {/* --- Header (Sticky Top) --- */}
            <SidebarHeader className="flex items-center justify-between p-4 h-16">
                <div className="flex items-center space-x-2">
                    <Home className="h-6 w-6 text-fuchsia-400" />
                    <h1 className="text-xl font-extrabold tracking-tight">Notely Admin</h1>
                </div>
                {/* Add the trigger to the header so it's always available */}
                <SidebarTrigger className="text-gray-300 hover:text-white" />
            </SidebarHeader>

            <SidebarSeparator />

            {/* --- Content (Scrollable Area) --- */}
            <SidebarContent className="py-4">
                <SidebarNavContent />
            </SidebarContent>

            {/* --- Footer (Sticky Bottom) --- */}
            <SidebarFooter className="border-t dark:border-gray-800 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="hover:bg-gray-700/50">
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}