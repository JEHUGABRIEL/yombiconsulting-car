'use client';

import { useTranslations } from 'next-intl';
import { Clipboard, GraduationCap, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

const pillarIcons = [Clipboard, GraduationCap, Users];

export default function Cabinet() {
  const t = useTranslations('cabinet');
  const pillars = t.raw('pillars');
  const sectionRef = useScrollRevealContainer();

  return (
    <section id="cabinet" className="py-16 bg-navy text-white" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-14 mb-10">
          <ScrollReveal>
            <span className="chip inline-flex items-center gap-2 bg-[rgba(255,255,255,.1)] text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {t('chip')}
            </span>
            <h2 className="text-white font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              {t('title')}{' '}
              <span className="text-blue-soft">{t('titleHighlight')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-[#B9C7DC] text-[15.5px]">{t('description')}</p>
            <p className="text-[#B9C7DC] text-[15.5px] mt-3.5">{t('description2')}</p>
          </ScrollReveal>
        </div>

        <ScrollReveal>
          <blockquote className="text-center text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold text-[#E7EEF9] tracking-[-0.01em] py-[38px] px-6 border-t border-b border-[rgba(255,255,255,.12)] mb-14">
            « <b className="text-blue-soft font-semibold">{t('mission')}</b> »
          </blockquote>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_0.85fr] gap-7" data-stagger>
          {pillars.map((pillar: any, i: number) => {
            const Icon = pillarIcons[i];
            return (
              <ScrollReveal key={i}>
                <div className="bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.1)] rounded-[20px] p-[30px]">
                  <span className="w-[54px] h-[54px] rounded-[16px] bg-blue flex items-center justify-center mb-5">
                    <Icon size={25} className="text-white" strokeWidth={1.8} />
                  </span>
                  <h3 className="text-[18px] font-extrabold mb-2.5">{pillar.title}</h3>
                  <p className="text-[14.5px] text-[#B9C7DC]">{pillar.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
