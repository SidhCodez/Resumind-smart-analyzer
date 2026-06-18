import { Link, useLocation } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import { IconLogout } from './Icons';

export default function Navbar() {
  const location = useLocation();
  const { auth } = usePuterStore();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-gray-900">
          <img src="/favicon.png" alt="Resumind logo" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-lg tracking-tight">Resumind</span>
        </Link>

        <div className="flex items-center gap-3">
          {location.pathname !== '/upload' && (
            <Link to="/upload" className="primary-button !px-4 !py-2 text-sm">
              Upload Resume
            </Link>
          )}
          {auth.isAuthenticated && (
            <button
              onClick={() => auth.signOut()}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              title="Sign out"
            >
              <IconLogout className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
