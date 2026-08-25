'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Minus, Plus, Quote } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { services, getServiceBySlug } from '@/data/services';

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
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
            <h1 className="font-bold text-2xl text-ink mb-4">Service introuvable</h1>
            <Link href="/services" className="text-blue font-bold hover:underline">
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

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url('${service.image}')` }}
          />
          <div className="absolute inset-0 bg-navy/88" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-white/60 text-[14px] font-semibold hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              {t('allServices')}
            </Link>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px]">
              {service.title}
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="py-14 bg-white">
          <div className="max-w-[800px] mx-auto px-6">
            <p className="text-mut text-[17px] leading-relaxed mb-12">
              {service.description}
            </p>

            <h2 className="font-bold text-[18px] text-ink mb-6">{t('prestations')}</h2>
            <ul className="space-y-4 mb-12">
              {service.list.map((item) => (
                <li key={item} className="flex gap-4 items-start">
                  <CheckCircle2 size={20} className="text-blue mt-0.5 shrink-0" />
                  <span className="text-[16px] text-ink leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a
                href={`mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(service.subject + ' · Yo Mbi Consulting')}`}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep hover:shadow-[0_10px_26px_rgba(37,87,230,.32)] transition-all"
              >
                {t('requestService')}
                <ArrowRight size={17} strokeWidth={2.5} />
              </a>
            </div>

            {/* Cas clients */}
            <h2 className="font-bold text-[18px] text-ink mb-2">{t('casesTitle')}</h2>
            <p className="text-mut text-[15px] mb-8">{t('casesSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {caseItems.map((c) => (
                <div
                  key={c.title}
                  className="bg-sky rounded-2xl border border-line p-7 flex flex-col"
                >
                  <Quote size={22} className="text-blue/40 mb-4" />
                  <h3 className="font-bold text-[16px] text-ink leading-snug mb-4">
                    {c.title}
                  </h3>
                  <p className="text-mut text-[14px] leading-relaxed mb-4">
                    <span className="font-bold text-ink">{t('contextLabel')}</span>
                    {c.context}
                  </p>
                  <p className="text-[14px] leading-relaxed mt-auto pt-4 border-t border-line">
                    <span className="font-bold text-blue">{t('resultLabel')}</span>
                    <span className="text-ink">{c.result}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <h2 className="font-bold text-[18px] text-ink mb-6">{t('faqTitle')}</h2>
            <div className="bg-sky rounded-2xl border border-line overflow-hidden mb-4">
              {faqItems.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className={`border-b border-line last:border-b-0 ${
                      isOpen ? 'bg-tint/40' : ''
                    } transition-colors duration-300`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="group w-full flex items-start gap-5 px-6 py-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`shrink-0 font-extrabold text-[13px] pt-0.5 tracking-widest transition-colors duration-300 ${
                          isOpen ? 'text-blue' : 'text-line-2 group-hover:text-blue'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`flex-1 font-bold text-[15px] leading-snug transition-colors duration-300 ${
                          isOpen ? 'text-blue' : 'text-ink'
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-300 ${
                          isOpen
                            ? 'bg-blue border-blue text-white'
                            : 'border-line-2 text-mut group-hover:border-blue group-hover:text-blue'
                        }`}
                      >
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 pl-[3.25rem] -mt-1 text-mut text-[14.5px] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Next Service */}
        <section className="py-16 bg-sky border-t border-line">
          <div className="max-w-[800px] mx-auto px-6">
            <p className="text-[13px] font-bold tracking-[0.12em] uppercase text-mut mb-4">
              Service suivant
            </p>
            <Link
              href={`/services/${nextService.slug}`}
              className="group flex items-center justify-between bg-white rounded-[20px] p-6 border border-line hover:border-blue/20 hover:shadow-[0_8px_24px_rgba(13,36,70,.08)] transition-all"
            >
              <span className="font-bold text-[18px] text-ink group-hover:text-blue transition-colors">
                {nextService.title}
              </span>
              <ArrowRight size={20} className="text-blue" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
