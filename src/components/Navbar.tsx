import React from 'react';
import { ShieldCheck, Sliders, Beaker, RotateCcw } from 'lucide-react';
import { PayPalStatus } from '../types/index.js';

interface NavbarProps {
  currentTab: 'landing' | 'dashboard' | 'disputes' | 'transactions' | 'analytics' | 'submit';
  setCurrentTab: (tab: 'landing' | 'dashboard' | 'disputes' | 'transactions' | 'analytics' | 'submit') => void;
  paypalStatus?: PayPalStatus | null;
  onOpenPolicy: () => void;
  onOpenTests: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  paypalStatus,
  onOpenPolicy,
  onOpenTests,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand element */}
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:bg-indigo-700 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              ResolvePay<span className="text-indigo-600">.ai</span>
            </span>
          </button>

          {/* Zone 2: 4-5 single-line clean navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'landing'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('disputes')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'disputes'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Dispute Center
            </button>
            <button
              onClick={() => setCurrentTab('transactions')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'transactions'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setCurrentTab('analytics')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'analytics'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setCurrentTab('submit')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                currentTab === 'submit'
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : ''
              }`}
            >
              Submit Complaint
            </button>
          </nav>

          {/* Zone 3: 1 primary action zone with utility triggers */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenTests}
              title="Run Automated Dispute Verification Test Suite"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Beaker className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPolicy}
              title="Merchant Refund Policy & PayPal Config"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              onClick={onResetDemo}
              title="Reset Demo Data Scenarios"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('disputes')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Dispute Queue
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
