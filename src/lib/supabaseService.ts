import { supabase, isSupabaseConfigured } from './auth';

export interface UserProfileRecord {
  id: string;
  full_name: string;
  avatar?: string;
  email: string;
  timezone: string;
  locale: string;
  created_at: string;
  last_login: string;
}

export interface GmailAccountRecord {
  user_id: string;
  email: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: number;
  unread_count: number;
  updated_at: string;
}

export interface GmailMessageRecord {
  id: string;
  user_id: string;
  sender: string;
  sender_email: string;
  subject: string;
  preview: string;
  category: string;
  received_time: string;
  is_unread: boolean;
  is_starred: boolean;
  raw_data?: any;
}

export interface CalendarEventRecord {
  id: string;
  user_id: string;
  title: string;
  time: string;
  location?: string;
  meet_link?: string;
  attendees: string[];
  start_time: string;
  end_time: string;
}

export interface DriveFileRecord {
  id: string;
  user_id: string;
  title: string;
  mime_type: string;
  file_size?: string;
  modified_time: string;
  shared_with?: string;
  web_view_link?: string;
}

export interface ActivityFeedRecord {
  id: string;
  user_id: string;
  time: string;
  timestamp: number;
  integration_id: string;
  integration_name: string;
  action: string;
  details: string;
  category: string;
}

export interface WorkspaceMemoryRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  snippet: string;
  tags: string[];
  created_at: string;
}

export interface AiConversationRecord {
  id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesRecord {
  user_id: string;
  workspace_type?: string;
  role_details?: any;
  updated_at: string;
}

/**
 * Ensures user profile is synced automatically to Supabase 'profiles' table on login
 */
export async function syncUserProfile(user: { id: string; email: string; name?: string; avatar?: string }) {
  if (!isSupabaseConfigured || !supabase) return;

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const locale = navigator.language || 'en-US';
  const now = new Date().toISOString();

  try {
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: user.name || user.email.split('@')[0],
      avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`,
      email: user.email,
      timezone,
      locale,
      created_at: now,
      last_login: now
    });
  } catch (err) {
    console.error('Error syncing profile to Supabase:', err);
  }
}

/**
 * Save Gmail messages to Supabase 'gmail_messages' table
 */
export async function saveGmailMessagesToSupabase(userId: string, messages: GmailMessageRecord[]) {
  if (!isSupabaseConfigured || !supabase || !messages.length) return;
  try {
    await supabase.from('gmail_messages').upsert(
      messages.map(m => ({ ...m, user_id: userId }))
    );
  } catch (err) {
    console.error('Error saving gmail messages to Supabase:', err);
  }
}

/**
 * Save Calendar events to Supabase 'calendar_events' table
 */
export async function saveCalendarEventsToSupabase(userId: string, events: CalendarEventRecord[]) {
  if (!isSupabaseConfigured || !supabase || !events.length) return;
  try {
    await supabase.from('calendar_events').upsert(
      events.map(e => ({ ...e, user_id: userId }))
    );
  } catch (err) {
    console.error('Error saving calendar events to Supabase:', err);
  }
}

/**
 * Save Drive files to Supabase 'drive_files' table
 */
export async function saveDriveFilesToSupabase(userId: string, files: DriveFileRecord[]) {
  if (!isSupabaseConfigured || !supabase || !files.length) return;
  try {
    await supabase.from('drive_files').upsert(
      files.map(f => ({ ...f, user_id: userId }))
    );
  } catch (err) {
    console.error('Error saving drive files to Supabase:', err);
  }
}

/**
 * Save Activity event to Supabase 'activity_feed'
 */
export async function saveActivityToSupabase(userId: string, activity: ActivityFeedRecord) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('activity_feed').insert({
      ...activity,
      user_id: userId
    });
  } catch (err) {
    console.error('Error saving activity to Supabase:', err);
  }
}

/**
 * Save Workspace Memory item to Supabase 'workspace_memory'
 */
export async function saveMemoryToSupabase(userId: string, memory: WorkspaceMemoryRecord) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('workspace_memory').insert({
      ...memory,
      user_id: userId
    });
  } catch (err) {
    console.error('Error saving memory item to Supabase:', err);
  }
}

/**
 * Fetch real activity feed from Supabase
 */
export async function fetchActivityFeedFromSupabase(userId: string): Promise<ActivityFeedRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (!error && data) return data as ActivityFeedRecord[];
  } catch (err) {
    console.error('Error fetching activity feed from Supabase:', err);
  }
  return [];
}

/**
 * Fetch real workspace memory from Supabase
 */
export async function fetchMemoryFromSupabase(userId: string): Promise<WorkspaceMemoryRecord[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('workspace_memory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) return data as WorkspaceMemoryRecord[];
  } catch (err) {
    console.error('Error fetching memory from Supabase:', err);
  }
  return [];
}
