'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getActualites } from '@/data/actualites';

export default function Actualites() {
  const t = useTranslations('actualites');
  const locale = useLocale();
  const items = getActualites(locale);
  const [lead, ...rest] = items;

  if (!lead) return null;

  return (
    <section id="actualites" className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-5 mb-9">
            <div className="max-w-[560px]">
              <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em]">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
            </div>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink hover:text-blue transition-colors"
            >
              {t('viewAll')}
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-4">
          {/* Article principal : photo plein cadre, texte en panneau superposé */}
          <ScrollReveal>
            <Link
              href={`/actualites/${lead.slug}`}
              className="group relative block overflow-hidden rounded-[20px] bg-navy min-h-[420px] h-full"
            >
              <img
                src={lead.image}
                alt={lead.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />

              <div className="relative h-full flex items-end p-3 sm:p-4">
                <div className="bg-[#FCFDFE] rounded-[14px] p-5 sm:p-6 w-full max-w-[440px]">
                  <div className="card__meta mb-2.5">
                    <span className="text-blue">{lead.category}</span>
                    <span className="w-1 h-1 rounded-full bg-line-2" />
                    <span>{lead.date}</span>
                  </div>
                  <h3 className="text-[18px] font-semibold text-ink leading-[1.35] tracking-[-0.01em] group-hover:text-blue transition-colors">
                    {lead.title}
                  </h3>
                  <p className="text-mut text-[13.5px] leading-[1.6] mt-2 line-clamp-2">
                    {lead.excerpt}
                  </p>
                  <span className="card__cta mt-3.5">
                    {t('readMore')}
                    <ArrowRight size={15} strokeWidth={1.9} />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Deux articles secondaires empilés, composition horizontale */}
          <div className="flex flex-col gap-4">
            {rest.slice(0, 2).map((article, i) => (
              <ScrollReveal key={article.slug} delay={80 + i * 60} className="flex-1">
                <Link
                  href={`/actualites/${article.slug}`}
                  className="group flex h-full overflow-hidden rounded-[20px] bg-[#F6F8FC] border border-[#ECEFF6] hover:border-[#DCE3EF] hover:bg-[#FDFEFF] transition-colors"
                >
                  <div className="w-[38%] sm:w-[34%] shrink-0 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full min-h-[150px] object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-4 sm:p-5 min-w-0">
                    <div className="card__meta mb-1.5">
                      <span className="text-blue">{article.category}</span>
                    </div>
                    <h3 className="text-[14.5px] font-semibold text-ink leading-[1.4] line-clamp-2 group-hover:text-blue transition-colors">
                      {article.title}
                    </h3>
                    <span className="text-[12px] text-mut mt-2">{article.date}</span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
