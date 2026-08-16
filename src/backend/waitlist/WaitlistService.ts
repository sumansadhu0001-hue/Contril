// Contril AI OS - Waitlist Management Engine
import { supabaseAdmin } from '../database/supabaseAdmin';

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string;
  country: string;
  company: string;
  selectedPlan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  referenceId: string;
  notes?: string;
}

export class WaitlistService {
  // 1. Join waitlist (create a real crm_inquiry / plan_inquiry)
  public static async joinWaitlist(data: {
    email: string;
    name: string;
    country?: string;
    company?: string;
    selectedPlan?: string;
  }): Promise<WaitlistEntry> {
    try {
      const refId = `CTR-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data: inserted, error } = await supabaseAdmin
        .from('plan_inquiries')
        .insert({
          reference_id: refId,
          full_name: data.name,
          email: data.email,
          country: data.country || 'Global',
          company: data.company || 'Independent',
          selected_plan: data.selectedPlan || 'Pro',
          status: 'New'
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: inserted.id,
        email: inserted.email,
        name: inserted.full_name,
        country: inserted.country,
        company: inserted.company,
        selectedPlan: inserted.selected_plan,
        status: 'PENDING',
        createdAt: inserted.created_at,
        referenceId: inserted.reference_id
      };
    } catch (e: any) {
      console.error('[WaitlistService Error] joinWaitlist failure:', e.message || e);
      throw e;
    }
  }

  // 2. List real waitlist entries from PostgreSQL
  public static async listWaitlist(statusFilter?: string): Promise<WaitlistEntry[]> {
    try {
      let query = supabaseAdmin.from('plan_inquiries').select('*');
      
      if (statusFilter && statusFilter !== 'All') {
        const mappedStatus = statusFilter === 'PENDING' ? 'New' : statusFilter === 'APPROVED' ? 'Converted' : 'Rejected';
        query = query.eq('status', mappedStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        email: row.email,
        name: row.full_name,
        country: row.country || 'Global',
        company: row.company || 'Independent',
        selectedPlan: row.selected_plan || 'Pro',
        status: row.status === 'New' ? 'PENDING' : row.status === 'Converted' ? 'APPROVED' : 'REJECTED',
        createdAt: row.created_at,
        referenceId: row.reference_id,
        notes: row.notes
      }));
    } catch (e: any) {
      console.error('[WaitlistService Error] listWaitlist failure:', e.message || e);
      return [];
    }
  }

  // 3. Approve waitlist applicant & create real user context
  public static async approveWaitlistEntry(id: string, adminId = 'admin'): Promise<WaitlistEntry | null> {
    try {
      const { data: inquiry, error: fetchErr } = await supabaseAdmin
        .from('plan_inquiries')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !inquiry) return null;

      // Update waitlist/applicant status
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('plan_inquiries')
        .update({ status: 'Converted', assigned_to: adminId })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Create actual user account in PostgreSQL users table
      const { error: userErr } = await supabaseAdmin
        .from('users')
        .insert({
          email: inquiry.email,
          full_name: inquiry.full_name,
          role: 'user',
          is_active: true
        });

      if (userErr) {
        console.warn('[WaitlistService Warning] User creation skipped (user might already exist):', userErr.message);
      }

      // Log immutable security audit event
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          workspace_id: '00000000-0000-0000-0000-000000000000', // System-level workspace
          user_id: adminId === 'admin' ? '00000000-0000-0000-0000-000000000000' : adminId,
          user_email: inquiry.email,
          action: 'APPROVED_EARLY_ACCESS',
          target_resource: `user:${inquiry.email}`,
          role: 'super_admin',
          result: 'success',
          details: { referenceId: inquiry.reference_id, selectedPlan: inquiry.selected_plan }
        });

      return {
        id: updated.id,
        email: updated.email,
        name: updated.full_name,
        country: updated.country,
        company: updated.company,
        selectedPlan: updated.selected_plan,
        status: 'APPROVED',
        createdAt: updated.created_at,
        referenceId: updated.reference_id
      };
    } catch (e: any) {
      console.error('[WaitlistService Error] approveWaitlistEntry failure:', e.message || e);
      return null;
    }
  }

  // 4. Reject waitlist applicant
  public static async rejectWaitlistEntry(id: string, adminId = 'admin', reason = 'Does not meet target audience'): Promise<WaitlistEntry | null> {
    try {
      const { data: inquiry, error: fetchErr } = await supabaseAdmin
        .from('plan_inquiries')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !inquiry) return null;

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('plan_inquiries')
        .update({ status: 'Rejected', notes: `Rejected by ${adminId}: ${reason}` })
        .eq('id', id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      // Log immutable security audit event
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          workspace_id: '00000000-0000-0000-0000-000000000000',
          user_id: adminId === 'admin' ? '00000000-0000-0000-0000-000000000000' : adminId,
          user_email: inquiry.email,
          action: 'REJECTED_EARLY_ACCESS',
          target_resource: `user:${inquiry.email}`,
          role: 'super_admin',
          result: 'success',
          details: { referenceId: inquiry.reference_id, reason }
        });

      return {
        id: updated.id,
        email: updated.email,
        name: updated.full_name,
        country: updated.country,
        company: updated.company,
        selectedPlan: updated.selected_plan,
        status: 'REJECTED',
        createdAt: updated.created_at,
        referenceId: updated.reference_id,
        notes: updated.notes
      };
    } catch (e: any) {
      console.error('[WaitlistService Error] rejectWaitlistEntry failure:', e.message || e);
      return null;
    }
  }
}
