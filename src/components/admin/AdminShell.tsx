'use client';

import { Fragment } from 'react';
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
} from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, section: 'Pilotage' },
  { href: '/admin/messages', label: 'Messages', icon: Inbox, section: 'Pilotage' },
  { href: '/admin/services', label: 'Services', icon: Briefcase, section: 'Contenu' },
  { href: '/admin/formations', label: 'Formations', icon: GraduationCap, section: 'Contenu' },
  { href: '/admin/actualites', label: 'Actualités', icon: Newspaper, section: 'Contenu' },
];

export default function AdminShell({
  admin,
  unread = 0,
  children,
}: {
  admin: { email: string; role: string };
  unread?: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initials = admin.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-[264px] lg:flex lg:flex-col border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-[#0A1728]">
        <div className="flex items-center gap-3 px-6 h-[72px] border-b border-white/[0.06]">
          <span className="w-9 h-9 rounded-[10px] bg-blue flex items-center justify-center shrink-0">
            <ShieldCheck size={18} strokeWidth={1.75} />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold">Yo Mbi</span>
            <span className="block text-[11px] text-white/55">Back-office</span>
          </span>
        </div>

        <nav className="flex lg:flex-col gap-1 px-3 py-3 overflow-x-auto lg:overflow-visible">
          {nav.map((item, index) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const showSection = index === 0 || nav[index - 1].section !== item.section;

            return (
              <Fragment key={item.href}>
                {showSection && (
                  <p className="hidden lg:block px-3 pb-2 pt-4 first:pt-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
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
        </nav>

        <div className="hidden lg:block mt-auto p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2.5">
            <span className="w-8 h-8 rounded-full bg-white/[0.07] text-white/70 text-[11px] font-bold flex items-center justify-center shrink-0">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] text-white/80 truncate" title={admin.email}>
                {admin.email}
              </span>
              <span className="block text-[10.5px] text-white/55 capitalize">{admin.role}</span>
            </span>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[12.5px] font-medium text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 lg:pl-[264px]">
        <header className="lg:hidden flex items-center justify-between px-5 h-[60px] border-b border-white/[0.07] bg-[#0A1728]">
          <span className="flex items-center gap-2 text-[13px] font-semibold">
            <ShieldCheck size={18} className="text-blue-soft" />
            Yo Mbi · Back-office
          </span>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-[12.5px] font-medium text-white/50 hover:text-white transition-colors">
              Déconnexion
            </button>
          </form>
        </header>
        <main className="px-5 sm:px-8 lg:px-10 py-8 max-w-[1160px]">{children}</main>
      </div>
    </div>
  );
}
