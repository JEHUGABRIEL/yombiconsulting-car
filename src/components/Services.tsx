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
    <section id="services" className="py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-14 items-end mb-14">
          <ScrollReveal>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-mut text-[15.5px]">{t('description')}</p>
            <p className="text-mut text-[15.5px] mt-3">{t('description2')}</p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
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
                    </div>
                  ) : null}
                  <div className="card__body">
                    <h3 className="card__title">{card.title}</h3>
                    <p className="card__text">{card.description}</p>
                    <span className="card__cta">
                      {t('details')}
                      <ArrowRight size={16} strokeWidth={1.8} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={100}>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[14.5px] font-bold rounded-full border border-line-2 text-ink hover:border-blue hover:text-blue transition-colors"
            >
              {t('allServices')}
              <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
