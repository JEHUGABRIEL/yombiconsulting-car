'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Tag,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { actualites, getActualiteBySlug } from '@/data/actualites';

export default function ActualiteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('actualites');
  const article = getActualiteBySlug(slug);

  if (!article) {
    return (
      <>
        <Header />
        <main className="pt-[80px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-ink mb-4">
              Actualité introuvable
            </h1>
            <Link
              href="/actualites"
              className="text-blue font-bold hover:underline"
            >
              Retour aux actualités
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = actualites.findIndex((a) => a.slug === slug);
  const nextArticle = actualites[(currentIndex + 1) % actualites.length];

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${article.image}')` }}
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative z-10 max-w-[800px] mx-auto px-6">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-[13px] text-white/50 mb-8">
              <Link
                href="/actualites"
                className="hover:text-white transition-colors"
              >
                {t('viewAll')}
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/80 truncate">{article.title}</span>
            </nav>

            {/* Métadonnées */}
            <div className="flex items-center gap-4 mb-5">
              <span className="inline-flex items-center gap-1.5 text-blue-soft text-[12px] font-bold tracking-wide uppercase">
                <Tag size={13} />
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/60 text-[13px]">
                <Calendar size={13} />
                {article.date}
              </span>
            </div>

            <h1 className="font-extrabold text-[clamp(1.8rem,4vw,3rem)] leading-[1.1] tracking-[-0.025em] text-white max-w-[680px]">
              {article.title}
            </h1>
          </div>
        </section>

        {/* ── Contenu ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[720px] mx-auto px-6">
            {/* Résumé */}
            <p className="text-ink text-[18px] leading-relaxed font-medium mb-10 pb-10 border-b border-line">
              {article.excerpt}
            </p>

            {/* Corps de l'article */}
            <div className="space-y-6">
              {article.content.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-mut text-[16px] leading-[1.8]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Retour */}
            <div className="mt-14 pt-8 border-t border-line">
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 text-blue font-bold text-[15px] hover:underline"
              >
                <ArrowLeft size={16} />
                {t('viewAll')}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Article suivant ── */}
        {nextArticle && nextArticle.slug !== article.slug && (
          <section className="py-16 bg-sky border-t border-line">
            <div className="max-w-[720px] mx-auto px-6">
              <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-mut mb-4">
                {t('nextArticle')}
              </p>
              <Link
                href={`/actualites/${nextArticle.slug}`}
                className="group flex items-center justify-between bg-white rounded-[20px] p-6 border border-line hover:border-blue/20 hover:shadow-[0_8px_24px_rgba(13,36,70,.08)] transition-all"
              >
                <div className="min-w-0 mr-4">
                  <span className="block text-[11px] font-bold tracking-[0.1em] uppercase text-blue mb-1">
                    {nextArticle.category}
                  </span>
                  <span className="block font-bold text-[16px] text-ink group-hover:text-blue transition-colors truncate">
                    {nextArticle.title}
                  </span>
                </div>
                <ArrowRight
                  size={20}
                  className="text-blue shrink-0 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
