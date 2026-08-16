import { EmailItem, MeetingItem, DocumentItem, DecisionItem, AutoCompletedTask } from '../types';

export const demoEmails: EmailItem[] = [
  {
    id: 'em-demo-001',
    sender: 'Elena Rostova',
    senderEmail: 'elena@novacore.io',
    subject: 'Operational Agreement & Legal Review',
    preview: 'Hi Team, I have reviewed the Operational Agreement for the joint venture. Most clauses look standard but we should double check Section 4.2 on intellectual property transfer.',
    time: '09:42 AM',
    category: 'urgent',
    draftReply: 'Thanks Elena. I will review Section 4.2 with our intellectual property counsel and get back to you by 3:00 PM.'
  },
  {
    id: 'em-demo-002',
    sender: 'Marcus Vance',
    senderEmail: 'marcus@northbridge.ai',
    subject: 'Financial Model Updates & Q3 Budget Allocation',
    preview: 'Alex, attached is the revised financial plan. We increased marketing spend by 12% to accelerate acquisition. Revenue forecast is updated accordingly.',
    time: '08:15 AM',
    category: 'vip',
    draftReply: 'Excellent work Marcus. The 12% adjustment aligns with our board goals. Let\'s proceed with the signature routing.'
  },
  {
    id: 'em-demo-003',
    sender: 'Olivia Bennett',
    senderEmail: 'olivia@atlas.ai',
    subject: 'Q3 Product Roadmap Review',
    preview: 'Hey Alex, do you have 10 minutes before the product sync? I want to make sure the AI Orchestration layer priorities are locked before we present to engineering.',
    time: 'Yesterday',
    category: 'action'
  }
];

export const demoMeetings: MeetingItem[] = [
  {
    id: 'mt-demo-001',
    title: 'NorthBridge Board Sync',
    time: '11:00 AM - 11:45 AM',
    platform: 'Google Meet',
    status: 'Upcoming',
    attendees: ['Alex Morgan', 'Marcus Vance', 'Olivia Bennett'],
    summary: 'Quarterly board meeting to review operational metrics, financial performance, and AI roadmap adjustments.',
    decisions: ['Approved Q3 budget allocation and expansion milestones.', 'Validated legal compliance framework.'],
    actionItems: [
      { task: 'Send executive briefing summary to board', owner: 'Alex Morgan', deadline: 'Today', completed: false },
      { task: 'Process financial model updates', owner: 'Marcus Vance', deadline: 'Aug 12, 2026', completed: false }
    ]
  },
  {
    id: 'mt-demo-002',
    title: 'Acme Proposal legal review',
    time: '02:30 PM - 03:00 PM',
    platform: 'Google Meet',
    status: 'Upcoming',
    attendees: ['Alex Morgan', 'Elena Rostova'],
    summary: 'Reviewing key clauses in the Acme procurement agreement before sign-off.',
    decisions: [],
    actionItems: [
      { task: 'Approve pending procurement request', owner: 'Alex Morgan', deadline: 'Today', completed: false }
    ]
  }
];

export const demoDocuments: DocumentItem[] = [
  {
    id: 'doc-demo-001',
    name: 'Acme Procurement Agreement.pdf',
    fileType: 'PDF',
    size: '2.4 MB',
    uploadDate: 'Aug 05, 2026',
    status: 'Pending Legal Approval',
    summary: 'Standard procurement agreement outlining deliverables, SLA parameters, payment cycles, and indemnification for vendor operations.',
    risk: 'Low',
    keyDates: ['Effective Date: Aug 10, 2026', 'Termination Notice: 30 Days'],
    clauses: [
      { title: 'Section 4: Indemnification', risk: 'low', text: 'Standard vendor indemnification against third party IP claims.', riskLevel: 'Low' },
      { title: 'Section 9: Payment Terms', risk: 'medium', text: 'Net-45 payment schedule upon validation of deliverables.', riskLevel: 'Medium' }
    ]
  },
  {
    id: 'doc-demo-002',
    name: 'Q3 Financial Forecast.xlsx',
    fileType: 'XLSX',
    size: '15.8 MB',
    uploadDate: 'Aug 04, 2026',
    status: 'Finalized',
    summary: 'Comprehensive spreadsheet detailing revenue trends, cost allocation, growth targets, and MRR forecasts across product segments.',
    risk: 'Low',
    financials: [
      { item: 'Current MRR', value: '₹42,15,000' },
      { item: 'Q3 Forecast Target', value: '₹50,00,000' }
    ]
  }
];

export const demoDecisions: DecisionItem[] = [
  {
    id: 'dec-demo-001',
    title: 'Operational Agreement sign-off',
    subtitle: 'Joint Venture Contract Review',
    category: 'Legal',
    status: 'Pending Approval',
    description: 'Verify operational agreement sections before official signature routing.',
    recommendation: 'Approved for signature. Section 4.2 has been validated by counsel.',
    legalStatus: 'Passed',
    financeStatus: 'Passed',
    riskLevel: 'Low',
    aiRecommendation: 'APPROVE',
    confidenceScore: 98,
    summary: 'Operational agreement between NovaCore and NorthBridge AI, establishing terms of the strategic partner venture.',
    financialImpact: 'Est. Revenue Increase of 12% in Q3',
    details: {
      keyClauses: [
        'Section 4.2: Intellectual Property remains vested in Contril Core Platform.',
        'Section 7.1: Termination clause standard Net-90 notice period.'
      ],
      requestedBy: 'Elena Rostova (CLO)',
      highlights: [
        'Validated legal compliance framework with zero high-risk clauses.'
      ]
    }
  }
];

export const demoTasks: AutoCompletedTask[] = [
  {
    id: 'task-demo-001',
    time: '10:15 AM',
    category: 'Gmail Agent',
    title: 'Inbox summarized',
    detail: 'Categorized 5 priority threads; flagged operational agreement for review.'
  },
  {
    id: 'task-demo-002',
    time: '10:12 AM',
    category: 'Calendar Agent',
    title: 'Calendar audited',
    detail: 'Synced NorthBridge Board meeting; prepared meeting intelligence pack.'
  }
];
