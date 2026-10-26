'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items');
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const maxIndex = Math.max(0, items.length - visibleCount);
  const safeCurrent = Math.min(current, maxIndex);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setVisibleCount(3);
      else if (w >= 768) setVisibleCount(2);
      else setVisibleCount(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    setCurrent((prev) => Math.min(prev, Math.max(0, items.length - visibleCount)));
  }, [visibleCount, items.length]);

  return (
    <section id="testimonials" className="py-20 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="bg-[#EFF4FD] rounded-[24px] px-5 sm:px-9 py-8 sm:py-10">
            <div className="flex flex-wrap items-end justify-between gap-5 mb-7">
              <div className="max-w-[620px]">
                <h2 className="font-extrabold text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.2] tracking-[-0.02em] mb-2">
                  {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
                </h2>
                <p className="text-mut text-[14px]">{t('description')}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-mut tabular-nums">
                  {safeCurrent + 1} / {maxIndex + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrent(Math.max(0, safeCurrent - 1))}
                    disabled={safeCurrent === 0}
                    className="carousel-btn"
                    aria-label="Témoignages précédents"
                  >
                    <ChevronLeft size={17} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrent(Math.min(maxIndex, safeCurrent + 1))}
                    disabled={safeCurrent >= maxIndex}
                    className="carousel-btn"
                    aria-label="Témoignages suivants"
                  >
                    <ChevronRight size={17} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden -mx-2">
              <div
                className="carousel-track flex"
                style={{ transform: `translateX(-${safeCurrent * (100 / visibleCount)}%)` }}
              >
                {items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="shrink-0 px-2"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <figure className="card card--light h-full">
                      <div className="card__body gap-4">
                        <blockquote className="text-ink text-[14.5px] leading-[1.7]">
                          {item.text}
                        </blockquote>
                        <figcaption className="mt-auto pt-4 border-t border-line flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-tint text-blue font-bold text-[11px] flex items-center justify-center">
                            {item.name
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </span>
                          <span>
                            <span className="block text-[13px] font-semibold text-ink">
                              {item.name}
                            </span>
                            <span className="block text-[12px] text-mut">{item.role}</span>
                          </span>
                        </figcaption>
                      </div>
                    </figure>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
