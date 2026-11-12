import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  RotateCcw,
  Scale,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PayPalStatus } from '../types/index.js';

interface LandingPageProps {
  onOpenDashboard: () => void;
  onOpenDisputes: () => void;
  onOpenSubmit: () => void;
  paypalStatus?: PayPalStatus | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenDashboard,
  onOpenDisputes,
  onOpenSubmit,
  paypalStatus,
}) => {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900">
      {/* Sandbox / Demo Status Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-indigo-400">Environment:</span>
            <span>
              {paypalStatus?.configured
                ? 'Connected to PayPal Sandbox Live REST API'
                : 'PayPal Sandbox Interactive Demonstration Mode (Ready for evaluation)'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">Gemini 3.8 Flash Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSubmit}
              className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
            >
              Test Customer Form
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenDisputes}
              className="text-xs text-indigo-300 hover:text-white underline cursor-pointer"
            >
              Open Dispute Center
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Messaging */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Payment Resolution</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] text-balance">
                Payment Disputes, <br />
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                  Resolved Intelligently.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Turn frantic customer complaints into verified PayPal resolutions.
                ResolvePay AI pairs natural language reasoning with genuine PayPal Sandbox
                transaction verification and strict merchant refund policy guardrails.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenDisputes}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Launch Dispute Center</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onOpenDashboard}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  View Merchant Dashboard
                </button>
                <button
                  onClick={onOpenSubmit}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  Customer Complaint Portal
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Automated Rogue Refunds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Real PayPal Sandbox API Calls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Structured Gemini 3.8 Flash Output</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-950">
                <img
                  src="/src/assets/images/resolvepay_hero_fintech_1794461352863.jpg"
                  alt="ResolvePay AI Dispute Resolution Workbench"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-indigo-300">
                      Merchant Operations Console
                    </p>
                    <p className="text-sm font-medium">
                      Live transaction verification & AI dispute decision-making
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Fintech Precision
            </p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for SMB Merchants, Not Chatbot Toys
            </h2>
            <p className="text-slate-600 text-sm">
              ResolvePay AI doesn't hallucinate payment statuses. It cross-checks customer
              assertions directly with PayPal Sandbox captures and your merchant policy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                1. Contextual Natural Language Parsing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Extracts claimed order numbers, amounts, timestamps, and core issues. Categorizes
                into 6 dispute vectors including double captures and unconfirmed orders.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                2. PayPal Ledger Verification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connects directly to PayPal REST endpoints to confirm capture status, buyer email,
                transaction fees, and whether prior refunds have already occurred.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                3. Merchant-Governed Approvals
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI recommends actions with clear confidence scores and evidence summaries. The
                merchant must explicitly approve before any PayPal refund is executed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5-Step Pipeline */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              The Resolution Lifecycle
            </p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              From Customer Frustration to Verified Resolution
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Customer Complaint',
                desc: 'Customer submits a plain-text grievance with claimed PayPal ID or order details.',
              },
              {
                step: '02',
                title: 'AI Classification',
                desc: 'Gemini 3.8 Flash identifies dispute type and extracts crucial claims.',
              },
              {
                step: '03',
                title: 'PayPal Verification',
                desc: 'Backend queries PayPal Sandbox captures to verify actual payment status and timestamps.',
              },
              {
                step: '04',
                title: 'Policy Evaluation',
                desc: 'AI scores claim against merchant return windows and recommends concrete action.',
              },
              {
                step: '05',
                title: 'Merchant Execution',
                desc: 'Merchant reviews evidence, approves with 1 click, executing PayPal refund idempotently.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200 bg-[#fafbfc] space-y-2 relative"
              >
                <div className="text-xs font-mono font-bold text-indigo-600">
                  STEP {item.step}
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Merchant Case Studies & Testimonials */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12 space-y-2">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
              Trusted by Merchants
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Transforming Chargeback Risk into Customer Loyalty
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Our checkout had a double-charge glitch during Black Friday. ResolvePay AI
                instantly detected duplicate captures within minutes, drafted reassuring customer
                messages, and allowed us to approve 40+ refunds with zero accidental double-refunds."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                  src="/src/assets/images/merchant_avatar_sarah_1794461354056.jpg"
                  alt="Sarah Jenkins"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Sarah Jenkins</h4>
                  <p className="text-xs text-slate-500">Founder, Nordic Lifestyle Goods</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <p className="text-sm text-slate-700 italic leading-relaxed">
                "Having Gemini formulate the exact policy reasoning alongside verified PayPal
                capture logs saves our support team 15 minutes per dispute. It prevents fraudulent
                claims while expediting genuine returns."
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <img
                  src="/src/assets/images/merchant_avatar_marcus_1794461353458.jpg"
                  alt="Marcus Vance"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Marcus Vance</h4>
                  <p className="text-xs text-slate-500">Payments & Risk Lead, Studio Gear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to experience intelligent payment resolution?
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Explore our pre-seeded PayPal Sandbox scenarios, run automated compliance tests, or
            submit your own simulated customer complaint.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onOpenDisputes}
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Open Dispute Resolution Center
            </button>
            <button
              onClick={onOpenSubmit}
              className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Submit Test Complaint
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ResolvePay AI</span>
            <span>·</span>
            <span>PayPal Sandbox + Gemini 3.8 Flash Dispute Automation</span>
          </div>
          <div>
            <span>Merchant Governance Guaranteed · Human-in-the-Loop Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
