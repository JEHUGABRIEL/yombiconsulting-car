'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
};

/**
 * Boîte de confirmation du back-office.
 * Remplace window.confirm : même garde-fou, mais lisible, accessible et cohérent
 * avec le reste de l'interface. Échap, clic sur le fond et Tab sont gérés.
 */
export default function ConfirmDialog({
  open,
  options,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  options: ConfirmOptions | null;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Les props changent à chaque rendu du parent : on les lit via des refs pour que
  // l'effet ne se relance pas et ne vole pas le focus à chaque mise à jour.
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  const busyRef = useRef(busy);
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    document.body.classList.add('no-scroll');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (busyRef.current) return;
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])')
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('no-scroll');
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open || !options) return null;

  const danger = options.tone === 'danger';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        className="dialog-backdrop absolute inset-0 bg-[#040A14]/75 backdrop-blur-[3px]"
        onClick={() => {
          if (!busy) onCancel();
        }}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.description ? 'confirm-description' : undefined}
        className="dialog-panel relative w-full max-w-[440px] rounded-[16px] border border-white/[0.09] bg-[#0E1D31] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-start gap-3.5">
          <span
            className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-500/15 text-red-300' : 'bg-blue/15 text-blue-soft'
            }`}
          >
            <AlertTriangle size={20} strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-[15px] font-semibold leading-snug">
              {options.title}
            </h2>
            {options.description && (
              <p
                id="confirm-description"
                className="text-[12.5px] leading-relaxed text-white/55 mt-1.5"
              >
                {options.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[12.5px] font-semibold text-white/65 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
          >
            {options.cancelLabel ?? 'Annuler'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-[9px] px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors disabled:opacity-60 ${
              danger ? 'bg-red-500/90 hover:bg-red-500' : 'bg-blue hover:bg-blue-deep'
            }`}
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {options.confirmLabel ?? 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
