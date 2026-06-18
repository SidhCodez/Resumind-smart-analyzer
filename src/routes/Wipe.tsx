import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import type { FSItem } from '~/types';
import { IconTrash } from '~/components/Icons';

export default function Wipe() {
  const { auth, fs, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [wiping, setWiping] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/wipe');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    fs.readDir('./').then((items) => setFiles(items || []));
  }, [auth.isAuthenticated, fs]);

  const handleWipe = async () => {
    setWiping(true);
    try {
      for (const file of files) {
        await fs.delete(file.path);
      }
      const keys = (await kv.list('resume:*', false)) as unknown as string[];
      for (const key of keys || []) {
        await kv.delete(key);
      }
      setDone(true);
    } finally {
      setWiping(false);
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <IconTrash className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-bold text-gray-900">Wipe All Data</h1>
      <p className="mt-2 text-sm text-gray-500">
        This will permanently delete all your uploaded resumes and analysis data ({files.length} file
        {files.length !== 1 ? 's' : ''} found). This cannot be undone.
      </p>

      {done ? (
        <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          All data wiped successfully.
        </p>
      ) : (
        <button
          onClick={handleWipe}
          disabled={wiping || files.length === 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 font-semibold text-white shadow-md transition-all hover:bg-rose-700 disabled:opacity-50"
        >
          {wiping ? 'Wiping…' : 'Wipe Everything'}
        </button>
      )}
    </div>
  );
}
