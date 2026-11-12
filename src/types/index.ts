export type DisputeCategory =
  | 'payment_not_received'
  | 'duplicate_payment'
  | 'refund_request'
  | 'order_not_confirmed'
  | 'incorrect_amount'
  | 'other_payment_issues';

export type ComplaintStatus =
  | 'submitted'
  | 'analyzing'
  | 'awaiting_merchant_approval'
  | 'approved'
  | 'refunded'
  | 'rejected'
  | 'escalated'
  | 'resolved';

export type RecommendedAction =
  | 'approve_full_refund'
  | 'approve_partial_refund'
  | 'verify_order_status'
  | 'request_more_information'
  | 'reject_claim'
  | 'escalate_to_tier2';

export interface Transaction {
  id: string; // Internal ID
  paypalTransactionId: string; // PayPal Capture ID / Tx ID (e.g. 8XX92841LL982142K)
  orderId?: string; // e.g. ORD-2026-9041
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentStatus: 'COMPLETED' | 'PENDING' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED';
  createdAt: string;
  paypalFee?: number;
  paymentMethod?: string;
  refundStatus?: 'NONE' | 'PENDING' | 'COMPLETED' | 'FAILED';
  refundedAmount?: number;
  paypalRefundId?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export interface AIAnalysis {
  id: string;
  complaintId: string;
  category: DisputeCategory;
  categoryLabel: string;
  summary: string;
  transactionReference: string;
  evidence: string[];
  missingInformation: string[];
  recommendedAction: RecommendedAction;
  recommendedActionLabel: string;
  reasoningSummary: string;
  confidence: number; // 0.0 - 1.0
  requiresMerchantApproval: boolean;
  customerResponse: string;
  policyComplianceScore?: number;
  createdAt: string;
  modelUsed?: string;
}

export interface Resolution {
  id: string;
  complaintId: string;
  merchantDecision: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'OVERRIDDEN';
  actionTaken: RecommendedAction | string;
  merchantNotes?: string;
  paypalRefundId?: string;
  refundAmount?: number;
  customerResponseSent?: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  executedAt?: string;
  decidedBy: string;
}

export interface AuditLog {
  id: string;
  complaintId: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface Complaint {
  id: string;
  trackingId: string; // e.g. RPC-84920
  customerName: string;
  customerEmail: string;
  transactionId?: string; // Matches a Transaction id or paypalTransactionId
  orderId?: string;
  description: string;
  category?: DisputeCategory;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIAnalysis;
  resolution?: Resolution;
  auditLogs?: AuditLog[];
  isDemo?: boolean;
}

export interface MerchantPolicy {
  storeName: string;
  returnWindowDays: number;
  allowRefundOnOrderFailure: boolean;
  duplicatePaymentWindowMinutes: number;
  autoEscalateAboveAmount: number;
  requireReturnForPhysicalGoods: boolean;
  policySummary: string;
}

export interface PayPalStatus {
  configured: boolean;
  mode: 'SANDBOX' | 'LIVE' | 'DEMO_SIMULATION';
  clientIdSet: boolean;
  baseUrl: string;
  lastChecked?: string;
}

export interface AnalyticsSummary {
  totalTransactions: number;
  totalVolume: number;
  totalDisputes: number;
  pendingResolutions: number;
  refundsProcessed: number;
  refundedVolume: number;
  disputeResolutionRate: number; // Percentage
  avgResolutionTimeMinutes: number;
  categoryBreakdown: { category: string; count: number; percentage: number }[];
  statusBreakdown: { status: string; count: number }[];
  resolutionTrends: { date: string; complaints: number; resolved: number; refunded: number }[];
}
