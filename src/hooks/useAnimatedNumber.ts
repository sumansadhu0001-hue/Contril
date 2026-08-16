import { useState, useEffect } from 'react';

export function useAnimatedNumber(target: number, duration: number = 400, isEnabled: boolean = true): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isEnabled) {
      setCurrent(0);
      return;
    }

    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(startValue + (target - startValue) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration, isEnabled]);

  return current;
}
