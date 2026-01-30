'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  className = '',
  delay = 0,
  speed = 50,
  cursor = true
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay * 1000);

    return () => clearTimeout(startTimer);
  }, [text, delay, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayText}
      {cursor && (
        <span
          className={`inline-block w-0.5 h-5 bg-current ml-1 align-middle transition-opacity ${
            showCursor ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </span>
  );
}