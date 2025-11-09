import { useEffect, useRef, useCallback, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  delay = 500, // Reduced to 500ms for faster autosave
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<T | null>(null);

  const save = useCallback(async (dataToSave: T, retries = 3) => {
    if (isSavingRef.current) {
      // Queue the save for later
      pendingSaveRef.current = dataToSave;
      return;
    }

    try {
      isSavingRef.current = true;
      setSaveStatus('saving');
      setError(null);
      
      await onSave(dataToSave);
      
      setSaveStatus('saved');
      previousDataRef.current = dataToSave;
      pendingSaveRef.current = null;
      
      // Reset to idle after showing "saved" for a moment
      setTimeout(() => {
        if (!isSavingRef.current) {
          setSaveStatus('idle');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Autosave failed:', err);
      
      // Retry on network errors
      if (retries > 0 && (err.message?.includes('fetch') || err.message?.includes('network'))) {
        console.log(`Retrying save... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return save(dataToSave, retries - 1);
      }
      
      setSaveStatus('error');
      setError(err.message || 'Failed to save');
      pendingSaveRef.current = dataToSave; // Keep pending for retry
    } finally {
      isSavingRef.current = false;
      
      // Process any pending save
      if (pendingSaveRef.current && JSON.stringify(pendingSaveRef.current) !== JSON.stringify(dataToSave)) {
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        save(pending);
      }
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Check if data has changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, delay, enabled]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save(data);
  }, [data, save]);

  // Wait for all pending saves to complete
  const flush = useCallback(async (): Promise<void> => {
    // Clear any pending timeout and save immediately
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If currently saving, wait for it to finish
    if (isSavingRef.current) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isSavingRef.current) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    // Save any unsaved changes
    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      await save(data);
    }

    // Wait for the save to complete
    if (isSavingRef.current) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isSavingRef.current) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
  }, [data, save]);

  return {
    saveStatus,
    error,
    saveNow,
    flush, // Export flush method for navigation
    isSaving: isSavingRef.current,
  };
}
