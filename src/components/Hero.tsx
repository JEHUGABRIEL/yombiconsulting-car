'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

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
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[current];

  return (
    <section className="pt-[112px] pb-16 lg:pt-[148px] lg:pb-24 bg-[#FCFDFE] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-16 lg:gap-20 items-center">
          {/* ── Texte ── */}
          <div>
            <h1 className="font-extrabold text-navy text-[clamp(2.15rem,4.6vw,3.5rem)] leading-[1.06] tracking-[-0.035em]">
              {slide.title.split(slide.titleHighlight).map((part: string, i: number) => (
                <span key={i}>
                  {part}
                  {i === 0 && <span className="text-blue">{slide.titleHighlight}</span>}
                </span>
              ))}
            </h1>

            <p className="text-mut text-[17px] leading-[1.65] max-w-[520px] mt-6">{slide.lead}</p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a href="#services" className="btn btn-primary px-6 py-3.5 text-[14.5px]">
                {slide.cta1}
                <ArrowRight size={17} strokeWidth={1.9} />
              </a>
              <a href="#cabinet" className="btn btn-outline px-6 py-3.5 text-[14.5px]">
                {slide.cta2}
              </a>
            </div>

            <dl className="grid grid-cols-3 gap-x-4 sm:gap-x-8 mt-10 pt-7 border-t border-line">
              {stats.map((stat: any, i: number) => (
                <div key={i}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-[22px] sm:text-[26px] font-extrabold text-navy tracking-[-0.03em] leading-none">
                      {stat.value}
                    </span>
                    <span className="block text-[11.5px] sm:text-[12.5px] font-medium text-mut mt-2 leading-snug">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Visuel ── */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              aria-hidden
              className="hidden sm:block absolute -top-5 -right-5 bottom-6 left-14 rounded-[26px] bg-navy"
            />

            <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] sm:aspect-[5/6] bg-sky">
              {heroImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden={i !== current}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    i === current ? 'opacity-100 hero-image-active' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
