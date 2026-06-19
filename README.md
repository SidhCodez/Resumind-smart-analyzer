# Resumind Project Documentation

## Overview
Resumind is a client-side AI resume analyzer built with React, TypeScript, and Puter.js. It lets a user upload a PDF resume, converts the first page to an image, stores both files in Puter cloud storage, sends the resume to Puter AI for analysis, and then presents a structured ATS and resume feedback report.

## Primary Technologies
- Language: TypeScript, JavaScript, HTML, CSS
- Framework: React 19
- Bundler: Vite
- UI styling: Tailwind CSS v4
- Routing: React Router DOM v7
- State management: Zustand
- PDF rendering: pdfjs-dist
- Drag & drop file upload: react-dropzone
- Cloud / AI platform: Puter.js

## Project Dependencies
### Runtime dependencies
- `react`
- `react-dom`
- `react-router-dom`
- `zustand`
- `pdfjs-dist`
- `react-dropzone`

### Development dependencies
- `typescript`
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `@tailwindcss/vite`
- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `postcss`, `autoprefixer`
- TypeScript typings for React and Node

## Folder Structure
```
/
  package.json
  vite.config.ts
  index.html
  README.md
  read,e.md
  tsconfig.json
  tsconfig.app.json
  tsconfig.node.json
  src/
    main.tsx
    App.tsx
    index.css
    router.tsx
    components/
      FeedbackCategory.tsx
      FileUploader.tsx
      Icons.tsx
      Navbar.tsx
      ProcessingStatus.tsx
      ResumeCard.tsx
      ScoreGauge.tsx
      ScoreRow.tsx
    lib/
      puter.ts
      pdf2img.ts
      prepareInstructions.ts
      utils.ts
    routes/
      Auth.tsx
      Home.tsx
      NotFound.tsx
      ResumeDetail.tsx
      RootLayout.tsx
      Upload.tsx
      Wipe.tsx
    types/
      index.ts
/public/
  favicon.png (and other static assets if present)
```

## Application Entry Points
- `src/main.tsx`: renders the root React app into `#root`.
- `src/App.tsx`: provides the React Router provider using `router`.
- `src/router.tsx`: defines all application routes and nested layout.
- `index.html`: loads `https://js.puter.com/v2/` and includes the client entry script.

## Routing and Pages
### Route definitions
- `/` → `Home.tsx`
- `/auth` → `Auth.tsx`
- `/upload` → `Upload.tsx`
- `/resume/:id` → `ResumeDetail.tsx`
- `/wipe` → `Wipe.tsx`
- `*` → `NotFound.tsx`

### Route responsibilities
- `RootLayout.tsx`: initializes Puter, shows loading/error states, renders `Navbar`, and renders child routes via `<Outlet />`.
- `Auth.tsx`: authentication screen with a sign-in button and `next` redirect support.
- `Home.tsx`: dashboard listing all saved resume reviews, fetching metadata from Puter KV and preview images from Puter FS.
- `Upload.tsx`: resume upload form, PDF conversion, cloud storage, AI analysis, and navigation to detail.
- `ResumeDetail.tsx`: full feedback summary with scores, category breakdowns, and resume preview.
- `Wipe.tsx`: destructive cleanup page that deletes all root cloud files and all `resume:*` KV records.
- `NotFound.tsx`: fallback for unknown routes.

## Authentication and Authorization Structure
- Puter auth is handled entirely client-side through the global `window.puter` object.
- `index.html` imports Puter runtime script from `https://js.puter.com/v2/`.
- `src/lib/puter.ts` wraps Puter SDK features inside a Zustand store.
- The app loads Puter by polling `window.puter` in `waitForPuter()` and then checks authentication status.
- Auth state interface includes:
  - `user`: `PuterUser | null`
  - `isAuthenticated`: boolean
  - `signIn()` / `signOut()` / `refreshUser()` / `checkAuthStatus()`
- `Auth.tsx` triggers `auth.signIn()` and redirects to `next` once authenticated.
- Route guards are implemented in pages such as `Home`, `Upload`, `ResumeDetail`, and `Wipe`. If `auth.isAuthenticated` is false, they navigate to `/auth?next=...`.
- No backend session management is used; authentication depends entirely on the Puter client.

## Puter Integration Details
### Puter features consumed
- `window.puter.auth` for sign in/sign out and user retrieval
- `window.puter.fs` for file storage operations
- `window.puter.kv` for key-value persistence
- `window.puter.ai` for AI chat calls and vision support

### `src/lib/puter.ts`
This file exposes:
- `auth`: auth helpers and state
- `fs`: file system helpers: `write`, `read`, `upload`, `delete`, `readDir`
- `ai`: AI helpers: `chat`, `feedback`, `img2txt`
- `kv`: KV helpers: `get`, `set`, `delete`, `list`, `flush`

### File storage and data model
- PDF resume files are uploaded via `fs.upload()` from `Upload.tsx`.
- Preview PNG images are generated client-side from the first PDF page and uploaded via `fs.upload()`.
- Resume metadata is stored in Puter KV using keys like `resume:<id>`.
- `Resume` record structure in `src/types/index.ts` includes:
  - `id`
  - `companyName?`
  - `jobTitle?`
  - `jobDescription?`
  - `imagePath`
  - `resumePath`
  - `feedback`
  - `createdAt`
- `Home.tsx` lists all `resume:*` KV records and loads preview images from `imagePath`.
- `ResumeDetail.tsx` loads a single record and the preview image by `imagePath`.
- `Wipe.tsx` deletes all cloud files in `./` and all `resume:*` KV entries.

## AI Feedback Flow
### Prompt construction
- `src/lib/prepareInstructions.ts` builds a strict instruction prompt for resume analysis.
- It asks Puter AI to:
  - analyze ATS compatibility
  - rate tone & style, content, structure, skills
  - return only JSON with no markdown fences
- The prompt includes the user's optional job title and job description.
- It also includes a structured type description for the expected `Feedback` JSON.

### AI model and call
- `src/lib/puter.ts` uses `window.puter.ai.chat(...)` with model option `{ model: 'gpt-4o-mini' }` inside `feedback()`.
- The app sends the uploaded PDF file path as a `file` attachment in the chat payload.
- The response is expected to be AI text content containing valid JSON.

### Parsing and validation
- The raw AI response is normalized and stripped of code fences.
- The application attempts `JSON.parse()` on the cleaned text.
- If parsing fails, the user sees an error message and the resume record remains with placeholder feedback.
- If it succeeds, the parsed feedback replaces placeholder data and is saved back to KV.

## PDF Conversion and Client Behavior
### PDF to image conversion
- `src/lib/pdf2img.ts` converts the first PDF page into a PNG using `pdfjs-dist`.
- The worker script is configured lazily via `pdfjsLib.GlobalWorkerOptions.workerSrc`.
- Conversion flow:
  - load PDF ArrayBuffer from the selected `File`
  - render first page at high resolution
  - convert canvas to Blob and wrap as `File`
- The image file is then uploaded to Puter FS and used as a resume preview.

### File upload flow in `Upload.tsx`
1. User selects a PDF through `FileUploader`.
2. The file is uploaded to Puter FS, returning `resumePath`.
3. The PDF is converted to an image, uploaded, returning `imagePath`.
4. A placeholder `Resume` record is created and saved to KV.
5. `ai.feedback()` is called to analyze the PDF resume.
6. Parsed JSON feedback is saved to KV.
7. The app navigates to `/resume/<id>`.

### Resume metadata lifecycle
- The record is created with placeholder feedback before AI analysis.
- The record is updated after AI analysis completes successfully.
- The resume identifier is a UUID generated by `generateUUID()` in `src/lib/utils.ts`.

## UI and Components
### `src/components`
- `Navbar.tsx`: sticky header with brand, upload link, and sign-out button.
- `FileUploader.tsx`: file drag-and-drop zone built on `react-dropzone` with PDF-only validation.
- `ProcessingStatus.tsx`: upload/convert/prepare/analyze progress UI.
- `ResumeCard.tsx`: dashboard cards for each saved resume.
- `ScoreGauge.tsx`: circular score visualization.
- `ScoreRow.tsx`: horizontal score bar line item.
- `FeedbackCategory.tsx`: category section with expandable tips.
- `Icons.tsx`: SVG icon components used throughout the UI.

### UI behaviors
- Pages redirect to `/auth` when the user is not authenticated.
- `Home.tsx` displays a loader while KV and image previews load.
- `Upload.tsx` shows step-by-step progress and handles upload/analysis errors.
- `ResumeDetail.tsx` shows a full structured score summary and expandable AI tips.
- `Wipe.tsx` offers a bulk delete experience with a warning and confirmation button.

## State and Utility Helpers
### State management
- One global Zustand store in `src/lib/puter.ts`.
- The store tracks:
  - `isLoading`
  - `error`
  - `puterReady`
  - `auth`, `fs`, `ai`, `kv`
- `init()` is called once by `RootLayout` on mount.

### `src/lib/utils.ts`
- `cn(...)`: class name builder utility.
- `formatSize()`: readable filesize formatter.
- `generateUUID()`: fallback to `crypto.randomUUID()` or pseudo-random UUID.
- `scoreColor()`, `scoreGradient()`, `scoreLabel()`: visual helpers for badge styling.
- `timeAgo()`: relative time converter for resume entries.
- `errorToString()`: robust error-to-string helper for nested or JSON error payloads.

## Build and Local Development
### Scripts in `package.json`
- `npm run dev` → starts Vite dev server
- `npm run build` → compiles TypeScript and builds production bundle
- `npm run preview` → serves the built production output
- `npm run lint` → runs ESLint across the repository

### Local setup
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`

## Behavior Summary
### Authentication
- Uses Puter client-side auth only.
- No backend server or API key is required.
- User data belongs to the signed-in Puter account.

### Data storage
- Resume PDFs and preview PNGs are stored via Puter FS.
- Resume analysis records are stored in Puter KV using keys like `resume:<id>`.
- The wipe page removes both FS files and KV keys.

### AI analysis
- The primary AI path is `ai.feedback()` with `gpt-4o-mini`.
- The model receives the resume file path and job details as input.
- The response must be strict JSON matching the feedback schema.

### Error handling
- App-level errors are surfaced through the Zustand store.
- `Upload.tsx` catches upload, conversion, and parse failures.
- `RootLayout.tsx` shows a fallback UI if Puter initialization fails.

## Notes and Considerations
- The app is designed as a fully client-side SPA.
- Puter.js is required and loaded as a global browser script.
- The `prepareInstructions.ts` prompt must remain strict: only valid JSON, no markdown fences.
- `pdfjs-dist` is loaded lazily when a resume upload begins to keep initial load small.
- The app is written to assume the first page of the PDF is sufficient for preview.

## Important Files and Their Roles
- `src/lib/puter.ts`: Puter SDK wrapper and global store.
- `src/lib/pdf2img.ts`: PDF rendering and PNG generation.
- `src/lib/prepareInstructions.ts`: AI prompt + response schema.
- `src/routes/Upload.tsx`: upload, store, analyze pipeline.
- `src/routes/ResumeDetail.tsx`: results rendering.
- `src/routes/Home.tsx`: resume list and preview loading.
- `src/routes/Wipe.tsx`: delete all user data.
- `src/components/*`: reusable UI building blocks.
- `src/types/index.ts`: shared interface definitions.
- `vite.config.ts`: path alias and build config.
- `tsconfig*.json`: TypeScript project configurations.
- `index.html`: root HTML and Puter runtime inclusion.

## Summary
Resumind is an AI-driven resume review app that uses Puter.js for authentication, storage, and AI capabilities. It is a well-scoped React TypeScript SPA with no server-side application code, relying on Puter for private cloud storage and AI calls. The application is structured for clean separation between routes, reusable components, helper libraries, and shared type definitions.
