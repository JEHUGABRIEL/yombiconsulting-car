'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ArrowUpRight, Clock, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getFormations } from '@/data/formations';

const catColors: Record<string, { text: string; dot: string }> = {
  sec: { text: 'text-blue', dot: 'bg-blue' },
  mgmt: { text: 'text-navy', dot: 'bg-navy' },
  ent: { text: 'text-blue-deep', dot: 'bg-blue-deep' },
};

export default function Formations() {
  const t = useTranslations('formations');
  const locale = useLocale();
  const displayItems = getFormations(locale).slice(0, 6);

  return (
    <section id="formations" className="py-20 bg-sky">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <ScrollReveal>
          <div className="max-w-[760px] mb-12">
            <span className="inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {t('chip')}
            </span>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>{' '}
              {t('titleSuffix')}
            </h2>
            <p className="text-mut max-w-[640px]">{t('description')}</p>
          </div>
        </ScrollReveal>

        {/* Formation Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          data-stagger
        >
          {displayItems.map((formation) => {
            const colors = catColors[formation.category] || catColors.sec;
            return (
              <ScrollReveal key={formation.slug}>
                <Link
                  href={`/formations/${formation.slug}`}
                  className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-line hover:border-blue/25 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-[180px] overflow-hidden shrink-0">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      style={{ backgroundImage: `url('${formation.image}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-navy/10 to-transparent" />
                    <span
                      className={`absolute top-4 left-4 inline-flex items-center gap-1.5 bg-[#FAFBFD]/95 ${colors.text} text-[11px] font-bold tracking-wide px-3 py-1.5 rounded-full`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {t(`filters.${formation.category}`)}
                    </span>
                    <span className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 text-white/90 text-[12px] font-semibold">
                      <Clock size={13} strokeWidth={1.8} />
                      {formation.duration}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="font-bold text-[17px] leading-snug text-ink mb-2 group-hover:text-blue transition-colors">
                      {formation.title}
                    </h3>
                    <p className="text-mut text-[14px] leading-relaxed line-clamp-2 mb-5">
                      {formation.description}
                    </p>

                    {/* Footer meta */}
                    <div className="mt-auto pt-4 border-t border-line flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-mut">
                        <Users size={14} className="text-blue" strokeWidth={1.8} />
                        {formation.format}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[13px] font-bold text-blue">
                        {t('seeMore')}
                        <ArrowUpRight
                          size={18}
                          className="transition-colors duration-300"
                          strokeWidth={1.8} />
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center mt-12">
            <Link
              href="/formations"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-bold rounded-full border-[1.5px] border-blue text-blue hover:bg-blue hover:text-white transition-all duration-300"
            >
              {t('allFormations')}
              <ArrowRight
                size={18}
                strokeWidth={1.8}
                className="transition-colors duration-300" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
