import { supabaseAdmin } from '../database/supabaseAdmin';
import { EncryptionHelper } from '../security/EncryptionHelper';
import { OutlookAuthService } from './outlookAuthService';

export class OutlookCalendarService {
  /**
   * Retrieve a valid Microsoft Graph access token, refreshing if necessary
   */
  private static async getAccessToken(workspaceId: string): Promise<string> {
    const { data: record, error } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'microsoft_outlook')
      .maybeSingle();

    if (error) throw error;
    if (!record) {
      throw new Error('Microsoft Outlook integration is not connected.');
    }

    const expiry = record.expires_at ? new Date(record.expires_at).getTime() : 0;
    const now = Date.now();

    // Check if token is expired or expiring within 5 minutes
    if (now >= expiry - 300000) {
      console.log('[OutlookCalendarService] Microsoft access token expiring soon or expired. Refreshing...');
      if (!record.refresh_token_encrypted) {
        throw {
          code: 'MICROSOFT_REAUTH_REQUIRED',
          provider: 'microsoft_outlook',
          message: 'Microsoft Graph authorization has expired. Please reconnect Outlook Calendar.'
        };
      }

      const refreshToken = EncryptionHelper.decrypt(record.refresh_token_encrypted);
      const refreshed = await OutlookAuthService.refreshAccessToken(record.id, workspaceId, refreshToken);
      
      if (!refreshed) {
        throw {
          code: 'MICROSOFT_REAUTH_REQUIRED',
          provider: 'microsoft_outlook',
          message: 'Microsoft Graph authorization has expired. Please reconnect Outlook Calendar.'
        };
      }
      return refreshed;
    }

    const decryptedAccess = EncryptionHelper.decrypt(record.access_token_encrypted);
    if (!decryptedAccess) {
      throw new Error('Failed to decrypt Microsoft access token.');
    }
    return decryptedAccess;
  }

  /**
   * Fetch Microsoft Graph calendar list
   */
  public static async getCalendarList(workspaceId: string): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return [{ id: 'primary', name: 'Outlook Calendar (Dev Mode)', isDefault: true }];
    }

    const res = await fetch('https://graph.microsoft.com/v1.0/me/calendars', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph calendars returned status ${res.status}`);
    }
    const data = await res.json();
    return data.value || [];
  }

  /**
   * Fetch upcoming Outlook Calendar events
   */
  public static async getUpcomingEvents(workspaceId: string, maxResults = 15): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return [
        {
          id: 'mock-ms-1',
          subject: 'Review Microsoft Graph Specs',
          bodyPreview: 'Reviewing outlook calendar endpoints integration syncs.',
          start: { dateTime: new Date(Date.now() + 7200000).toISOString() },
          end: { dateTime: new Date(Date.now() + 10800000).toISOString() },
          attendees: [{ emailAddress: { address: 'suman@contril.ai', name: 'Suman Sadhu' } }],
          webLink: 'https://teams.microsoft.com/mock-teams-link'
        }
      ];
    }

    const startIso = new Date().toISOString();
    const endIso = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(); // Lookahead 30 days
    const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${encodeURIComponent(startIso)}&endDateTime=${encodeURIComponent(endIso)}&$top=${maxResults}&$orderBy=start/dateTime`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph calendarview returned status ${res.status}`);
    }
    const data = await res.json();
    return data.value || [];
  }

  /**
   * Fetch events by date range
   */
  public static async getEventsByDateRange(workspaceId: string, start: Date, end: Date): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return [];
    }

    const url = `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${encodeURIComponent(start.toISOString())}&endDateTime=${encodeURIComponent(end.toISOString())}&$orderBy=start/dateTime`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph calendarview range returned status ${res.status}`);
    }
    const data = await res.json();
    return data.value || [];
  }

  /**
   * Fetch single Outlook event details
   */
  public static async getEvent(workspaceId: string, eventId: string): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: eventId, subject: 'Sample MS Mock Event' };
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Microsoft Graph event detail returned status ${res.status}`);
    }
    return res.json();
  }

  /**
   * Create an event in Outlook Calendar
   */
  public static async createEvent(workspaceId: string, eventPayload: any): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: `mock-ms-${Date.now()}`, ...eventPayload };
    }

    const res = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Microsoft Graph create event failed: ${err}`);
    }
    return res.json();
  }

  /**
   * Update an event in Outlook Calendar
   */
  public static async updateEvent(workspaceId: string, eventId: string, eventPayload: any): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: eventId, ...eventPayload };
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Microsoft Graph update event failed: ${err}`);
    }
    return res.json();
  }

  /**
   * Delete an event from Outlook Calendar
   */
  public static async deleteEvent(workspaceId: string, eventId: string): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { success: true };
    }

    const res = await fetch(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Microsoft Graph delete event failed: ${err}`);
    }
    return { success: true };
  }
}
