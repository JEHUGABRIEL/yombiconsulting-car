'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CtaBanner() {
  const t = useTranslations('cta');

  return (
    <section className="py-0 pb-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden bg-blue rounded-[28px] px-16 py-14 flex items-center justify-between gap-10 flex-wrap">
            {/* Decorative circles */}
            <div className="absolute right-[-120px] top-[-160px] w-[420px] h-[420px] rounded-full bg-[rgba(255,255,255,.09)]" />
            <div className="absolute right-[60px] bottom-[-200px] w-[300px] h-[300px] rounded-full bg-[rgba(255,255,255,.06)]" />

            <div className="relative z-10">
              <h2 className="text-white font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] max-w-[560px] mb-3">
                {t('title')}
              </h2>
              <p className="text-[#D6E2FB] max-w-[560px] relative z-10">
                {t('description')}
              </p>
            </div>

            <a
              href="#contact"
              className="relative z-10 inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-white text-blue hover:shadow-[0_10px_26px_rgba(6,20,45,.25)] transition-all"
            >
              {t('cta')}
              <ArrowRight size={17} strokeWidth={2.5} />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
