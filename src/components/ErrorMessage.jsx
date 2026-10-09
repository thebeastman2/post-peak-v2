import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onDismiss(), 2000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-md z-50">
      <div className="flex items-center gap-2.5 pp-card border pp-border rounded-xl px-4 py-3 shadow-lg">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        <span className="text-sm pp-text">{message}</span>
      </div>
    </div>
  );
}