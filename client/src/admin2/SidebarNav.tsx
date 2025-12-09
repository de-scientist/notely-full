// src/components/SidebarNav.tsx (You would create this file)

import { Link, useLocation } from "react-router-dom";
import { Gauge, Upload, Users, List, Home } from "lucide-react";

// Define the navigation items
const navItems = [
    {
        href: "/admin",
        title: "Dashboard",
        icon: Gauge,
    },
    {
        href: "/admin/rag",
        title: "RAG Manager",
        icon: Upload,
    },
    {
        href: "/admin/inbox",
        title: "User Messages",
        icon: Users,
    },
    {
        href: "/admin/table",
        title: "Query Table",
        icon: List,
    },
];

export function SidebarNav() {
    const location = useLocation();

    return (
        <nav className="flex flex-col space-y-2 p-2">
            {navItems.map((item) => {
                // Check if the current path matches the item's href
                const isActive = location.pathname === item.href;
                
                return (
                    <Link
                        key={item.href}
                        to={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-700/50 ${
                            isActive
                                ? "bg-fuchsia-600/90 text-white shadow-md hover:bg-fuchsia-700"
                                : "text-gray-300 hover:text-white"
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}