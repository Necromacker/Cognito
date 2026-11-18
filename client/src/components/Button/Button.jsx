import React, { useRef } from 'react';
import gsap from 'gsap';
import './Button.css';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, accent, outline, ghost, patient
  size = 'medium',    // medium, large, patient
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon = null,
  ...rest
}) {
  const btnRef = useRef(null);

  const handlePointerDown = () => {
    if (disabled) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced && btnRef.current) {
      gsap.to(btnRef.current, { scale: 0.96, duration: 0.1, ease: 'power1.out' });
    }
  };

  const handlePointerUp = () => {
    if (disabled) return;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced && btnRef.current) {
      gsap.to(btnRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
    }
  };

  const variantClass = `btn--${variant}`;
  const sizeClass = size === 'large' ? 'btn--large' : (size === 'patient' ? 'btn--patient' : '');

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`btn ${variantClass} ${sizeClass} custom-button ${className}`}
      {...rest}
    >
      {icon && <span className="custom-button__icon">{icon}</span>}
      <span className="custom-button__label">{children}</span>
    </button>
  );
}

