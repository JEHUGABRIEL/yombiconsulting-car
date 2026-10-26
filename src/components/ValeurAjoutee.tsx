'use client';

import { useTranslations } from 'next-intl';
import { Users, GraduationCap, Target, MessageCircle, Award, RefreshCw, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

const itemIcons = [Users, GraduationCap, Target, MessageCircle, Award, RefreshCw];

export default function ValeurAjoutee() {
  const t = useTranslations('valeur');
  const items = t.raw('items');
  const sectionRef = useScrollRevealContainer();

  return (
    <section id="valeur" className="py-16" ref={sectionRef}>
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
                <span className="text-blue">{t('titleHighlight')}</span>{' '}
                {t('titleSuffix')}
              </h2>
              <p className="text-mut max-w-[640px] mb-9">{t('description')}</p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-colors"
              >
                {t('cta')}
                <ArrowRight size={18} strokeWidth={1.8} />
              </a>
            </ScrollReveal>
          </div>

          {/* Right column - value items */}
          <div data-stagger>
            {items.map((item: any, i: number) => {
              const Icon = itemIcons[i];
              return (
                <ScrollReveal key={i}>
                  <div
                    className={`flex gap-5 py-[22px] ${
                      i < items.length - 1 ? 'border-b border-line' : ''
                    } ${i === 0 ? 'pt-1.5' : ''}`}
                  >
                    <span className="w-[50px] h-[50px] rounded-[14px] bg-tint flex items-center justify-center shrink-0">
                      <Icon size={23} className="text-blue" strokeWidth={1.8} />
                    </span>
                    <div>
                      <h4 className="text-[16.5px] font-extrabold mb-1.5 tracking-[-0.01em]">
                        {item.title}
                      </h4>
                      <p className="text-[14.5px] text-mut">{item.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
