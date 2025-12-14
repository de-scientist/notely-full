// src/admin2/AdminSidebar.tsx

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

import { SidebarNavContent } from "./SidebarNavContent";

export function AdminSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className="dark:bg-gray-900 border-r dark:border-gray-800"
    >
      {/* --- Header (Sticky Top) --- */}
      <SidebarHeader className="flex items-center justify-between p-4 h-16">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-fuchsia-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Notely Admin
          </h1>
        </div>
        <SidebarTrigger className="text-gray-400 hover:text-white" />
      </SidebarHeader>

      <SidebarSeparator className="bg-gray-700/50" />

      {/* --- Content (Scrollable Area) --- 
                
                The shadcn/ui Sidebar component uses flex for its internal layout
                (Header | Content | Footer). The SidebarContent element is designed
                to use 'flex-1' and 'overflow-y-auto' to take up remaining space
                and enable scrolling *only* in this section.
                
                If you encounter scrolling issues, ensure the parent div in AdminApp.tsx
                provides the full height (min-h-screen).
            */}
      <SidebarContent className="py-4">
        <SidebarNavContent />
      </SidebarContent>

      {/* --- Footer (Sticky Bottom) --- */}
      <SidebarFooter className="border-t dark:border-gray-800 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-gray-300 hover:bg-gray-700/50 hover:text-white">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
