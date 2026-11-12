import {
  Complaint,
  Transaction,
  MerchantPolicy,
  PayPalStatus,
  AnalyticsSummary,
} from '../types/index.js';

export const api = {
  async getPayPalStatus(): Promise<PayPalStatus> {
    const res = await fetch('/api/paypal/status');
    if (!res.ok) throw new Error('Failed to fetch PayPal status');
    return res.json();
  },

  async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/analytics');
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  async getMerchantPolicy(): Promise<MerchantPolicy> {
    const res = await fetch('/api/merchant/policy');
    if (!res.ok) throw new Error('Failed to fetch merchant policy');
    return res.json();
  },

  async updateMerchantPolicy(policy: Partial<MerchantPolicy>): Promise<MerchantPolicy> {
    const res = await fetch('/api/merchant/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    if (!res.ok) throw new Error('Failed to update merchant policy');
    return res.json();
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async getTransaction(id: string): Promise<Transaction> {
    const res = await fetch(`/api/transactions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch transaction');
    return res.json();
  },

  async getComplaints(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Complaint[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/complaints?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  async getComplaint(id: string): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${id}`);
    if (!res.ok) throw new Error('Failed to fetch complaint');
    return res.json();
  },

  async submitComplaint(data: {
    customerName: string;
    customerEmail: string;
    transactionId?: string;
    orderId?: string;
    description: string;
  }): Promise<Complaint> {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return res.json();
  },

  async reanalyzeComplaint(id: string): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${id}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to analyze complaint');
    }
    return res.json();
  },

  async approveComplaint(
    id: string,
    data: { merchantNotes?: string; customCustomerResponse?: string }
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve resolution');
    }
    return res.json();
  },

  async rejectComplaint(
    id: string,
    data: { rejectionReason: string; customCustomerResponse?: string }
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject complaint');
    }
    return res.json();
  },

  async escalateComplaint(
    id: string,
    data: { escalationNotes: string }
  ): Promise<Complaint> {
    const res = await fetch(`/api/complaints/${id}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to escalate complaint');
    }
    return res.json();
  },

  async resetDemo(): Promise<void> {
    const res = await fetch('/api/demo/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
  },
};
