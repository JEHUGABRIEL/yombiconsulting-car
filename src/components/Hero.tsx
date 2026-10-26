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
    <section className="relative overflow-hidden bg-sky pt-24 pb-16 min-h-[85vh] flex items-center">
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

      {/* Aucun voile ni filtre sur la photo */}

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
        <div
          key={`text-${current}`}
          className="hero-slide max-w-[640px] rounded-[28px] bg-[#FAFBFD] border border-line p-7 sm:p-9 md:p-10 shadow-[0_30px_70px_rgba(12,36,64,.14)]"
        >
          <div className="animate-fade-in-up">
            <span className="chip inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue" />
              {slide.chip}
            </span>
          </div>

          <h1 className="font-extrabold text-navy text-[clamp(2.1rem,4.2vw,3.3rem)] leading-[1.1] tracking-[-0.025em] mb-5 animate-fade-in-up delay-100">
            {slide.title.split(slide.titleHighlight).map((part: string, i: number) => (
              <span key={i}>
                {part}
                {i === 0 && (
                  <span className="text-blue">{slide.titleHighlight}</span>
                )}
              </span>
            ))}
          </h1>

          <p className="text-mut text-[16.5px] max-w-[520px] mb-8 animate-fade-in-up delay-200">
            {slide.lead}
          </p>

          <div className="flex items-center gap-7 flex-wrap mb-9 animate-fade-in-up delay-300">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-colors"
            >
              {slide.cta1}
              <ArrowRight size={18} strokeWidth={1.8} />
            </a>
            <a
              href="#cabinet"
              className="inline-flex items-center gap-2 text-blue text-[15px] font-bold hover:underline"
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
                  i < stats.length - 1 ? 'border-r border-line' : 'border-none mr-0 pr-0'
                }`}
              >
                <strong className="block text-[28px] font-extrabold text-navy tracking-[-0.02em] leading-tight">
                  {stat.value}
                </strong>
                <span className="text-[13px] font-semibold text-mut">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
