'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Inbox,
  LogOut,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Newspaper,
  ScrollText,
  Menu,
  Users,
  X,
  UserRound,
} from 'lucide-react';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import NotificationBell from '@/components/admin/NotificationBell';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: string;
  superadminOnly?: boolean;
};

const nav: NavItem[] = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, section: 'Pilotage' },
  { href: '/admin/messages', label: 'Messages', icon: Inbox, section: 'Pilotage' },
  { href: '/admin/services', label: 'Services', icon: Briefcase, section: 'Contenu' },
  { href: '/admin/formations', label: 'Formations', icon: GraduationCap, section: 'Contenu' },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper, section: 'Contenu' },
  { href: '/admin/journal', label: 'Journal d’audit', icon: ScrollText, section: 'Sécurité' },
  {
    href: '/admin/administrateurs',
    label: 'Administrateurs',
    icon: Users,
    section: 'Sécurité',
    superadminOnly: true,
  },
  { href: '/admin/profil', label: 'Mon profil', icon: UserRound, section: 'Sécurité' },
];

/** Initiales de l'avatar : deux mots → deux lettres, sinon les deux premières. */
function initialsOf(name: string, fallback: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] ?? fallback).slice(0, 2).toUpperCase();
}

/** Photo de profil si elle existe, initiales sinon. */
function Avatar({ url, initials }: { url?: string; initials: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/10"
      />
    );
  }

  return (
    <span className="w-8 h-8 rounded-full bg-white/[0.07] text-white/70 text-[11px] font-bold flex items-center justify-center shrink-0">
      {initials}
    </span>
  );
}

function NavItems({
  pathname,
  role,
  unread,
  onNavigate,
  sectionClassName,
}: {
  pathname: string;
  role: string;
  unread: number;
  onNavigate?: () => void;
  sectionClassName: string;
}) {
  // La gestion de l'équipe n'apparaît que pour les superadministrateurs.
  const items = nav.filter((item) => !item.superadminOnly || role === 'superadmin');

  return (
    <>
      {items.map((item, index) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const showSection = index === 0 || items[index - 1].section !== item.section;

        return (
          <Fragment key={item.href}>
            {showSection && <p className={sectionClassName}>{item.section}</p>}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-blue/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              {item.label}
              {item.href === '/admin/messages' && unread > 0 && (
                <span className="ml-auto text-[10.5px] font-bold text-white bg-blue rounded-full px-1.5 py-0.5 leading-none">
                  {unread}
                </span>
              )}
            </Link>
          </Fragment>
        );
      })}
    </>
  );
}

export default function AdminShell({
  admin,
  unread = 0,
  children,
}: {
  admin: {
    email: string;
    role: string;
    displayName?: string;
    jobTitle?: string;
    avatarUrl?: string;
  };
  unread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const displayName = admin.displayName?.trim() || admin.email;
  const initials = initialsOf(displayName, admin.email);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const logoutForm = useRef<HTMLFormElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // La navigation ferme le panneau mobile.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Panneau mobile : Échap, Tab piégé, page figée derrière.
  useEffect(() => {
    if (!drawerOpen) return;

    closeButtonRef.current?.focus();
    document.body.classList.add('no-scroll');

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
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
    };
  }, [drawerOpen]);

  function askLogout() {
    setDrawerOpen(false);
    setLogoutOpen(true);
  }

  function runLogout() {
    logoutForm.current?.requestSubmit();
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Déconnexion réelle : formulaire POST (révoque la session côté serveur). */}
      <form ref={logoutForm} action="/api/admin/logout" method="post" className="hidden" aria-hidden />

      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-[264px] lg:flex lg:flex-col border-r border-white/[0.07] bg-[#0A1728]">
        <div className="flex items-center gap-3 px-6 h-[72px] border-b border-white/[0.06]">
          <span className="w-9 h-9 rounded-[10px] bg-blue flex items-center justify-center shrink-0">
            <ShieldCheck size={18} strokeWidth={1.75} />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold">Yo Mbi</span>
            <span className="block text-[11px] text-white/55">Back-office</span>
          </span>
          <NotificationBell panelSide="left" className="ml-auto shrink-0" />
        </div>

        <nav className="flex flex-col gap-1 px-3 py-3 overflow-y-auto">
          <NavItems
            pathname={pathname}
            role={admin.role}
            unread={unread}
            sectionClassName="px-3 pb-2 pt-4 first:pt-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55"
          />
        </nav>

        <div className="mt-auto p-3 border-t border-white/[0.06]">
          <Link
            href="/admin/profil"
            className="flex items-center gap-3 px-2 py-2.5 rounded-[9px] hover:bg-white/[0.04] transition-colors"
          >
            <Avatar url={admin.avatarUrl} initials={initials} />
            <span className="min-w-0">
              <span className="block text-[12.5px] text-white/80 truncate" title={admin.email}>
                {displayName}
              </span>
              <span className="block text-[10.5px] text-white/55 truncate capitalize">
                {admin.jobTitle?.trim() || admin.role}
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={askLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[12.5px] font-medium text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Se déconnecter
          </button>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 h-[60px] border-b border-white/[0.07] bg-[#0A1728]">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          className="w-10 h-10 -ml-1 rounded-[9px] flex items-center justify-center text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>

        <span className="flex items-center gap-2 text-[13px] font-semibold min-w-0">
          <ShieldCheck size={18} className="text-blue-soft shrink-0" />
          <span className="truncate">Yo Mbi · Back-office</span>
        </span>

        <div className="flex items-center gap-1 -mr-1 shrink-0">
          <NotificationBell />

          <Link
            href="/admin/messages"
            aria-label={`Messages, ${unread} non lu${unread > 1 ? 's' : ''}`}
            className="relative w-10 h-10 rounded-[9px] flex items-center justify-center text-white/75 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Inbox size={20} strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue text-white text-[9.5px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
        </div>
      </header>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[150]">
          <div
            className="dialog-backdrop absolute inset-0 bg-[#040A14]/75 backdrop-blur-[3px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden
          />

          <div
            id="admin-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu du back-office"
            className="drawer-panel relative flex h-full w-[286px] max-w-[84%] flex-col border-r border-white/[0.07] bg-[#0A1728] shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between gap-3 px-5 h-[60px] border-b border-white/[0.06]">
              <span className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-[9px] bg-blue flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} strokeWidth={1.75} />
                </span>
                <span className="leading-tight">
                  <span className="block text-[13px] font-semibold">Yo Mbi</span>
                  <span className="block text-[10.5px] text-white/55">Back-office</span>
                </span>
              </span>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer le menu"
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.07] transition-colors"
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-1 px-3 py-3 overflow-y-auto">
              <NavItems
                pathname={pathname}
                role={admin.role}
                unread={unread}
                onNavigate={() => setDrawerOpen(false)}
                sectionClassName="px-3 pb-2 pt-4 first:pt-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55"
              />
            </nav>

            <div className="p-3 border-t border-white/[0.06]">
              <Link
                href="/admin/profil"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-2 py-2.5 rounded-[9px] hover:bg-white/[0.04] transition-colors"
              >
                <Avatar url={admin.avatarUrl} initials={initials} />
                <span className="min-w-0">
                  <span className="block text-[12px] text-white/80 truncate" title={admin.email}>
                    {displayName}
                  </span>
                  <span className="block text-[10.5px] text-white/55 truncate capitalize">
                    {admin.jobTitle?.trim() || admin.role}
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={askLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[12.5px] font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <LogOut size={16} strokeWidth={1.75} />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 lg:pl-[264px]">
        <main className="w-full px-5 sm:px-8 lg:pl-10 lg:pr-8 py-8">{children}</main>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        options={{
          title: 'Se déconnecter du back-office ?',
          description:
            'La session sera fermée sur tous vos appareils. Vous devrez saisir à nouveau vos identifiants pour revenir.',
          confirmLabel: 'Se déconnecter',
          tone: 'danger',
        }}
        onConfirm={runLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
