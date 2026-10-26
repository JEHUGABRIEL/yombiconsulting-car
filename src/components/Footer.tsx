'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MessageCircle, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ServiceModal from './ServiceModal';
import { getServices } from '@/data/services';

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const serviceLinks = getServices(locale).map((service) => service.title);
  const links = t.raw('links');
  const legalLabels = t.raw('legalLinks') as Record<string, string>;

  // Seuls les liens vers de vraies pages sont affichés (plus d'ancres home)
  const linkRoutes: Record<string, string> = {
    home: '/',
    apropos: '/a-propos',
    services: '/services',
    formations: '/formations',
    actualites: '/actualites',
  };

  const legalRoutes = [
    { key: 'mentions', href: '/mentions' },
    { key: 'cgu', href: '/cgu' },
    { key: 'privacy', href: '/confidentialite' },
    { key: 'cookies', href: '/cookies' },
  ] as const;
  const [modalOpen, setModalOpen] = useState(false);
  const [activeService, setActiveService] = useState(-1);

  const openService = useCallback((index: number) => {
    setActiveService(index);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <footer className="bg-navy-2 text-[#AABBD4] pt-16 pb-0">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Newsletter Band */}
        <div className="flex items-center justify-between gap-9 flex-wrap pb-12 border-b border-[rgba(255,255,255,.1)] mb-[52px]">
          <div>
            <h3 className="text-white text-[22px] font-extrabold tracking-[-0.01em] mb-1.5">
              {t('newsletter.title')}
            </h3>
            <p className="text-[14px] max-w-[420px]">{t('newsletter.description')}</p>
          </div>
          <form className="flex gap-2.5 flex-wrap" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder={t('newsletter.placeholder')}
              className="bg-[rgba(255,255,255,.07)] border-[1.5px] border-[rgba(255,255,255,.18)] rounded-[10px] px-[22px] py-3.5 text-[14.5px] text-white min-w-[280px] focus:outline-none focus:border-blue-soft transition-colors placeholder:text-[#8799B3]" />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-[10px] bg-blue text-white text-[15px] font-bold hover:bg-blue-deep transition-colors"
            >
              {t('newsletter.cta')}
            </button>
          </form>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-11 pb-[52px]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="Yo Mbi Consulting"
                className="w-[46px] h-[46px] object-contain" />
              <div className="leading-tight">
                <b className="block text-[19px] font-extrabold text-white">Yo Mbi</b>
                <span className="block text-[9.5px] font-bold tracking-[0.32em] text-blue-soft">CONSULTING</span>
              </div>
            </div>
            <p className="text-[14px] leading-[1.65] max-w-[300px]">{t('brand')}</p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://wa.me/23672111914"
                target="_blank"
                rel="noopener"
                className="w-[42px] h-[42px] rounded-full border-[1.5px] border-[rgba(255,255,255,.18)] flex items-center justify-center hover:bg-blue hover:border-blue transition-colors text-lg"
              >
                <MessageCircle size={18} strokeWidth={1.8} />
              </a>
              <a
                href="https://www.facebook.com/search/top?q=cabinet%20yo%20mbi%20consulting"
                target="_blank"
                rel="noopener"
                className="w-[42px] h-[42px] rounded-full border-[1.5px] border-[rgba(255,255,255,.18)] flex items-center justify-center hover:bg-blue hover:border-blue transition-colors text-lg"
              >
                <Facebook size={18} strokeWidth={1.8} />
              </a>
              <a
                href="mailto:contact.cmc@gmail.com"
                className="w-[42px] h-[42px] rounded-full border-[1.5px] border-[rgba(255,255,255,.18)] flex items-center justify-center hover:bg-blue hover:border-blue transition-colors text-lg"
              >
                <Mail size={18} strokeWidth={1.8} />
              </a>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <p className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-5">
              {t('services')}
            </p>
            <ul className="space-y-1.5">
              {serviceLinks.map((service, i) => (
                <li key={service}>
                  <button
                    type="button"
                    onClick={() => openService(i)}
                    className="block text-[14.5px] font-semibold py-1.5 text-[#AABBD4] hover:text-white transition-colors text-left"
                  >
                    {service}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <p className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-5">
              {t('usefulLinks')}
            </p>
            <ul className="space-y-1.5">
              {Object.entries(links)
                .filter(([key]) => key in linkRoutes)
                .map(([key, label]) => (
                  <li key={key}>
                    <Link
                      href={linkRoutes[key]}
                      className="block text-[14.5px] font-semibold py-1.5 text-[#AABBD4] hover:text-white transition-colors"
                    >
                      {label as string}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-5">
              {t('contact')}
            </p>
            <ul className="space-y-4">
              <li className="flex gap-3 text-[14.5px] leading-[1.5]">
                <MapPin size={16} className="shrink-0 mt-0.5" strokeWidth={1.8} />
                <span>{t('address')}</span>
              </li>
              <li className="flex gap-3 text-[14.5px]">
                <Phone size={16} className="shrink-0" strokeWidth={1.8} />
                <a href="tel:+23672111914" className="hover:text-white transition-colors">+236 72 11 19 14</a>
              </li>
              <li className="flex gap-3 text-[14.5px]">
                <Mail size={16} className="shrink-0" strokeWidth={1.8} />
                <a href="mailto:contact.cmc@gmail.com" className="hover:text-white transition-colors">contact.cmc@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-[rgba(255,255,255,.1)] py-6 text-[13px]">
          <span>© {new Date().getFullYear()} Cabinet Yo Mbi Consulting. {t('copyright')}</span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="text-[#AABBD4] hover:text-white transition-colors"
              >
                {legalLabels[route.key]}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <ServiceModal
        isOpen={modalOpen}
        serviceIndex={activeService}
        onClose={closeModal} />
    </footer>
  );
}
