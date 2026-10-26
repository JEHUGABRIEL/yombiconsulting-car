'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { getActualites } from '@/data/actualites';

export default function Actualites() {
  const t = useTranslations('actualites');
  const locale = useLocale();
  const items = getActualites(locale);

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
    <section id="actualites" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div className="max-w-[620px]">
              <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-3">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
              <p className="text-mut text-[15.5px]">{t('description')}</p>
            </div>

            {maxIndex > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-mut tabular-nums">
                  {current + 1} / {maxIndex + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIndex(Math.max(0, current - 1))}
                    disabled={current === 0}
                    className="carousel-btn"
                    aria-label="Actualités précédentes"
                  >
                    <ChevronLeft size={17} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex(Math.min(maxIndex, current + 1))}
                    disabled={current >= maxIndex}
                    className="carousel-btn"
                    aria-label="Actualités suivantes"
                  >
                    <ChevronRight size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className="overflow-hidden -mx-1">
            <div
              className="carousel-track flex"
              style={{ transform: `translateX(-${current * (100 / visible)}%)` }}
            >
              {items.map((article) => (
                <div
                  key={article.slug}
                  className="shrink-0 px-1"
                  style={{ width: `${100 / visible}%` }}
                >
                  <Link href={`/actualites/${article.slug}`} className="card group h-full">
                    <div className="card__media">
                      <img src={article.image} alt={article.title} loading="lazy" />
                    </div>

                    <div className="card__body">
                      <div className="card__meta">
                        <span className="text-blue">{article.category}</span>
                        <span className="w-1 h-1 rounded-full bg-line-2" />
                        <span>{article.date}</span>
                      </div>

                      <h3 className="card__title">{article.title}</h3>
                      <p className="card__text line-clamp-3">{article.excerpt}</p>

                      <span className="card__cta">
                        {t('readMore')}
                        <ArrowRight size={16} strokeWidth={1.8} />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-10">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-blue hover:gap-2.5 transition-all"
          >
            {t('viewAll')}
            <ArrowRight size={16} strokeWidth={1.9} />
          </Link>
        </div>
      </div>
    </section>
  );
}
