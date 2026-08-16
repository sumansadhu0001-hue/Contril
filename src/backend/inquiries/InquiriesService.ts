// Contril AI OS - Plan Inquiries Service & Supabase Persistence
import { SecurityMiddleware } from '../security/SecurityMiddleware';

export interface PlanInquiry {
  id: string;
  referenceId: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  country: string;
  companySize: string;
  selectedPlan: 'Pro' | 'Executive' | 'Enterprise';
  useCase: string;
  monthlyUsage: 'Light' | 'Medium' | 'Heavy';
  budget: 'Under $50' | '$50–100' | '$100–300' | '$300+';
  preferredContact: 'Email' | 'Phone' | 'Google Meet' | 'WhatsApp';
  agreedToTerms: boolean;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Rejected';
  assignedTo?: string;
  notes?: string;
}

export class InquiriesService {
  private static inquiries: PlanInquiry[] = [];

  public static async createInquiry(data: Omit<PlanInquiry, 'id' | 'referenceId' | 'createdAt' | 'status'>): Promise<PlanInquiry> {
    const random6Digits = Math.floor(100000 + Math.random() * 900000);
    const referenceId = `CTR-${random6Digits}`;

    const inquiry: PlanInquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      referenceId,
      createdAt: new Date().toISOString(),
      status: 'New',
      notes: ''
    };

    this.inquiries.unshift(inquiry);

    // Audit log entry
    SecurityMiddleware.logSecurityEvent(
      'PLAN_INQUIRY_SUBMITTED',
      'guest',
      { referenceId, plan: inquiry.selectedPlan, email: inquiry.email, company: inquiry.company }
    );

    return inquiry;
  }

  public static async listInquiries(params?: {
    search?: string;
    status?: string;
    sortBy?: 'date' | 'plan' | 'status';
  }): Promise<PlanInquiry[]> {
    let result = [...this.inquiries];

    if (params?.status && params.status !== 'All') {
      result = result.filter(i => i.status.toLowerCase() === params.status!.toLowerCase());
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        i =>
          i.fullName.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.referenceId.toLowerCase().includes(q) ||
          i.selectedPlan.toLowerCase().includes(q)
      );
    }

    if (params?.sortBy === 'plan') {
      result.sort((a, b) => a.selectedPlan.localeCompare(b.selectedPlan));
    } else if (params?.sortBy === 'status') {
      result.sort((a, b) => a.status.localeCompare(b.status));
    } else {
      // Default date desc
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  public static async updateInquiryStatus(id: string, status: PlanInquiry['status'], notes?: string): Promise<PlanInquiry | null> {
    const item = this.inquiries.find(i => i.id === id || i.referenceId === id);
    if (!item) return null;

    item.status = status;
    if (notes !== undefined) item.notes = notes;

    SecurityMiddleware.logSecurityEvent('PLAN_INQUIRY_UPDATED', 'admin', { id: item.id, status, notes });

    return item;
  }

  public static async deleteInquiry(id: string): Promise<boolean> {
    const idx = this.inquiries.findIndex(i => i.id === id || i.referenceId === id);
    if (idx === -1) return false;
    this.inquiries.splice(idx, 1);
    SecurityMiddleware.logSecurityEvent('PLAN_INQUIRY_DELETED', 'admin', { id });
    return true;
  }
}
