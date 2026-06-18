# Resumind — AI Resume Analyzer & ATS Checker

Smart feedback for your resume. Upload a PDF, get an instant ATS score plus
detailed breakdowns on tone & style, content, structure, and skills —
all powered by Puter.js (free, no API key, no backend needed).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7 (data router)
- Zustand (state management)
- Puter.js (auth, cloud file storage, key-value store, AI chat/vision)
- pdfjs-dist (client-side PDF -> image rendering)
- react-dropzone (drag & drop upload)

## How it works

1. Sign in with a free Puter account (handled entirely client-side, no backend).
2. Upload a resume PDF + optional job title/description.
3. The PDF is rendered to a PNG client-side (first page, high-res).
4. Both files are stored in your private Puter cloud drive.
5. The PDF is sent to Puter's AI chat endpoint with a structured prompt
   asking for JSON-formatted ATS/tone/content/structure/skills feedback.
6. Results are cached in Puter KV storage and rendered with score gauges,
   progress bars, and expandable tip cards.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

No environment variables or API keys required -- Puter.js handles auth
and AI calls entirely client-side under the signed-in user's free quota.

## Project structure

```
src/
  components/      Reusable UI (Navbar, FileUploader, ScoreGauge, etc.)
  lib/
    puter.ts                 Zustand store wrapping the Puter.js SDK
    pdf2img.ts                PDF -> PNG conversion (lazy-loaded pdfjs)
    prepareInstructions.ts    AI prompt + response schema
    utils.ts                  Formatting / color helpers
  routes/
    Home.tsx          Dashboard listing all analyzed resumes
    Auth.tsx          Puter sign-in screen
    Upload.tsx        Upload form + analysis pipeline
    ResumeDetail.tsx  Full feedback breakdown for one resume
    Wipe.tsx          Danger-zone: delete all stored data
  types/              Shared TypeScript interfaces + Puter ambient types
```

## Notes

- All data (PDFs, preview images, feedback JSON) lives in the signed-in
  user's own Puter cloud storage -- nothing touches a third-party server.
- The AI model defaults to claude-sonnet-4 via Puter's hosted access;
  swap the model option in lib/puter.ts (feedback function) to change it.
- Bundle is code-split so pdfjs-dist only loads when a user actually
  uploads a file, keeping the initial page load light.
