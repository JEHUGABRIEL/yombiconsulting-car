'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Mail, Phone } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

type LegalNamespace = 'mentions' | 'cgu' | 'confidentialite' | 'cookies';

const legalRoutes = [
  { key: 'mentions', href: '/mentions' },
  { key: 'cgu', href: '/cgu' },
  { key: 'privacy', href: '/confidentialite' },
  { key: 'cookies', href: '/cookies' },
] as const;

interface LegalSection {
  title: string;
  paragraphs: string[];
  items?: string[];
}

export default function LegalDocument({ namespace }: { namespace: LegalNamespace }) {
  const t = useTranslations(namespace);
  const tLegal = useTranslations('legalPage');
  const tNav = useTranslations('nav');
  const tFooter = useTranslations('footer');

  const sections = t.raw('sections') as LegalSection[];
  const legalLinks = tFooter.raw('legalLinks') as Record<string, string>;

  const number = (index: number) => String(index + 1).padStart(2, '0');

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* En-tête */}
        <section className="bg-navy py-14">
          <div className="max-w-[1100px] mx-auto px-6">
            <nav className="flex items-center gap-1.5 text-[13px] text-white/50 mb-6">
              <Link href="/" className="hover:text-white transition-colors">
                {tNav('home')}
              </Link>
              <ChevronRight size={18} strokeWidth={1.8} />
              <span className="text-white/80 truncate">{t('title')}</span>
            </nav>
            <h1 className="font-extrabold text-[clamp(1.9rem,3.6vw,2.8rem)] leading-[1.12] tracking-[-0.02em] text-white max-w-[720px]">
              {t('title')}
            </h1>
            <p className="text-[12px] font-bold tracking-[0.14em] uppercase text-blue-soft mt-4">
              {tLegal('updated')}
            </p>
          </div>
        </section>

        {/* Document */}
        <section className="py-14 bg-white">
          <div className="max-w-[1100px] mx-auto px-6">
            <p className="text-mut text-[16px] leading-relaxed max-w-[760px]">{t('intro')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12 mt-12 items-start">
              {/* Sommaire */}
              <aside className="lg:sticky lg:top-[110px]">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-mut mb-4">
                  {tLegal('summary')}
                </p>
                <ol className="border-l border-line">
                  {sections.map((section, index) => (
                    <li key={section.title}>
                      <a
                        href={`#section-${index + 1}`}
                        className="block pl-4 py-1.5 text-[13.5px] font-semibold text-mut hover:text-blue hover:border-l-2 hover:border-blue hover:-ml-[1px] transition-colors"
                      >
                        {number(index)}. {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </aside>

              {/* Contenu */}
              <div>
                {sections.map((section, index) => (
                  <section
                    key={section.title}
                    id={`section-${index + 1}`}
                    className="scroll-mt-[110px] pb-9 mb-9 border-b border-line last:border-b-0 last:mb-0 last:pb-0"
                  >
                    <h2 className="flex items-baseline gap-3 font-extrabold text-[18px] text-ink mb-4 tracking-[-0.01em]">
                      <span className="text-[12px] font-extrabold text-blue tracking-[0.08em]">
                        {number(index)}
                      </span>
                      {section.title}
                    </h2>

                    <div className="space-y-3">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-mut text-[15px] leading-[1.75]">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.items ? (
                      <ul className="mt-4 space-y-2.5">
                        {section.items.map((item) => (
                          <li key={item} className="flex gap-3 text-mut text-[15px] leading-[1.7]">
                            <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-blue shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}

                {/* Contact */}
                <div className="mt-10 bg-sky border border-line rounded-[20px] p-7">
                  <h2 className="font-extrabold text-[17px] text-ink mb-2">
                    {tLegal('contactTitle')}
                  </h2>
                  <p className="text-mut text-[14.5px] leading-relaxed mb-5">{tLegal('contactText')}</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="mailto:contact.cmc@gmail.com"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue text-white text-[14px] font-bold hover:bg-blue-deep transition-colors"
                    >
                      <Mail size={16} strokeWidth={1.8} />
                      contact.cmc@gmail.com
                    </a>
                    <a
                      href="tel:+23672111914"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-[1.5px] border-line-2 text-ink text-[14px] font-bold hover:border-blue hover:text-blue transition-colors"
                    >
                      <Phone size={16} strokeWidth={1.8} />
                      +236 72 11 19 14
                    </a>
                  </div>
                </div>

                {/* Navigation légale */}
                <nav className="mt-10 pt-6 border-t border-line flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                  {legalRoutes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="font-semibold text-mut hover:text-blue transition-colors"
                    >
                      {legalLinks[route.key]}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
