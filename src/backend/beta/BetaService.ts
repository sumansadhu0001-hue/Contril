// Contril AI OS - Production Beta Access & Account Generation Engine
export interface BetaAccount {
  userId: string;
  username: string;
  email: string;
  tempPassword: string;
  plan: 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  expiryDate: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'DEACTIVATED';
  notes: string;
  reviewerName: string;
  activationCode: string;
  createdAt: string;
}

export class BetaService {
  private static betaAccounts = new Map<string, BetaAccount>([
    [
      'beta_001',
      {
        userId: 'usr_beta_001',
        username: 'alex_vc',
        email: 'alex@sequoia.com',
        tempPassword: 'temp_Pass9812#',
        plan: 'ENTERPRISE',
        expiryDate: '2026-12-31',
        status: 'ACTIVE',
        notes: 'Partner review account for Sequoia Board',
        reviewerName: 'Suman (CEO)',
        activationCode: 'CONTRIL-BETA-SEQ-9012',
        createdAt: new Date().toISOString()
      }
    ],
    [
      'beta_002',
      {
        userId: 'usr_beta_002',
        username: 'marcus_cfo',
        email: 'marcus@samsung.com',
        tempPassword: 'temp_Pass3341#',
        plan: 'BUSINESS',
        expiryDate: '2026-11-15',
        status: 'ACTIVE',
        notes: 'Samsung Strategic Alliance Team',
        reviewerName: 'Elena Rostova',
        activationCode: 'CONTRIL-BETA-SAM-4412',
        createdAt: new Date().toISOString()
      }
    ]
  ]);

  // Generate single or bulk beta accounts (50, 100, 500)
  public static generateBetaAccounts(params: {
    count: number;
    plan?: 'PRO' | 'BUSINESS' | 'ENTERPRISE';
    expiryDays?: number;
    notes?: string;
    reviewerName?: string;
  }): BetaAccount[] {
    const generated: BetaAccount[] = [];
    const count = Math.min(Math.max(params.count || 1, 1), 1000);
    const plan = params.plan || 'PRO';
    const days = params.expiryDays || 180;
    const reviewer = params.reviewerName || 'Contril Ops Admin';

    const expiryDate = new Date(Date.now() + days * 86400 * 1000).toISOString().split('T')[0];

    for (let i = 0; i < count; i++) {
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const userId = `usr_beta_${Date.now()}_${i}`;
      const username = `beta_user_${randomSuffix}`;
      const email = `beta.${randomSuffix}@contril.ai`;
      const tempPassword = `temp_${Math.random().toString(36).slice(-8)}!`;
      const activationCode = `CONTRIL-BETA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${randomSuffix}`;

      const account: BetaAccount = {
        userId,
        username,
        email,
        tempPassword,
        plan,
        expiryDate,
        status: 'ACTIVE',
        notes: params.notes || `Batch generated ${count} accounts on ${new Date().toLocaleDateString()}`,
        reviewerName: reviewer,
        activationCode,
        createdAt: new Date().toISOString()
      };

      this.betaAccounts.set(userId, account);
      generated.push(account);
    }

    return generated;
  }

  // Get all beta accounts
  public static listBetaAccounts(): BetaAccount[] {
    return Array.from(this.betaAccounts.values());
  }

  // Search & Filter
  public static searchBetaAccounts(query?: string, status?: string): BetaAccount[] {
    let list = this.listBetaAccounts();
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(a => a.email.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.activationCode.toLowerCase().includes(q));
    }
    if (status) {
      list = list.filter(a => a.status === status);
    }
    return list;
  }

  // Account operations
  public static updateAccountStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'DEACTIVATED'): BetaAccount | null {
    const acc = this.betaAccounts.get(userId);
    if (!acc) return null;
    acc.status = status;
    return acc;
  }

  public static extendExpiry(userId: string, days: number): BetaAccount | null {
    const acc = this.betaAccounts.get(userId);
    if (!acc) return null;
    const current = new Date(acc.expiryDate).getTime();
    acc.expiryDate = new Date(current + days * 86400 * 1000).toISOString().split('T')[0];
    acc.status = 'ACTIVE';
    return acc;
  }

  public static resetTempPassword(userId: string): BetaAccount | null {
    const acc = this.betaAccounts.get(userId);
    if (!acc) return null;
    acc.tempPassword = `temp_${Math.random().toString(36).slice(-8)}!`;
    return acc;
  }

  public static deleteAccount(userId: string): boolean {
    return this.betaAccounts.delete(userId);
  }

  // Export to CSV string format
  public static exportCSV(): string {
    const accounts = this.listBetaAccounts();
    const headers = ['User ID', 'Username', 'Email', 'Temp Password', 'Plan', 'Expiry Date', 'Status', 'Activation Code', 'Reviewer', 'Notes'];
    const rows = accounts.map(a => [
      a.userId, a.username, a.email, a.tempPassword, a.plan, a.expiryDate, a.status, a.activationCode, a.reviewerName, `"${a.notes.replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
