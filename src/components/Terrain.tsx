'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

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
            <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em]">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
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
              className={i === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : 'sm:col-span-1'}
            >
              <figure className="relative h-full overflow-hidden rounded-[20px] bg-navy">
                <img
                  src={photo.src}
                  alt={items[i]?.title ?? ''}
                  className={`w-full h-full object-cover ${
                    i === 0 ? 'h-[280px] lg:h-[540px]' : 'h-[220px] lg:h-[260px]'
                  }`}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" />
                <figcaption className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-semibold text-[14.5px] leading-snug">
                    {items[i]?.title}
                  </p>
                  <p className="text-white/65 text-[12.5px] mt-0.5">{items[i]?.caption}</p>
                </figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={120}>
          <div className="mt-10">
            <Link
              href="/a-propos"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-[14px] font-semibold btn btn-outline text-ink"
            >
              {t('cta')}
              <ArrowRight size={17} strokeWidth={1.8} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
