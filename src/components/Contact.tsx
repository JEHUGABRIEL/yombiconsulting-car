'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MapPin, Phone, Mail, ArrowRight, MessageCircle, Facebook, Check, AlertCircle, Loader2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useScrollRevealContainer } from '@/hooks/useScrollReveal';

const CONTACT_EMAIL = 'contact.cmc@gmail.com';

export default function Contact() {
  const t = useTranslations('contact');
  const subjects = t.raw('form.subjects');
  const [formData, setFormData] = useState({
    nom: '',
    organisation: '',
    contact: '',
    sujet: subjects[0],
    message: '',
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const sectionRef = useScrollRevealContainer();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.nom,
          organisation: formData.organisation,
          contact: formData.contact,
          subject: formData.sujet,
          message: formData.message,
          company: formData.website,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data?.error || t('form.errorFallback'));
        setStatus('error');
        return;
      }

      setStatus('success');
      setFormData({
        nom: '',
        organisation: '',
        contact: '',
        sujet: subjects[0],
        message: '',
        website: '',
      });
    } catch {
      setErrorMessage(t('form.errorFallback'));
      setStatus('error');
    }
  };

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Contact · Yo Mbi Consulting'
  )}`;
  const fieldClass = 'field';

  return (
    <section id="contact" className="py-20 bg-sky" ref={sectionRef}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-12 lg:gap-16 items-start">
          <div>
            <ScrollReveal>
              <h2 className="font-extrabold text-[clamp(1.85rem,3.4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] mb-3">
                {t('title')} <span className="text-blue">{t('titleHighlight')}</span>
              </h2>
              <p className="text-mut text-[15.5px] mb-9 max-w-[440px]">{t('description')}</p>
            </ScrollReveal>

            <ul className="border-t border-line" data-stagger>
              <ScrollReveal>
                <li className="flex gap-4 py-5 border-b border-line">
                  <MapPin size={18} strokeWidth={1.7} className="text-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-mut block mb-1">
                      {t('address.label')}
                    </span>
                    <span className="text-[15px] font-semibold text-ink block">{t('address.value')}</span>
                    <span className="text-[13.5px] text-mut mt-0.5 block">{t('address.detail')}</span>
                  </div>
                </li>
              </ScrollReveal>
              <ScrollReveal>
                <li className="flex gap-4 py-5 border-b border-line">
                  <Phone size={18} strokeWidth={1.7} className="text-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-mut block mb-1">
                      {t('phone.label')}
                    </span>
                    <a href="tel:+23672111914" className="text-[15px] font-semibold text-ink hover:text-blue transition-colors">
                      {t('phone.value')}
                    </a>
                  </div>
                </li>
              </ScrollReveal>
              <ScrollReveal>
                <li className="flex gap-4 py-5 border-b border-line">
                  <Mail size={18} strokeWidth={1.7} className="text-blue shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-mut block mb-1">
                      {t('email.label')}
                    </span>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[15px] font-semibold text-ink hover:text-blue transition-colors">
                      {t('email.value')}
                    </a>
                  </div>
                </li>
              </ScrollReveal>
            </ul>

            <ScrollReveal delay={200}>
              <div className="flex gap-2.5 mt-7 flex-wrap">
                <a
                  href="https://wa.me/23672111914"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13.5px] font-semibold rounded-lg border border-line-2 bg-[#FCFDFE] text-ink hover:border-blue hover:text-blue transition-colors"
                >
                  <MessageCircle size={15} strokeWidth={1.8} /> {t('whatsapp')}
                </a>
                <a
                  href="https://www.facebook.com/search/top?q=cabinet%20yo%20mbi%20consulting"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13.5px] font-semibold rounded-lg border border-line-2 bg-[#FCFDFE] text-ink hover:border-blue hover:text-blue transition-colors"
                >
                  <Facebook size={15} strokeWidth={1.8} /> {t('facebook')}
                </a>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={100}>
            <div className="bg-[#FCFDFE] border border-line rounded-[16px] p-6 md:p-8">
              {status === 'success' ? (
                <div className="py-6 text-center" role="status">
                  <span className="w-12 h-12 rounded-full bg-tint text-blue flex items-center justify-center mx-auto mb-4">
                    <Check size={22} strokeWidth={2} />
                  </span>
                  <h3 className="text-[17px] font-bold text-ink mb-2">
                    {t('form.successTitle')}
                  </h3>
                  <p className="text-[14px] text-mut leading-relaxed max-w-[360px] mx-auto mb-6">
                    {t('form.successText')}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13.5px] font-semibold rounded-lg border border-line-2 text-ink hover:border-blue hover:text-blue transition-colors"
                  >
                    {t('form.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="contact-nom" className="block text-[12.5px] font-semibold mb-1.5">
                        {t('form.fullName')}
                      </label>
                      <input
                        id="contact-nom"
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        autoComplete="name"
                        required
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-organisation" className="block text-[12.5px] font-semibold mb-1.5">
                        {t('form.organization')}
                      </label>
                      <input
                        id="contact-organisation"
                        type="text"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleChange}
                        autoComplete="organization"
                        placeholder={t('form.organizationPlaceholder')}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contact-contact" className="block text-[12.5px] font-semibold mb-1.5">
                      {t('form.contactInfo')}
                    </label>
                    <input
                      id="contact-contact"
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      autoComplete="email"
                      required
                      className={fieldClass}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contact-sujet" className="block text-[12.5px] font-semibold mb-1.5">
                      {t('form.subject')}
                    </label>
                    <div className="relative">
                      <select
                        id="contact-sujet"
                        name="sujet"
                        value={formData.sujet}
                        onChange={handleChange}
                        className="field appearance-none pr-10"
                      >
                        {subjects.map((subject: string) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 w-[8px] h-[8px] border-r-2 border-b-2 border-mut transform -translate-y-[70%] rotate-45 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="contact-message" className="block text-[12.5px] font-semibold mb-1.5">
                      {t('form.message')}
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('form.messagePlaceholder')}
                      rows={5}
                      className="field resize-vertical min-h-[128px]"
                    />
                  </div>

                  {/* Champ piège invisible pour les robots */}
                  <div aria-hidden className="hidden">
                    <label htmlFor="contact-website">Site web</label>
                    <input
                      id="contact-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  {status === 'error' && (
                    <div
                      role="alert"
                      className="flex gap-2.5 items-start text-[13px] text-[#B42318] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3.5 py-3 mb-4 leading-relaxed"
                    >
                      <AlertCircle size={15} strokeWidth={1.9} className="shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold block">{t('form.errorTitle')}</strong>
                        {errorMessage}{' '}
                        <a href={mailtoHref} className="font-semibold underline">
                          {CONTACT_EMAIL}
                        </a>
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14.5px] font-semibold rounded-lg bg-blue text-white hover:bg-blue-deep transition-colors disabled:opacity-70"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {t('form.sending')}
                      </>
                    ) : (
                      <>
                        {t('form.submit')}
                        <ArrowRight size={17} strokeWidth={1.8} />
                      </>
                    )}
                  </button>

                  <p className="text-[12px] text-mut mt-3.5 leading-relaxed">{t('form.legal')}</p>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
