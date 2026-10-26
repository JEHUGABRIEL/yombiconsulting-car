'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getFormations } from '@/data/formations';

const catDots: Record<string, string> = {
  sec: 'bg-blue',
  mgmt: 'bg-navy',
  ent: 'bg-blue-deep',
};

export default function Formations() {
  const t = useTranslations('formations');
  const locale = useLocale();
  const items = getFormations(locale);

  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = Math.max(0, items.length - visible);
  const current = Math.min(index, maxIndex);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, items.length - visible)));
  }, [visible, items.length]);

  return (
    <section id="formations" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-3">
            <div className="max-w-[640px]">
              <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em] mb-3">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>{' '}
                {t('titleSuffix')}
              </h2>
              <p className="text-mut text-[15.5px] leading-[1.7] max-w-[560px]">
                {t('description')}
              </p>
            </div>

            <div className="flex items-center gap-3 pb-1">
              <span className="text-[13px] font-medium text-mut tabular-nums">
                {current + 1} / {maxIndex + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIndex(Math.max(0, current - 1))}
                  disabled={current === 0}
                  className="carousel-btn"
                  aria-label="Formations précédentes"
                >
                  <ChevronLeft size={17} strokeWidth={1.9} />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex(Math.min(maxIndex, current + 1))}
                  disabled={current >= maxIndex}
                  className="carousel-btn"
                  aria-label="Formations suivantes"
                >
                  <ChevronRight size={17} strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="overflow-hidden -mx-2 mt-7">
            <div
              className="carousel-track flex"
              style={{ transform: `translateX(-${current * (100 / visible)}%)` }}
            >
              {items.map((formation) => (
                <div
                  key={formation.slug}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / visible}%` }}
                >
                  <Link href={`/formations/${formation.slug}`} className="card group h-full">
                    <div className="card__media">
                      <img src={formation.image} alt={formation.title} loading="lazy" />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-[6px] bg-[#FCFDFE]/95 px-2 py-1 text-[10.5px] font-semibold text-ink">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${catDots[formation.category] ?? 'bg-blue'}`}
                        />
                        {t(`filters.${formation.category}`)}
                      </span>
                    </div>

                    <div className="card__body">
                      <h3 className="card__title">{formation.title}</h3>
                      <p className="card__text line-clamp-2">{formation.description}</p>
                      <div className="mt-auto pt-4 border-t border-line flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-mut">
                          <Clock size={13} strokeWidth={1.9} className="text-blue" />
                          {formation.duration}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-mut">
                          <Users size={13} strokeWidth={1.9} className="text-blue" />
                          {formation.format}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-9">
          <Link
            href="/formations"
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink hover:text-blue transition-colors"
          >
            {t('allFormations')}
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
