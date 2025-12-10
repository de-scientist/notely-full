// src/admin2/SidebarNavContent.tsx

import { Link, useLocation } from "react-router-dom";
import { Gauge, Upload, Users, List, MessageSquareText } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";

// --- Navigation Data (Centralized) ---
const navSections = [
    {
        title: "MAIN",
        items: [{ href: "/admin", title: "Dashboard", icon: Gauge }],
    },
    {
        title: "CONTENT & DATA",
        items: [
            { href: "/admin/rag", title: "RAG Manager", icon: Upload },
            { href: "/admin/table", title: "Query Table", icon: List },
        ],
    },
    {
        title: "COMMUNICATION",
        items: [
            { href: "/admin/inbox", title: "User Inbox", icon: Users },
            { href: "/admin/queries", title: "Search Log", icon: MessageSquareText },
        ],
    },
];

export function SidebarNavContent() {
    const location = useLocation();

    // Determine active link
    const getIsActive = (href: string) => {
        if (href === "/admin") {
            return location.pathname === href || location.pathname === "/";
        }
        return location.pathname.startsWith(`${href}`);
    };

    return (
        <div
            className="
                h-[calc(100vh-128px)] 
                overflow-y-auto 
                px-2 
                py-4 
                space-y-6
            "
        >
            {navSections.map((section) => (
                <SidebarGroup key={section.title}>
                    <SidebarGroupLabel className="text-gray-400">
                        {section.title}
                    </SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {section.items.map((item) => {
                                const isActive = getIsActive(item.href);

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className="group/button"
                                        >
                                            <Link
                                                to={item.href}
                                                className="flex items-center gap-3"
                                            >
                                                <item.icon
                                                    className={`h-5 w-5 ${
                                                        isActive
                                                            ? "text-white"
                                                            : "text-gray-400 group-hover/button:text-white"
                                                    }`}
                                                />
                                                <span className="truncate">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </div>
    );
}
