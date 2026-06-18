import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import type { Resume } from '~/types';
import ScoreGauge from '~/components/ScoreGauge';
import ScoreRow from '~/components/ScoreRow';
import FeedbackCategory from '~/components/FeedbackCategory';
import { IconArrowLeft } from '~/components/Icons';

export default function ResumeDetail() {
  const { id } = useParams<{ id: string }>();
  const { auth, kv, fs, isLoading } = usePuterStore();
  const navigate = useNavigate();

  const [resume, setResume] = useState<Resume | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [notFound, setNotFound] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading, auth.isAuthenticated, id, navigate]);

  useEffect(() => {
    if (!auth.isAuthenticated || !id) return;

    const load = async () => {
      setLoadingData(true);
      try {
        const raw = await kv.get(`resume:${id}`);
        if (!raw) {
          setNotFound(true);
          return;
        }
        const parsed = JSON.parse(raw) as Resume;
        setResume(parsed);

        const blob = await fs.read(parsed.imagePath);
        if (blob) setImageUrl(URL.createObjectURL(blob));
      } catch {
        setNotFound(true);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [auth.isAuthenticated, fs, id, kv]);

  if (!auth.isAuthenticated) return null;

  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      </div>
    );
  }

  if (notFound || !resume) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">Resume not found</h1>
        <p className="text-sm text-gray-500">This resume may have been deleted or never existed.</p>
        <Link to="/" className="primary-button mt-2">
          Back to Home
        </Link>
      </div>
    );
  }

  const { feedback } = resume;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link to="/" className="back-button mb-6 inline-flex">
        <IconArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="gradient-border">
            <div className="overflow-hidden rounded-[14px] bg-white">
              {imageUrl ? (
                <img src={imageUrl} alt="Resume preview" className="w-full object-contain" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center text-sm text-gray-400">
                  No preview available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-1">
              {resume.companyName && (
                <h1 className="text-xl font-bold text-gray-900">{resume.companyName}</h1>
              )}
              {resume.jobTitle && <p className="text-gray-500">{resume.jobTitle}</p>}
              {!resume.companyName && !resume.jobTitle && (
                <h1 className="text-xl font-bold text-gray-900">Resume Review</h1>
              )}
            </div>

            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ScoreGauge score={feedback.overallScore} size={140} strokeWidth={12} label="Overall Score" />
              <div className="flex w-full flex-1 flex-col gap-3">
                <ScoreRow label="ATS" score={feedback.ATS.score} />
                <ScoreRow label="Tone & Style" score={feedback.toneAndStyle.score} />
                <ScoreRow label="Content" score={feedback.content.score} />
                <ScoreRow label="Structure" score={feedback.structure.score} />
                <ScoreRow label="Skills" score={feedback.skills.score} />
              </div>
            </div>
          </div>

          {feedback.ATS.tips.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">ATS Compatibility</h3>
                <span className="text-lg font-bold text-gray-700">{feedback.ATS.score}/100</span>
              </div>
              <ul className="flex flex-col gap-2">
                {feedback.ATS.tips.map((tip, i) => (
                  <li
                    key={i}
                    className={`rounded-xl px-4 py-2.5 text-sm ${
                      tip.type === 'good' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {tip.tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FeedbackCategory title="Tone & Style" score={feedback.toneAndStyle.score} tips={feedback.toneAndStyle.tips} />
          <FeedbackCategory title="Content" score={feedback.content.score} tips={feedback.content.tips} />
          <FeedbackCategory title="Structure" score={feedback.structure.score} tips={feedback.structure.tips} />
          <FeedbackCategory title="Skills" score={feedback.skills.score} tips={feedback.skills.tips} />
        </div>
      </div>
    </div>
  );
}
