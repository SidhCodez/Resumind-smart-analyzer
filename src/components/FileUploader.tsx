import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { cn, formatSize } from '~/lib/utils';
import { IconUpload, IconFile, IconX } from './Icons';

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  maxSize?: number;
}

export default function FileUploader({
  onFileSelect,
  selectedFile,
  maxSize = 20 * 1024 * 1024,
}: FileUploaderProps) {
  const [rejectMessage, setRejectMessage] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setRejectMessage(null);
      const file = acceptedFiles[0] || null;
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const msg = fileRejections[0]?.errors[0]?.message ?? 'File rejected';
    setRejectMessage(msg);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-12',
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div
            className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                <IconFile className="h-5 w-5" />
              </span>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
              aria-label="Remove file"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <IconUpload className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-gray-700">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume here'}
              </p>
              <p className="mt-1 text-sm text-gray-400">
                or click to browse — PDF only, up to {formatSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
      {rejectMessage && <p className="mt-2 text-sm text-rose-500">{rejectMessage}</p>}
    </div>
  );
}
