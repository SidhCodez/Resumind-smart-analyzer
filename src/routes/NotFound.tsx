import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">This page doesn't exist.</p>
      <Link to="/" className="primary-button mt-2">
        Back to Home
      </Link>
    </div>
  );
}
