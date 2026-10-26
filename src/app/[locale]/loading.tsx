'use client';

import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('loading');

  return (
    <div className="min-h-screen bg-[#FAFBFD]">
      {/* Barre de navigation */}
      <div className="h-[80px] border-b border-line bg-[#FAFBFD]" />

      <div className="max-w-[1200px] mx-auto px-6 pt-16">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center text-center"
        >
          <img src="/logo.png" alt="" className="w-[60px] h-[60px] object-contain" />
          <p className="mt-4 text-[10px] font-bold tracking-[0.34em] text-mut uppercase">
            Yo Mbi Consulting
          </p>
          <div className="mt-5 h-[3px] w-[180px] rounded-full bg-line overflow-hidden">
            <span className="block h-full w-1/3 rounded-full bg-blue loader-bar" />
          </div>
          <p className="mt-4 text-[13.5px] text-mut">{t('hint')}</p>
          <span className="sr-only">{t('label')}</span>
        </div>

        {/* Squelette de page */}
        <div className="mt-16 max-w-[900px] mx-auto" aria-hidden="true">
          <div className="skeleton h-[24px] w-[38%]" />
          <div className="mt-4 space-y-3">
            <div className="skeleton h-[14px] w-[68%]" />
            <div className="skeleton h-[14px] w-[54%]" />
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="skeleton h-[180px]" />
            <div className="skeleton h-[180px]" />
            <div className="skeleton h-[180px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
