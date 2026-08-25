'use client';

import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to any element.
 * When the element enters the viewport, it gets the class "revealed"
 * which triggers the CSS transition (opacity 1, translateY 0).
 * Respects prefers-reduced-motion.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      el.classList.add('revealed');
      return;
    }

    if (options?.delay) {
      el.style.transitionDelay = `${options.delay}ms`;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin, options?.delay]);

  return ref;
}

/**
 * Hook that sets up a root IntersectionObserver for all `.scroll-reveal` children.
 * Attach to a section/container and all descendants with `className="scroll-reveal"` will animate in.
 */
export function useScrollRevealContainer<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      container.querySelectorAll('.scroll-reveal').forEach((el) => el.classList.add('revealed'));
      return;
    }

    const elements = container.querySelectorAll('.scroll-reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return ref;
}
