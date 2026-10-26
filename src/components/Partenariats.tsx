'use client';

import { useTranslations } from 'next-intl';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

export default function Partenariats() {
  const t = useTranslations('partenariats');
  const items = t.raw('items');
  const sectionRef = useScrollRevealContainer();

  return (
    <section id="partenariats" className="pb-20" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#F4F1EA] rounded-[28px] px-6 sm:px-10 lg:px-12 py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-9 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-[110px]">
              <ScrollReveal>
                <h2 className="font-extrabold text-[clamp(1.8rem,3.2vw,2.35rem)] leading-[1.12] tracking-[-0.03em] mb-4">
                  {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
                </h2>
                <p className="text-[#4B5565] text-[15px] leading-[1.7] max-w-[380px] mb-7">
                  {t('description')}
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center px-5 py-3 text-[14px] font-semibold rounded-[10px] bg-[#0C2440] text-white hover:bg-[#132F52] transition-colors"
                >
                  {t('cta')}
                </a>
              </ScrollReveal>
            </div>

            <ol data-stagger className="border-t border-[#DDD6C8]">
              {items.map((item: string, i: number) => (
                <ScrollReveal key={i}>
                  <li className="flex gap-5 items-baseline py-4 border-b border-[#DDD6C8]">
                    <span className="text-[12px] font-bold text-[#8A8172] tabular-nums min-w-[22px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-[15.5px] font-medium text-[#1F2A3A] leading-[1.55]">
                      {item}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
