import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { usePuterStore } from '~/lib/puter';
import Navbar from '~/components/Navbar';

export default function RootLayout() {
  const { init, isLoading, error } = usePuterStore();

  useEffect(() => {
    init();
  }, [init]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-rose-600">Something went wrong</h1>
        <p className="max-w-md text-sm text-gray-500">{error}</p>
        <button onClick={() => window.location.reload()} className="primary-button mt-2">
          Reload
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
        <p className="text-sm text-gray-400">Starting up Resumind…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
