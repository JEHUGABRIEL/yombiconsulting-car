'use client';

import { use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Clock, Users, BookOpen, Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getFormations, getFormationBySlug } from '@/data/formations';

export default function FormationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations('formations');
  const locale = useLocale();
  const all = getFormations(locale);
  const formation = getFormationBySlug(slug, locale);

  if (!formation) {
    return (
      <>
        <Header />
        <main className="pt-[80px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-ink mb-4">{t('notFound')}</h1>
            <Link href="/formations" className="text-blue font-bold hover:underline">
              {t('backToFormations')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = all.findIndex((f) => f.slug === slug);
  const nextFormation = all[(currentIndex + 1) % all.length];

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${formation.image}')` }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 text-white/60 text-[13.5px] font-medium hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
              {t('chip')}
            </Link>
            <p className="text-blue-soft text-[11.5px] font-bold tracking-[0.12em] uppercase mb-3">
              {t(`filters.${formation.category}`)}
            </p>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[680px]">
              {formation.title}
            </h1>
          </div>
        </section>

        <section className="border-b border-line bg-[#FCFDFE]">
          <div className="max-w-[820px] mx-auto px-6 py-6">
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-blue" strokeWidth={1.8} />
                <dt className="sr-only">{t('filters.all')}</dt>
                <dd className="text-[14.5px] font-semibold text-ink">{formation.duration}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <BookOpen size={16} className="text-blue" strokeWidth={1.8} />
                <dd className="text-[14.5px] font-semibold text-ink">{formation.format}</dd>
              </div>
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-blue" strokeWidth={1.8} />
                <dd className="text-[14.5px] font-semibold text-ink">{formation.public_cible}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="py-14">
          <div className="max-w-[820px] mx-auto px-6">
            <p className="text-ink/80 text-[17px] leading-[1.75] mb-12">{formation.description}</p>

            <h2 className="font-bold text-[19px] text-ink mb-5 tracking-[-0.01em]">
              {t('objectives')}
            </h2>
            <ul className="border-t border-line mb-12">
              {formation.objectives.map((obj) => (
                <li key={obj} className="flex gap-3.5 items-start py-3.5 border-b border-line">
                  <Check size={17} className="text-blue mt-0.5 shrink-0" strokeWidth={2} />
                  <span className="text-[15px] text-ink leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>

            <h2 className="font-bold text-[19px] text-ink mb-3 tracking-[-0.01em]">
              {t('audience')}
            </h2>
            <p className="text-mut text-[15px] leading-relaxed mb-10">{formation.public_cible}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(formation.title + ' · Yo Mbi Consulting')}`}
                className="btn btn-primary px-6 py-3.5 text-[14.5px]"
              >
                {t('noteLink')}
                <ArrowRight size={17} strokeWidth={1.8} />
              </a>
              <Link
                href="/formations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14.5px] font-semibold rounded-lg border border-line-2 text-ink hover:border-blue hover:text-blue transition-colors"
              >
                {t('allFormations')}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-14 border-t border-line bg-sky">
          <div className="max-w-[820px] mx-auto px-6">
            <p className="text-[11.5px] font-bold tracking-[0.12em] uppercase text-mut mb-3">
              {t('nextFormation')}
            </p>
            <Link
              href={`/formations/${nextFormation.slug}`}
              className="group flex items-center justify-between gap-4 bg-[#FCFDFE] rounded-[16px] px-6 py-5 border border-line hover:border-line-2 transition-colors"
            >
              <div className="min-w-0">
                <span className="text-[11.5px] font-semibold text-mut block mb-1">
                  {t(`filters.${nextFormation.category}`)}
                </span>
                <span className="font-semibold text-[16px] text-ink group-hover:text-blue transition-colors">
                  {nextFormation.title}
                </span>
              </div>
              <ArrowRight size={18} className="text-blue shrink-0" strokeWidth={1.8} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
