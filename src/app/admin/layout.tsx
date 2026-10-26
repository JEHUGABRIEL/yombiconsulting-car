import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Back-office · Cabinet Yo Mbi Consulting',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#F4F7FC]">{children}</div>;
}
