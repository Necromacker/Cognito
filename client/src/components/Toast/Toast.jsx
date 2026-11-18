import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Toast.css';

export default function Toast({ message, type = 'info', onClose }) {
  const toastRef = useRef(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div ref={toastRef} className={`toast-notification toast--${type}`} role="status">
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️'}
      </span>
      <span className="toast-message">{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss notification">✕</button>
    </div>
  );
}

