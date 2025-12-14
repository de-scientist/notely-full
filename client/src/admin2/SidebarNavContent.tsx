// src/admin2/SidebarNavContent.tsx

import { Link, useLocation } from "react-router-dom";
import {
  Gauge,
  Upload,
  Users,
  List,
  MessageSquareText,
  ChevronDown,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
// Assuming these are available from shadcn/ui or similar setup
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
    <div className="space-y-4">
      {" "}
      {/* Reduced spacing for a denser, collapsible layout */}
      {navSections.map((section) => (
        // 1. Wrap the entire group in Collapsible
        <Collapsible
          key={section.title}
          defaultOpen={true}
          className="group/collapsible"
        >
          <SidebarGroup>
            {/* 2. Use the SidebarGroupLabel as the Collapsible Trigger */}
            <SidebarGroupLabel
              asChild // This is crucial for accessibility to pass props to the CollapsibleTrigger
            >
              <CollapsibleTrigger className="w-full flex justify-between items-center pr-3 mb-2 cursor-pointer text-xs font-semibold tracking-wider uppercase text-gray-500 dark:text-gray-400 hover:text-white transition-colors">
                {section.title}
                {/* 3. Add the Chevron icon that rotates on open/close */}
                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>

            {/* 4. Wrap the content in CollapsibleContent */}
            <CollapsibleContent>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = getIsActive(item.href);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className="group/button text-sm font-medium transition-colors"
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
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </div>
  );
}
