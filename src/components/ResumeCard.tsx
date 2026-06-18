import { Link } from 'react-router-dom';
import type { Resume } from '~/types';
import { scoreColor, timeAgo } from '~/lib/utils';

interface ResumeCardProps {
  resume: Resume;
  imageUrl: string;
}

export default function ResumeCard({ resume, imageUrl }: ResumeCardProps) {
  const colors = scoreColor(resume.feedback.overallScore);

  return (
    <Link to={`/resume/${resume.id}`} className="group block">
      <div className="gradient-border h-full">
        <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white">
          <div className="flex items-start justify-between gap-3 p-4 pb-3">
            <div className="overflow-hidden">
              {resume.companyName && (
                <h3 className="truncate font-semibold text-gray-900">{resume.companyName}</h3>
              )}
              {resume.jobTitle && (
                <p className="truncate text-sm text-gray-500">{resume.jobTitle}</p>
              )}
              {!resume.companyName && !resume.jobTitle && (
                <h3 className="font-semibold text-gray-900">General Resume Review</h3>
              )}
              <p className="mt-1 text-xs text-gray-400">{timeAgo(resume.createdAt)}</p>
            </div>
            <div className={`score-badge shrink-0 ${colors.bg} ${colors.text}`}>
              {resume.feedback.overallScore}/100
            </div>
          </div>

          <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
            <img
              src={imageUrl}
              alt={`${resume.companyName || 'Resume'} preview`}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
