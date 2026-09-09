'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { actualites } from '@/data/actualites';

export default function Actualites() {
  const t = useTranslations('actualites');

  return (
    <section id="actualites" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* En-tête */}
        <ScrollReveal>
          <div className="max-w-[760px] mb-12">
            <span className="inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {t('chip')}
            </span>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
            <p className="text-mut max-w-[640px]">{t('description')}</p>
          </div>
        </ScrollReveal>

        {/* Grille d'actus */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-stagger
        >
          {actualites.map((article) => (
            <ScrollReveal key={article.slug}>
              <Link
                href={`/actualites/${article.slug}`}
                className="group flex flex-col h-full bg-sky rounded-[20px] overflow-hidden border border-line hover:border-blue/25 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(13,36,70,.1)] transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-[180px] overflow-hidden shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    style={{ backgroundImage: `url('${article.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/50 via-transparent to-transparent" />
                  {/* Date */}
                  <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-white/90 text-[12px] font-semibold">
                    <Calendar size={13} />
                    {article.date}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Catégorie */}
                  <span className="inline-flex items-center gap-1.5 text-blue text-[11px] font-bold tracking-wide uppercase mb-3">
                    <Tag size={12} />
                    {article.category}
                  </span>

                  <h3 className="font-bold text-[17px] leading-snug text-ink mb-2 group-hover:text-blue transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-mut text-[14px] leading-relaxed line-clamp-3 mb-5 flex-1">
                    {article.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue">
                    {t('readMore')}
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center mt-12">
            <Link
              href="/actualites"
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 text-[15px] font-bold rounded-full border-[1.5px] border-blue text-blue hover:bg-blue hover:text-white transition-all duration-300"
            >
              {t('viewAll')}
              <ArrowRight
                size={17}
                strokeWidth={2.5}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
