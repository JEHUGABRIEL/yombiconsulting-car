'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const items = t.raw('items');
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

  const maxIndex = Math.max(0, items.length - visibleCount);

  const next = useCallback(() => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Responsive visible count
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

  // Reset index when visible count changes
  useEffect(() => {
    setCurrent((prev) => Math.min(prev, Math.max(0, items.length - visibleCount)));
  }, [visibleCount, items.length]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Clamp index
  useEffect(() => {
    if (current > maxIndex) setCurrent(maxIndex);
  }, [current, maxIndex]);

  return (
    <section id="testimonials" className="py-16 bg-gradient-to-b from-white to-sky overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="chip inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {t('chip')}
            </span>
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
            <p className="text-mut max-w-[640px] mx-auto">{t('description')}</p>
          </div>
        </ScrollReveal>

        {/* Slider */}
        <div className="relative">
          {/* Track */}
          <div
            ref={trackRef}
            className="overflow-hidden"
          >
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                transform: `translateX(-${current * (100 / visibleCount)}%)`,
              }}
            >
              {items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div className="bg-white border border-line rounded-[20px] p-8 relative h-full">
                    {/* Quote icon */}
                    <Quote
                      size={48}
                      className="text-blue/5 absolute top-6 right-6"
                      fill="currentColor" />

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: item.rating }).map((_: any, j: number) => (
                        <Star
                          key={j}
                          size={16}
                          className="text-amber-400"
                          fill="currentColor" />
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-mut text-[15px] leading-relaxed mb-6 italic">
                      &ldquo;{item.text}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-tint flex items-center justify-center text-blue font-extrabold text-sm">
                        {item.name
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-extrabold text-[15px] text-ink">{item.name}</p>
                        <p className="text-[13px] text-mut font-medium">{item.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-11 h-11 rounded-full border border-line-2 flex items-center justify-center text-ink hover:border-blue hover:text-blue transition-colors"
              aria-label="Précédent"
            >
              <ChevronLeft size={20} strokeWidth={1.8} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-8 bg-blue'
                      : 'w-2 bg-line-2 hover:bg-mut'
                  }`}
                  aria-label={`Groupe ${i + 1}`} />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 rounded-full border border-line-2 flex items-center justify-center text-ink hover:border-blue hover:text-blue transition-colors"
              aria-label="Suivant"
            >
              <ChevronRight size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
