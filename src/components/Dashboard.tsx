import React, { useState } from 'react';
import {
  CreditCard,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Check,
  X,
} from 'lucide-react';
import { AnalyticsSummary, Complaint, Transaction } from '../types/index.js';

interface DashboardProps {
  analytics: AnalyticsSummary | null;
  complaints: Complaint[];
  transactions: Transaction[];
  onSelectComplaint: (id: string) => void;
  onNavigateToDisputes: () => void;
  onNavigateToTransactions: () => void;
  onSelectScenario: (scenarioNumber: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  analytics,
  complaints,
  transactions,
  onSelectComplaint,
  onNavigateToDisputes,
  onNavigateToTransactions,
  onSelectScenario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        c.trackingId.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Scenario Quick-Jump Strip */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
            <span>Demo Scenarios (PayPal Sandbox Simulation)</span>
            <span className="text-xs bg-indigo-200/80 text-indigo-800 font-medium px-2 py-0.5 rounded">
              Interactive
            </span>
          </h3>
          <p className="text-xs text-indigo-700/80 mt-0.5">
            Click any scenario below to immediately load and evaluate its transaction and dispute workflow:
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectScenario(1)}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            1: Order Not Confirmed ($50)
          </button>
          <button
            onClick={() => onSelectScenario(2)}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            2: Eligible Return ($149.99)
          </button>
          <button
            onClick={() => onSelectScenario(3)}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            3: Duplicate Charge ($28.50)
          </button>
          <button
            onClick={() => onSelectScenario(4)}
            className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-indigo-600 hover:text-white text-indigo-900 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            4: Out-of-Policy ($320)
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (Calculated directly from actual records) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Transactions</span>
            <CreditCard className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {analytics?.totalTransactions ?? 0}
          </div>
          <p className="text-xs text-slate-500 font-mono tabular-nums">
            ${analytics?.totalVolume?.toFixed(2) ?? '0.00'} USD volume
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Disputes</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {analytics?.totalDisputes ?? 0}
          </div>
          <p className="text-xs text-slate-500">
            {complaints.filter((c) => c.isDemo).length} seeded demo cases
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 font-mono tabular-nums">
            {analytics?.pendingResolutions ?? 0}
          </div>
          <p className="text-xs text-indigo-600/80 font-medium">
            Requires merchant sign-off
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Refunds Executed</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {analytics?.refundsProcessed ?? 0}
          </div>
          <p className="text-xs text-emerald-600 font-mono tabular-nums">
            ${analytics?.refundedVolume?.toFixed(2) ?? '0.00'} returned
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Resolution Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {analytics?.disputeResolutionRate ?? 0}%
          </div>
          <p className="text-xs text-slate-500">
            From actual verified cases
          </p>
        </div>
      </div>

      {/* Main Grid: Pending Disputes & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Pending Complaints Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Disputes Requiring Attention
              </h2>
              <p className="text-xs text-slate-500">
                AI has classified claims and recommended actions awaiting your approval.
              </p>
            </div>
            <button
              onClick={onNavigateToDisputes}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Open Dispute Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filters */}
          <div className="p-3 bg-slate-50/60 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tracking ID, customer, or issue..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('awaiting_merchant_approval')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  statusFilter === 'awaiting_merchant_approval'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending Approval
              </button>
              <button
                onClick={() => setStatusFilter('refunded')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  statusFilter === 'refunded'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Refunded
              </button>
            </div>
          </div>

          {/* Disputes List */}
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[460px]">
            {filteredComplaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No disputes matching current filter criteria.
              </div>
            ) : (
              filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c.id)}
                  className="p-4 hover:bg-slate-50/70 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900">
                        {c.trackingId}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-medium text-slate-700">{c.customerName}</span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${
                        c.status === 'awaiting_merchant_approval'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : c.status === 'refunded'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : c.status === 'rejected'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {c.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    "{c.description}"
                  </p>

                  {c.aiAnalysis && (
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span>AI Rec: {c.aiAnalysis.recommendedActionLabel}</span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-400">
                        {(c.aiAnalysis.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: PayPal Sandbox Transactions Ledger (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                PayPal Sandbox Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Recent capture records & payment statuses.
              </p>
            </div>
            <button
              onClick={onNavigateToTransactions}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>All Transactions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[500px]">
            {transactions.slice(0, 6).map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-medium text-slate-900">
                      {tx.paypalTransactionId}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono tabular-nums font-bold ${
                      tx.paymentStatus === 'REFUNDED'
                        ? 'text-slate-400 line-through'
                        : 'text-slate-900'
                    }`}
                  >
                    ${tx.amount.toFixed(2)} {tx.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{tx.customerName}</span>
                  <span
                    className={`font-semibold ${
                      tx.paymentStatus === 'COMPLETED'
                        ? 'text-emerald-600'
                        : tx.paymentStatus === 'REFUNDED'
                        ? 'text-amber-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {tx.paymentStatus}
                  </span>
                </div>

                {tx.orderId && (
                  <div className="text-xs text-slate-400 font-mono">
                    Order Ref: {tx.orderId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
