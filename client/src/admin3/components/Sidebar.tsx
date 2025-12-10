import { NavLink } from "react-router-dom";
import { FC } from "react";

const links = [
  { name: "Dashboard", to: "/admin" },
  { name: "Notes", to: "/admin/notes" },
  { name: "User Inbox", to: "/admin/inbox" },
  { name: "RAG Upload", to: "/admin/rag" },
];

const Sidebar: FC = () => (
  <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 space-y-4">
    <h2 className="text-xl font-bold mb-4">Notely Admin</h2>
    {links.map((link) => (
      <NavLink
        key={link.name}
        to={link.to}
        className={({ isActive }) =>
          `p-2 rounded hover:bg-gray-800 ${isActive ? "bg-gray-700" : ""}`
        }
      >
        {link.name}
      </NavLink>
    ))}
  </aside>
);

export default Sidebar;
