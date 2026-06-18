import { create } from 'zustand';
import type { PuterUser, FSItem, AIResponse, ChatMessage } from '~/types';

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;

  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
  };

  fs: {
    write: (path: string, data: string | File | Blob) => Promise<FSItem | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (files: File[] | FileList) => Promise<FSItem[] | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };

  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string,
      testMode?: boolean,
      options?: { model?: string }
    ) => Promise<AIResponse | undefined>;
    feedback: (path: string, message: string) => Promise<AIResponse | undefined>;
    img2txt: (image: string | File | Blob, testMode?: boolean) => Promise<string | undefined>;
  };

  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (pattern?: string, returnValues?: boolean) => Promise<string[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

let initAttempted = false;

const POLL_INTERVAL = 100;
const POLL_TIMEOUT = 10000;

function waitForPuter(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.puter) {
      resolve();
      return;
    }
    let waited = 0;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.puter) {
        clearInterval(interval);
        resolve();
      }
      waited += POLL_INTERVAL;
      if (waited >= POLL_TIMEOUT) {
        clearInterval(interval);
        reject(new Error('Puter.js failed to load. Check your network/ad-blocker and refresh.'));
      }
    }, POLL_INTERVAL);
  });
}

export const usePuterStore = create<PuterStore>((set, get) => {
  const setError = (msg: string) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        ...get().auth,
        user: null,
        isAuthenticated: false,
      },
    });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    if (!window.puter) {
      setError('Puter.js not available');
      return false;
    }
    try {
      const isSignedIn = window.puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await window.puter.auth.getUser();
        set({
          auth: { ...get().auth, user, isAuthenticated: true },
          isLoading: false,
        });
        return true;
      }
      set({ auth: { ...get().auth, user: null, isAuthenticated: false }, isLoading: false });
      return false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to check auth status';
      setError(msg);
      return false;
    }
  };

  const signIn = async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await window.puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await window.puter.auth.signOut();
      set({ auth: { ...get().auth, user: null, isAuthenticated: false }, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign out failed';
      setError(msg);
    }
  };

  const refreshUser = async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const user = await window.puter.auth.getUser();
      set({ auth: { ...get().auth, user, isAuthenticated: true }, isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh user';
      setError(msg);
    }
  };

  const init = (): void => {
    if (initAttempted) return;
    initAttempted = true;
    set({ isLoading: true });
    waitForPuter()
      .then(() => {
        set({ puterReady: true });
        checkAuthStatus();
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  const write = async (path: string, data: string | File | Blob) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.fs.write(path, data);
  };

  const readFile = async (path: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.fs.read(path);
  };

  const upload = async (files: File[] | FileList) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    const result = await window.puter.fs.upload(files);
    if (Array.isArray(result)) return result;
    if (result) return [result];
    return undefined;
  };

  const deleteFile = async (path: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return;
    }
    return window.puter.fs.delete(path);
  };

  const readDir = async (path: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.fs.readdir(path);
  };

  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string,
    testMode?: boolean,
    options?: { model?: string }
  ) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    const result = imageURL
      ? await window.puter.ai.chat(prompt, imageURL, testMode, options)
      : await window.puter.ai.chat(prompt, (testMode ?? false) as unknown as Record<string, unknown>, undefined, options);
    return typeof result === 'string'
      ? ({ message: { content: result } } as unknown as AIResponse)
      : result;
  };

  const feedback = async (path: string, message: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    const result = await window.puter.ai.chat(
      [
        {
          role: 'user',
          content: [
            { type: 'file', puter_path: path },
            { type: 'text', text: message },
          ],
        },
      ] as unknown as ChatMessage[],
      undefined,
      false,
      { model: 'gpt-4o-mini' }
    );
    if (typeof result === 'string') {
      return { message: { content: result } } as unknown as AIResponse;
    }
    return result as AIResponse;
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.ai.img2txt(image, testMode);
  };

  const kvGet = async (key: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.kv.get(key);
  };

  const kvSet = async (key: string, value: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.kv.set(key, value);
  };

  const kvDelete = async (key: string) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.kv.delete(key);
  };

  const kvList = async (pattern?: string, returnValues?: boolean) => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    const result = await window.puter.kv.list(pattern, returnValues);
    return result as string[];
  };

  const kvFlush = async () => {
    if (!window.puter) {
      setError('Puter not initialized');
      return undefined;
    }
    return window.puter.kv.flush();
  };

  return {
    isLoading: true,
    error: null,
    puterReady: false,

    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
    },

    fs: {
      write,
      read: readFile,
      upload,
      delete: deleteFile,
      readDir,
    },

    ai: {
      chat,
      feedback,
      img2txt,
    },

    kv: {
      get: kvGet,
      set: kvSet,
      delete: kvDelete,
      list: kvList,
      flush: kvFlush,
    },

    init,
    clearError: () => set({ error: null }),
  };
});
