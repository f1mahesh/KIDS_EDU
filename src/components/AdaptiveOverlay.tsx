import React, { useEffect } from 'react';

interface AdaptiveOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  compact?: boolean;
  children: React.ReactNode;
}

export function AdaptiveOverlay({
  open,
  onClose,
  title,
  compact = false,
  children
}: AdaptiveOverlayProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/40 backdrop-blur-sm ${
        compact ? 'items-end' : 'items-end md:items-center md:p-4'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`liquid-glass-elevated w-full max-h-[88dvh] overflow-y-auto overscroll-y-contain rounded-t-[28px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${
          compact ? '' : 'md:max-w-lg md:rounded-[28px] md:p-6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto mb-3 h-1.5 w-11 rounded-full bg-slate-400/50 ${
            compact ? '' : 'md:hidden'
          }`}
        />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full px-3 text-sm font-semibold opacity-75 transition hover:opacity-100 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
