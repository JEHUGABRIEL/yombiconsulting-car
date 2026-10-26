'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Clock, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getFormations } from '@/data/formations';

const catColors: Record<string, { dot: string }> = {
  sec: { dot: 'bg-blue' },
  mgmt: { dot: 'bg-navy' },
  ent: { dot: 'bg-blue-deep' },
};

export default function Formations() {
  const t = useTranslations('formations');
  const locale = useLocale();
  const displayItems = getFormations(locale).slice(0, 6);

  return (
    <section id="formations" className="py-20 bg-sky">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="max-w-[760px] mb-12">
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span> {t('titleSuffix')}
            </h2>
            <p className="text-mut max-w-[640px]">{t('description')}</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
          {displayItems.map((formation) => {
            const colors = catColors[formation.category] || catColors.sec;
            return (
              <ScrollReveal key={formation.slug} className="h-full">
                <Link href={`/formations/${formation.slug}`} className="card group h-full">
                  <div className="card__media">
                    <img src={formation.image} alt={formation.title} loading="lazy" />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#FAFBFD]/95 px-2.5 py-1 text-[11px] font-bold text-ink">
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {t(`filters.${formation.category}`)}
                    </span>
                  </div>

                  <div className="card__body">
                    <h3 className="card__title">{formation.title}</h3>
                    <p className="card__text line-clamp-2">{formation.description}</p>
                    <div className="mt-auto pt-4 border-t border-line flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-mut">
                        <Clock size={15} strokeWidth={1.8} className="text-blue" />
                        {formation.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-mut">
                        <Users size={15} strokeWidth={1.8} className="text-blue" />
                        {formation.format}
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={100}>
          <div className="flex justify-center mt-12">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[14.5px] font-bold rounded-full border border-line-2 text-ink hover:border-blue hover:text-blue transition-colors"
            >
              {t('allFormations')}
              <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
