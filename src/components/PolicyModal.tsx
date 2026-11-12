import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { MerchantPolicy, PayPalStatus } from '../types/index.js';
import { api } from '../lib/api.js';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: MerchantPolicy | null;
  paypalStatus: PayPalStatus | null;
  onPolicyUpdated: (updated: MerchantPolicy) => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  paypalStatus,
  onPolicyUpdated,
}) => {
  if (!isOpen || !policy) return null;

  const [storeName, setStoreName] = useState(policy.storeName);
  const [returnWindowDays, setReturnWindowDays] = useState(policy.returnWindowDays);
  const [duplicatePaymentWindowMinutes, setDuplicatePaymentWindowMinutes] = useState(
    policy.duplicatePaymentWindowMinutes
  );
  const [autoEscalateAboveAmount, setAutoEscalateAboveAmount] = useState(
    policy.autoEscalateAboveAmount
  );
  const [allowRefundOnOrderFailure, setAllowRefundOnOrderFailure] = useState(
    policy.allowRefundOnOrderFailure
  );
  const [requireReturnForPhysicalGoods, setRequireReturnForPhysicalGoods] = useState(
    policy.requireReturnForPhysicalGoods
  );
  const [policySummary, setPolicySummary] = useState(policy.policySummary);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const updated = await api.updateMerchantPolicy({
        storeName,
        returnWindowDays: Number(returnWindowDays),
        duplicatePaymentWindowMinutes: Number(duplicatePaymentWindowMinutes),
        autoEscalateAboveAmount: Number(autoEscalateAboveAmount),
        allowRefundOnOrderFailure,
        requireReturnForPhysicalGoods,
        policySummary,
      });
      onPolicyUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Merchant Policy & PayPal Configuration
              </h3>
              <p className="text-xs text-slate-500">
                These rules govern Gemini 3.8 Flash's dispute recommendations and thresholds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* PayPal Sandbox Status Badge */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>PayPal Integration State</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded font-semibold text-xs ${
                paypalStatus?.configured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {paypalStatus?.configured
                ? 'LIVE SANDBOX CONNECTED'
                : 'INTERACTIVE DEMO SIMULATION'}
            </span>
          </div>
          <p className="text-slate-600">
            Base Endpoint: <code className="font-mono text-slate-800">{paypalStatus?.baseUrl}</code>
          </p>
          {!paypalStatus?.configured && (
            <p className="text-slate-500 italic">
              Tip: You can optionally add <code className="font-mono">PAYPAL_CLIENT_ID</code> and{' '}
              <code className="font-mono">PAYPAL_CLIENT_SECRET</code> to your server environment to
              directly call live PayPal Sandbox endpoints.
            </p>
          )}
        </div>

        {/* Policy Editor Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Merchant policy successfully updated! Future AI evaluations will use these rules.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Store / Merchant Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Return Window (Days)
              </label>
              <input
                type="number"
                value={returnWindowDays}
                onChange={(e) => setReturnWindowDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Duplicate Payment Window (Minutes)
              </label>
              <input
                type="number"
                value={duplicatePaymentWindowMinutes}
                onChange={(e) => setDuplicatePaymentWindowMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Auto-Escalate Threshold ($ USD)
              </label>
              <input
                type="number"
                value={autoEscalateAboveAmount}
                onChange={(e) => setAutoEscalateAboveAmount(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowRefundOnOrderFailure}
                onChange={(e) => setAllowRefundOnOrderFailure(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 font-medium">
                Allow full refund when payment was captured but order confirmation failed
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={requireReturnForPhysicalGoods}
                onChange={(e) => setRequireReturnForPhysicalGoods(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 font-medium">
                Require physical return proof / warehouse tracking before authorizing refund
              </span>
            </label>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Refund Policy Summary Text (Passed to Gemini AI Engine)
            </label>
            <textarea
              rows={3}
              value={policySummary}
              onChange={(e) => setPolicySummary(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Policy'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
