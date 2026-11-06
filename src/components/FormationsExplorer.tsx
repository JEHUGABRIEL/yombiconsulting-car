'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Clock, Users } from 'lucide-react';
import type { Formation } from '@/data/formations';

const filterKeys = ['all', 'sec', 'mgmt', 'ent'] as const;

export default function FormationsExplorer({ items }: { items: Formation[] }) {
  const t = useTranslations('formations');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filtered =
    activeFilter === 'all' ? items : items.filter((formation) => formation.category === activeFilter);

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 mb-10 rounded-xl border border-line bg-sky w-fit max-w-full">
        {filterKeys.map((key) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            aria-pressed={activeFilter === key}
            className={`px-4 py-2 rounded-lg text-[13.5px] font-semibold transition-colors ${
              activeFilter === key ? 'bg-[#FCFDFE] text-ink' : 'text-mut hover:text-ink'
            }`}
          >
            {t(`filters.${key}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-mut text-[14.5px]">Aucune formation dans cette catégorie pour le moment.</p>
      ) : (
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
                    <Clock size={16} strokeWidth={1.75} />
                    {formation.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={16} strokeWidth={1.75} />
                    {formation.format}
                  </span>
                </div>
                <span className="card__cta">
                  {t('seeMore')}
                  <ArrowRight size={18} strokeWidth={1.75} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
