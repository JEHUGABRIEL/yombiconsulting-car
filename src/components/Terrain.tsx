'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/* Photos réelles des interventions du cabinet (public/images) */
const photos = [
  { src: '/images/chantier-consignes-securite.jpeg' },
  { src: '/images/formation-paperboard.jpeg' },
  { src: '/images/formation-salle-participants.jpeg' },
];

export default function Terrain() {
  const t = useTranslations('terrain');
  const items = t.raw('items') as { title: string; caption: string }[];

  return (
    <section id="terrain" className="py-16 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-end mb-10">
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
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr] gap-5">
          {photos.map((photo, i) => (
            <ScrollReveal
              key={photo.src}
              delay={i * 80}
              className={
                i === 0
                  ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2'
                  : 'sm:col-span-1'
              }
            >
              <figure className="relative overflow-hidden rounded-[24px] h-full">
                <img
                  src={photo.src}
                  alt={items[i]?.title ?? ''}
                  className={`w-full h-full object-cover ${
                    i === 0 ? 'h-[280px] lg:h-[540px]' : 'h-[220px] lg:h-[260px]'
                  }`}
                  loading={i === 0 ? 'eager' : 'lazy'} />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-bold text-[15px] leading-snug">
                    {items[i]?.title}
                  </p>
                  <p className="text-white/70 text-[13px]">{items[i]?.caption}</p>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={120}>
          <div className="mt-10">
            <Link
              href="/a-propos"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[15px] font-bold rounded-full border-[1.5px] border-blue text-blue hover:bg-blue hover:text-white transition-colors"
            >
              {t('cta')}
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
