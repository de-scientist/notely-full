import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { useAuthStore } from './store/auth';
import { Avatar, Button } from './components/ui';
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

function AppHeader() {
  const { user } = useAuthStore();

  const isLoggedIn = !!user;

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-lg font-semibold text-gray-900">
          Notely
        </Link>
        {isLoggedIn && (
          <nav className="flex items-center gap-3 text-sm text-gray-700">
            <Link to="/app/notes" className="hover:text-blue-600">
              My notes
            </Link>
            <Link to="/app/notes/new" className="hover:text-blue-600">
              New entry
            </Link>
            <Link to="/app/profile" className="hover:text-blue-600">
              Profile
            </Link>
            <Link to="/app/trash" className="hover:text-blue-600">
              Trash
            </Link>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {!isLoggedIn && (
          <>
            <Link to="/login" className="text-sm text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link to="/register">
              <Button className="text-sm">Sign up</Button>
            </Link>
          </>
        )}
        {isLoggedIn && user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-gray-700 sm:inline">
              Welcome back, <span className="font-semibold">{user.firstName}</span>
            </span>
            <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} />
          </div>
        )}
      </div>
    </header>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
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
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
