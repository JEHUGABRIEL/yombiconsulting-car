'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';
import { getServices } from '@/data/services';

function LanguageSelect({
  value,
  onChange,
  label,
  full = false,
}: {
  value: Locale;
  onChange: (locale: string) => void;
  label: string;
  full?: boolean;
}) {
  return (
    <div className={`relative ${full ? 'w-full' : ''}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`appearance-none cursor-pointer rounded-[9px] border border-line bg-[#FFFFFF] pl-3 pr-9 py-2 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:border-blue/40 focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15 ${
          full ? 'w-full' : ''
        }`}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={2}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mut"
      />
    </div>
  );
}

export default function Header() {
  const t = useTranslations('nav');
  const tServices = useTranslations('services');
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const currentLocale = pathname.split('/')[1] as Locale;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const switchLocale = (locale: string) => {
    const segments = pathname.split('/');
    segments[1] = locale;
    router.push(segments.join('/'));
  };

  const openMenu = useCallback(() => {
    setMobileOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMenuVisible(true));
    });
    document.body.classList.add('no-scroll');
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
    document.body.classList.remove('no-scroll');
    setTimeout(() => setMobileOpen(false), 350);
  }, []);

  const toggleMenu = useCallback(() => {
    if (mobileOpen) closeMenu();
    else openMenu();
  }, [mobileOpen, openMenu, closeMenu]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) closeMenu();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mobileOpen, closeMenu]);

  const locale = pathname.split('/')[1] as Locale;
  const serviceMenu = getServices(locale);

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/a-propos`, label: t('cabinet') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/formations`, label: t('formations') },
    { href: `/${locale}/actualites`, label: t('actualites') },
  ];

  return (
    <>
      {/* ── Header Bar ── */}
      <header
        id="site-header"
        className="bg-white border-b border-line"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          boxShadow: scrolled
            ? '0 8px 30px rgba(13,36,70,.1)'
            : '0 1px 4px rgba(13,36,70,.06)',
          transition: 'box-shadow 0.3s cubic-bezier(0.22,1,0.28,1)',
        }}
      >
        <div
          className="max-w-[1200px] mx-auto px-6 flex items-center justify-between"
          style={{ height: 72 }}
        >
          {/* Brand */}
          <a href="#" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Yo Mbi Consulting"
              style={{ width: 42, height: 42, objectFit: 'contain' }} />
            <div className="leading-tight hidden sm:block">
              <b className="block text-[18px] font-extrabold text-navy">Yo Mbi</b>
              <span className="block text-[9px] font-bold tracking-[0.32em] text-blue mt-0.5">
                CONSULTING
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active =
                link.href === `/${locale}`
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
              const linkClass = `relative text-[14.5px] font-medium transition-colors py-1 ${
                active ? 'text-blue' : 'text-ink hover:text-blue'
              }`;
              const underlineClass = `absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-blue transition-opacity ${
                active ? 'opacity-100' : 'opacity-0'
              }`;

              // « Services » déroule les six domaines, comme les menus du site de référence.
              if (link.href === `/${locale}/services`) {
                return (
                  <div key={link.href} className="relative group">
                    <a
                      href={link.href}
                      className={`${linkClass} inline-flex items-center gap-1`}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <ChevronDown
                        size={14}
                        strokeWidth={2}
                        className="transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.28,1)] group-hover:rotate-180"
                      />
                      <span className={underlineClass} />
                    </a>

                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 invisible opacity-0 translate-y-1.5 scale-[0.98] origin-top transition-all duration-[280ms] ease-[cubic-bezier(0.22,1,0.28,1)] group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100">
                      <ul className="w-[330px] bg-white border border-line rounded-[14px] shadow-[0_18px_50px_rgba(13,36,70,0.14)] p-2">
                        {serviceMenu.map((service) => (
                          <li key={service.slug}>
                            <a
                              href={`/${locale}/services/${service.slug}`}
                              className="block px-3 py-2.5 rounded-[9px] text-[13.5px] font-medium text-ink hover:bg-sky hover:text-blue transition-colors"
                            >
                              {service.title}
                            </a>
                          </li>
                        ))}
                        <li className="mt-1 pt-1 border-t border-line">
                          <a
                            href={`/${locale}/services`}
                            className="block px-3 py-2.5 rounded-[9px] text-[13px] font-semibold text-blue hover:bg-sky transition-colors"
                          >
                            {tServices('allServices')}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <a key={link.href} href={link.href} className={linkClass}>
                  {link.label}
                  <span className={underlineClass} />
                </a>
              );
            })}
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSelect
              value={currentLocale}
              onChange={switchLocale}
              label={t('language')}
            />
            <a
              href={`/${locale}#contact`}
              className="inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-bold btn btn-primary"
            >
              {t('cta')}
            </a>
          </div>

          {/* Mobile Burger */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-11 h-11 gap-[5px] bg-transparent border-none cursor-pointer"
            onClick={toggleMenu}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            <span
              className="block w-6 h-[2px] rounded-full bg-navy origin-center"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: mobileOpen ? 'translateY(3.5px) rotate(45deg)' : 'none',
              }} />
            <span
              className="block w-6 h-[2px] rounded-full bg-navy"
              style={{
                transition: 'opacity 0.2s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                opacity: mobileOpen ? 0 : 1,
                transform: mobileOpen ? 'scaleX(0)' : 'scaleX(1)',
              }} />
            <span
              className="block w-6 h-[2px] rounded-full bg-navy origin-center"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                transform: mobileOpen ? 'translateY(-3.5px) rotate(-45deg)' : 'none',
              }} />
          </button>
        </div>
      </header>

      {/* ── Mobile Menu (full-screen slide-in) ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[10000]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            style={{
              opacity: menuVisible ? 1 : 0,
              transition: 'opacity 0.35s ease',
            }}
            onClick={closeMenu} />

          {/* Panel */}
          <div
            className="absolute top-0 right-0 bottom-0 w-[min(360px,85vw)] bg-white shadow-[-8px_0_40px_rgba(13,36,70,.15)] flex flex-col"
            style={{
              transform: menuVisible ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 border-b border-line" style={{ height: 72 }}>
              <a href="#" className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Yo Mbi Consulting"
                  style={{ width: 38, height: 38, objectFit: 'contain' }} />
                <span className="text-[16px] font-extrabold text-navy">Yo Mbi</span>
              </a>
              <button
                onClick={closeMenu}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-sky text-ink hover:bg-tint transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {navLinks.map((link, i) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3.5 rounded-xl text-[16px] font-semibold text-ink hover:bg-sky hover:text-blue transition-colors"
                    style={{
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? 'translateX(0)' : 'translateX(20px)',
                      transition: `opacity 0.3s ease ${80 + i * 40}ms, transform 0.3s cubic-bezier(0.16,1,0.3,1) ${80 + i * 40}ms, background-color 0.2s ease, color 0.2s ease`,
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Panel Footer */}
            <div
              className="px-6 pb-8 pt-4 border-t border-line space-y-4"
              style={{
                opacity: menuVisible ? 1 : 0,
                transform: menuVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s ease 200ms, transform 0.4s cubic-bezier(0.16,1,0.3,1) 200ms',
              }}
            >
              {/* Language Switcher */}
              <LanguageSelect
                value={currentLocale}
                onChange={(loc) => {
                  switchLocale(loc);
                  closeMenu();
                }}
                label={t('language')}
                full
              />

              {/* CTA */}
              <a
                href={`/${locale}#contact`}
                onClick={closeMenu}
                className="flex items-center justify-center w-full py-3.5 btn btn-primary text-[15px] font-bold hover:bg-blue-deep transition-colors"
              >
                {t('cta')}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
