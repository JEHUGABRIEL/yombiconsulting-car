'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CtaBanner() {
  const t = useTranslations('cta');

  return (
    <section className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[28px] bg-navy px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.55]"
              style={{
                backgroundImage:
                  'radial-gradient(120% 140% at 100% 0%, rgba(37,87,230,0.35) 0%, rgba(12,36,64,0) 55%)',
              }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-center">
              <div>
                <h2 className="text-white font-extrabold text-[clamp(1.8rem,3.4vw,2.5rem)] leading-[1.12] tracking-[-0.03em] max-w-[560px]">
                  {t('title')}
                </h2>
                <p className="text-[#B9C7DC] text-[15.5px] leading-[1.7] max-w-[480px] mt-4">
                  {t('description')}
                </p>
              </div>

              <div className="flex lg:justify-end">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14.5px] font-semibold rounded-[10px] bg-white text-navy hover:bg-[#E9F0FD] transition-colors"
                >
                  {t('cta')}
                  <ArrowRight size={17} strokeWidth={1.9} />
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
