'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import type { NotificationItem, NotificationTone } from '@/lib/notification-shared';

const POLL_MS = 45_000;

const TONES: Record<NotificationTone, { icon: typeof Bell; className: string }> = {
  info: { icon: CheckCircle2, className: 'bg-white/[0.06] text-white/70' },
  success: { icon: ShieldCheck, className: 'bg-emerald-500/15 text-emerald-300' },
  warn: { icon: TriangleAlert, className: 'bg-amber-400/15 text-amber-200' },
  danger: { icon: ShieldAlert, className: 'bg-red-500/15 text-red-300' },
};

/** Âge lisible d'une alerte (calculé côté client, après récupération). */
function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '';

  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return 'à l’instant';
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `il y a ${days} j`;

  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(
    new Date(timestamp)
  );
}

/**
 * Cloche de notification du back-office.
 *
 * Elle interroge `/api/admin/notifications` au montage, toutes les 45 s et au
 * retour sur l'onglet. Aucune notification n'est poussée depuis le serveur :
 * une alerte manquée est simplement rattrapée au passage suivant.
 */
export default function NotificationBell({
  panelSide = 'right',
  className = '',
}: {
  panelSide?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [ready, setReady] = useState(true);
  const [busy, setBusy] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        ready?: boolean;
        unread?: number;
        notifications?: NotificationItem[];
      };
      if (!aliveRef.current) return;
      setReady(data.ready !== false);
      setUnread(Number(data.unread ?? 0));
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch {
      // Réseau coupé : on garde l'état affiché et on réessaiera au prochain tour.
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    void load();

    const timer = window.setInterval(() => {
      if (!document.hidden) void load();
    }, POLL_MS);

    const onVisible = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      aliveRef.current = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  // Ouverture : rafraîchit pour ne pas afficher un état vieux de 45 s.
  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  // Échap et clic extérieur ferment le panneau.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function markRead(item: NotificationItem) {
    if (item.read) return;

    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    setUnread((current) => Math.max(0, current - 1));

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
      if (res.ok) {
        const data = (await res.json()) as { unread?: number };
        if (typeof data.unread === 'number') setUnread(data.unread);
      }
    } catch {
      // L'état optimiste reste : le serveur rattrapera au prochain chargement.
    }
  }

  async function markAll() {
    if (unread === 0 || busy) return;

    const previous = items;
    setBusy(true);
    setItems((current) => current.map((entry) => ({ ...entry, read: true })));
    setUnread(0);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        const data = (await res.json()) as { unread?: number };
        if (typeof data.unread === 'number') setUnread(data.unread);
      } else {
        setItems(previous);
        await load();
      }
    } catch {
      setItems(previous);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const badge = unread > 99 ? '99+' : String(unread);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unread > 0 ? `Notifications, ${unread} non lue${unread > 1 ? 's' : ''}` : 'Notifications'
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative w-10 h-10 rounded-[9px] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <Bell size={19} strokeWidth={1.75} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue text-white text-[9.5px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className={`bell-panel absolute top-[calc(100%+10px)] z-[160] w-[min(360px,calc(100vw-24px))] rounded-[14px] border border-white/[0.1] bg-[#0E1D31] shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden ${
            panelSide === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2 min-w-0">
              <Bell size={15} strokeWidth={1.75} className="text-white/60 shrink-0" />
              <p className="text-[12.5px] font-semibold">Notifications</p>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-blue/20 text-blue-soft px-1.5 py-0.5 rounded-full leading-none">
                  {unread}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0 || busy}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-soft/85 hover:text-blue-soft transition-colors disabled:text-white/25 disabled:hover:text-white/25"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} strokeWidth={2} />}
              Tout lire
            </button>
          </div>

          {!ready ? (
            <p className="px-4 py-6 text-[12px] leading-relaxed text-amber-200/90">
              Les notifications sont momentanément indisponibles. Vérifiez la base de données, puis
              rechargez la page.
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[12.5px] text-white/65">Aucune alerte récente.</p>
              <p className="text-[11px] text-white/40 mt-1">
                Les opérations sensibles apparaîtront ici.
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(420px,60vh)] overflow-y-auto divide-y divide-white/[0.05]">
              {items.map((item) => {
                const tone = TONES[item.tone] ?? TONES.info;
                const Icon = tone.icon;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setOpen(false);
                        void markRead(item);
                      }}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
                    >
                      <span
                        className={`mt-0.5 w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${tone.className}`}
                        aria-hidden
                      >
                        <Icon size={15} strokeWidth={1.75} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span
                            className={`text-[12.5px] leading-snug ${
                              item.read ? 'text-white/65' : 'text-white font-semibold'
                            }`}
                          >
                            {item.label}
                          </span>
                          {!item.read && (
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-blue-soft shrink-0"
                              aria-label="Non lue"
                            />
                          )}
                        </span>

                        <span className="block text-[11px] text-white/45 mt-0.5 truncate">
                          {item.source === 'public' ? 'Site public' : item.actor || 'Back-office'}
                          {item.detail && ` · ${item.detail}`}
                        </span>
                        <span className="block text-[10.5px] text-white/35 mt-0.5 tabular-nums">
                          {relativeTime(item.createdAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/admin/journal"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between gap-2 px-4 py-3 border-t border-white/[0.07] text-[11.5px] font-medium text-white/55 hover:text-white hover:bg-white/[0.03] transition-colors"
          >
            <span className="inline-flex items-center gap-1.5">
              <ScrollText size={14} strokeWidth={1.75} />
              Journal d’audit complet
            </span>
            <ChevronRight size={14} strokeWidth={1.75} />
          </Link>
        </div>
      )}
    </div>
  );
}
