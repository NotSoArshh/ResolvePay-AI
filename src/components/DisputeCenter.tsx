import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  Clock,
  RotateCw,
  Send,
  Lock,
  FileText,
  User,
  CreditCard,
  Building,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Complaint, MerchantPolicy, Transaction } from '../types/index.js';
import { api } from '../lib/api.js';

interface DisputeCenterProps {
  complaints: Complaint[];
  selectedComplaintId: string | null;
  onSelectComplaint: (id: string) => void;
  policy: MerchantPolicy | null;
  onRefresh: () => void;
}

export const DisputeCenter: React.FC<DisputeCenterProps> = ({
  complaints,
  selectedComplaintId,
  onSelectComplaint,
  policy,
  onRefresh,
}) => {
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Filter state for the left queue
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load selected complaint details whenever selectedComplaintId changes
  React.useEffect(() => {
    const idToLoad = selectedComplaintId || complaints[0]?.id;
    if (idToLoad) {
      loadComplaint(idToLoad);
    }
  }, [selectedComplaintId, complaints]);

  async function loadComplaint(id: string) {
    setLoadingDetails(true);
    setFeedbackMessage(null);
    try {
      const data = await api.getComplaint(id);
      setActiveComplaint(data);
      setCustomResponse(data.aiAnalysis?.customerResponse || '');
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleReanalyze() {
    if (!activeComplaint) return;
    setAnalyzing(true);
    setFeedbackMessage(null);
    try {
      const updated = await api.reanalyzeComplaint(activeComplaint.id);
      setActiveComplaint(updated);
      setCustomResponse(updated.aiAnalysis?.customerResponse || '');
      setFeedbackMessage({
        type: 'success',
        text: 'AI evaluation successfully refreshed with latest policy parameters.',
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Failed to re-analyze complaint',
      });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleApprove() {
    if (!activeComplaint) return;
    setActionProcessing(true);
    setFeedbackMessage(null);
    try {
      const updated = await api.approveComplaint(activeComplaint.id, {
        merchantNotes: 'Authorized by merchant administrator.',
        customCustomerResponse: customResponse,
      });
      setActiveComplaint(updated);
      setApprovalModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Resolution approved! ${
          updated.resolution?.paypalRefundId
            ? `PayPal Sandbox refund executed (${updated.resolution.paypalRefundId}).`
            : 'Action recorded in audit ledger.'
        }`,
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Approval execution failed',
      });
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleReject() {
    if (!activeComplaint) return;
    setActionProcessing(true);
    setFeedbackMessage(null);
    try {
      const updated = await api.rejectComplaint(activeComplaint.id, {
        rejectionReason: rejectionReason || 'Dispute does not comply with merchant return policy.',
        customCustomerResponse: customResponse,
      });
      setActiveComplaint(updated);
      setRejectModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: 'Dispute closed and rejection rationale recorded.',
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Rejection failed',
      });
    } finally {
      setActionProcessing(false);
    }
  }

  async function handleEscalate() {
    if (!activeComplaint) return;
    setActionProcessing(true);
    try {
      const updated = await api.escalateComplaint(activeComplaint.id, {
        escalationNotes: 'Escalated to senior operations for manual carrier check.',
      });
      setActiveComplaint(updated);
      setFeedbackMessage({
        type: 'success',
        text: 'Case escalated to Tier-2 Operations team.',
      });
      onRefresh();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Escalation failed',
      });
    } finally {
      setActionProcessing(false);
    }
  }

  const filteredQueue = complaints.filter((c) => {
    if (statusFilter === 'pending') {
      if (c.status !== 'awaiting_merchant_approval' && c.status !== 'submitted') return false;
    } else if (statusFilter === 'resolved') {
      if (c.status !== 'refunded' && c.status !== 'resolved' && c.status !== 'rejected') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.trackingId.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tx = activeComplaint?.transactionId
    ? (activeComplaint as any).transaction
    : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>AI Dispute Resolution Center</span>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2.5 py-0.5 rounded-full">
              PayPal Sandbox Verified
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review Gemini 3.8 Flash structured deductions against real PayPal transactions & policy rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleReanalyze()}
            disabled={analyzing || !activeComplaint}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>Re-analyze with Gemini</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Dispute Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[780px]">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dispute Queue ({filteredQueue.length})
              </span>
              <span className="text-xs text-indigo-600 font-medium">Auto-synced</span>
            </div>

            {/* Status pills / segmented control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-colors cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`flex-1 py-1 rounded-md font-medium text-center transition-colors cursor-pointer ${
                  statusFilter === 'resolved'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved
              </button>
            </div>

            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {filteredQueue.map((item) => {
              const isSelected = activeComplaint?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectComplaint(item.id);
                    loadComplaint(item.id);
                  }}
                  className={`p-4 transition-colors cursor-pointer space-y-1.5 border-l-3 ${
                    isSelected
                      ? 'bg-indigo-50/50 border-l-indigo-600'
                      : 'hover:bg-slate-50/60 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">
                      {item.trackingId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        item.status === 'awaiting_merchant_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'refunded'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'rejected'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.customerName}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {item.description}
                  </p>

                  {item.aiAnalysis && (
                    <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-indigo-600 font-medium truncate max-w-[170px]">
                        {item.aiAnalysis.recommendedActionLabel}
                      </span>
                      <span className="font-mono tabular-nums">
                        {(item.aiAnalysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Comprehensive Case Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-[780px]">
          {loadingDetails ? (
            <div className="p-16 text-center text-xs text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p>Retrieving case ledger & PayPal Sandbox verification...</p>
            </div>
          ) : !activeComplaint ? (
            <div className="p-16 text-center text-xs text-slate-500">
              Select a dispute from the queue on the left to inspect details.
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Top Case Meta Bar */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-slate-900">
                      Case {activeComplaint.trackingId}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Opened {new Date(activeComplaint.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-900">
                      {activeComplaint.customerName}
                    </span>
                    <span>({activeComplaint.customerEmail})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                      activeComplaint.status === 'awaiting_merchant_approval'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : activeComplaint.status === 'refunded'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        : activeComplaint.status === 'rejected'
                        ? 'bg-rose-100 text-rose-900 border border-rose-200'
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                    }`}
                  >
                    STATUS: {activeComplaint.status.toUpperCase().replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Scrollable Inspector Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Customer Narrative */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customer Submitted Message</span>
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans">
                    "{activeComplaint.description}"
                  </div>
                  {activeComplaint.orderId && (
                    <div className="text-xs text-slate-500 font-mono">
                      Referenced Order: {activeComplaint.orderId}
                    </div>
                  )}
                </div>

                {/* 2. Verified PayPal Sandbox Transaction Box */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Verified PayPal Sandbox Capture Ledger</span>
                    </span>
                    <span className="text-xs font-normal text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Authentic PayPal Sandbox Context</span>
                    </span>
                  </h3>

                  {tx ? (
                    <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-slate-500 block">Capture ID</span>
                          <span className="font-mono font-semibold text-slate-900">
                            {tx.paypalTransactionId}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Amount Captured</span>
                          <span className="font-mono font-bold text-slate-900 tabular-nums">
                            ${tx.amount.toFixed(2)} {tx.currency}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Payment Status</span>
                          <span
                            className={`font-semibold ${
                              tx.paymentStatus === 'COMPLETED'
                                ? 'text-emerald-700'
                                : tx.paymentStatus === 'REFUNDED'
                                ? 'text-amber-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {tx.paymentStatus}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">PayPal Fee</span>
                          <span className="font-mono text-slate-700 tabular-nums">
                            ${tx.paypalFee?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>

                      {tx.items && tx.items.length > 0 && (
                        <div className="pt-2 border-t border-indigo-100/70 text-slate-600">
                          <span className="font-medium text-slate-700">Line Items: </span>
                          {tx.items.map((it: any, idx: number) => (
                            <span key={idx} className="font-mono text-xs">
                              {it.quantity}x {it.name} (${it.price.toFixed(2)})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        No existing transaction ledger record matched ID "
                        {activeComplaint.transactionId || 'None'}". AI will evaluate based on customer
                        claims and recommend verification.
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Gemini AI Analysis Engine Card */}
                {activeComplaint.aiAnalysis && (
                  <div className="p-5 bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Gemini 3.8 Flash Analysis & Recommendation
                          </h4>
                          <p className="text-xs text-slate-500">
                            Dispute classification: {activeComplaint.aiAnalysis.categoryLabel}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Confidence:</span>
                        <div className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md font-mono text-xs font-bold text-indigo-700 tabular-nums">
                          {(activeComplaint.aiAnalysis.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Reasoning Summary */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        AI Reasoning Deduction
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                        {activeComplaint.aiAnalysis.reasoningSummary}
                      </p>
                    </div>

                    {/* Verified Evidence & Missing Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Verified Evidence Points</span>
                        </span>
                        <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                          {activeComplaint.aiAnalysis.evidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Missing / Unconfirmed Info</span>
                        </span>
                        {activeComplaint.aiAnalysis.missingInformation.length > 0 ? (
                          <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                            {activeComplaint.aiAnalysis.missingInformation.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            All requisite payment & policy inputs verified.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Recommended Action Box */}
                    <div className="p-3 bg-indigo-600/5 border border-indigo-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-indigo-900 block font-medium">
                          Recommended Merchant Action:
                        </span>
                        <span className="text-sm font-bold text-indigo-950 font-mono">
                          {activeComplaint.aiAnalysis.recommendedActionLabel}
                        </span>
                      </div>
                      <div className="text-xs text-indigo-700 flex items-center gap-1 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Requires Merchant Sign-off</span>
                      </div>
                    </div>

                    {/* Customer Response Draft (Editable) */}
                    <div className="space-y-1.5 pt-2 border-t border-indigo-100">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Customer-Facing Response (AI Drafted)
                      </label>
                      <textarea
                        rows={3}
                        value={customResponse}
                        onChange={(e) => setCustomResponse(e.target.value)}
                        placeholder="Customize customer response before approving..."
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                      />
                      <span className="text-xs text-slate-400 block">
                        This message will be dispatched to the customer when the action is executed.
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. Immutable Audit Logs */}
                {activeComplaint.auditLogs && activeComplaint.auditLogs.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Audit Trail & Execution Log
                    </h3>
                    <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                      {activeComplaint.auditLogs.map((log) => (
                        <div key={log.id} className="p-3 flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{log.action}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500">{log.actor}</span>
                            </div>
                            <p className="text-slate-600">{log.details}</p>
                          </div>
                          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Fixed Action Bar */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {activeComplaint.status === 'awaiting_merchant_approval' ? (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pending your decision before any PayPal transaction occurs</span>
                    </span>
                  ) : activeComplaint.status === 'refunded' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Refund executed via PayPal Sandbox (ID:{' '}
                        {activeComplaint.resolution?.paypalRefundId || 'N/A'})
                      </span>
                    </span>
                  ) : (
                    <span>Dispute state: {activeComplaint.status}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEscalate()}
                    disabled={actionProcessing || activeComplaint.status === 'refunded'}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Escalate to Tier-2
                  </button>

                  <button
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionProcessing || activeComplaint.status === 'refunded'}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Reject Claim
                  </button>

                  <button
                    onClick={() => setApprovalModalOpen(true)}
                    disabled={
                      actionProcessing ||
                      activeComplaint.status === 'refunded' ||
                      activeComplaint.status === 'resolved'
                    }
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve AI Resolution</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirmation Modal */}
      {approvalModalOpen && activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span>Confirm Merchant Resolution Approval</span>
              </h3>
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                You are about to authorize the resolution for customer{' '}
                <strong className="text-slate-900">{activeComplaint.customerName}</strong> under
                tracking ID <strong className="text-slate-900">{activeComplaint.trackingId}</strong>.
              </p>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                <span className="font-semibold text-indigo-950 block">Executed Action:</span>
                <span className="font-mono text-indigo-900 font-bold">
                  {activeComplaint.aiAnalysis?.recommendedActionLabel}
                </span>
                {activeComplaint.transactionId && (
                  <span className="block text-slate-500 font-mono">
                    PayPal Target ID: {activeComplaint.transactionId}
                  </span>
                )}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong>Idempotent Execution:</strong> If this action includes a refund, ResolvePay AI
                will issue the corresponding refund call to PayPal Sandbox with a cryptographic
                deduplication key to avoid accidental double-refunds.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionProcessing ? 'Processing in PayPal...' : 'Confirm & Execute Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Reject Dispute Claim</span>
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Provide the policy rationale for declining this claim. This will be added to the audit
                ledger and communicated to the customer.
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Rejection Reason / Policy Violation
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Return window expired 65 days ago; carrier confirmed delivery signed."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {actionProcessing ? 'Updating...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
