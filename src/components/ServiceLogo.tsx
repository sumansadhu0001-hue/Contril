import React from 'react';

interface ServiceLogoProps {
  id: string; // Service or App ID e.g. 'gmail', 'slack', 'github', etc.
  className?: string;
  size?: number;
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({ id, className = "w-6 h-6", size }) => {
  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;
  const cleanId = id.toLowerCase().replace(/[^a-z0-9_]/g, '');

  switch (cleanId) {
    case 'google':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
      );

    case 'gmail':
    case 'mail':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" fill="#EA4335" fillOpacity="0.1" />
          <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6Z" stroke="#EA4335" strokeWidth="1.5" />
          <path d="M22 6L12 13L2 6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 18L10 12" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 18L14 12" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'google_calendar':
    case 'calendar':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="17" rx="3" fill="#4285F4" fillOpacity="0.1" stroke="#4285F4" strokeWidth="1.5" />
          <path d="M3 8.5H21" stroke="#4285F4" strokeWidth="1.5" />
          <path d="M8 2V5" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 2V5" stroke="#34A853" strokeWidth="1.8" strokeLinecap="round" />
          <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4285F4" fontFamily="sans-serif">31</text>
        </svg>
      );

    case 'google_drive':
    case 'drive':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 3H15.5L22 14H15L8.5 3Z" fill="#FFBA00" />
          <path d="M2 14.5L5.5 8.5L15.5 8.5L12 14.5H2Z" fill="#0066DA" />
          <path d="M2 14.5L5.5 20.5H18.5L22 14.5H2Z" fill="#00AC47" />
        </svg>
      );

    case 'google_docs':
    case 'docs':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="3" width="16" height="18" rx="2" fill="#2684FC" fillOpacity="0.15" stroke="#2684FC" strokeWidth="1.5" />
          <path d="M8 8H16" stroke="#2684FC" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 12H16" stroke="#2684FC" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 16H12" stroke="#2684FC" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'outlook':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="5" width="20" height="14" rx="2" fill="#0078D4" fillOpacity="0.1" stroke="#0078D4" strokeWidth="1.5" />
          <circle cx="8" cy="12" r="3.5" stroke="#0078D4" strokeWidth="1.8" />
          <path d="M12 9.5L20 14" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 9.5L14.5 13" stroke="#0078D4" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'microsoft_calendar':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2" fill="#0078D4" fillOpacity="0.1" stroke="#0078D4" strokeWidth="1.5" />
          <path d="M3 8.5H21" stroke="#0078D4" strokeWidth="1.5" />
          <path d="M8 2V5" stroke="#0078D4" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 2V5" stroke="#0078D4" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="7" y="11" width="3" height="3" rx="0.5" fill="#0078D4" />
          <rect x="14" y="11" width="3" height="3" rx="0.5" fill="#0078D4" />
        </svg>
      );

    case 'onedrive':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.5 18C4 18 2 16 2 13.5C2 11.2 3.6 9.3 5.8 8.9C6.4 6.1 8.9 4 12 4C15.5 4 18.4 6.6 18.9 10C20.7 10.3 22 11.9 22 13.8C22 16.1 20.1 18 17.8 18H6.5Z" fill="#0078D4" fillOpacity="0.15" stroke="#0078D4" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );

    case 'microsoft_teams':
    case 'teams':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="13" height="14" rx="2" fill="#6264A7" />
          <text x="9.5" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">T</text>
          <circle cx="18" cy="8" r="2.5" fill="#6264A7" />
          <path d="M15.5 12.5C15.5 11.5 16.5 10.5 18 10.5C19.5 10.5 20.5 11.5 20.5 12.5V15H15.5V12.5Z" fill="#6264A7" />
        </svg>
      );

    case 'slack':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 15A2 2 0 0 1 4 13A2 2 0 0 1 6 11H8V13A2 2 0 0 1 6 15Z" fill="#E01E5A" />
          <path d="M9 6A2 2 0 0 1 11 4A2 2 0 0 1 13 6V8H11A2 2 0 0 1 9 6Z" fill="#36C5F0" />
          <path d="M18 9A2 2 0 0 1 20 11A2 2 0 0 1 18 13H16V11A2 2 0 0 1 18 9Z" fill="#2EB67D" />
          <path d="M15 18A2 2 0 0 1 13 20A2 2 0 0 1 11 18V16H13A2 2 0 0 1 15 18Z" fill="#ECB22E" />
          <rect x="8" y="6" width="8" height="2" rx="1" fill="#36C5F0" />
          <rect x="8" y="16" width="8" height="2" rx="1" fill="#ECB22E" />
          <rect x="6" y="8" width="2" height="8" rx="1" fill="#E01E5A" />
          <rect x="16" y="8" width="2" height="8" rx="1" fill="#2EB67D" />
        </svg>
      );

    case 'discord':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.8 4.2C17.4 3.5 15.9 3 14.3 2.7C14.1 3.1 13.9 3.6 13.7 4C12 3.7 10.3 3.7 8.6 4C8.4 3.6 8.2 3.1 8 2.7C6.4 3 4.9 3.5 3.5 4.2C0.7 8.4 0 12.5 0.3 16.5C2.1 17.8 3.9 18.6 5.6 19.1C6 18.5 6.4 17.9 6.8 17.2C6.2 17 5.6 16.7 5 16.4C5.1 16.3 5.3 16.2 5.4 16.1C8.8 17.7 12.5 17.7 15.8 16.1C15.9 16.2 16.1 16.3 16.2 16.4C15.6 16.7 15 17 14.4 17.2C14.8 17.9 15.2 18.5 15.6 19.1C17.4 18.6 19.2 17.8 21 16.5C21.4 11.9 20.3 7.8 18.8 4.2ZM7.2 14C6.1 14 5.2 13 5.2 11.8C5.2 10.6 6.1 9.6 7.2 9.6C8.3 9.6 9.2 10.6 9.2 11.8C9.2 13 8.3 14 7.2 14ZM14.1 14C13 14 12.1 13 12.1 11.8C12.1 10.6 13 9.6 14.1 9.6C15.2 9.6 16.1 10.6 16.1 11.8C16.1 13 15.2 14 14.1 14Z" fill="#5865F2" />
        </svg>
      );

    case 'zoom':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="6" width="13" height="12" rx="3" fill="#2D8CFF" />
          <path d="M15 10L21 6.5V17.5L15 14V10Z" fill="#2D8CFF" />
        </svg>
      );

    case 'notion':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#FFFFFF" stroke="#FAFAFA" strokeWidth="1.5" />
          <path d="M7 6L14 16V6H17V18H14L7 8V18H4V6H7Z" fill="#09090B" />
        </svg>
      );

    case 'linear':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9" fill="#5E6AD2" fillOpacity="0.2" stroke="#5E6AD2" strokeWidth="1.5" />
          <path d="M7 17L17 7" stroke="#5E6AD2" strokeWidth="2" strokeLinecap="round" />
          <path d="M7 12L12 7" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 17L17 12" stroke="#5E6AD2" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'trello':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#0079BF" />
          <rect x="6" y="6" width="5" height="11" rx="1" fill="#FFFFFF" />
          <rect x="13" y="6" width="5" height="7" rx="1" fill="#FFFFFF" />
        </svg>
      );

    case 'jira':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 3L3 11.5L11.5 20L20 11.5L11.5 3Z" fill="#0052CC" />
          <path d="M11.5 3L8 6.5L12 10.5L15.5 7L11.5 3Z" fill="#2684FF" />
          <path d="M12 10.5L8.5 14L12 17.5L15.5 14L12 10.5Z" fill="#0052CC" />
        </svg>
      );

    case 'asana':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="7" r="3.5" fill="#F06A6A" />
          <circle cx="6.5" cy="16" r="3.5" fill="#F06A6A" />
          <circle cx="17.5" cy="16" r="3.5" fill="#F06A6A" />
        </svg>
      );

    case 'dropbox':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4L12 8L6 12L0 8L6 4Z" fill="#0061FF" />
          <path d="M18 4L24 8L18 12L12 8L18 4Z" fill="#0061FF" />
          <path d="M0 16L6 12L12 16L6 20L0 16Z" fill="#0061FF" />
          <path d="M24 16L18 12L12 16L18 20L24 16Z" fill="#0061FF" />
          <path d="M6 20L12 16L18 20L12 24L6 20Z" fill="#0061FF" />
        </svg>
      );

    case 'box':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#0061D5" />
          <path d="M8 8V16H12C14 16 15.5 14.5 15.5 12.5C15.5 10.5 14 9 12 9H8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'github':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );

    case 'gitlab':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.65 14.39L12 22.13L1.35 14.39C0.85 14.03 0.65 13.39 0.86 12.82L3.5 5.7C3.68 5.21 4.16 4.89 4.68 4.93C5.2 4.97 5.62 5.36 5.7 5.88L7.5 11.41H16.5L18.3 5.88C18.38 5.36 18.8 4.97 19.32 4.93C19.84 4.89 20.32 5.21 20.5 5.7L23.14 12.82C23.35 13.39 23.15 14.03 22.65 14.39Z" fill="#FC6D26" />
        </svg>
      );

    case 'hubspot':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4" fill="#FF7A59" />
          <circle cx="12" cy="4" r="2.5" fill="#FF7A59" />
          <circle cx="19.5" cy="8.5" r="2.5" fill="#FF7A59" />
          <path d="M12 6.5V8M16 10L17.5 9.5" stroke="#FF7A59" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'salesforce':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 10.5C19.2 8 17 6 14.3 6C13.2 6 12.1 6.4 11.3 7.1C10.5 5.8 9.1 5 7.5 5C5 5 3 7 3 9.5C3 9.8 3 10.1 3.1 10.4C1.9 11.1 1 12.4 1 14C1 16.2 2.8 18 5 18H19C21.2 18 23 16.2 23 14C23 12 21.5 10.8 19.5 10.5Z" fill="#00A1E0" />
        </svg>
      );

    case 'clickup':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 14L12 7L20 14" stroke="#7B68EE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="18" r="2" fill="#FF3366" />
        </svg>
      );

    case 'monday':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="4" height="12" rx="2" fill="#FF3D57" />
          <rect x="10" y="6" width="4" height="12" rx="2" fill="#FFCC00" />
          <rect x="16" y="6" width="4" height="12" rx="2" fill="#00CA72" />
        </svg>
      );

    case 'resend':
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="6" fill="#000000" />
          <path d="M7 9.5L12 13L17 9.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="5.5" y="7.5" width="13" height="9" rx="1.5" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
      );

    default:
      return (
        <svg style={style} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
  }
};
