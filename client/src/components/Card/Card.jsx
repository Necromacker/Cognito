import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './Card.css';

export default function Card({
  children,
  interactive = false,
  patient = false,
  className = '',
  onClick,
  animate = true,
  ...rest
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (animate && !isReduced && cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }, [animate]);

  const classes = [
    'card',
    interactive ? 'card--interactive' : '',
    patient ? 'card--patient' : '',
    'custom-card',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={cardRef}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {children}
    </div>
  );
}

