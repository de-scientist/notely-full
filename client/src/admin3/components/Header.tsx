import React from "react";
import { useAdminStore } from "../store/adminStore";

const Header: React.FC = () => {
  const { filter, setFilter } = useAdminStore();

  return (
    <header className="flex items-center justify-between bg-white shadow p-4">
      <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1 border rounded focus:outline-none focus:ring focus:ring-blue-400"
        />
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Admin</span>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700">A</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
