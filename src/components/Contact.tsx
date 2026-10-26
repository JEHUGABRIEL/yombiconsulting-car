'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle, Facebook } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

export default function Contact() {
  const t = useTranslations('contact');
  const subjects = t.raw('form.subjects');
  const [formData, setFormData] = useState({
    nom: '',
    organisation: '',
    contact: '',
    sujet: subjects[0],
    message: '',
  });
  const sectionRef = useScrollRevealContainer();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Nom : ${formData.nom}\nOrganisation : ${formData.organisation || 'non précisée'}\nContact : ${formData.contact}\nSujet : ${formData.sujet}\n\nMessage :\n${formData.message}`;
    window.location.href = `mailto:contact.cmc@gmail.com?subject=${encodeURIComponent(formData.sujet + ' · Yo Mbi Consulting')}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className="py-16 bg-sky" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 items-start">
          {/* Left column */}
          <div>
            <ScrollReveal>
              <span className="chip inline-flex items-center gap-2 bg-tint text-blue text-xs font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue" />
                {t('chip')}
              </span>
              <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-4">
                {t('title')}{' '}
                <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
              <p className="text-mut mb-9">{t('description')}</p>
            </ScrollReveal>

            <ul className="space-y-0" data-stagger>
              <ScrollReveal>
                <li className="flex gap-4.5 py-4.5 border-b border-line">
                  <span className="w-12 h-12 rounded-[14px] bg-tint flex items-center justify-center shrink-0">
                    <MapPin size={22} className="text-blue" strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-mut block mb-1">
                      {t('address.label')}
                    </span>
                    <span className="text-[16px] font-bold block">{t('address.value')}</span>
                    <small className="text-[13.5px] text-mut font-medium mt-0.5 block">
                      {t('address.detail')}
                    </small>
                  </div>
                </li>
              </ScrollReveal>
              <ScrollReveal>
                <li className="flex gap-4.5 py-4.5 border-b border-line">
                  <span className="w-12 h-12 rounded-[14px] bg-tint flex items-center justify-center shrink-0">
                    <Phone size={22} className="text-blue" strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-mut block mb-1">
                      {t('phone.label')}
                    </span>
                    <a href="tel:+23672111914" className="text-[16px] font-bold hover:text-blue transition-colors">
                      {t('phone.value')}
                    </a>
                  </div>
                </li>
              </ScrollReveal>
              <ScrollReveal>
                <li className="flex gap-4.5 py-4.5 border-b border-line">
                  <span className="w-12 h-12 rounded-[14px] bg-tint flex items-center justify-center shrink-0">
                    <Mail size={22} className="text-blue" strokeWidth={1.8} />
                  </span>
                  <div>
                    <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-mut block mb-1">
                      {t('email.label')}
                    </span>
                    <a href="mailto:contact.cmc@gmail.com" className="text-[16px] font-bold hover:text-blue transition-colors">
                      {t('email.value')}
                    </a>
                  </div>
                </li>
              </ScrollReveal>
            </ul>

            <ScrollReveal delay={240}>
              <div className="flex gap-3 mt-8 flex-wrap">
                <a
                  href="https://wa.me/23672111914"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-[22px] py-3 text-[14px] font-bold rounded-full border-[1.5px] border-line-2 text-ink hover:border-blue hover:text-blue transition-all"
                >
                  <MessageCircle size={16} /> {t('whatsapp')}
                </a>
                <a
                  href="https://www.facebook.com/search/top?q=cabinet%20yo%20mbi%20consulting"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-[22px] py-3 text-[14px] font-bold rounded-full border-[1.5px] border-line-2 text-ink hover:border-blue hover:text-blue transition-all"
                >
                  <Facebook size={16} /> {t('facebook')}
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Contact Form */}
          <ScrollReveal delay={100}>
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-line rounded-[28px] p-[38px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-[13px] font-bold mb-2">{t('form.fullName')}</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FBFCFE] border-[1.5px] border-line-2 rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-blue focus:shadow-[0_0_0_4px_rgba(37,87,230,.1)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold mb-2">{t('form.organization')}</label>
                  <input
                    type="text"
                    name="organisation"
                    value={formData.organisation}
                    onChange={handleChange}
                    placeholder={t('form.organizationPlaceholder')}
                    className="w-full bg-[#FBFCFE] border-[1.5px] border-line-2 rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-blue focus:shadow-[0_0_0_4px_rgba(37,87,230,.1)] transition-all placeholder:text-mut"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-bold mb-2">{t('form.contactInfo')}</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FBFCFE] border-[1.5px] border-line-2 rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-blue focus:shadow-[0_0_0_4px_rgba(37,87,230,.1)] transition-all"
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-bold mb-2">{t('form.subject')}</label>
                <div className="relative">
                  <select
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleChange}
                    className="w-full bg-[#FBFCFE] border-[1.5px] border-line-2 rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-blue focus:shadow-[0_0_0_4px_rgba(37,87,230,.1)] transition-all appearance-none"
                  >
                    {subjects.map((subject: string) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-[18px] top-1/2 w-[9px] h-[9px] border-r-2 border-b-2 border-mut transform -translate-y-[70%] rotate-45 pointer-events-none" />
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-bold mb-2">{t('form.message')}</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('form.messagePlaceholder')}
                  rows={5}
                  className="w-full bg-[#FBFCFE] border-[1.5px] border-line-2 rounded-[12px] px-4 py-3.5 text-[15px] text-ink focus:outline-none focus:border-blue focus:shadow-[0_0_0_4px_rgba(37,87,230,.1)] transition-all resize-vertical placeholder:text-mut min-h-[130px]"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2.5 px-7 py-4 text-[15px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-colors mt-2"
              >
                {t('form.submit')}
                <ArrowRight size={17} strokeWidth={2.5} />
              </button>

              <p className="text-[12.5px] text-mut mt-4 leading-relaxed">
                {t('form.legal')}
              </p>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
