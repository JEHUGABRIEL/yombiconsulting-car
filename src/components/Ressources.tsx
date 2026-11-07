'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Download, FileText } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

/** Plaquette servie depuis /public ; la taille est affichée pour éviter les surprises. */
const PLAQUETTE = { href: '/yo_presentation.pdf', size: '2,9 Mo' };

export default function Ressources() {
  const t = useTranslations('ressources');

  return (
    <section id="ressources" className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-[28px] bg-navy px-6 sm:px-10 lg:px-12 py-10 lg:py-14">
            <div
              aria-hidden
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(110% 130% at 0% 0%, rgba(37,87,230,0.35) 0%, rgba(12,36,64,0) 58%)',
              }}
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center">
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-blue-soft mb-3">
                  {t('chip')}
                </p>
                <h2 className="text-white font-extrabold text-[clamp(1.7rem,3.2vw,2.35rem)] leading-[1.15] tracking-[-0.03em] max-w-[520px]">
                  {t('title')} <span className="text-blue-soft">{t('titleHighlight')}</span>
                </h2>
                <p className="text-[#B9C7DC] text-[15px] leading-[1.7] max-w-[480px] mt-4">
                  {t('description')}
                </p>
                <p className="text-[13px] text-[#93A7C4] mt-5">{t('note')}</p>
              </div>

              <a
                href={PLAQUETTE.href}
                download
                className="group block bg-[#FCFDFE] rounded-[16px] p-5 sm:p-6 hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <div className="flex items-start gap-4">
                  <span className="w-11 h-11 shrink-0 rounded-[10px] bg-tint text-blue flex items-center justify-center">
                    <FileText size={20} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-ink leading-snug">
                      {t('document.title')}
                    </p>
                    <p className="text-[12.5px] text-mut mt-1">
                      {t('document.meta')} · {PLAQUETTE.size}
                    </p>
                  </div>
                </div>
                <span className="card__cta mt-4 group-hover:text-blue-deep">
                  {t('document.cta')}
                  <Download size={16} strokeWidth={1.75} />
                </span>
              </a>
            </div>

            <div className="relative mt-8 pt-7 border-t border-[rgba(255,255,255,.12)] flex flex-wrap items-center justify-between gap-4">
              <p className="text-[14px] text-[#B9C7DC]">{t('contactText')}</p>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold btn btn-light"
              >
                {t('contactCta')}
                <ArrowRight size={17} strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
