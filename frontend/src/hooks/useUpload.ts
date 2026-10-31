import { useRef, useState } from "react";
import { api, errorMessage } from "../lib/api";

export const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
export const PDF_TYPE = "application/pdf";
const MAX_MB = 5;

/**
 * Opens a file picker, uploads the chosen file with progress, then calls `onDone(mediaId)`.
 * Render `input` somewhere in the component and call `open()` from a button.
 */
export function useUpload(onDone: (mediaId: string) => void | Promise<void>, accept = IMAGE_TYPES) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That file is larger than ${MAX_MB} MB.`);
      return;
    }
    setProgress(0);
    try {
      const { id } = await api.uploadImage(file, setProgress);
      await onDone(id);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return {
    inputRef,
    accept,
    upload,
    open: () => inputRef.current?.click(),
    progress,
    busy: progress !== null,
    error,
    maxMb: MAX_MB,
  };
}
