import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { getSessionAdmin } from '@/lib/auth';
import { hasDb } from '@/lib/db';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion · Back-office Yo Mbi Consulting',
};

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const admin = await getSessionAdmin();
  if (admin) redirect('/admin');

  const configured = hasDb() && Boolean(process.env.SESSION_SECRET);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
            <ShieldCheck size={19} className="text-white" strokeWidth={1.9} />
          </span>
          <div className="leading-tight">
            <p className="text-[14.5px] font-bold text-ink">Cabinet Yo Mbi Consulting</p>
            <p className="text-[12px] text-mut">Espace d’administration</p>
          </div>
        </div>

        <div className="bg-[#FCFDFE] border border-line rounded-[16px] p-7">
          <h1 className="text-[19px] font-bold text-ink tracking-[-0.01em] mb-1">Connexion</h1>
          <p className="text-[13.5px] text-mut mb-6">
            Accès réservé à l’équipe du cabinet.
          </p>

          {configured ? (
            <LoginForm />
          ) : (
            <div className="text-[13.5px] text-[#8A4B08] bg-[#FFFAEB] border border-[#FEDF89] rounded-lg px-4 py-3.5 leading-relaxed">
              Le back-office n’est pas encore configuré. Renseignez{' '}
              <code className="font-mono text-[12.5px]">DATABASE_URL</code> et{' '}
              <code className="font-mono text-[12.5px]">SESSION_SECRET</code>, appliquez les
              migrations puis créez un administrateur.
            </div>
          )}
        </div>

        <Link
          href="/fr"
          className="inline-flex items-center gap-2 mt-6 text-[13px] font-medium text-mut hover:text-blue transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          Retour au site
        </Link>
      </div>
    </div>
  );
}
