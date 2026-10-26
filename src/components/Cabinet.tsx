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
    <section id="cabinet" className="pb-20" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="bg-[#EDF2FB] rounded-[28px] px-6 sm:px-10 lg:px-12 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.95fr] gap-8 lg:gap-16 items-start mb-10">
            <ScrollReveal>
              <h2 className="text-navy font-extrabold text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.1] tracking-[-0.03em]">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="text-mut text-[15.5px] leading-[1.7]">{t('description')}</p>
              <p className="text-mut text-[15.5px] leading-[1.7] mt-3.5">{t('description2')}</p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <blockquote className="border-l-2 border-blue pl-5 lg:pl-6 max-w-[760px] mb-10 lg:mb-12">
              <p className="text-[clamp(1.15rem,2vw,1.45rem)] font-semibold text-navy leading-[1.45] tracking-[-0.015em]">
                {t('mission')}
              </p>
            </blockquote>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5" data-stagger>
            {pillars.map((pillar: any, i: number) => {
              const Icon = pillarIcons[i];
              return (
                <ScrollReveal key={i} className="h-full">
                  <div className="bg-[#FCFDFE] border border-[#DEE6F3] rounded-[16px] p-6 h-full">
                    <span className="w-9 h-9 rounded-[9px] bg-blue flex items-center justify-center mb-4">
                      <Icon size={17} className="text-white" strokeWidth={1.9} />
                    </span>
                    <h3 className="text-[15.5px] font-semibold text-ink mb-2 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-[14px] text-mut leading-[1.65]">{pillar.description}</p>
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
