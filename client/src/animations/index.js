import gsap from 'gsap';

const checkReducedMotion = () => {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const fadeIn = (target, delay = 0) => {
  if (checkReducedMotion()) return;
  return gsap.from(target, {
    opacity: 0,
    duration: 0.6,
    delay,
    ease: 'power2.out'
  });
};

export const slideUp = (target, delay = 0, y = 30) => {
  if (checkReducedMotion()) return;
  return gsap.from(target, {
    opacity: 0,
    y,
    duration: 0.7,
    delay,
    ease: 'power2.out'
  });
};

export const staggerCards = (targets, stagger = 0.1) => {
  if (checkReducedMotion()) return;
  return gsap.from(targets, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger,
    ease: 'power2.out'
  });
};

export const celebrateStar = (target) => {
  if (checkReducedMotion()) return;
  return gsap.fromTo(
    target,
    { scale: 0.7, opacity: 0.5 },
    { scale: 1.15, opacity: 1, duration: 0.8, ease: 'power2.out', yoyo: true, repeat: 1 }
  );
};

export const cardFlip = (target, onMidpoint) => {
  if (checkReducedMotion()) {
    if (onMidpoint) onMidpoint();
    return;
  }
  const tl = gsap.timeline();
  tl.to(target, {
    rotateY: 90,
    duration: 0.25,
    ease: 'power1.in',
    onComplete: onMidpoint
  }).to(target, {
    rotateY: 0,
    duration: 0.35,
    ease: 'power2.out'
  });
  return tl;
};

export const gentlePulse = (target) => {
  if (checkReducedMotion()) return;
  return gsap.to(target, {
    scale: 1.04,
    duration: 1.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });
};

