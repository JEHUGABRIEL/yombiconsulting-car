'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Inbox, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/messages', label: 'Messages', icon: Inbox },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: { email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-[248px] bg-navy text-white">
        <div className="flex items-center gap-3 px-6 h-[68px] border-b border-white/10">
          <span className="w-9 h-9 rounded-lg bg-blue flex items-center justify-center">
            <ShieldCheck size={18} strokeWidth={1.9} />
          </span>
          <span className="leading-tight">
            <span className="block text-[14px] font-bold">Yo Mbi</span>
            <span className="block text-[11.5px] text-white/50">Back-office</span>
          </span>
        </div>

        <nav className="flex lg:flex-col gap-1 px-3 py-3 overflow-x-auto lg:overflow-visible">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
          <a
            href="/fr"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-white/60 hover:text-white hover:bg-white/5 whitespace-nowrap transition-colors"
          >
            <ExternalLink size={16} strokeWidth={1.8} />
            Voir le site
          </a>
        </nav>

        <div className="hidden lg:block absolute bottom-0 inset-x-0 p-3 border-t border-white/10">
          <p className="px-3 pb-2 text-[12px] text-white/50 truncate" title={admin.email}>
            {admin.email}
          </p>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={15} strokeWidth={1.8} />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 lg:pl-[248px]">
        <header className="lg:hidden flex items-center justify-between px-5 h-[60px] bg-[#FCFDFE] border-b border-line">
          <span className="text-[13.5px] font-semibold text-ink">Back-office</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-[13px] font-medium text-mut hover:text-ink">
              Déconnexion
            </button>
          </form>
        </header>
        <main className="px-5 sm:px-8 py-8 max-w-[1120px]">{children}</main>
      </div>
    </div>
  );
}
