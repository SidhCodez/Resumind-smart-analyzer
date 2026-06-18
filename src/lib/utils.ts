export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function scoreColor(score: number): { text: string; bg: string; ring: string } {
  if (score >= 80) return { text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200' };
  if (score >= 60) return { text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200' };
  return { text: 'text-rose-700', bg: 'bg-rose-50', ring: 'ring-rose-200' };
}

export function scoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-green-400';
  if (score >= 60) return 'from-amber-500 to-yellow-400';
  return 'from-rose-500 to-red-400';
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Needs Work';
  return 'Weak';
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function tryParseJson(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

export function errorToString(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') {
    const parsed = tryParseJson(error.trim());
    if (parsed !== error) {
      return errorToString(parsed);
    }
    return error;
  }

  if (Array.isArray(error)) {
    return error.map(errorToString).filter(Boolean).join('; ');
  }

  if (typeof error === 'object' && error !== null) {
    const anyError = error as Record<string, unknown>;
    const messageFields = ['message', 'error', 'reason', 'detail', 'description', 'title'];

    for (const field of messageFields) {
      const value = anyError[field];
      if (typeof value === 'string') {
        const parsed = tryParseJson(value.trim());
        if (parsed !== value) {
          return errorToString(parsed);
        }
        return value;
      }
      if (value !== undefined && value !== null) {
        const nested = errorToString(value);
        if (nested) return nested;
      }
    }

    const stringified = Object.entries(anyError)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : errorToString(value)}`)
      .join('; ');

    return stringified || 'An unknown error occurred';
  }

  return String(error);
}
