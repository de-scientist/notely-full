import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/auth';
import { Button } from './components/ui/button';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotesListPage } from './pages/NotesListPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { NewEntryPage } from './pages/NewEntryPage';
import { EditEntryPage } from './pages/EditEntryPage';
import { TrashPage } from './pages/TrashPage';
import { ProfilePage } from './pages/ProfilePage';

// 👇 NEW AVATAR IMPORTS (Assuming path is correct)
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar"; 
// 👇 ADD SONNER IMPORTS
import { Toaster } from "./components/ui/sonner"; 

// Helper function to generate initials for the AvatarFallback
const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
  if (!firstName || !lastName) return 'NN';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

function AppHeader() {
  const { user } = useAuthStore();

  const isLoggedIn = !!user;

  // 👇 FIX: Assigning user.avatar (string | null) to a variable that handles the type conversion
  const avatarSrc = user?.avatar ?? undefined; 

  return (
    // Improved Header Styling: better color contrast, shadows, and spacing
    <header className="flex items-center justify-between border-b dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors hover:text-primary"
        >
          Notely
        </Link>
        {isLoggedIn && (
          // Navigation Links: Improved styling
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link to="/app/notes" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              My notes
            </Link>
            <Link to="/app/notes/new" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              New entry
            </Link>
            {/* Kept Profile and Trash in nav as per original logic */}
            <Link to="/app/profile" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Profile
            </Link>
            <Link to="/app/trash" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Trash
            </Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          // Guest Links: Using ghost button for less visual weight on Login
          <>
            <Link to="/login">
              <Button variant="ghost" className="text-sm dark:text-gray-300 hover:bg-accent">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="text-sm">Sign up</Button>
            </Link>
          </>
        )}
        
        {isLoggedIn && user && (
          // Logged-in Profile Area: Wrapped in Link for better UX
          <Link to="/app/profile" className="flex items-center gap-3 text-sm group">
            
            {/* Welcome Message: Enhanced visual hierarchy */}
            <span className="hidden text-right lg:inline">
              <span className="block text-xs text-muted-foreground">Welcome back,</span>
              <span className="block font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary">
                {user.firstName}
              </span>
            </span>
            
            {/* 👇 SHADCN AVATAR IMPLEMENTATION */}
            <Avatar className="h-9 w-9 border-2 border-transparent group-hover:border-primary transition-colors">
              {/* FIX: Use the 'avatarSrc' variable which converts null to undefined */}
              <AvatarImage 
                src={avatarSrc} 
                alt={`${user.firstName} ${user.lastName} Avatar`}
              />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            
          </Link>
        )}
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    // Added dark mode support to AppLayout background
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/app/notes" element={<NotesListPage />} />
            <Route path="/app/notes/new" element={<NewEntryPage />} />
            <Route path="/app/notes/:id" element={<NoteDetailPage />} />
            <Route path="/app/notes/:id/edit" element={<EditEntryPage />} />
            <Route path="/app/trash" element={<TrashPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {/* 👇 ADD TOASTER HERE */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}