import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './ProgressBar.css';

export default function ProgressBar({ current = 1, total = 5, label = '' }) {
  const barRef = useRef(null);
  const percent = Math.min(100, Math.round((current / total) * 100));

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced && barRef.current) {
      gsap.to(barRef.current, {
        width: `${percent}%`,
        duration: 0.6,
        ease: 'power2.out'
      });
    } else if (barRef.current) {
      barRef.current.style.width = `${percent}%`;
    }
  }, [percent]);

  return (
    <div className="progress-box" role="progressbar" aria-valuenow={current} aria-valuemin="1" aria-valuemax={total}>
      <div className="progress-labels">
        <span className="progress-labels__text">{label || `Question ${current} of ${total}`}</span>
        <span className="progress-labels__percent">{percent}%</span>
      </div>
      <div className="progress-track">
        <div ref={barRef} className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

