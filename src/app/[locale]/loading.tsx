'use client';

import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('loading');

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#FAFBFD]">
      {/* Fond : halo très doux et trame discrète, pour éviter l'écran blanc vide. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-blue/[0.07] blur-[120px]" />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(#E2E9F3 1px, transparent 1px), linear-gradient(90deg, #E2E9F3 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse at center, #000 15%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 15%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative flex flex-1 items-center justify-center px-6">
        <div role="status" aria-live="polite" className="flex flex-col items-center text-center">
          <div className="relative">
            <span className="loader-ring" aria-hidden />
            <div className="relative flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-line bg-[#FFFFFF] shadow-[0_18px_40px_rgba(12,36,64,0.10)]">
              <img src="/logo.png" alt="" className="h-[42px] w-[42px] object-contain" />
            </div>
          </div>

          <p className="mt-8 text-[19px] font-extrabold tracking-[-0.02em] text-navy">
            Yo Mbi Consulting
          </p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-blue/80">
            Cabinet de conseil · Bangui
          </p>

          <div className="mt-8 h-[2px] w-[200px] overflow-hidden rounded-full bg-line">
            <span className="loader-bar block h-full w-1/3 rounded-full bg-gradient-to-r from-blue to-blue/30" />
          </div>
          <p className="mt-4 text-[12.5px] text-mut">{t('hint')}</p>
          <span className="sr-only">{t('label')}</span>
        </div>
      </div>

      <p className="relative pb-8 text-center text-[11px] text-mut">
        © {new Date().getFullYear()} Cabinet Yo Mbi Consulting
      </p>
    </div>
  );
}
