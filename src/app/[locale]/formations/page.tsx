'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Clock, Users, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations, categoryLabels } from '@/data/formations';

const filterKeys = ['all', 'sec', 'mgmt', 'ent'] as const;

export default function FormationsPage() {
  const t = useTranslations('formations');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered = activeFilter === 'all'
    ? formations
    : formations.filter((f) => f.category === activeFilter);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <span className="chip inline-flex items-center gap-2 bg-white/10 text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {t('chip')}
            </span>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>{' '}
              {t('titleSuffix')}
            </h1>
            <p className="text-white/70 text-[17px] max-w-[560px]">
              {t('description')}
            </p>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="py-14 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-12">
              {filterKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-5 py-2.5 rounded-full text-[14px] font-bold transition-all border ${
                    activeFilter === key
                      ? 'bg-blue text-white border-blue'
                      : 'bg-sky text-mut border-line hover:border-blue/30 hover:text-ink'
                  }`}
                >
                  {key === 'all' ? t('filters.all') : categoryLabels[key]}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((formation) => (
                <Link
                  key={formation.slug}
                  href={`/formations/${formation.slug}`}
                  className="group block bg-sky rounded-[20px] overflow-hidden border border-line hover:border-blue/20 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-[180px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${formation.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <span className="absolute top-4 left-4 bg-white/90 text-ink text-[12px] font-bold px-3 py-1.5 rounded-full">
                      {categoryLabels[formation.category]}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="font-bold text-[17px] text-ink mb-3 leading-snug group-hover:text-blue transition-colors">
                      {formation.title}
                    </h2>
                    <div className="flex items-center gap-4 text-[13px] text-mut mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} />
                        {formation.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users size={14} />
                        {formation.format}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-blue text-[14px] font-bold transition-colors">
                      Détails
                      <ArrowRight size={16} strokeWidth={2.5} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Note */}
            <div className="mt-12 text-center">
              <p className="text-mut text-[15px]">
                {t('note')}{' '}
                <a href="#contact" className="text-blue font-bold hover:underline">
                  {t('noteLink')}
                </a>
                {t('noteSuffix')}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
