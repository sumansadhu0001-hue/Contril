export interface TimeGreetingData {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  greeting: string;
  subGreeting: string;
  briefSubtitle: string;
  badgeLabel: string;
  formattedTime: string;
  timeZone: string;
}

export function getGreetingForTime(date: Date = new Date(), userName: string = ''): TimeGreetingData {
  const hours = date.getHours();
  
  // Format local time like "08:15"
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
  let timeZone = 'Local';
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    const shortZone = new Date().toLocaleDateString('en-US', { timeZoneName: 'short' }).split(', ')[1];
    if (shortZone) timeZone = shortZone;
  } catch (e) {
    // fallback
  }

  const cleanName = userName && !userName.includes('Demo') ? userName.trim().split(' ')[0] : '';
  const nameSuffix = cleanName ? `, ${cleanName}` : '';

  if (hours >= 5 && hours < 12) {
    // 05:00 – 11:59
    return {
      timeOfDay: 'morning',
      greeting: `Good morning${nameSuffix}.`,
      subGreeting: 'Everything is synchronized.',
      briefSubtitle: 'Everything is synchronized.',
      badgeLabel: 'Morning Executive Brief',
      formattedTime,
      timeZone
    };
  } else if (hours >= 12 && hours < 17) {
    // 12:00 – 16:59
    return {
      timeOfDay: 'afternoon',
      greeting: `Good afternoon${nameSuffix}.`,
      subGreeting: 'Everything is synchronized.',
      briefSubtitle: 'Everything is synchronized.',
      badgeLabel: 'Afternoon Executive Brief',
      formattedTime,
      timeZone
    };
  } else if (hours >= 17 && hours < 22) {
    // 17:00 – 21:59
    return {
      timeOfDay: 'evening',
      greeting: `Good evening${nameSuffix}.`,
      subGreeting: 'Everything is under control.',
      briefSubtitle: 'Everything is under control.',
      badgeLabel: 'Evening Summary',
      formattedTime,
      timeZone
    };
  } else {
    // 22:00 – 04:59
    return {
      timeOfDay: 'night',
      greeting: `Working late${cleanName ? `, ${cleanName}?` : '?'}`,
      subGreeting: 'Workspace is active and processing in background.',
      briefSubtitle: 'Workspace is active and processing in background.',
      badgeLabel: 'Nightly Sync',
      formattedTime,
      timeZone
    };
  }
}
