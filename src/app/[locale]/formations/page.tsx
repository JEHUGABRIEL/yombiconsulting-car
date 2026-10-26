'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Clock, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFormations } from '@/data/formations';

const filterKeys = ['all', 'sec', 'mgmt', 'ent'] as const;

export default function FormationsPage() {
  const t = useTranslations('formations');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const all = getFormations(locale);
  const filtered =
    activeFilter === 'all' ? all : all.filter((f) => f.category === activeFilter);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/formation-salle-participants.jpeg')" }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-3">
              {t('title')} <span className="text-blue-soft">{t('titleHighlight')}</span>{' '}
              {t('titleSuffix')}
            </h1>
            <p className="text-white/70 text-[16.5px] max-w-[560px]">{t('description')}</p>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 mb-10 rounded-xl border border-line bg-sky w-fit max-w-full">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  aria-pressed={activeFilter === key}
                  className={`px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-colors ${
                    activeFilter === key
                      ? 'bg-[#FCFDFE] text-ink shadow-[0_1px_2px_rgba(12,36,64,.08)]'
                      : 'text-mut hover:text-ink'
                  }`}
                >
                  {t(`filters.${key}`)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((formation) => (
                <Link key={formation.slug} href={`/formations/${formation.slug}`} className="card group">
                  <div className="card__media">
                    <img src={formation.image} alt={formation.title} loading="lazy" />
                    <span className="absolute top-3 left-3 bg-[#FCFDFE]/95 text-mut text-[10.5px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-md">
                      {t(`filters.${formation.category}`)}
                    </span>
                  </div>
                  <div className="card__body">
                    <h2 className="card__title">{formation.title}</h2>
                    <div className="flex items-center gap-4 text-[12.5px] text-mut mt-0.5">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} strokeWidth={1.8} />
                        {formation.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={13} strokeWidth={1.8} />
                        {formation.format}
                      </span>
                    </div>
                    <span className="card__cta">
                      {t('seeMore')}
                      <ArrowRight size={16} strokeWidth={1.8} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <p className="mt-12 text-mut text-[14.5px]">
              {t('note')}{' '}
              <a href="/#contact" className="text-blue font-semibold hover:underline">
                {t('noteLink')}
              </a>
              {t('noteSuffix')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
