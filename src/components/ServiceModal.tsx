'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X, ArrowRight, Shield, Clipboard, AlertTriangle, Leaf, TrendingUp, Briefcase } from 'lucide-react';

const icons = [Shield, Clipboard, AlertTriangle, Leaf, TrendingUp, Briefcase];

interface ServiceModalProps {
  isOpen: boolean;
  serviceIndex: number; // 0-5 for specific service, -1 for "all services"
  onClose: () => void;
}

export default function ServiceModal({ isOpen, serviceIndex, onClose }: ServiceModalProps) {
  const t = useTranslations('services');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.classList.add('no-scroll');
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAllServices = serviceIndex === -1;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[rgba(9,22,42,.6)]" onClick={onClose} />

      {/* Modal Box */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-[24px] max-w-[600px] w-full max-h-[84vh] overflow-auto p-[38px_40px] shadow-[0_40px_90px_rgba(8,20,40,.35)] transform transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[18px] right-[18px] w-[38px] h-[38px] rounded-full flex items-center justify-center bg-sky hover:bg-tint transition-colors"
          aria-label="Fermer"
        >
          <X size={15} className="text-ink" strokeWidth={2} strokeLinecap="round" />
        </button>

        {isAllServices ? (
          <>
            {/* Header for All Services */}
            <div className="flex gap-[18px] items-center mb-[14px] pr-[44px]">
              <span className="w-[54px] h-[54px] rounded-[16px] bg-tint flex items-center justify-center">
                <Briefcase size={27} className="text-blue" strokeWidth={1.8} />
              </span>
              <h3 id="modal-title" className="text-[22px] font-extrabold tracking-[-0.01em]">
                {t('allServicesTitle')}
              </h3>
            </div>
            <p className="text-mut text-[15px] mb-5">{t('allServicesDesc')}</p>

            <ul className="space-y-0">
              {t.raw('modal').map((svc: any, i: number) => {
                const Icon = icons[i];
                return (
                  <li key={i} className="flex gap-3 items-start py-3 border-t border-line text-[15px] font-semibold">
                    <ArrowRight size={16} className="text-blue shrink-0 mt-1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <span>{svc.title}</span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <>
            {/* Header for Single Service */}
            <div className="flex gap-[18px] items-center mb-[14px] pr-[44px]">
              <span className="w-[54px] h-[54px] rounded-[16px] bg-tint flex items-center justify-center">
                {(() => { const Icon = icons[serviceIndex]; return Icon ? <Icon size={27} className="text-blue" strokeWidth={1.8} /> : null; })()}
              </span>
              <h3 id="modal-title" className="text-[22px] font-extrabold tracking-[-0.01em]">
                {t(`modal.${serviceIndex}.title`)}
              </h3>
            </div>
            <p className="text-mut text-[15px] mb-5">
              {t(`modal.${serviceIndex}.desc`)}
            </p>

            <ul className="space-y-0">
              {t.raw(`modal.${serviceIndex}.list`).map((item: string, i: number) => (
                <li key={i} className="flex gap-3 items-start py-3 border-t border-line text-[15px] font-semibold">
                  <ArrowRight size={16} className="text-blue shrink-0 mt-1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-7 flex-wrap">
          <a
            href="#contact"
            onClick={() => {
              onClose();
              // Scroll to contact after close
              setTimeout(() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-bold rounded-full bg-blue text-white hover:bg-blue-deep transition-all"
          >
            {t('requestService')}
            <ArrowRight size={15} strokeWidth={2.5} />
          </a>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[14px] font-bold rounded-full border-[1.5px] border-line-2 text-ink hover:border-blue hover:text-blue transition-all"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
