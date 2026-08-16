import { EmailItem, MeetingItem, DocumentItem, ActionItem } from '../types';
import { saveGmailMessagesToSupabase, saveCalendarEventsToSupabase, saveDriveFilesToSupabase } from './supabaseService';

export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/documents.readonly'
].join(' ');

export interface GoogleTokens {
  accessToken: string;
  expiresAt: number;
  refreshToken?: string;
  email?: string;
  scopes?: string[];
}

let inMemoryTokens: GoogleTokens | null = null;

export async function getGoogleAccessToken(): Promise<string | null> {
  if (inMemoryTokens && inMemoryTokens.accessToken && Date.now() < inMemoryTokens.expiresAt - 300000) {
    return inMemoryTokens.accessToken;
  }

  try {
    const sessionUserStr = localStorage.getItem('contril_session_user');
    const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';
    if (!token) return null;

    const res = await fetch('/api/v1/integrations/google/sync', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.accessToken) {
        inMemoryTokens = {
          accessToken: data.accessToken,
          expiresAt: Date.now() + 3600000
        };
        return data.accessToken;
      }
    }
  } catch (err) {
    console.error('[Google API Proxy] Failed to retrieve fresh access token from backend:', err);
  }
  return null;
}

export function getStoredGoogleTokens(): GoogleTokens | null {
  return inMemoryTokens;
}

export function saveGoogleTokens(tokens: GoogleTokens) {
  inMemoryTokens = tokens;
  
  const sessionUserStr = localStorage.getItem('contril_session_user');
  const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';
  if (!token) return;

  fetch('/api/v1/integrations/google/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      email: tokens.email,
      scopes: tokens.scopes
    })
  }).then(res => {
    if (res.ok) {
      console.log('[Google Token Sync] Persisted tokens to backend database.');
    }
  }).catch(err => {
    console.error('[Google Token Sync Error] Failed to send tokens to backend:', err);
  });
}

export function clearGoogleTokens() {
  inMemoryTokens = null;

  const sessionUserStr = localStorage.getItem('contril_session_user');
  const token = sessionUserStr ? JSON.parse(sessionUserStr).token : '';
  if (!token) return;

  fetch('/api/v1/integrations/google/disconnect', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).catch(err => console.error('Failed to notify backend of Google disconnect:', err));
}

export function isGoogleTokenValid(tokens: GoogleTokens | null): boolean {
  if (!tokens || !tokens.accessToken) return false;
  return Date.now() < (tokens.expiresAt - 300000);
}

/**
 * 1. LIVE GMAIL API FETCHING
 */
export async function fetchLiveGmailMessages(accessTokenParam?: string, userId?: string): Promise<EmailItem[]> {
  try {
    let accessToken = accessTokenParam || await getGoogleAccessToken();
    if (!accessToken) return [];

    console.info('Gmail message list request starting...', {
      url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15',
      accessTokenPreview: accessToken ? `${accessToken.substring(0, 10)}...` : 'NONE'
    });

    let listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // 401 Silent Retry exchange
    if (listRes.status === 401) {
      console.warn('[Google API Client] Received 401 from Gmail API. Forcing background token renewal...');
      inMemoryTokens = null;
      accessToken = await getGoogleAccessToken();
      if (accessToken) {
        listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    if (!listRes.ok) {
      console.error('Gmail message list request failed:', { status: listRes.status, statusText: listRes.statusText });
      return [];
    }

    const listData = await listRes.json();
    console.info('Gmail message list response received:', {
      status: listRes.status,
      ok: listRes.ok,
      messageCount: listData?.messages?.length || 0,
      resultSizeEstimate: listData?.resultSizeEstimate
    });

    if (!listData.messages || !Array.isArray(listData.messages)) {
      console.info('No messages array returned from Gmail message list response');
      return [];
    }

    const emailItems: EmailItem[] = [];
    const supabaseMessages: any[] = [];

    for (const msgRef of listData.messages.slice(0, 10)) {
      try {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgRef.id}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!detailRes.ok) continue;

        const detail = await detailRes.json();
        const headers: any[] = detail.payload?.headers || [];

        const subjectHeader = headers.find((h: any) => h.name?.toLowerCase() === 'subject');
        const fromHeader = headers.find((h: any) => h.name?.toLowerCase() === 'from');
        const dateHeader = headers.find((h: any) => h.name?.toLowerCase() === 'date');

        const rawFrom = fromHeader ? fromHeader.value : 'Unknown Sender';
        let senderName = rawFrom;
        let senderEmail = rawFrom;

        if (rawFrom.includes('<')) {
          const parts = rawFrom.split('<');
          senderName = parts[0].trim().replace(/^"|"$/g, '');
          senderEmail = parts[1].replace('>', '').trim();
        }

        const isUnread = detail.labelIds?.includes('UNREAD') ?? false;
        const isStarred = detail.labelIds?.includes('STARRED') ?? false;
        const dateObj = dateHeader ? new Date(dateHeader.value) : new Date();
        const formattedTime = isNaN(dateObj.getTime()) ? 'Recently' : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const emailCategory: 'urgent' | 'action' | 'vip' | 'low' = isUnread ? 'urgent' : isStarred ? 'vip' : 'action';

        const emailItem: EmailItem = {
          id: detail.id,
          sender: senderName || 'Gmail Sender',
          senderEmail: senderEmail || 'sender@gmail.com',
          subject: subjectHeader ? subjectHeader.value : '(No Subject)',
          preview: detail.snippet || 'No email content preview available.',
          time: formattedTime,
          category: emailCategory,
          draftReply: `Hi ${senderName.split(' ')[0]},\n\nThank you for your email regarding "${subjectHeader?.value || 'this topic'}". I have received it and will follow up shortly.\n\nBest regards,`
        };

        emailItems.push(emailItem);

        if (userId) {
          supabaseMessages.push({
            id: detail.id,
            user_id: userId,
            sender: senderName,
            sender_email: senderEmail,
            subject: subjectHeader ? subjectHeader.value : '(No Subject)',
            preview: detail.snippet || '',
            category: emailCategory,
            received_time: dateObj.toISOString(),
            is_unread: isUnread,
            is_starred: isStarred
          });
        }
      } catch (err) {
        console.error('Error fetching detail for message', msgRef.id, err);
      }
    }

    if (userId && supabaseMessages.length > 0) {
      saveGmailMessagesToSupabase(userId, supabaseMessages).catch(() => {});
    }

    return emailItems;
  } catch (err) {
    console.error('Error fetching Gmail messages:', err);
    return [];
  }
}

/**
 * 2. LIVE GOOGLE CALENDAR API FETCHING
 */
export async function fetchLiveCalendarEvents(accessTokenParam?: string, userId?: string): Promise<MeetingItem[]> {
  try {
    let accessToken = accessTokenParam || await getGoogleAccessToken();
    if (!accessToken) return [];

    const nowIso = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&maxResults=10&orderBy=startTime&singleEvents=true`;

    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.status === 401) {
      console.warn('[Google API Client] Received 401 from Calendar API. Retrying...');
      inMemoryTokens = null;
      accessToken = await getGoogleAccessToken();
      if (accessToken) {
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    const meetingItems: MeetingItem[] = [];
    const supabaseEvents: any[] = [];

    for (const item of data.items) {
      const startDateTime = item.start?.dateTime || item.start?.date;
      const endDateTime = item.end?.dateTime || item.end?.date;
      
      const startDateObj = startDateTime ? new Date(startDateTime) : new Date();
      const formattedTime = isNaN(startDateObj.getTime()) ? 'Today' : startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const attendeeNames = item.attendees && Array.isArray(item.attendees)
        ? item.attendees.map((a: any) => a.displayName || a.email?.split('@')[0] || 'Attendee')
        : [];

      const meetLink = item.hangoutLink || item.htmlLink || 'https://meet.google.com';

      const actionItems: ActionItem[] = [
        { task: 'Prepare briefing notes before session', owner: 'Executive Assistant', completed: false }
      ];

      const meeting: MeetingItem = {
        id: item.id,
        title: item.summary || 'Google Calendar Meeting',
        time: formattedTime,
        attendees: attendeeNames,
        summary: item.description || `Scheduled event with ${attendeeNames.length} participants.`,
        decisions: ['Sync calendar agendas & objectives'],
        actionItems
      };

      meetingItems.push(meeting);

      if (userId) {
        supabaseEvents.push({
          id: item.id,
          user_id: userId,
          title: item.summary || 'Calendar Meeting',
          time: formattedTime,
          location: item.location || '',
          meet_link: meetLink,
          attendees: attendeeNames,
          start_time: startDateObj.toISOString(),
          end_time: endDateTime ? new Date(endDateTime).toISOString() : startDateObj.toISOString()
        });
      }
    }

    if (userId && supabaseEvents.length > 0) {
      saveCalendarEventsToSupabase(userId, supabaseEvents).catch(() => {});
    }

    return meetingItems;
  } catch (err) {
    console.error('Error fetching Google Calendar events:', err);
    return [];
  }
}

/**
 * 3. LIVE GOOGLE DRIVE API FETCHING
 */
export async function fetchLiveDriveFiles(accessTokenParam?: string, userId?: string): Promise<DocumentItem[]> {
  try {
    let accessToken = accessTokenParam || await getGoogleAccessToken();
    if (!accessToken) return [];

    const url = `https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime,size,owners,webViewLink,shared)&orderBy=modifiedTime%20desc`;

    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.status === 401) {
      console.warn('[Google API Client] Received 401 from Drive API. Retrying...');
      inMemoryTokens = null;
      accessToken = await getGoogleAccessToken();
      if (accessToken) {
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (!data.files || !Array.isArray(data.files)) {
      return [];
    }

    const docs: DocumentItem[] = [];
    const supabaseFiles: any[] = [];

    for (const file of data.files) {
      const modDate = file.modifiedTime ? new Date(file.modifiedTime) : new Date();
      const timeStr = isNaN(modDate.getTime()) ? 'Recently' : modDate.toLocaleDateString();

      const docItem: DocumentItem = {
        id: file.id,
        name: file.name,
        fileType: file.mimeType?.includes('document') ? 'Google Doc' : file.mimeType?.includes('spreadsheet') ? 'Google Sheet' : 'Drive File',
        size: file.size ? `${Math.round(file.size / 1024)} KB` : 'Cloud File',
        uploadDate: timeStr,
        summary: `Indexed Google Drive document. Shared: ${file.shared ? 'Yes' : 'Private'}.`,
        risk: 'Low'
      };

      docs.push(docItem);

      if (userId) {
        supabaseFiles.push({
          id: file.id,
          user_id: userId,
          title: file.name,
          mime_type: file.mimeType || 'application/octet-stream',
          file_size: file.size ? `${Math.round(file.size / 1024)} KB` : 'Cloud File',
          modified_time: modDate.toISOString(),
          shared_with: file.owners?.[0]?.displayName || 'Me',
          web_view_link: file.webViewLink || ''
        });
      }
    }

    if (userId && supabaseFiles.length > 0) {
      saveDriveFilesToSupabase(userId, supabaseFiles).catch(() => {});
    }

    return docs;
  } catch (err) {
    console.error('Error fetching Google Drive files:', err);
    return [];
  }
}

/**
 * 4. LIVE GOOGLE DOCS API FETCHING
 */
export async function fetchLiveGoogleDocContent(accessTokenParam?: string, docId?: string): Promise<string | null> {
  try {
    if (!docId) return null;
    let accessToken = accessTokenParam || await getGoogleAccessToken();
    if (!accessToken) return null;

    const url = `https://docs.googleapis.com/v1/documents/${docId}`;
    let res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (res.status === 401) {
      console.warn('[Google API Client] Received 401 from Docs API. Retrying...');
      inMemoryTokens = null;
      accessToken = await getGoogleAccessToken();
      if (accessToken) {
        res = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    }

    if (!res.ok) return null;

    const data = await res.json();
    let text = '';

    if (data.body?.content) {
      for (const element of data.body.content) {
        if (element.paragraph?.elements) {
          for (const pe of element.paragraph.elements) {
            if (pe.textRun?.content) {
              text += pe.textRun.content;
            }
          }
        }
      }
    }

    return text || null;
  } catch (err) {
    console.error('Error fetching Google Doc content:', err);
    return null;
  }
}
