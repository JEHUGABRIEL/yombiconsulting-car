'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ArrowRight,
  Layers,
  Hammer,
  MapPinned,
  UserCheck,
  BadgeCheck,
  RefreshCw,
  Clipboard,
  GraduationCap,
  Users,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

const valeurIcons = [Layers, Hammer, MapPinned, UserCheck, BadgeCheck, RefreshCw];
const pillarIcons = [Clipboard, GraduationCap, Users];

export default function AProposPage() {
  const t = useTranslations('apropos');
  const tCabinet = useTranslations('cabinet');
  const tValeur = useTranslations('valeur');

  const pillars = tCabinet.raw('pillars');
  const valeurs = tValeur.raw('items');

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-navy/90" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <span className="chip inline-flex items-center gap-2 bg-white/10 text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {t('chip')}
            </span>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-4">
              {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
            </h1>
            <p className="text-white/70 text-[17px] max-w-[560px]">{t('description')}</p>
          </div>
        </section>

        {/* ── Qui sommes-nous ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
            <ScrollReveal>
              <span className="chip inline-flex items-center gap-2 bg-sky text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                {t('whoChip')}
              </span>
              <h2 className="font-extrabold text-navy text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-6">
                {tCabinet('title')}{' '}
                <span className="text-blue">{tCabinet('titleHighlight')}</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="text-mut text-[15.5px]">{tCabinet('description')}</p>
              <p className="text-mut text-[15.5px] mt-3.5">{tCabinet('description2')}</p>
            </ScrollReveal>
          </div>
          <div className="max-w-[1200px] mx-auto px-6 mt-10">
            <ScrollReveal>
              <blockquote className="text-center text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold text-ink tracking-[-0.01em] py-[38px] px-6 border-t border-b border-line">
                «{' '}
                <b className="text-blue font-semibold">
                  {tCabinet('mission')}
                </b>{' '}
                »
              </blockquote>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Notre approche (piliers) ── */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <ScrollReveal>
              <span className="chip inline-flex items-center gap-2 bg-sky text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                {t('pillarsChip')}
              </span>
              <h2 className="font-extrabold text-navy text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.02em] mb-10 max-w-[640px]">
                {t('pillarsTitle')} <span className="text-blue">{t('pillarsTitleHighlight')}</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr_0.85fr] gap-7" data-stagger>
              {pillars.map((pillar: any, i: number) => {
                const Icon = pillarIcons[i];
                return (
                  <ScrollReveal key={i}>
                    <div className="bg-sky rounded-[20px] p-[30px] border border-line h-full">
                      <span className="w-[54px] h-[54px] rounded-[16px] bg-blue flex items-center justify-center mb-5">
                        <Icon size={25} className="text-white" strokeWidth={1.8} />
                      </span>
                      <h3 className="text-[18px] font-extrabold text-navy mb-2.5">{pillar.title}</h3>
                      <p className="text-[14.5px] text-mut leading-relaxed">{pillar.description}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Nos valeurs ajoutées ── */}
        <section className="py-16 bg-sky">
          <div className="max-w-[1200px] mx-auto px-6">
            <ScrollReveal>
              <span className="chip inline-flex items-center gap-2 bg-white text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                {t('valuesChip')}
              </span>
              <h2 className="font-extrabold text-navy text-[clamp(1.6rem,3vw,2.2rem)] tracking-[-0.02em] mb-10 max-w-[720px]">
                {t('valuesTitle')}{' '}
                <span className="text-blue">{t('valuesTitleHighlight')}</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7" data-stagger>
              {valeurs.map((item: any, i: number) => {
                const Icon = valeurIcons[i % valeurIcons.length];
                return (
                  <ScrollReveal key={i}>
                    <div className="bg-white rounded-[20px] p-8 border border-line h-full">
                      <span className="w-12 h-12 rounded-[14px] bg-tint text-blue flex items-center justify-center mb-5">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <h3 className="font-bold text-[17px] text-ink mb-2.5 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-mut text-[14.5px] leading-relaxed">{item.description}</p>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 bg-navy">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <ScrollReveal>
              <h2 className="font-extrabold text-white text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] tracking-[-0.02em] max-w-[720px] mx-auto mb-4">
                {t('ctaTitle')}
              </h2>
              <p className="text-[#B9C7DC] text-[16px] max-w-[520px] mx-auto mb-9">
                {t('ctaText')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-blue text-white text-[15px] font-bold hover:bg-blue-deep transition-colors"
                >
                  {t('ctaServices')}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Link>
                <Link
                  href="/formations"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-transparent border-[1.5px] border-white/25 text-white text-[15px] font-bold transition-colors"
                >
                  {t('ctaFormations')}
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 text-blue-soft text-[15px] font-bold transition-colors"
                >
                  {t('ctaContact')}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
