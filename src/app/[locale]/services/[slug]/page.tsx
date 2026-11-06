import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronRight, Quote } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ServiceFaq, { type FaqItem } from '@/components/ServiceFaq';
import { getPublicService, getPublicServices } from '@/lib/content';
import { serializeJsonLd } from '@/lib/safeJsonLd';

function rawArray<T>(read: () => unknown): T[] {
  try {
    const value = read();
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('services');

  const [service, list] = await Promise.all([
    getPublicService(slug, locale),
    getPublicServices(locale),
  ]);

  if (!service) {
    return (
      <>
        <Header />
        <main className="pt-[80px] min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-bold text-2xl text-ink mb-4">{t('notFound')}</h1>
            <Link href="/services" className="text-blue font-bold hover:underline">
              {t('backToServices')}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentIndex = list.findIndex((item) => item.slug === slug);
  const nextService = list[(currentIndex + 1) % list.length] ?? service;

  const faqItems = rawArray<FaqItem>(() => t.raw(`detail.${slug}.faq`));
  const caseItems = rawArray<{ title: string; context: string; result: string }>(() =>
    t.raw(`detail.${slug}.cases`)
  );

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
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${baseUrl}/services` },
      { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl },
    ],
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
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
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            {/* Fil d'Ariane */}
            <nav className="flex items-center gap-2 text-[13px] text-white/50 mb-8">
              <Link href="/services" className="hover:text-white transition-colors">
                {t('allServices')}
              </Link>
              <ChevronRight size={18} strokeWidth={1.75} />
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
                      <div key={item} className="flex gap-3 items-start py-3 border-b border-line">
                        <ArrowRight
                          size={18}
                          strokeWidth={1.75}
                          className="text-blue mt-0.5 shrink-0"
                        />
                        <span className="text-[15px] text-ink leading-snug">{item}</span>
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
                    <p className="text-mut text-[14.5px] mb-8">{t('casesSubtitle')}</p>

                    <div className="space-y-6">
                      {caseItems.map((item) => (
                        <div
                          key={item.title}
                          className="bg-sky rounded-[16px] border border-line overflow-hidden"
                        >
                          <div className="px-7 pt-6 pb-4">
                            <div className="flex items-start gap-3 mb-4">
                              <Quote size={20} className="text-blue/30 shrink-0 mt-0.5" />
                              <h3 className="font-bold text-[16px] text-ink leading-snug">
                                {item.title}
                              </h3>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 border-t border-line">
                            <div className="px-7 py-5">
                              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
                                {t('contextLabel')}
                              </p>
                              <p className="text-[14px] text-ink leading-relaxed">{item.context}</p>
                            </div>
                            <div className="px-7 py-5 bg-tint/40 sm:border-l border-line">
                              <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-blue/70 mb-1.5">
                                {t('resultLabel')}
                              </p>
                              <p className="text-[14px] text-ink leading-relaxed">{item.result}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ */}
                <ServiceFaq title={t('faqTitle')} items={faqItems} />
              </div>

              {/* Colonne latérale sticky */}
              <div className="lg:sticky lg:top-[100px]">
                <div className="bg-sky rounded-[16px] border border-line p-6">
                  <h3 className="font-extrabold text-[16px] text-ink mb-3">{t('requestService')}</h3>
                  <p className="text-mut text-[14px] leading-relaxed mb-6">{service.description}</p>
                  <a
                    href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(
                      service.subject + ' · Yo Mbi Consulting'
                    )}`}
                    className="inline-flex items-center justify-center gap-2.5 w-full px-6 py-3.5 text-[15px] font-bold btn btn-primary"
                  >
                    {t('requestService')}
                    <ArrowRight size={18} strokeWidth={1.75} />
                  </a>
                </div>

                {/* Service suivant */}
                <Link
                  href={`/services/${nextService.slug}`}
                  className="group mt-4 flex items-center gap-4 bg-[#FCFDFE] rounded-[16px] p-4 border border-line hover:border-line-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold text-[15px] text-ink group-hover:text-blue transition-colors truncate">
                      {nextService.title}
                    </span>
                  </div>
                  <ArrowRight size={18} className="text-blue shrink-0" strokeWidth={1.75} />
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
              href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(
                service.subject + ' · Yo Mbi Consulting'
              )}`}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-bold btn btn-light hover:bg-sky transition-colors"
            >
              {t('requestService')}
              <ArrowRight size={18} strokeWidth={1.75} />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
