'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getServices } from '@/data/services';

export default function Services() {
  const t = useTranslations('services');
  const locale = useLocale();
  const list = getServices(locale);
  const cards = t.raw('cards');

  return (
    <section id="services" className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 items-end mb-10">
          <ScrollReveal>
            <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em]">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-mut text-[15.5px] leading-[1.7]">{t('description')}</p>
            <p className="text-mut text-[15.5px] leading-[1.7] mt-3">{t('description2')}</p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
          {cards.slice(0, 6).map((card: any, i: number) => {
            const service = list[i];
            return (
              <ScrollReveal key={i} className="h-full">
                <Link
                  href={service ? `/services/${service.slug}` : '/services'}
                  className="card group h-full"
                >
                  {service?.image ? (
                    <div className="card__media">
                      <img src={service.image} alt={card.title} loading="lazy" />
                      <span className="absolute top-3 left-3 text-[10.5px] font-bold tracking-[0.08em] text-white/90 mix-blend-difference">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  ) : null}
                  <div className="card__body">
                    <h3 className="card__title">{card.title}</h3>
                    <p className="card__text">{card.description}</p>
                    <span className="card__cta">
                      {t('details')}
                      <ArrowRight size={15} strokeWidth={1.9} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-9">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink hover:text-blue transition-colors"
          >
            {t('allServices')}
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
