import { useState, useEffect } from 'react';
import { getGreetingForTime, TimeGreetingData } from '../utils/timeGreeting';

export function useLocalGreeting(userName: string = ''): TimeGreetingData {
  const [greetingData, setGreetingData] = useState<TimeGreetingData>(() => getGreetingForTime(new Date(), userName));

  useEffect(() => {
    const updateGreeting = () => {
      setGreetingData(getGreetingForTime(new Date(), userName));
    };

    updateGreeting();

    const intervalId = setInterval(updateGreeting, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateGreeting();
      }
    };

    const handleWindowFocus = () => {
      updateGreeting();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [userName]);

  return greetingData;
}

