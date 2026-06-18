import { cn } from '~/lib/utils';
import { IconCheck } from './Icons';

interface Step {
  key: string;
  label: string;
}

const STEPS: Step[] = [
  { key: 'uploading', label: 'Uploading resume' },
  { key: 'converting', label: 'Converting to image' },
  { key: 'preparing', label: 'Preparing data' },
  { key: 'analyzing', label: 'Analyzing with AI' },
];

interface ProcessingStatusProps {
  currentStep: string;
  statusText?: string;
}

export default function ProcessingStatus({ currentStep, statusText }: ProcessingStatusProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="mb-1 text-center text-lg font-semibold text-gray-900">
        {statusText || 'Analyzing your resume...'}
      </h2>
      <p className="mb-6 text-center text-sm text-gray-400">This usually takes under a minute</p>

      <div className="flex flex-col gap-4">
        {STEPS.map((step, i) => {
          const isDone = currentIndex > i || currentStep === 'done';
          const isActive = currentIndex === i && currentStep !== 'done';
          return (
            <div key={step.key} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isDone && 'border-emerald-500 bg-emerald-500 text-white',
                  isActive && 'border-indigo-500 text-indigo-500',
                  !isDone && !isActive && 'border-gray-200 text-gray-300'
                )}
              >
                {isDone ? (
                  <IconCheck className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-semibold">{i + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isDone && 'text-gray-400 line-through',
                  isActive && 'text-gray-900',
                  !isDone && !isActive && 'text-gray-300'
                )}
              >
                {step.label}
              </span>
              {isActive && (
                <span className="ml-auto flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
