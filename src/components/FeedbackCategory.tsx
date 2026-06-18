import { useState } from 'react';
import { IconCheck, IconAlert } from './Icons';
import { cn } from '~/lib/utils';

interface Tip {
  type: 'good' | 'improve';
  tip: string;
  explanation?: string;
}

interface FeedbackCategoryProps {
  title: string;
  score: number;
  tips: Tip[];
}

export default function FeedbackCategory({ title, score, tips }: FeedbackCategoryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  const textColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <span className={cn('text-lg font-bold', textColor)}>{score}/100</span>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={cn('h-full rounded-full transition-all duration-700', barColor)} style={{ width: `${score}%` }} />
      </div>

      <div className="flex flex-col gap-2">
        {tips.map((tip, i) => {
          const isOpen = openIndex === i;
          const hasDetail = Boolean(tip.explanation);
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-100">
              <button
                type="button"
                disabled={!hasDetail}
                onClick={() => hasDetail && setOpenIndex(isOpen ? null : i)}
                className={cn(
                  'flex w-full items-start gap-2.5 p-3 text-left transition-colors',
                  hasDetail ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    tip.type === 'good' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  )}
                >
                  {tip.type === 'good' ? <IconCheck className="h-3 w-3" /> : <IconAlert className="h-3 w-3" />}
                </span>
                <span className="text-sm font-medium text-gray-800">{tip.tip}</span>
              </button>
              {hasDetail && isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600 animate-fade-in">
                  {tip.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
