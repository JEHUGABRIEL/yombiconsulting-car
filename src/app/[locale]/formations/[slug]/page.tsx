'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, Clock, Users, BookOpen, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formations, getFormationBySlug, categoryLabels } from '@/data/formations';

export default function FormationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslations('formations');
  const formation = getFormationBySlug(slug);

  if (!formation) {
    return (
      <>
        <Header />
        <main className="pt-[80px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-ink mb-4">Formation introuvable</h1>
            <Link href="/formations" className="text-blue font-bold hover:underline">
              Retour aux formations
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = formations.findIndex((f) => f.slug === slug);
  const nextFormation = formations[(currentIndex + 1) % formations.length];

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${formation.image}')` }}
          />
          <div className="absolute inset-0 bg-navy/88" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 text-white/60 text-[14px] font-semibold hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              {t('chip')}
            </Link>
            <span className="inline-block bg-white/10 text-blue-soft text-[12px] font-bold px-3 py-1.5 rounded-full mb-4">
              {categoryLabels[formation.category]}
            </span>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px]">
              {formation.title}
            </h1>
          </div>
        </section>

        {/* Meta */}
        <section className="bg-white border-b border-line">
          <div className="max-w-[800px] mx-auto px-6 py-8">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2.5 text-[15px] text-ink">
                <Clock size={18} className="text-blue" />
                <span className="font-semibold">{formation.duration}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[15px] text-ink">
                <BookOpen size={18} className="text-blue" />
                <span className="font-semibold">{formation.format}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[15px] text-ink">
                <Users size={18} className="text-blue" />
                <span className="font-semibold">{formation.public_cible}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-[800px] mx-auto px-6">
            <p className="text-mut text-[17px] leading-relaxed mb-12">
              {formation.description}
            </p>

            <h2 className="font-bold text-[18px] text-ink mb-6">Objectifs pédagogiques</h2>
            <ul className="space-y-4 mb-12">
              {formation.objectives.map((obj) => (
                <li key={obj} className="flex gap-4 items-start">
                  <CheckCircle2 size={20} className="text-blue mt-0.5 shrink-0" />
                  <span className="text-[16px] text-ink leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>

            <h2 className="font-bold text-[18px] text-ink mb-4">Public concerné</h2>
            <p className="text-mut text-[16px] leading-relaxed mb-12">
              {formation.public_cible}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(formation.title + ' · Yo Mbi Consulting')}`}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep hover:shadow-[0_10px_26px_rgba(37,87,230,.32)] transition-all"
              >
                {t('noteLink')}
                <ArrowRight size={17} strokeWidth={2.5} />
              </a>
            </div>
          </div>
        </section>

        {/* Next Formation */}
        <section className="py-16 bg-sky border-t border-line">
          <div className="max-w-[800px] mx-auto px-6">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-mut mb-4">
              Formation suivante
            </p>
            <Link
              href={`/formations/${nextFormation.slug}`}
              className="group flex items-center justify-between bg-white rounded-[20px] p-6 border border-line hover:border-blue/20 hover:shadow-[0_8px_24px_rgba(13,36,70,.08)] transition-all"
            >
              <div>
                <span className="text-[12px] font-bold text-blue/70 block mb-1">
                  {categoryLabels[nextFormation.category]}
                </span>
                <span className="font-bold text-[18px] text-ink group-hover:text-blue transition-colors">
                  {nextFormation.title}
                </span>
              </div>
              <ArrowRight size={20} className="text-blue" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
