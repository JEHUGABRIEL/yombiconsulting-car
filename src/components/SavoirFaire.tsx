'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Check } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import type { Service } from '@/data/services';

/**
 * Les cartes de prestations : la carte active (survol à la souris, lecture au
 * centre de l'écran sur mobile) s'agrandit et découvre son détail sur fond blanc.
 */
export default function SavoirFaire({ items }: { items: Service[] }) {
  const t = useTranslations('savoirfaire');
  const [active, setActive] = useState<string | null>(null);
  const cards = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Sur un appareil à souris, le survol suffit : pas d'observateur.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const best = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const slug = best.target.getAttribute('data-slug');
        if (slug) setActive(slug);
      },
      { threshold: [0.35, 0.6, 0.85] }
    );

    cards.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items.length]);

  return (
    <section id="savoir-faire" className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-16 items-end mb-10">
          <ScrollReveal>
            <h2 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.6rem)] leading-[1.1] tracking-[-0.03em]">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <p className="text-mut text-[15.5px] leading-[1.7]">{t('description')}</p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-stagger>
          {items.map((service, index) => {
            const shown = active === service.slug;
            const ease = 'ease-[cubic-bezier(0.22,1,0.28,1)]';

            return (
              <ScrollReveal key={service.slug} className="h-full">
                <div
                  ref={(element) => {
                    if (element) cards.current.set(service.slug, element);
                    else cards.current.delete(service.slug);
                  }}
                  data-slug={service.slug}
                  onMouseLeave={() => setActive((current) => (current === service.slug ? null : current))}
                  className={`group relative h-full overflow-hidden rounded-[18px] bg-navy aspect-[4/3] transition-transform duration-[420ms] ${ease} hover:z-10 hover:scale-[1.03] focus-within:z-10 focus-within:scale-[1.03] ${
                    shown ? 'z-10 scale-[1.03]' : ''
                  }`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ${ease} group-hover:scale-[1.06]`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/25 to-transparent" />

                  <span className="absolute top-3.5 left-4 text-[11px] font-bold tracking-[0.14em] text-white/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div
                    className={`absolute inset-x-4 bottom-4 transition-all duration-300 ${ease} group-hover:opacity-0 group-hover:translate-y-2 group-focus-within:opacity-0 ${
                      shown ? 'opacity-0 translate-y-2' : 'opacity-100'
                    }`}
                  >
                    <h3 className="text-white font-bold text-[16px] leading-snug">{service.title}</h3>
                  </div>

                  {/* Détail sur fond blanc, révélé quand la carte devient active. */}
                  <div
                    className={`absolute inset-x-2.5 bottom-2.5 rounded-[13px] bg-[#FCFDFE] p-4 shadow-[0_12px_30px_rgba(12,36,64,.18)] transition-all duration-[380ms] ${ease} translate-y-[105%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 ${
                      shown ? 'translate-y-0 opacity-100' : ''
                    }`}
                  >
                    <h3 className="text-[15px] font-bold text-ink leading-snug">{service.title}</h3>
                    <p className="text-[12.5px] text-mut leading-[1.55] mt-1.5 line-clamp-2">
                      {service.description}
                    </p>
                    <ul className="mt-2.5 space-y-1">
                      {service.list.slice(0, 3).map((entry) => (
                        <li
                          key={entry}
                          className="flex items-start gap-1.5 text-[12px] text-ink leading-snug"
                        >
                          <Check size={13} strokeWidth={2.2} className="text-blue shrink-0 mt-[2px]" />
                          <span className="line-clamp-1">{entry}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/services/${service.slug}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-blue"
                    >
                      {t('details')}
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-[14px] font-semibold btn btn-outline text-ink"
          >
            {t('all')}
            <ArrowRight size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </section>
  );
}
