'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Shield, AlertTriangle, FileText, Leaf, TrendingUp, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getServices } from '@/data/services';

const iconMap: Record<string, React.ReactNode> = {
  'conseil-management-hsse': <Shield size={28} strokeWidth={1.8} />,
  'risques-professionnels-duerp': <AlertTriangle size={28} strokeWidth={1.8} />,
  'procedures-plans-urgence': <FileText size={28} strokeWidth={1.8} />,
  'environnement': <Leaf size={28} strokeWidth={1.8} />,
  'developpement-entreprises': <TrendingUp size={28} strokeWidth={1.8} />,
  'coaching-pme': <Users size={28} strokeWidth={1.8} />,
};

export default function ServicesPage() {
  const t = useTranslations('services');
  const locale = useLocale();
  const list = getServices(locale);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/chantier-consignes-securite.jpeg')" }} />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <span className="chip inline-flex items-center gap-2 bg-white/10 text-blue-soft text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-soft" />
              {t('chip')}
            </span>
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-4">
              {t('title')}{' '}
              <span className="text-blue">{t('titleHighlight')}</span>
            </h1>
            <p className="text-white/70 text-[17px] max-w-[560px]">
              {t('description')}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {list.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col h-full bg-sky rounded-[20px] overflow-hidden transition-colors duration-300 border border-line hover:border-blue/20"
                >
                  <div className="relative h-[170px] shrink-0 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-navy/5 to-transparent" />
                    <span className="absolute bottom-4 left-5 w-11 h-11 rounded-[12px] bg-[#FAFBFD]/95 text-blue flex items-center justify-center">
                      {iconMap[service.slug]}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-7">
                    <h2 className="font-bold text-[18px] text-ink mb-3 leading-snug">
                      {service.title}
                    </h2>
                    <p className="text-mut text-[14.5px] leading-relaxed mb-5 flex-1">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-blue text-[14px] font-bold transition-colors">
                      {t('details')}
                      <ArrowRight size={18} strokeWidth={1.8} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
