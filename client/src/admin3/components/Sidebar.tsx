import { NavLink } from "react-router-dom";
import { FC } from "react";
import {
  LayoutDashboard,
  FileText,
  Mail,
  Database,
  Settings,
} from "lucide-react";

// Define the Link structure with an Icon component
const primaryLinks = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { name: "Notes Management", to: "/admin/notes", icon: FileText },
  { name: "User Inbox", to: "/admin/inbox", icon: Mail },
  { name: "AI/RAG Upload", to: "/admin/rag", icon: Database },
];

const systemLinks = [
  { name: "System Settings", to: "/admin/settings", icon: Settings },
];

const Sidebar: FC = () => (
  // Updated dark background and shadow for depth
  <aside className="w-64 h-screen bg-gray-900 dark:bg-gray-950 text-white flex flex-col p-4 shadow-xl sticky top-0">
    {/* Admin Title/Logo Area */}
    <div className="flex items-center space-x-2 pb-6 pt-2 border-b border-gray-700/50 mb-4">
      <div className="h-3 w-3 rounded-full bg-fuchsia-500"></div>{" "}
      {/* Branding Dot */}
      <h2 className="text-xl font-extrabold tracking-wider text-white">
        Notely Admin
      </h2>
    </div>

    {/* Primary Navigation Links */}
    <nav className="flex flex-col space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Main
      </p>
      {primaryLinks.map((link) => (
        <NavLink
          key={link.name}
          to={link.to}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 
            ${
              isActive
                ? // Active link: Fuchsia text/icon, light background glow
                  "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30 hover:bg-fuchsia-700"
                : // Inactive link: Gray text, hover effect
                  "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`
          }
        >
          {/* Icon Component */}
          <link.icon className="h-5 w-5" />
          {link.name}
        </NavLink>
      ))}
    </nav>

    {/* System/Settings Links (Separated) */}
    <div className="mt-auto pt-4 border-t border-gray-700/50">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        System
      </p>
      <nav className="flex flex-col space-y-2">
        {systemLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 
                        ${
                          isActive
                            ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/30 hover:bg-fuchsia-700"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  </aside>
);

export default Sidebar;
