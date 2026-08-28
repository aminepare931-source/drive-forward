import type { Variants } from "framer-motion";

/**
 * Courbe de easing partagée. Choisie pour une sensation "tenue" (deceleration
 * marquée) qui évite l'effet bonbon des courbes par défaut.
 */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Conteneur qui cascade ses enfants. @param delay délai avant le premier enfant. */
export function stagger(delayChildren = 0.06, staggerChildren = 0.07): Variants {
  return {
    hidden: {},
    show: {
      transition: { delayChildren, staggerChildren },
    },
  };
}