import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import { IconSparkle } from '~/components/Icons';

export default function Auth() {
  const { auth, isLoading } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();
  const next = new URLSearchParams(location.search).get('next') || '/';

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [auth.isAuthenticated, next, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <IconSparkle className="h-7 w-7" />
        </span>
        <h1 className="text-xl font-bold text-gray-900">Welcome to Resumind</h1>
        <p className="mt-2 text-sm text-gray-500">
          Sign in with your Puter account to start analyzing resumes — free, no credit card needed.
        </p>

        <button
          onClick={() => auth.signIn()}
          disabled={isLoading}
          className="auth-button mt-6"
        >
          {isLoading ? 'Signing in…' : 'Sign in with Puter'}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          Your resumes are stored privately in your own Puter cloud account.
        </p>
      </div>
    </div>
  );
}
