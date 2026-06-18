import type { FSItem, KVItem, ChatMessage, AIResponse, PuterUser } from './index';

interface PuterFSSpace {
  write: (path: string, data: string | File | Blob, options?: Record<string, unknown>) => Promise<FSItem>;
  read: (path: string) => Promise<Blob>;
  upload: (files: File[] | FileList) => Promise<FSItem[]>;
  delete: (path: string) => Promise<void>;
  readdir: (path: string) => Promise<FSItem[]>;
  mkdir: (path: string) => Promise<FSItem>;
}

interface PuterAISpace {
  chat: (
    prompt: string | ChatMessage[],
    imageURLOrOptions?: string | Record<string, unknown>,
    testMode?: boolean,
    options?: { model?: string }
  ) => Promise<AIResponse | string>;
  img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string>;
}

interface PuterKVSpace {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<boolean>;
  delete: (key: string) => Promise<boolean>;
  list: (pattern?: string, returnValues?: boolean) => Promise<string[] | KVItem[]>;
  flush: () => Promise<boolean>;
}

interface PuterAuthSpace {
  getUser: () => Promise<PuterUser>;
  isSignedIn: () => boolean;
  signIn: () => Promise<unknown>;
  signOut: () => Promise<void>;
}

interface PuterGlobal {
  fs: PuterFSSpace;
  ai: PuterAISpace;
  kv: PuterKVSpace;
  auth: PuterAuthSpace;
  print: (text: string) => void;
}

declare global {
  interface Window {
    puter: PuterGlobal;
  }
}

export {};
