'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { locales, type Locale } from '@/i18n/config';

export default function Header() {
  const t = useTranslations('nav');
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
          transition: 'box-shadow 0.25s ease',
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
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`relative text-[14.5px] font-medium transition-colors py-1 ${
                    active ? 'text-blue' : 'text-ink hover:text-blue'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-blue transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-0.5 bg-sky rounded-[9px] p-1">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className="px-2.5 py-1 rounded-[7px] text-[11.5px] font-bold uppercase border-none cursor-pointer transition-colors"
                  style={{
                    backgroundColor: currentLocale === loc ? '#2557E6' : 'transparent',
                    color: currentLocale === loc ? '#fff' : '#5B6C86',
                  }}
                >
                  {loc}
                </button>
              ))}
            </div>
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
                <X size={20} strokeWidth={1.8} />
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
              <div className="flex gap-2">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { switchLocale(loc); closeMenu(); }}
                    className="flex-1 py-2.5 rounded-[8px] text-[14px] font-bold uppercase cursor-pointer transition-colors border"
                    style={{
                      border: currentLocale === loc ? 'none' : '1.5px solid #CBD7E8',
                      backgroundColor: currentLocale === loc ? '#2557E6' : 'transparent',
                      color: currentLocale === loc ? '#fff' : '#5B6C86',
                    }}
                  >
                    {loc}
                  </button>
                ))}
              </div>

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
