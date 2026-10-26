'use client';

import { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  Quote,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { services, getServiceBySlug } from '@/data/services';
import { serializeJsonLd } from '@/lib/safeJsonLd';

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations('services');
  const service = getServiceBySlug(slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqItems = (t.raw(`detail.${slug}.faq`) || []) as {
    question: string;
    answer: string;
  }[];
  const caseItems = (t.raw(`detail.${slug}.cases`) || []) as {
    title: string;
    context: string;
    result: string;
  }[];

  if (!service) {
    return (
      <>
        <Header />
        <main className="pt-[80px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-ink mb-4">
              Service introuvable
            </h1>
            <Link
              href="/services"
              className="text-blue font-bold hover:underline"
            >
              Retour aux services
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = services.findIndex((s) => s.slug === slug);
  const nextService = services[(currentIndex + 1) % services.length];

  // ── JSON-LD Schema.org ──
  const baseUrl = 'https://yombiconsulting.com';
  const pageUrl = `${baseUrl}/services/${slug}`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    image: service.image,
    provider: {
      '@type': 'Organization',
      name: 'Cabinet Yo Mbi Consulting',
      url: baseUrl,
    },
    areaServed: {
      '@type': 'Country',
      name: 'République centrafricaine',
    },
    serviceType: service.subject,
    url: pageUrl,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Services',
        item: `${baseUrl}/services`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: service.title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
        />
      )}

      <Header />
      <main className="pt-[80px]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-20">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${service.image}')` }}
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-[13px] text-white/50 mb-8">
              <Link
                href="/services"
                className="hover:text-white transition-colors"
              >
                {t('allServices')}
              </Link>
              <ChevronRight size={14} />
              <span className="text-white/80">{service.title}</span>
            </nav>

            <div className="max-w-[720px]">
              <h1 className="font-extrabold text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.08] tracking-[-0.025em] text-white mb-5">
                {service.title}
              </h1>
              <p className="text-white/70 text-[17px] leading-relaxed max-w-[580px]">
                {service.description}
              </p>
            </div>
          </div>
        </section>

        {/* ── Corps : 2 colonnes ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16 items-start">
              {/* Colonne principale */}
              <div>
                {/* Prestations */}
                <div className="mb-14">
                  <h2 className="font-extrabold text-[20px] text-ink mb-6 tracking-[-0.01em]">
                    {t('prestations')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {service.list.map((item) => (
                      <div
                        key={item}
                        className="flex gap-3 items-start py-3 border-b border-line"
                      >
                        <CheckCircle2
                          size={18}
                          className="text-blue mt-0.5 shrink-0"
                        />
                        <span className="text-[15px] text-ink leading-snug">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cas clients */}
                {caseItems.length > 0 && (
                  <div className="mb-14">
                    <h2 className="font-extrabold text-[20px] text-ink mb-2 tracking-[-0.01em]">
                      {t('casesTitle')}
                    </h2>
                    <p className="text-mut text-[14.5px] mb-8">
                      {t('casesSubtitle')}
                    </p>

                    <div className="space-y-6">
                      {caseItems.map((c) => (
                        <div
                          key={c.title}
                          className="bg-sky rounded-[20px] border border-line overflow-hidden"
                        >
                          {/* En-tête du cas */}
                          <div className="px-7 pt-6 pb-4">
                            <div className="flex items-start gap-3 mb-4">
                              <Quote
                                size={20}
                                className="text-blue/30 shrink-0 mt-0.5"
                              />
                              <h3 className="font-bold text-[16px] text-ink leading-snug">
                                {c.title}
                              </h3>
                            </div>
                          </div>

                          {/* Contexte + Résultat */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-line">
                            <div className="px-7 py-5">
                              <span className="block text-[11px] font-bold tracking-[0.1em] uppercase text-mut mb-2">
                                {t('contextLabel')}
                              </span>
                              <p className="text-[14px] text-ink leading-relaxed">
                                {c.context}
                              </p>
                            </div>
                            <div className="px-7 py-5 bg-tint/40 sm:border-l border-line">
                              <span className="block text-[11px] font-bold tracking-[0.1em] uppercase text-blue mb-2">
                                {t('resultLabel')}
                              </span>
                              <p className="text-[14px] text-ink leading-relaxed">
                                {c.result}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ */}
                <div>
                  <h2 className="font-extrabold text-[20px] text-ink mb-6 tracking-[-0.01em]">
                    {t('faqTitle')}
                  </h2>
                  <div className="rounded-[20px] border border-line overflow-hidden">
                    {faqItems.map((item, i) => {
                      const isOpen = openFaq === i;
                      return (
                        <div
                          key={i}
                          className={`border-b border-line last:border-b-0 transition-colors duration-200 ${isOpen ? 'bg-tint/30' : ''}`}
                        >
                          <button
                            onClick={() =>
                              setOpenFaq(isOpen ? null : i)
                            }
                            className="group w-full flex items-start gap-4 px-7 py-5 text-left"
                            aria-expanded={isOpen}
                          >
                            <span
                              className={`shrink-0 font-extrabold text-[12px] pt-0.5 tracking-widest transition-colors ${isOpen ? 'text-blue' : 'text-line-2 group-hover:text-blue'}`}
                            >
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span
                              className={`flex-1 font-bold text-[15px] leading-snug transition-colors ${isOpen ? 'text-blue' : 'text-ink'}`}
                            >
                              {item.question}
                            </span>
                            <span
                              className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full border transition-all ${isOpen ? 'bg-blue border-blue text-white' : 'border-line-2 text-mut group-hover:border-blue group-hover:text-blue'}`}
                            >
                              {isOpen ? (
                                <Minus size={13} />
                              ) : (
                                <Plus size={13} />
                              )}
                            </span>
                          </button>
                          <div
                            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                            style={{
                              gridTemplateRows: isOpen ? '1fr' : '0fr',
                            }}
                          >
                            <div className="overflow-hidden">
                              <p className="px-7 pb-6 pl-[3.5rem] -mt-1 text-mut text-[14.5px] leading-relaxed max-w-[600px]">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Colonne latérale sticky */}
              <div className="lg:sticky lg:top-[100px]">
                <div className="bg-sky rounded-[20px] border border-line p-7">
                  <h3 className="font-extrabold text-[16px] text-ink mb-3">
                    {t('requestService')}
                  </h3>
                  <p className="text-mut text-[14px] leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <a
                    href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(service.subject + ' · Yo Mbi Consulting')}`}
                    className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-3.5 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-all"
                  >
                    {t('requestService')}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </a>
                </div>

                {/* Service suivant */}
                <Link
                  href={`/services/${nextService.slug}`}
                  className="group mt-5 flex items-center gap-4 bg-white rounded-[20px] p-5 border border-line hover:border-blue/20 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold tracking-[0.1em] uppercase text-mut mb-1">
                      Service suivant
                    </span>
                    <span className="block font-bold text-[15px] text-ink group-hover:text-blue transition-colors truncate">
                      {nextService.title}
                    </span>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-blue shrink-0 transition-colors"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="py-16 bg-navy">
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <h2 className="font-extrabold text-white text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.02em] mb-4">
              {t('requestService')}
            </h2>
            <p className="text-[#B9C7DC] text-[16px] max-w-[520px] mx-auto mb-9">
              {t('casesSubtitle')}
            </p>
            <a
              href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(service.subject + ' · Yo Mbi Consulting')}`}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-bold rounded-full bg-white text-navy hover:bg-sky transition-colors"
            >
              {t('requestService')}
              <ArrowRight size={17} strokeWidth={2.5} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
