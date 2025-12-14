import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Upload,
  MessageSquare,
  ListChecks,
  LayoutDashboard,
  Feather,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import React from "react"; // Explicitly import React for the FC type

// Brand Color Classes
const BRAND_ACCENT = "text-fuchsia-500";
const SIDEBAR_BG = "bg-gray-50 dark:bg-gray-900";
const SIDEBAR_TEXT = "text-gray-700 dark:text-gray-300";
const ACTIVE_HOVER_BG = "hover:bg-fuchsia-50 dark:hover:bg-gray-800";
const ACTIVE_BG = "bg-fuchsia-100/70 dark:bg-fuchsia-950/40";

// ✅ FIX: Define the props interface to resolve the 7031 errors
interface SidebarLinkProps {
  to: string;
  icon: React.ElementType; // Use React.ElementType for the Lucide icon component
  children: React.ReactNode;
}

// --- Sidebar Link Component (Encapsulates Shadcn Button style) ---
// ✅ FIX: Apply the explicit type to the functional component
const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  children,
}) => {
  const location = useLocation();
  // Logic for setting the 'active' state
  const isActive =
    location.pathname === to ||
    (to !== "/admin" && location.pathname.startsWith(to));

  return (
    <Button
      asChild
      variant="ghost"
      className={`
                w-full justify-start h-11 px-4 text-sm font-semibold transition-all duration-150
                ${SIDEBAR_TEXT}
                ${ACTIVE_HOVER_BG}
                ${
                  isActive
                    ? `${ACTIVE_BG} ${BRAND_ACCENT} font-bold`
                    : "hover:text-fuchsia-600 dark:hover:text-fuchsia-300"
                }
            `}
    >
      <Link to={to} className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <span>{children}</span>
      </Link>
    </Button>
  );
};

// =========================================================================
// 🚀 AdminLayout Component
// =========================================================================
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* 1. Sidebar (Fixed Width, Shadcn/Tailwind Aesthetics) */}
      <aside
        className={`w-64 border-r dark:border-gray-700 ${SIDEBAR_BG} p-4 flex flex-col shadow-md`}
      >
        <div className="pt-2 pb-6 px-1">
          <Link
            to="/"
            className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 ${BRAND_ACCENT} transition-colors`}
          >
            <Feather className={`h-6 w-6`} />
            <span className="text-gray-900 dark:text-white">Notely</span>
            <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 ml-1">
              Admin
            </span>
          </Link>
        </div>

        <Separator className="dark:bg-gray-700 mb-4" />

        <nav className="space-y-1 flex-1">
          <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-4 px-4 mb-1">
            Overview
          </h3>
          <SidebarLink to="/admin" icon={LayoutDashboard}>
            Dashboard
          </SidebarLink>

          <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-6 px-4 mb-1">
            Management
          </h3>
          <SidebarLink to="/admin/rag" icon={Upload}>
            RAG Knowledge Base
          </SidebarLink>
          <SidebarLink to="/admin/queries" icon={ListChecks}>
            User Queries
          </SidebarLink>
          <SidebarLink to="/admin/messages" icon={MessageSquare}>
            User Messages
          </SidebarLink>
        </nav>

        <div className="mt-auto text-xs text-center text-gray-400 p-2 border-t dark:border-gray-700">
          <p className="py-2">Notely Admin Console</p>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 bg-gray-100 dark:bg-gray-950 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
