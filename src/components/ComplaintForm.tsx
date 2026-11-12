import React, { useState } from 'react';
import {
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ExternalLink,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { Complaint } from '../types/index.js';

interface ComplaintFormProps {
  onSuccess: (complaint: Complaint) => void;
  onOpenDisputes: (id: string) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  onSuccess,
  onOpenDisputes,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick Tracking Lookup
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<Complaint | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  function handlePreFill(scenario: 'duplicate' | 'order_lost' | 'return' | 'ineligible') {
    if (scenario === 'duplicate') {
      setCustomerName('Marcus Vance');
      setCustomerEmail('marcus.vance@example.com');
      setTransactionId('4XX99214LL001299C');
      setOrderId('ORD-3310-DUP');
      setDescription(
        'Your website checkout lagged and double-billed me $28.50 in PayPal for the same cable. Please refund the duplicate charge.'
      );
    } else if (scenario === 'order_lost') {
      setCustomerName('David Chen');
      setCustomerEmail('david.chen@example.com');
      setTransactionId('9LK48210PP772183A');
      setOrderId('ORD-4921');
      setDescription(
        'I paid $50 for my order, but the payment was deducted and my order was never confirmed. I want my money back.'
      );
    } else if (scenario === 'return') {
      setCustomerName('Elena Rostova');
      setCustomerEmail('elena.rostova@example.com');
      setTransactionId('7RT22915LL119283K');
      setOrderId('ORD-4880');
      setDescription(
        'Returned the wool overshirt within 30 days via USPS tracking 940011189922. Warehouse confirmed receipt 4 days ago. Please process my $149.99 refund.'
      );
    } else if (scenario === 'ineligible') {
      setCustomerName('Arthur Pendelton');
      setCustomerEmail('arthur.p@example.com');
      setTransactionId('3PP99104AA883190Q');
      setOrderId('ORD-1209');
      setDescription(
        'Bought an alloy mechanical keyboard 65 days ago, delivered fine but I decided I do not want it. Give me my $320 back.'
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName || !customerEmail || !description) {
      setError('Please provide your name, email, and a description of the issue.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const complaint = await api.submitComplaint({
        customerName,
        customerEmail,
        transactionId,
        orderId,
        description,
      });
      setSubmittedComplaint(complaint);
      onSuccess(complaint);
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookup() {
    if (!lookupId.trim()) return;
    setLookupLoading(true);
    try {
      const data = await api.getComplaint(lookupId.trim());
      setLookupResult(data);
    } catch (err: any) {
      setLookupResult(null);
      setError('No dispute found with tracking code ' + lookupId);
    } finally {
      setLookupLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Customer Resolution Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit a Payment Dispute or Claim
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Experiencing an unconfirmed order, double charge, or refund request? Our AI
          resolution engine immediately verifies your PayPal transaction and submits it for merchant action.
        </p>
      </div>

      {/* Submitted State View */}
      {submittedComplaint ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Dispute Submitted Successfully
            </h2>
            <p className="text-xs text-slate-500">
              Your tracking reference has been created and analyzed by ResolvePay AI.
            </p>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-indigo-700 block font-medium">Your Tracking ID</span>
              <span className="text-xl font-mono font-bold text-indigo-950">
                {submittedComplaint.trackingId}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Current Status</span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                {submittedComplaint.status.toUpperCase().replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* AI Assessment Preview */}
          {submittedComplaint.aiAnalysis && (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Instant AI Assessment Result</span>
              </div>
              <p className="text-slate-700">
                <strong>Identified Issue:</strong>{' '}
                {submittedComplaint.aiAnalysis.categoryLabel}
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-semibold block text-slate-900 mb-1">
                  Customer Update:
                </span>
                "{submittedComplaint.aiAnalysis.customerResponse}"
              </div>
              <p className="text-slate-500">
                The merchant has received this assessment and will approve the proposed action
                shortly.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setDescription('');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Submit Another Dispute
            </button>
            <button
              onClick={() => onOpenDisputes(submittedComplaint.id)}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              View in Merchant Dispute Center →
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Quick Pre-fill bar for evaluators */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Quick Test Scenarios:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePreFill('order_lost')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-slate-700 cursor-pointer font-medium"
              >
                1: Order Not Confirmed ($50)
              </button>
              <button
                type="button"
                onClick={() => handlePreFill('return')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-slate-700 cursor-pointer font-medium"
              >
                2: Return ($149.99)
              </button>
              <button
                type="button"
                onClick={() => handlePreFill('duplicate')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-slate-700 cursor-pointer font-medium"
              >
                3: Duplicate Charge ($28.50)
              </button>
              <button
                type="button"
                onClick={() => handlePreFill('ineligible')}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 rounded text-slate-700 cursor-pointer font-medium"
              >
                4: Out-of-Policy Return
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Chen"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. david.chen@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PayPal Transaction ID / Capture ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9LK48210PP772183A"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Found on your PayPal receipt or email notification.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Merchant Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-4921"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Describe the Payment Issue in Detail *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Explain what happened: e.g. I was charged twice, payment deducted without order receipt, item returned, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                ResolvePay AI validates claims against merchant refund policies.
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Dispute</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Claim Tracker */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Already Have a Tracking Reference?
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter tracking code (e.g. RPC-84920)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-800"
          />
          <button
            onClick={handleLookup}
            disabled={lookupLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {lookupLoading ? 'Checking...' : 'Track Dispute'}
          </button>
        </div>

        {lookupResult && (
          <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-mono font-bold text-slate-900">
              <span>{lookupResult.trackingId}</span>
              <span className="text-indigo-600">{lookupResult.status}</span>
            </div>
            <p className="text-slate-600">
              Customer: {lookupResult.customerName} · Filed:{' '}
              {new Date(lookupResult.createdAt).toLocaleDateString()}
            </p>
            {lookupResult.resolution && (
              <p className="text-emerald-700 font-semibold">
                Outcome: {lookupResult.resolution.actionTaken} (Decision:{' '}
                {lookupResult.resolution.merchantDecision})
              </p>
            )}
            <button
              onClick={() => onOpenDisputes(lookupResult.id)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold block text-xs underline cursor-pointer pt-1"
            >
              Open in Dispute Center →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
