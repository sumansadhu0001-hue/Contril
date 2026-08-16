import { supabaseAdmin } from '../database/supabaseAdmin';
import { EncryptionHelper } from '../security/EncryptionHelper';

export class GoogleCalendarService {
  /**
   * Retrieve a valid access token, refreshing if necessary
   */
  private static async getAccessToken(workspaceId: string): Promise<string> {
    const { data: record, error } = await supabaseAdmin
      .from('connector_authorizations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('connector_id', 'google')
      .maybeSingle();

    if (error) throw error;
    if (!record) {
      throw new Error('Google Workspace integration is not connected.');
    }

    const expiry = record.expires_at ? new Date(record.expires_at).getTime() : 0;
    const now = Date.now();

    // Check if token is expired or expiring within 5 minutes
    if (now >= expiry - 300000) {
      console.log('[GoogleCalendarService] Access token expiring soon or expired. Refreshing...');
      if (!record.refresh_token_encrypted) {
        throw {
          code: 'GOOGLE_REAUTH_REQUIRED',
          provider: 'google_calendar',
          message: 'Google Calendar authorization has expired. Please reconnect Google Calendar.'
        };
      }

      const refreshToken = EncryptionHelper.decrypt(record.refresh_token_encrypted);
      const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

      if (!clientId || !clientSecret || clientId.includes('CONTRIL_') || clientSecret.includes('CONTRIL_')) {
        console.warn('[GoogleCalendarService] Missing client credentials. Simulating refreshed token.');
        const mockToken = 'mock_google_access_token_dev_refreshed_' + Date.now();
        await supabaseAdmin
          .from('connector_authorizations')
          .update({
            access_token_encrypted: EncryptionHelper.encrypt(mockToken),
            expires_at: new Date(Date.now() + 3600000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('workspace_id', workspaceId)
          .eq('connector_id', 'google');
        return mockToken;
      }

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const encryptedAccess = EncryptionHelper.encrypt(data.access_token);
        const expiresAtDate = new Date(Date.now() + (data.expires_in * 1000)).toISOString();

        const updatePayload: any = {
          access_token_encrypted: encryptedAccess,
          expires_at: expiresAtDate,
          status: 'authorized',
          updated_at: new Date().toISOString()
        };

        if (data.refresh_token) {
          updatePayload.refresh_token_encrypted = EncryptionHelper.encrypt(data.refresh_token);
        }

        await supabaseAdmin
          .from('connector_authorizations')
          .update(updatePayload)
          .eq('workspace_id', workspaceId)
          .eq('connector_id', 'google');

        return data.access_token;
      } else {
        const errText = await response.text();
        console.error('[GoogleCalendarService] Refresh token exchange failed:', errText);
        await supabaseAdmin
          .from('connector_authorizations')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('workspace_id', workspaceId)
          .eq('connector_id', 'google');
          
        throw {
          code: 'GOOGLE_REAUTH_REQUIRED',
          provider: 'google_calendar',
          message: 'Google Calendar authorization has expired. Please reconnect Google Calendar.'
        };
      }
    }

    const decryptedAccess = EncryptionHelper.decrypt(record.access_token_encrypted);
    if (!decryptedAccess) {
      throw new Error('Failed to decrypt access token.');
    }
    return decryptedAccess;
  }

  /**
   * Fetch calendar list
   */
  public static async getCalendarList(workspaceId: string): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);
    
    // In dev fallback mode
    if (token.startsWith('mock_')) {
      return [{ id: 'primary', summary: 'Primary Calendar (Dev Mode)', primary: true }];
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google Calendar API list returned status ${res.status}`);
    }
    const data = await res.json();
    return data.items || [];
  }

  /**
   * Fetch upcoming calendar events
   */
  public static async getUpcomingEvents(workspaceId: string, maxResults = 15): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return [
        {
          id: 'mock-1',
          summary: 'Sync Calendar Agendas & Objectives',
          description: 'Weekly team meeting to review design specs.',
          start: { dateTime: new Date().toISOString() },
          end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
          attendees: [{ email: 'suman@contril.ai', responseStatus: 'accepted' }],
          hangoutLink: 'https://meet.google.com/mock-meet-link'
        }
      ];
    }

    const nowIso = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(nowIso)}&maxResults=${maxResults}&orderBy=startTime&singleEvents=true`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google Calendar API events returned status ${res.status}`);
    }
    const data = await res.json();
    return data.items || [];
  }

  /**
   * Fetch events within date range
   */
  public static async getEventsByDateRange(workspaceId: string, start: Date, end: Date): Promise<any[]> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return [];
    }

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(start.toISOString())}&timeMax=${encodeURIComponent(end.toISOString())}&singleEvents=true&orderBy=startTime`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google Calendar API events returned status ${res.status}`);
    }
    const data = await res.json();
    return data.items || [];
  }

  /**
   * Get single event details
   */
  public static async getEvent(workspaceId: string, eventId: string): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: eventId, summary: 'Sample Mock Event' };
    }

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google Calendar API event returned status ${res.status}`);
    }
    return res.json();
  }

  /**
   * Create a new event
   */
  public static async createEvent(workspaceId: string, eventPayload: any): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: `mock-${Date.now()}`, ...eventPayload, status: 'confirmed' };
    }

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Calendar create event failed: ${err}`);
    }
    return res.json();
  }

  /**
   * Update an existing event
   */
  public static async updateEvent(workspaceId: string, eventId: string, eventPayload: any): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { id: eventId, ...eventPayload, status: 'confirmed' };
    }

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Calendar update event failed: ${err}`);
    }
    return res.json();
  }

  /**
   * Delete calendar event
   */
  public static async deleteEvent(workspaceId: string, eventId: string): Promise<any> {
    const token = await this.getAccessToken(workspaceId);

    if (token.startsWith('mock_')) {
      return { success: true };
    }

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google Calendar delete event failed: ${err}`);
    }
    return { success: true };
  }
}
