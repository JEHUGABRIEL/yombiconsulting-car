'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Shield, Clipboard, AlertTriangle, Leaf, TrendingUp, Briefcase, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getServices } from '@/data/services';

const icons = [Shield, Clipboard, AlertTriangle, Leaf, TrendingUp, Briefcase];

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
            <span className="chip inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {t('chip')}
            </span>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-mut text-[15.5px]">{t('description')}</p>
            <p className="text-mut text-[15.5px] mt-3">{t('description2')}</p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
          {cards.slice(0, 6).map((card: any, i: number) => {
            const Icon = icons[i];
            const service = list[i];
            return (
              <ScrollReveal key={i}>
                <Link
                  href={service ? `/services/${service.slug}` : '/services'}
                  className="group flex flex-col h-full bg-white border border-line rounded-[20px] overflow-hidden hover:border-[#C6D7F6] transition-colors"
                >
                  <div className="relative h-[170px] shrink-0 overflow-hidden">
                    {service?.image ? (
                      <img
                        src={service.image}
                        alt={card.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/5 to-transparent" />
                    <span className="absolute bottom-4 left-5 w-11 h-11 rounded-[12px] bg-[#FAFBFD]/95 flex items-center justify-center">
                      <Icon size={20} className="text-blue" strokeWidth={1.8} />
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <h3 className="text-[18px] font-extrabold mb-2.5 tracking-[-0.01em]">
                      {card.title}
                    </h3>
                    <p className="text-[14.5px] text-mut mb-5 flex-1">
                      {card.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-blue text-[14px] font-bold">
                      {t('details')}
                      <ArrowRight size={18} strokeWidth={1.8} />
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
              className="inline-flex items-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full border-[1.5px] border-blue text-blue hover:bg-blue hover:text-white transition-colors"
            >
              {t('allServices')}
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
