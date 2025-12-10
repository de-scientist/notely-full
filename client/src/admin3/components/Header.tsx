import React from "react";
import { useAdminStore } from "../store/adminStore";
import { Search, Menu, Sun, Moon, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth"; // Assuming auth store is the source of admin user details
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom"; // Use Link for navigation

// Helper to get user initials (can be shared with App.tsx)
const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
  if (!firstName || !lastName) return 'A';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// ----------------------------------------------------
// 💡 Admin User Dropdown Menu
// ----------------------------------------------------
function AdminUserNav() {
  // Assuming the admin user is stored in the general auth store
  const { user, clear } = useAuthStore();
  const avatarSrc = user?.avatar ?? undefined;

  const handleLogout = () => {
    // @ts-ignore - Assuming clear exists on useAuthStore
    clear(); 
    // The ProtectedAdminRoute will handle the redirect after clear()
  };

  if (!user) return null; // Should not happen in an admin route, but safe guard

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer group transition-opacity">
          <span className="hidden text-right lg:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
            {user.firstName}
          </span>
          <Avatar className="h-9 w-9 border-2 border-transparent hover:border-fuchsia-500 transition-colors">
            <AvatarImage src={avatarSrc} alt={`${user.firstName} Avatar`} />
            <AvatarFallback className="bg-fuchsia-600 text-primary-foreground font-bold text-xs">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Redirect to user profile outside admin panel */}
        <DropdownMenuItem asChild>
          <Link to="/app/profile" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" /> Profile Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/50">
          <LogOut className="h-4 w-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ----------------------------------------------------
// ✅ Updated Header Component
// ----------------------------------------------------
const Header: React.FC = () => {
  const { filter, setFilter } = useAdminStore();

  // Placeholder function for Dark Mode toggle
  const toggleDarkMode = () => {
      // In a real app, this would change a theme context or add/remove a 'dark' class on the HTML tag
      console.log('Toggling Dark Mode...');
  };
  
  // Placeholder function for Mobile Nav
  const handleMobileNavToggle = () => {
      console.log('Toggling Mobile Navigation...');
  };

  return (
    // Updated styling for modern admin panel header
    <header className="flex items-center justify-between border-b dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 sticky top-0 z-50">
      
      {/* Left Side: Title and Mobile Toggle */}
      <div className="flex items-center space-x-4">
        {/* Mobile menu toggle (assuming a responsive sidebar) */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMobileNavToggle}
            className="md:hidden"
        >
            <Menu className="h-6 w-6" />
        </Button>

        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Admin Dashboard
        </h1>
      </div>
      
      {/* Right Side: Search, Theme Toggle, and User */}
      <div className="flex items-center space-x-4">
        
        {/* Search Input using Shadcn Input */}
        <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                placeholder="Search users, notes, or messages..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-[200px] md:w-[300px] pl-9 h-9"
            />
        </div>

        {/* Dark Mode Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode} 
            aria-label="Toggle dark mode"
        >
            {/* Replace with logic to determine current mode */}
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
        
        {/* Admin User Navigation */}
        <AdminUserNav />
      </div>
    </header>
  );
};

export default Header;