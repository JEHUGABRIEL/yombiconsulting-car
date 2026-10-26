'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';

/* ── Images de fond par slide ───────────────────────────── */
const heroImages = [
  '/images/formation-salle-participants.jpeg',
  '/images/chantier-consignes-securite.jpeg',
  '/images/formation-paperboard.jpeg',
];

export default function Hero() {
  const t = useTranslations('hero');
  const slides = t.raw('slides');
  const stats = t.raw('stats');
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden pt-24 pb-16 min-h-[85vh] flex items-center">
      {/* ── Background images (crossfade) ── */}
      {heroImages.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1200ms] ease-in-out"
          style={{
            backgroundImage: `url('${src}')`,
            opacity: i === current ? 1 : 0,
          }} />
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 hero-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
        <div key={`text-${current}`} className="hero-slide max-w-[720px]">
          <div className="animate-fade-in-up">
            <span className="chip inline-flex items-center gap-2 bg-white/10 text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {slide.chip}
            </span>
          </div>

          <h1 className="font-extrabold text-[clamp(2.4rem,4.8vw,3.8rem)] leading-[1.08] tracking-[-0.025em] mb-6 animate-fade-in-up delay-100">
            {slide.title.split(slide.titleHighlight).map((part: string, i: number) => (
              <span key={i}>
                {part}
                {i === 0 && (
                  <span className="text-blue">{slide.titleHighlight}</span>
                )}
              </span>
            ))}
          </h1>

          <p className="text-white/70 text-[17px] max-w-[540px] mb-9 animate-fade-in-up delay-200">
            {slide.lead}
          </p>

          <div className="flex items-center gap-7 flex-wrap mb-12 animate-fade-in-up delay-300">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-colors"
            >
              {slide.cta1}
              <ArrowRight size={18} strokeWidth={1.8} />
            </a>
            <a
              href="#cabinet"
              className="inline-flex items-center gap-2 text-blue-soft text-[15px] font-bold hover:underline"
            >
              {slide.cta2}
              <ArrowRight size={18} strokeWidth={1.8} />
            </a>
          </div>

          <div className="flex flex-wrap gap-0 animate-fade-in-up delay-500">
            {stats.map((stat: any, i: number) => (
              <div
                key={i}
                className={`py-1 pr-10 mr-10 ${
                  i < stats.length - 1 ? 'border-r border-white/20' : 'border-none mr-0 pr-0'
                }`}
              >
                <strong className="block text-[32px] font-extrabold text-white tracking-[-0.02em] leading-tight">
                  {stat.value}
                </strong>
                <span className="text-[13px] font-semibold text-white/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
