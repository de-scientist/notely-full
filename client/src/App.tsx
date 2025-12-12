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

// 🚨 NEW ROUTES: Placeholder components for the utility pages
import { PrivacyPolicy } from './pages/PrivacyPolicy'; // Assuming you have these components
import { TermsOfService } from './pages/TermsOfService';
import { HelpSupport } from './pages/HelpSupport';
import { ContactPage } from './pages/ContactPage';
import Chatbot from './components/AI/Chatbot';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
// ⭐ REQUIRED IMPORT FOR SHARED ROUTE
import { SharedNotePage } from './pages/SharedNotePage';
//import AdminRoute from './admin/AdminRoute';
import AdminApp from './admin3/AdminApp';
import { AuthCallbackPage } from './pages/AuthCallback';
//import ProtectedAdminRoute from './admin3/ProtectedAdminRoute';

// Shadcn imports for User Dropdown (Assuming basic components)
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { LogOut, Settings, Feather } from 'lucide-react'; 


// 💜 OneNote-inspired color classes
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const PRIMARY_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700";
const PRIMARY_HOVER_CLASS = "hover:text-fuchsia-600 dark:hover:text-fuchsia-500";
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";
// Defined complementary class for secondary CTA consistency
const COMPLEMENTARY_GRADIENT_CLASS = "bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-md shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.03]";
const SECONDARY_BUTTON_CLASS = "border-2 border-fuchsia-600 hover:bg-fuchsia-50/20 text-fuchsia-600 dark:border-fuchsia-400 dark:text-fuchsia-400 dark:hover:bg-fuchsia-900/20 transition-all font-semibold";

const getInitials = (firstName: string | undefined, lastName: string | undefined): string => {
  if (!firstName || !lastName) return 'NN';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// =========================================================================
// 💡 NEW UX COMPONENT: User Dropdown Menu
// =========================================================================
function UserNav() {
    const { user, clear } = useAuthStore();
    const avatarSrc = user?.avatar ?? undefined;

    // Use a function to safely call logout and handle navigation/UI state
    const handleLogout = () => {
        // Assuming logout is a synchronous action on the store
        // In a real app, you might await an API call here.
        // @ts-ignore - Assuming logout exists on useAuthStore
        clear(); 
        // No need to navigate, as ProtectedRoute will handle redirect.
    };

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity">
                    <span className="hidden text-right lg:inline">
                        <span className="block text-xs text-muted-foreground">Welcome back,</span>
                        <span className={`block font-semibold text-gray-800 dark:text-gray-100 group-hover:${PRIMARY_TEXT_CLASS}`}>
                            {user.firstName}
                        </span>
                    </span>
                    <Avatar 
                        className={`h-9 w-9 border-2 border-transparent group-hover:border-fuchsia-600 transition-colors`}
                    >
                        <AvatarImage 
                            src={avatarSrc} 
                            alt={`${user.firstName} ${user.lastName} Avatar`}
                        />
                        <AvatarFallback className={`${PRIMARY_BG_CLASS} text-primary-foreground font-bold text-xs`}>
                            {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/app/profile" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" /> Profile Settings
                    </Link>
                </DropdownMenuItem>
                {/* Add other utility links here if needed, e.g., Billing */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className={`flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:!bg-red-50 dark:hover:!bg-red-900/50`}>
                    <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// =========================================================================
// ✏️ UPDATED: AppHeader
// =========================================================================
function AppHeader() {
  const { user } = useAuthStore();
  const isLoggedIn = !!user;

  return (
    <header className="flex items-center justify-between border-b dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link 
          to="/" 
          className={`text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white transition-colors ${PRIMARY_HOVER_CLASS} flex items-center gap-2`}
        >
            <Feather className={`h-6 w-6 ${PRIMARY_TEXT_CLASS}`} />
            Notely
        </Link>
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {/* Using a cleaner link style for logged-in navigation */}
            <Link to="/app/notes" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS} hover:underline underline-offset-4`}>
              My notes
            </Link>
            <Link to="/app/notes/new" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS} hover:underline underline-offset-4`}>
              New entry
            </Link>
            <Link to="/app/trash" className={`text-gray-600 dark:text-gray-300 transition-colors ${PRIMARY_HOVER_CLASS} hover:underline underline-offset-4`}>
              Trash
            </Link>
          </nav>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {!isLoggedIn && (
          <>
            {/* Secondary CTA: Login */}
            <Link to="/login">
              <Button 
                variant="outline" 
                className={`
                    h-9 px-6 text-md font-semibold 
                    ${SECONDARY_BUTTON_CLASS}
                `}
              >
                Log in
              </Button>
            </Link>
            {/* Primary CTA: Sign up */}
            <Link to="/register">
              <Button 
                className={`
                    h-10 px-8 text-md font-semibold 
                    ${GRADIENT_CLASS}
                `}
              >
                Sign up
              </Button>
            </Link>
          </>
        )}
        
        {isLoggedIn && <UserNav />}

      </div>
    </header>
  );
}

// =========================================================================
// ✏️ FIXED: AppLayout
// =========================================================================
function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <AppHeader />
      <main className="mx-auto w-full flex-1"> 
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* <Route element={<ProtectedAdminRoute />}> */}
  <Route path="/admin/*" element={<AdminApp />} />
{/* </Route> */}

          
          {/* Shared Note Route */}
          <Route path="/share/:id" element={<SharedNotePage />} />

          {/* Utility Routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/contact" element={<ContactPage />} />
         

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app/notes" element={<NotesListPage />} />
            <Route path="/app/notes/new" element={<NewEntryPage />} />
            <Route path="/app/notes/:id" element={<NoteDetailPage />} />
            <Route path="/app/notes/:id/edit" element={<EditEntryPage />} />
            <Route path="/app/trash" element={<TrashPage />} />
            <Route path="/app/profile" element={<ProfilePage />} />
            <Route path="/app/analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* ✅ CORRECT FIX: AdminRoute now properly lives inside <Routes> */}
{/*           <Route path="/admin/*" element={<AdminRoute />} /> */}
          
          {/* Fallback Route - remains last */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Components that are NOT routes remain outside the <Routes> block */}
      <Chatbot />
      <AppFooter />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}