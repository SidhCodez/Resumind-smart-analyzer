import { scoreColor, scoreLabel } from '~/lib/utils';

interface ScoreRowProps {
  label: string;
  score: number;
}

export default function ScoreRow({ label, score }: ScoreRowProps) {
  const colors = scoreColor(score);
  const barColor = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="flex items-center gap-4">
      <span className="w-32 shrink-0 text-sm font-medium text-gray-700">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`score-badge ${colors.bg} ${colors.text}`}>{score}</span>
      <span className="hidden w-20 text-xs text-gray-400 sm:block">{scoreLabel(score)}</span>
    </div>
  );
}
