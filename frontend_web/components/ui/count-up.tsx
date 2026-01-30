'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function CountUp({
  end,
  duration = 2,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = setTimeout(() => {
      let startTimeStamp: number;
      let animationFrameId: number;

      const animate = (currentTime: number) => {
        if (!startTimeStamp) startTimeStamp = currentTime;
        const progress = Math.min((currentTime - startTimeStamp) / (duration * 1000), 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = easeOutQuart * end;

        setCount(currentCount);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrameId);
    }, delay * 1000);

    return () => clearTimeout(startTime);
  }, [isVisible, end, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}