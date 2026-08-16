import fetch from 'node-fetch';

export interface SearchResultItem {
  source: 'Gmail' | 'Google Calendar' | 'Google Drive' | 'Google Docs' | 'Slack' | 'GitHub';
  type: string;
  title: string;
  snippet: string;
  link?: string;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResultItem[];
  scannedCount: number;
  sourcesSearched: string[];
  skippedSources: string[];
}

// 1. Mock Datasets for Demo/Offline Mode
const MOCK_EMAILS = [
  {
    id: 'msg-1',
    from: 'sarah.jenkins@sequoiacap.com',
    to: 'alex.morgan@contril.ai',
    subject: 'Series B Term Sheet Draft - Contril',
    snippet: 'Hi Alex, attached is the revised draft of the Series B term sheet. Let us finalize the valuation cap before Monday.',
    date: '2026-08-05'
  },
  {
    id: 'msg-2',
    from: 'elena.rostova@contril.ai',
    to: 'alex.morgan@contril.ai',
    subject: 'Operational SLA Agreement & Vendor Invoices',
    snippet: 'Hi Alex, I have uploaded the Q2 vendor invoice (Q2_Vendor_Invoice.pdf) to our Google Drive. Let me know when you approve.',
    date: '2026-08-04'
  },
  {
    id: 'msg-3',
    from: 'billing@airtel.com',
    to: 'alex.morgan@contril.ai',
    subject: 'Your Airtel Monthly Invoice Statement',
    snippet: 'Dear Customer, your Airtel fiber bill is ready. Total due: Rs 1,199. Due date: August 15, 2026.',
    date: '2026-08-01'
  }
];

const MOCK_CALENDAR = [
  {
    id: 'event-1',
    title: 'Series B Budget Alignment',
    time: '2026-08-10T10:00:00Z',
    platform: 'Google Meet',
    attendees: 'Sarah Jenkins, Marcus Vance'
  },
  {
    id: 'event-2',
    title: 'Product Roadmap Sync',
    time: '2026-08-12T14:30:00Z',
    platform: 'Google Meet',
    attendees: 'Elena Rostova'
  }
];

const MOCK_DRIVE = [
  {
    id: 'file-1',
    name: 'Q2_Vendor_Invoice.pdf',
    type: 'pdf',
    owner: 'Elena Rostova',
    snippet: 'Invoice details for vendor payments, total amount Rs 4,50,000.',
    link: '#docs'
  },
  {
    id: 'file-2',
    name: 'Contril_Product_Roadmap_2026.gdoc',
    type: 'gdoc',
    owner: 'Alex Morgan',
    snippet: 'Product design, feature specification, and launch milestones for Contril AI OS.',
    link: '#docs'
  },
  {
    id: 'file-3',
    name: 'Samsung_Partnership_Agreement.pdf',
    type: 'pdf',
    owner: 'Elena Rostova',
    snippet: 'Co-development contract draft with Samsung Mobile division.',
    link: '#docs'
  }
];

const MOCK_SLACK = [
  {
    id: 'slack-1',
    channel: '#engineering',
    user: 'Elena Rostova',
    snippet: 'Hey team, did anyone upload the latest invoice.pdf to the shared drive? Alex needs it.',
    timestamp: '2026-08-04T09:00:00Z'
  }
];

const MOCK_GITHUB = [
  {
    id: 'issue-1',
    repo: 'contril-core',
    title: 'Fix PKCE callback redirect loop bug',
    snippet: 'Issue #412: Redirecting to landing page on successful Supabase exchange. Status: Open',
    link: 'https://github.com/contril/contril-core/issues/412'
  }
];

/**
 * Unified Workspace Search across Google, Slack, and GitHub
 */
export async function searchWorkspace(
  query: string,
  connectedApps: string[] = [],
  googleAccessToken?: string
): Promise<SearchResponse> {
  const normalized = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];
  const sourcesSearched: string[] = [];
  const skippedSources: string[] = [];
  let scannedCount = 0;

  const isLiveGoogle = googleAccessToken && !googleAccessToken.startsWith('demo_');

  // Helper to check match
  const textMatches = (fields: (string | undefined)[]) => {
    return fields.some(f => f && f.toLowerCase().includes(normalized));
  };

  // 1. Gmail Search
  if (connectedApps.includes('gmail')) {
    sourcesSearched.push('Gmail');
    if (isLiveGoogle) {
      try {
        const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=5`, {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });
        if (res.ok) {
          const list = await res.json() as any;
          const messages = list.messages || [];
          scannedCount += messages.length;
          for (const msg of messages.slice(0, 5)) {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${googleAccessToken}` }
            });
            if (detailRes.ok) {
              const detail = await detailRes.json() as any;
              const subjectHeader = detail.payload?.headers?.find((h: any) => h.name?.toLowerCase() === 'subject');
              const fromHeader = detail.payload?.headers?.find((h: any) => h.name?.toLowerCase() === 'from');
              results.push({
                source: 'Gmail',
                type: 'Email',
                title: subjectHeader?.value || 'No Subject',
                snippet: detail.snippet || '',
                metadata: { from: fromHeader?.value || '' }
              });
            }
          }
        }
      } catch (err) {
        console.error('[Workspace Search] Live Gmail search failed:', err);
      }
    } else {
      // Fallback Search
      scannedCount += MOCK_EMAILS.length;
      MOCK_EMAILS.forEach(email => {
        if (textMatches([email.from, email.to, email.subject, email.snippet])) {
          results.push({
            source: 'Gmail',
            type: 'Email',
            title: email.subject,
            snippet: email.snippet,
            metadata: { from: email.from, date: email.date }
          });
        }
      });
    }
  } else {
    skippedSources.push('Gmail');
  }

  // 2. Google Calendar Search
  if (connectedApps.includes('google_calendar') || connectedApps.includes('gcal')) {
    sourcesSearched.push('Google Calendar');
    if (isLiveGoogle) {
      try {
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?q=${encodeURIComponent(query)}&maxResults=5`, {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });
        if (res.ok) {
          const data = await res.json() as any;
          const items = data.items || [];
          scannedCount += items.length;
          items.forEach((item: any) => {
            results.push({
              source: 'Google Calendar',
              type: 'Meeting',
              title: item.summary || 'No Title',
              snippet: `Scheduled at: ${item.start?.dateTime || item.start?.date}. Description: ${item.description || ''}`,
              metadata: { link: item.hangoutLink }
            });
          });
        }
      } catch (err) {
        console.error('[Workspace Search] Live Calendar search failed:', err);
      }
    } else {
      scannedCount += MOCK_CALENDAR.length;
      MOCK_CALENDAR.forEach(event => {
        if (textMatches([event.title, event.attendees])) {
          results.push({
            source: 'Google Calendar',
            type: 'Meeting',
            title: event.title,
            snippet: `Attendees: ${event.attendees}. Platform: ${event.platform}. Scheduled at: ${event.time}`,
            metadata: { platform: event.platform }
          });
        }
      });
    }
  } else {
    skippedSources.push('Google Calendar');
  }

  // 3. Google Drive / Docs Search
  if (connectedApps.includes('google_drive') || connectedApps.includes('gdrive') || connectedApps.includes('google_docs')) {
    sourcesSearched.push('Google Drive');
    sourcesSearched.push('Google Docs');
    if (isLiveGoogle) {
      try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(`name contains '${query}'`)}&maxResults=5`, {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });
        if (res.ok) {
          const data = await res.json() as any;
          const files = data.files || [];
          scannedCount += files.length;
          files.forEach((file: any) => {
            const isDoc = file.mimeType?.includes('document');
            results.push({
              source: isDoc ? 'Google Docs' : 'Google Drive',
              type: file.mimeType || 'File',
              title: file.name,
              snippet: `Owner: ${file.owners?.[0]?.displayName || 'Unknown'}. Created: ${file.createdTime || ''}`
            });
          });
        }
      } catch (err) {
        console.error('[Workspace Search] Live Drive search failed:', err);
      }
    } else {
      scannedCount += MOCK_DRIVE.length;
      MOCK_DRIVE.forEach(file => {
        if (textMatches([file.name, file.snippet, file.owner])) {
          results.push({
            source: file.type === 'gdoc' ? 'Google Docs' : 'Google Drive',
            type: file.type,
            title: file.name,
            snippet: `Owner: ${file.owner}. ${file.snippet}`,
            link: file.link
          });
        }
      });
    }
  } else {
    skippedSources.push('Google Drive');
    skippedSources.push('Google Docs');
  }

  // 4. Slack Search
  if (connectedApps.includes('slack')) {
    sourcesSearched.push('Slack');
    scannedCount += MOCK_SLACK.length;
    MOCK_SLACK.forEach(msg => {
      if (textMatches([msg.snippet, msg.channel, msg.user])) {
        results.push({
          source: 'Slack',
          type: 'Message',
          title: `Slack Message in ${msg.channel}`,
          snippet: `User ${msg.user}: "${msg.snippet}"`
        });
      }
    });
  } else {
    skippedSources.push('Slack');
  }

  // 5. GitHub Search
  if (connectedApps.includes('github')) {
    sourcesSearched.push('GitHub');
    scannedCount += MOCK_GITHUB.length;
    MOCK_GITHUB.forEach(issue => {
      if (textMatches([issue.repo, issue.title, issue.snippet])) {
        results.push({
          source: 'GitHub',
          type: 'Issue',
          title: `[${issue.repo}] ${issue.title}`,
          snippet: issue.snippet,
          link: issue.link
        });
      }
    });
  } else {
    skippedSources.push('GitHub');
  }

  return {
    results,
    scannedCount,
    sourcesSearched,
    skippedSources
  };
}
