'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { getActualites } from '@/data/actualites';

export default function ActualitesPage() {
  const t = useTranslations('actualites');
  const locale = useLocale();
  const items = getActualites(locale);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/formation-formatrice-paperboard.jpeg')" }} />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h1>
            <p className="text-white/70 text-[17px] max-w-[560px]">{t('description')}</p>
          </div>
        </section>

        {/* Liste */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger>
              {items.map((article) => (
                <ScrollReveal key={article.slug}>
                  <Link
                    href={`/actualites/${article.slug}`}
                    className="group flex flex-col h-full bg-sky rounded-[20px] overflow-hidden border border-line hover:border-blue/25 transition-colors duration-300"
                  >
                    <div className="relative h-[200px] overflow-hidden shrink-0">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
                      <span className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 text-white/90 text-[12px] font-semibold">
                        <Calendar size={15} strokeWidth={1.8} />
                        {article.date}
                      </span>
                    </div>

                    <div className="flex flex-col flex-1 p-6">
                      <span className="inline-flex items-center gap-1.5 text-blue text-[11px] font-bold tracking-wide uppercase mb-3">
                        <Tag size={14} strokeWidth={1.8} />
                        {article.category}
                      </span>
                      <h2 className="font-bold text-[17px] leading-snug text-ink mb-2 group-hover:text-blue transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-mut text-[14px] leading-relaxed line-clamp-3 mb-5 flex-1">
                        {article.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-blue">
                        {t('readMore')}
                        <ArrowRight size={18} strokeWidth={1.8} />
                      </span>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
