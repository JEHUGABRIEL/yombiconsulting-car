'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const heroImages = [
  '/images/formation-salle-participants.jpeg',
  '/images/chantier-consignes-securite.jpeg',
  '/images/formation-paperboard.jpeg',
];

const TYPE_MS = 60;
const TYPE_JITTER_MS = 55;
const HOLD_MS = 2100;
const ERASE_MS = 26;
const RESTART_MS = 600;

type HeroWord = { text: string; highlight: boolean };

function tokenizeWords(title: string, highlight: string): HeroWord[] {
  const at = highlight ? title.indexOf(highlight) : -1;
  const segments =
    at >= 0
      ? [
          { text: title.slice(0, at), highlight: false },
          { text: highlight, highlight: true },
          { text: title.slice(at + highlight.length), highlight: false },
        ]
      : [{ text: title, highlight: false }];

  return segments.flatMap((segment) =>
    segment.text
      .split(/\s+/)
      .filter(Boolean)
      .map((text) => ({ text, highlight: segment.highlight }))
  );
}

/**
 * Titre du hero dont la dernière ligne — celle que le navigateur place réellement en bas —
 * se tape lettre par lettre, puis s'efface une fois complète, en boucle.
 */
function HeroTitle({ title, highlight }: { title: string; highlight: string }) {
  const words = useMemo(() => tokenizeWords(title, highlight), [title, highlight]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [lastLineStart, setLastLineStart] = useState<number | null>(null);
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Repère les mots de la dernière ligne rendue : elle change avec la largeur et la police.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    if (!heading) return;

    const measure = () => {
      const wordNodes = Array.from(heading.querySelectorAll<HTMLElement>('[data-word]'));
      if (!wordNodes.length) return;
      let lastTop = wordNodes[0].offsetTop;
      for (const node of wordNodes) lastTop = Math.max(lastTop, node.offsetTop);
      const firstOnLine = wordNodes.findIndex((node) => node.offsetTop === lastTop);
      setLastLineStart(firstOnLine === -1 ? wordNodes.length - 1 : firstOnLine);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    return () => observer.disconnect();
  }, [words]);

  const tailLetters = useMemo(() => {
    if (lastLineStart === null) return 0;
    return words.slice(lastLineStart).reduce((total, word) => total + word.text.length, 0);
  }, [words, lastLineStart]);

  useEffect(() => {
    if (lastLineStart === null || tailLetters === 0 || reduceMotion) return;

    let shown = 0;
    let timer: ReturnType<typeof setTimeout>;
    setVisibleLetters(0);

    const type = () => {
      shown += 1;
      setVisibleLetters(shown);
      if (shown >= tailLetters) {
        timer = setTimeout(erase, HOLD_MS);
        return;
      }
      timer = setTimeout(type, TYPE_MS + Math.floor(Math.random() * TYPE_JITTER_MS));
    };

    const erase = () => {
      shown -= 1;
      setVisibleLetters(shown);
      if (shown <= 0) {
        timer = setTimeout(type, RESTART_MS);
        return;
      }
      timer = setTimeout(erase, ERASE_MS);
    };

    timer = setTimeout(type, 420);
    return () => clearTimeout(timer);
  }, [title, lastLineStart, tailLetters, reduceMotion]);

  let letterCursor = 0;

  return (
    <h1
      ref={headingRef}
      aria-label={title}
      className="font-extrabold text-navy text-[clamp(2.15rem,4.6vw,3.5rem)] leading-[1.06] tracking-[-0.035em]"
    >
      {words.map((word, wordIndex) => {
        const isTypedLine =
          !reduceMotion && lastLineStart !== null && wordIndex >= lastLineStart;
        const wordStart = letterCursor;
        if (isTypedLine) letterCursor += word.text.length;

        return (
          <span
            key={wordIndex}
            data-word
            className={word.highlight ? 'text-blue' : undefined}
          >
            {Array.from(word.text).map((letter, letterIndex) => {
              const isShown = !isTypedLine || wordStart + letterIndex < visibleLetters;
              return (
                <span key={letterIndex} style={isShown ? undefined : { visibility: 'hidden' }}>
                  {letter}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </h1>
  );
}

export default function Hero() {
  const t = useTranslations('hero');
  const slides = t.raw('slides');
  const stats = t.raw('stats');
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 7000);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const slide = slides[current];

  return (
    <section className="min-h-[88vh] lg:min-h-[94vh] flex items-center pt-[124px] pb-20 lg:pt-[164px] lg:pb-28 bg-[#FCFDFE] overflow-hidden">
      <div className="w-full max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-16 lg:gap-20 items-center">
          {/* ── Texte ── */}
          <div>
            <HeroTitle title={slide.title} highlight={slide.titleHighlight} />

            <p className="text-mut text-[17px] leading-[1.65] max-w-[520px] mt-6">{slide.lead}</p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a href="#services" className="btn btn-primary px-6 py-3.5 text-[14.5px]">
                {slide.cta1}
                <ArrowRight size={18} strokeWidth={1.75} />
              </a>
              <a href="#cabinet" className="btn btn-outline px-6 py-3.5 text-[14.5px]">
                {slide.cta2}
              </a>
            </div>

            <dl className="grid grid-cols-3 gap-x-4 sm:gap-x-8 mt-10 pt-7 border-t border-line">
              {stats.map((stat: any, i: number) => (
                <div key={i}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-[22px] sm:text-[26px] font-extrabold text-navy tracking-[-0.03em] leading-none">
                      {stat.value}
                    </span>
                    <span className="block text-[11.5px] sm:text-[12.5px] font-medium text-mut mt-2 leading-snug">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ── Visuel ── */}
          <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div
              aria-hidden
              className="hidden sm:block absolute -top-5 -right-5 bottom-6 left-14 rounded-[26px] bg-navy"
            />

            <div className="relative rounded-[24px] overflow-hidden aspect-[4/5] sm:aspect-[5/6] bg-sky">
              {heroImages.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden={i !== current}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1100ms] ease-[cubic-bezier(0.22,1,0.28,1)] ${
                    i === current ? 'opacity-100 hero-image-active' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
