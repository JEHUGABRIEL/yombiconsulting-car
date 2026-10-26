'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

export default function ValeurAjoutee() {
  const t = useTranslations('valeur');
  const items = t.raw('items');
  const sectionRef = useScrollRevealContainer();

  return (
    <section id="valeur" className="py-20" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-[72px] items-start">
          <div className="lg:sticky lg:top-[110px]">
            <ScrollReveal>
              <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span> {t('titleSuffix')}
              </h2>
              <p className="text-mut max-w-[640px] mb-9">{t('description')}</p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-[14.5px] font-bold rounded-[10px] bg-blue text-white hover:bg-blue-deep transition-colors"
              >
                {t('cta')}
                <ArrowRight size={17} strokeWidth={1.8} />
              </a>
            </ScrollReveal>
          </div>

          <div data-stagger>
            {items.map((item: any, i: number) => (
              <ScrollReveal key={i}>
                <div
                  className={`grid grid-cols-[38px_1fr] gap-4 py-6 ${
                    i < items.length - 1 ? 'border-b border-line' : ''
                  }`}
                >
                  <span className="text-[12px] font-extrabold tracking-[0.08em] text-blue pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-[16.5px] font-bold text-ink mb-1.5 tracking-[-0.01em]">
                      {item.title}
                    </h3>
                    <p className="text-[14.5px] text-mut leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
