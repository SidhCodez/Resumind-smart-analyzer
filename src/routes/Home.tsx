import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import type { Resume } from '~/types';
import ResumeCard from '~/components/ResumeCard';
import { IconSparkle } from '~/components/Icons';

export default function Home() {
  const { auth, kv, fs, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const items = (await kv.list('resume:*', true)) as unknown as { key: string; value: string }[];
        const parsed: Resume[] = (items || [])
          .map((item) => {
            try {
              return JSON.parse(item.value) as Resume;
            } catch {
              return null;
            }
          })
          .filter((r): r is Resume => r !== null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setResumes(parsed);

        const urls: Record<string, string> = {};
        for (const resume of parsed) {
          try {
            const blob = await fs.read(resume.imagePath);
            if (blob) urls[resume.id] = URL.createObjectURL(blob);
          } catch {
            // skip missing image
          }
        }
        setImageUrls(urls);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [auth.isAuthenticated, fs, kv]);

  if (!auth.isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-10 text-center">
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
          <IconSparkle className="h-3 w-3" /> AI-Powered Resume Review
        </span>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Track Your Applications &amp; Resume Ratings
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-gray-500">
          {resumes.length > 0
            ? 'Review your submissions and check AI-powered feedback.'
            : 'No resumes yet. Upload your first resume to get instant ATS feedback.'}
        </p>
      </div>

      {loadingResumes ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-80 rounded-2xl" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <p className="text-gray-400">Get started by uploading your first resume</p>
          <Link to="/upload" className="primary-button">
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} imageUrl={imageUrls[resume.id] || ''} />
          ))}
        </div>
      )}
    </div>
  );
}
