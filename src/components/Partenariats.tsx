'use client';

import { useTranslations } from 'next-intl';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

export default function Partenariats() {
  const t = useTranslations('partenariats');
  const items = t.raw('items');
  const sectionRef = useScrollRevealContainer();

  return (
    <section id="partenariats" className="py-16 bg-sky" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-[72px] items-start">
          {/* Left sticky column */}
          <div className="lg:sticky lg:top-[110px]">
            <ScrollReveal>
              <span className="chip inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                {t('chip')}
              </span>
              <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
                {t('title')}{' '}
                <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
              <p className="text-mut max-w-[640px] mb-9">{t('description')}</p>
              <button className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full border-[1.5px] border-line-2 text-ink hover:border-blue hover:text-blue transition-all">
                {t('cta')}
              </button>
            </ScrollReveal>
          </div>

          {/* Right column - partnership items */}
          <ol data-stagger>
            {items.map((item: string, i: number) => (
              <ScrollReveal key={i}>
                <li
                  className={`flex gap-6 items-baseline py-[19px] ${
                    i < items.length - 1 ? 'border-b border-line' : ''
                  } ${i === 0 ? 'pt-1.5' : ''}`}
                >
                  <span className="text-[15px] font-extrabold text-blue min-w-[30px]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-[16.5px] font-semibold">{item}</p>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
