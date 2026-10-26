import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-14">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <span className="w-10 h-10 rounded-[10px] bg-blue flex items-center justify-center">
            <ShieldCheck size={19} strokeWidth={1.9} />
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold">Cabinet Yo Mbi Consulting</p>
            <p className="text-[11.5px] text-white/40">Espace d’administration</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-[14px] p-7">
          <h1 className="text-[18px] font-semibold tracking-[-0.01em] mb-1">Connexion</h1>
          <p className="text-[13px] text-white/40 mb-6">Accès réservé à l’équipe du cabinet.</p>

          {configured ? (
            <LoginForm />
          ) : (
            <div className="text-[13px] text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-[9px] px-4 py-3.5 leading-relaxed">
              Le back-office n’est pas encore configuré. Renseignez{' '}
              <code className="font-mono text-[12px]">DATABASE_URL</code> et{' '}
              <code className="font-mono text-[12px]">SESSION_SECRET</code>, appliquez les
              migrations puis créez un administrateur.
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8">
          © {new Date().getFullYear()} Cabinet Yo Mbi Consulting
        </p>
      </div>
    </div>
  );
}
