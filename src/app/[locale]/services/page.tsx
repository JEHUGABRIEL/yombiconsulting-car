'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Shield, AlertTriangle, FileText, Leaf, TrendingUp, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getServices } from '@/data/services';

const iconMap: Record<string, React.ReactNode> = {
  'conseil-management-hsse': <Shield size={20} strokeWidth={1.8} />,
  'risques-professionnels-duerp': <AlertTriangle size={20} strokeWidth={1.8} />,
  'procedures-plans-urgence': <FileText size={20} strokeWidth={1.8} />,
  'environnement': <Leaf size={20} strokeWidth={1.8} />,
  'developpement-entreprises': <TrendingUp size={20} strokeWidth={1.8} />,
  'coaching-pme': <Users size={20} strokeWidth={1.8} />,
};

export default function ServicesPage() {
  const t = useTranslations('services');
  const locale = useLocale();
  const list = getServices(locale);

  return (
    <>
      <Header />
      <main className="pt-[80px]">
        <section className="relative overflow-hidden py-16">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/chantier-consignes-securite.jpeg')" }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <h1 className="font-extrabold text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.02em] text-white max-w-[640px] mb-3">
              {t('title')} <span className="text-blue-soft">{t('titleHighlight')}</span>
            </h1>
            <p className="text-white/70 text-[16.5px] max-w-[560px]">{t('description')}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((service) => (
                <Link key={service.slug} href={`/services/${service.slug}`} className="card group">
                  <div className="card__media">
                    <img src={service.image} alt={service.title} loading="lazy" />
                    <span className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-[#FCFDFE]/95 text-blue flex items-center justify-center shadow-[0_1px_3px_rgba(12,36,64,.12)]">
                      {iconMap[service.slug]}
                    </span>
                  </div>
                  <div className="card__body">
                    <h2 className="card__title">{service.title}</h2>
                    <p className="card__text">{service.description}</p>
                    <span className="card__cta">
                      {t('details')}
                      <ArrowRight size={16} strokeWidth={1.8} />
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
