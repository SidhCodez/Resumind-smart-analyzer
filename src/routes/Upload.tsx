import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { prepareInstructions } from '~/lib/prepareInstructions';
import { errorToString, generateUUID } from '~/lib/utils';
import type { Feedback } from '~/types';
import FileUploader from '~/components/FileUploader';
import ProcessingStatus from '~/components/ProcessingStatus';

type Step = 'idle' | 'uploading' | 'converting' | 'preparing' | 'analyzing' | 'done' | 'error';

export default function Upload() {
  const { auth, fs, kv, ai, isLoading } = usePuterStore();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [step, setStep] = useState<Step>('idle');
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/upload');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const isBusy = step !== 'idle' && step !== 'error';

  const handleAnalyze = async () => {
    if (!file) {
      setErrorMsg('Please select a PDF resume first.');
      return;
    }
    setErrorMsg('');

    try {
      const id = generateUUID();

      setStep('uploading');
      setStatusText('Uploading your resume…');
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile || uploadedFile.length === 0 || !uploadedFile[0]?.path) {
        throw new Error('Failed to upload PDF file. Please try again.');
      }
      const resumePath = uploadedFile[0].path;

      setStep('converting');
      setStatusText('Converting PDF to image…');
      const { imageFile, error: convertError } = await convertPdfToImage(file);
      if (!imageFile) {
        throw new Error(convertError || 'Failed to convert PDF to image.');
      }

      const uploadedImage = await fs.upload([imageFile]);
      if (!uploadedImage || uploadedImage.length === 0 || !uploadedImage[0]?.path) {
        throw new Error('Failed to upload preview image. Please try again.');
      }
      const imagePath = uploadedImage[0].path;

      setStep('preparing');
      setStatusText('Preparing analysis data…');
      const placeholderFeedback: Feedback = {
        overallScore: 0,
        ATS: { score: 0, tips: [] },
        toneAndStyle: { score: 0, tips: [] },
        content: { score: 0, tips: [] },
        structure: { score: 0, tips: [] },
        skills: { score: 0, tips: [] },
      };

      const record = {
        id,
        companyName: companyName || undefined,
        jobTitle: jobTitle || undefined,
        jobDescription: jobDescription || undefined,
        imagePath,
        resumePath,
        feedback: placeholderFeedback,
        createdAt: new Date().toISOString(),
      };

      await kv.set(`resume:${id}`, JSON.stringify(record));

      setStep('analyzing');
      setStatusText('Analyzing resume with AI…');

      const feedbackResponse = await ai.feedback(
        resumePath,
        prepareInstructions({ jobTitle, jobDescription })
      );

      if (!feedbackResponse) {
        throw new Error('AI analysis returned no response. Please try again.');
      }

      const rawText =
        typeof feedbackResponse.message.content === 'string'
          ? feedbackResponse.message.content
          : Array.isArray(feedbackResponse.message.content)
            ? (feedbackResponse.message.content as Array<{ text?: string }>)
                .map((c) => c.text || '')
                .join('')
            : '';

      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      let parsedFeedback: Feedback;
      try {
        parsedFeedback = JSON.parse(cleaned) as Feedback;
      } catch {
        throw new Error('Could not parse AI feedback. Please try again.');
      }

      const finalRecord = { ...record, feedback: parsedFeedback };
      await kv.set(`resume:${id}`, JSON.stringify(finalRecord));

      setStep('done');
      setStatusText('Analysis complete! Redirecting…');
      navigate(`/resume/${id}`);
    } catch (err) {
      console.error('Resume analysis failed:', err);
      setStep('error');
      const msg = errorToString(err).trim();
      setErrorMsg(msg || 'Something went wrong. Please try again. If the issue persists, refresh and try again.');
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Smart Feedback for Your Dream Job</h1>
        <p className="mt-2 text-gray-500">
          Upload your resume and job details to get an instant ATS score and detailed feedback.
        </p>
      </div>

      {isBusy ? (
        <ProcessingStatus currentStep={step === 'done' ? 'done' : step} statusText={statusText} />
      ) : (
        <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for more tailored feedback…"
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Resume (PDF)</label>
            <FileUploader onFileSelect={setFile} selectedFile={file} />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{errorMsg}</div>
          )}

          <button onClick={handleAnalyze} className="primary-button w-full" disabled={!file}>
            Analyze Resume
          </button>
        </div>
      )}
    </div>
  );
}
