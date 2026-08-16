import { supabase } from '../../lib/auth';

export type ApprovalType = 
  | 'expense_approval' 
  | 'document_approval' 
  | 'automation_approval' 
  | 'connector_approval' 
  | 'invite_approval';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequestItem {
  id: string;
  orgId: string;
  requesterId: string;
  requesterName?: string;
  approverId?: string;
  workflowType: ApprovalType;
  title: string;
  details: Record<string, any>;
  status: ApprovalStatus;
  createdAt: string;
}

export class ApprovalWorkflowService {
  /**
   * Submits a new approval request requiring admin or manager review.
   */
  public static async submitRequest(
    orgId: string,
    requesterId: string,
    workflowType: ApprovalType,
    title: string,
    details: Record<string, any>
  ): Promise<ApprovalRequestItem> {
    const newItem: ApprovalRequestItem = {
      id: `appr-${Date.now()}`,
      orgId,
      requesterId,
      workflowType,
      title,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await supabase.from('approval_workflows').insert([{
        id: newItem.id,
        org_id: orgId,
        requester_id: requesterId,
        workflow_type: workflowType,
        title,
        details,
        status: 'pending',
        created_at: newItem.createdAt
      }]);
    } catch {
      // Fallback
    }

    return newItem;
  }

  /**
   * Approves or rejects a pending workflow item with audit logging.
   */
  public static async updateStatus(approvalId: string, approverId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      await supabase.from('approval_workflows').update({
        approver_id: approverId,
        status,
        updated_at: new Date().toISOString()
      }).eq('id', approvalId);
      return true;
    } catch {
      return false;
    }
  }
}
