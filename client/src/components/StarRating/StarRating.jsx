import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './StarRating.css';

export default function StarRating({ stars = 3, maxStars = 5, showStreak = true, streak = 1 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isReduced && containerRef.current) {
      const starEls = containerRef.current.querySelectorAll('.star-item--filled');
      if (starEls.length > 0) {
        gsap.fromTo(
          starEls,
          { scale: 0.6, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [stars]);

  return (
    <div ref={containerRef} className="star-rating-box" aria-label={`Earned ${stars} out of ${maxStars} stars`}>
      <div className="star-rating-row">
        {Array.from({ length: maxStars }).map((_, i) => (
          <span
            key={i}
            className={`star-item ${i < stars ? 'star-item--filled' : 'star-item--empty'}`}
          >
            ⭐
          </span>
        ))}
      </div>
      {showStreak && streak > 0 && (
        <div className="star-streak-badge">
          🔥 {streak} Day Streak!
        </div>
      )}
    </div>
  );
}

