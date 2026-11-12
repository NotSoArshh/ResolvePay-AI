import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { Complaint, Transaction } from '../types/index.js';

interface TransactionsPageProps {
  transactions: Transaction[];
  complaints: Complaint[];
  onOpenDisputesForTx: (complaintId: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  complaints,
  onOpenDisputesForTx,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'all' && tx.paymentStatus !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        tx.paypalTransactionId.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.customerEmail.toLowerCase().includes(q) ||
        (tx.orderId && tx.orderId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Transaction Management</span>
            <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded">
              PayPal REST API Ledger
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and inspect verified PayPal Sandbox payment captures and refund statuses.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Total Recorded:</span>
          <span className="font-mono font-bold text-slate-900">{transactions.length} captures</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PayPal ID, customer, order..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </span>
          {['all', 'COMPLETED', 'REFUNDED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">PayPal Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Dispute / Refund Link</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions matching your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const matchingComplaint = complaints.find(
                    (c) =>
                      c.transactionId === tx.paypalTransactionId ||
                      c.transactionId === tx.id ||
                      (tx.orderId && c.orderId === tx.orderId)
                  );

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-default"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {tx.paypalTransactionId}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{tx.customerName}</div>
                        <div className="text-slate-400 text-xs">{tx.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.orderId || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 whitespace-nowrap">
                        ${tx.amount.toFixed(2)} {tx.currency}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            tx.paymentStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.paymentStatus === 'REFUNDED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {matchingComplaint ? (
                          <button
                            onClick={() => onOpenDisputesForTx(matchingComplaint.id)}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Case {matchingComplaint.trackingId}</span>
                          </button>
                        ) : tx.refundStatus === 'COMPLETED' ? (
                          <span className="text-emerald-700 font-mono text-xs">
                            Refund ID: {tx.paypalRefundId}
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span>PayPal Capture Details</span>
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Capture ID</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedTx.paypalTransactionId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Amount</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    ${selectedTx.amount.toFixed(2)} {selectedTx.currency}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-semibold text-slate-900">
                    {selectedTx.paymentStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">PayPal Fee</span>
                  <span className="font-mono text-slate-700 tabular-nums">
                    ${selectedTx.paypalFee?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Customer Info</span>
                <p>
                  {selectedTx.customerName} ({selectedTx.customerEmail})
                </p>
                {selectedTx.orderId && (
                  <p className="font-mono text-slate-500">Order Ref: {selectedTx.orderId}</p>
                )}
              </div>

              {selectedTx.items && selectedTx.items.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Items Purchased</span>
                  <div className="space-y-1">
                    {selectedTx.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200 font-mono text-xs"
                      >
                        <span>
                          {it.quantity}x {it.name}
                        </span>
                        <span>${it.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTx.refundStatus === 'COMPLETED' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 space-y-1">
                  <span className="font-semibold block">Refund Executed</span>
                  <p className="font-mono">Refund ID: {selectedTx.paypalRefundId}</p>
                  <p>Amount: ${selectedTx.refundedAmount?.toFixed(2)} USD</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
