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
import AppFooter from './components/AppFooter';
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar"; 
import { Toaster } from "./components/ui/sonner"; 

// 💜 OneNote-inspired color classes
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const PRIMARY_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700";
const PRIMARY_HOVER_CLASS = "hover:text-fuchsia-600 dark:hover:text-fuchsia-500";
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";


const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
  if (!firstName || !lastName) return 'NN';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

function AppHeader() {
  const { user } = useAuthStore();
  const isLoggedIn = !!user;
  const avatarSrc = user?.avatar ?? undefined; 

  return (
    <header className="flex items-center justify-between border-b dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 shadow-sm">
      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          // 👇 Updated text color hover
          className={`text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors ${PRIMARY_HOVER_CLASS}`}
        >
          Notely
        </Link>
        {isLoggedIn && (
          <nav className="flex items-center gap-4 text-sm font-medium">
            {/* 👇 Updated navigation link hover color */}
            <Link to="/app/notes" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS}`}>
              My notes
            </Link>
            <Link to="/app/notes/new" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS}`}>
              New entry
            </Link>
            <Link to="/app/profile" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS}`}>
              Profile
            </Link>
            <Link to="/app/trash" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS}`}>
              Trash
            </Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <>
            <Link to="/login">
              <Button 
                variant="ghost" 
                // 👇 Updated hover text color for consistency
                className={`h-12 px-8 text-lg font-semibold ${GRADIENT_CLASS}`}
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              {/* NOTE: This button needs custom gradient/color in the button component itself for consistency */}
              <Button 
                className="border-2 border-fuchsia-600 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white transition-all font-semibold rounded-full px-12 py-7 text-lg dark:border-fuchsia-400 dark:hover:bg-emerald-800"
              >
                Sign up
              </Button>
            </Link>
          </>
        )}
        
        {isLoggedIn && user && (
          <Link to="/app/profile" className="flex items-center gap-3 text-sm group">
            
            <span className="hidden text-right lg:inline">
              <span className="block text-xs text-muted-foreground">Welcome back,</span>
              {/* 👇 Updated text color hover */}
              <span className={`block font-semibold text-gray-800 dark:text-gray-100 group-hover:${PRIMARY_TEXT_CLASS}`}>
                {user.firstName}
              </span>
            </span>
            
            <Avatar 
              // 👇 Updated border hover color
              className={`h-9 w-9 border-2 border-transparent group-hover:border-fuchsia-600 transition-colors`}
            >
              <AvatarImage 
                src={avatarSrc} 
                alt={`${user.firstName} ${user.lastName} Avatar`}
              />
              {/* 👇 Updated background color for fallback initials */}
              <AvatarFallback className={`${PRIMARY_BG_CLASS} text-primary-foreground font-bold text-xs`}>
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

      <AppFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}