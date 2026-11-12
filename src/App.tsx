import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { LandingPage } from './components/LandingPage.js';
import { Dashboard } from './components/Dashboard.js';
import { DisputeCenter } from './components/DisputeCenter.js';
import { ComplaintForm } from './components/ComplaintForm.js';
import { TransactionsPage } from './components/TransactionsPage.js';
import { AnalyticsPage } from './components/AnalyticsPage.js';
import { PolicyModal } from './components/PolicyModal.js';
import { TestingSuiteModal } from './components/TestingSuiteModal.js';
import { api } from './lib/api.js';
import {
  AnalyticsSummary,
  Complaint,
  MerchantPolicy,
  PayPalStatus,
  Transaction,
} from './types/index.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'landing' | 'dashboard' | 'disputes' | 'transactions' | 'analytics' | 'submit'
  >('landing');

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [policy, setPolicy] = useState<MerchantPolicy | null>(null);
  const [paypalStatus, setPaypalStatus] = useState<PayPalStatus | null>(null);

  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [testSuiteModalOpen, setTestSuiteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [complaintsData, txData, analyticsData, policyData, statusData] =
        await Promise.all([
          api.getComplaints(),
          api.getTransactions(),
          api.getAnalytics(),
          api.getMerchantPolicy(),
          api.getPayPalStatus(),
        ]);

      setComplaints(complaintsData);
      setTransactions(txData);
      setAnalytics(analyticsData);
      setPolicy(policyData);
      setPaypalStatus(statusData);

      if (!selectedComplaintId && complaintsData.length > 0) {
        setSelectedComplaintId(complaintsData[0].id);
      }
    } catch (err) {
      console.error('[ResolvePay AI] Error loading platform data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectScenario(num: number) {
    const scenarioMap: Record<number, string> = {
      1: 'cmp-001', // Order Not Confirmed $50
      2: 'cmp-002', // Return $149.99
      3: 'cmp-003', // Duplicate payment $28.50
      4: 'cmp-004', // Out-of-policy $320
    };
    const targetId = scenarioMap[num] || 'cmp-001';
    setSelectedComplaintId(targetId);
    setCurrentTab('disputes');
  }

  async function handleResetDemo() {
    if (confirm('Reset demo scenarios and restore original PayPal sandbox state?')) {
      await api.resetDemo();
      await loadAllData();
      alert('Demo state restored.');
    }
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans flex flex-col">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        paypalStatus={paypalStatus}
        onOpenPolicy={() => setPolicyModalOpen(true)}
        onOpenTests={() => setTestSuiteModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onOpenDashboard={() => setCurrentTab('dashboard')}
            onOpenDisputes={() => setCurrentTab('disputes')}
            onOpenSubmit={() => setCurrentTab('submit')}
            paypalStatus={paypalStatus}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            analytics={analytics}
            complaints={complaints}
            transactions={transactions}
            onSelectComplaint={(id) => {
              setSelectedComplaintId(id);
              setCurrentTab('disputes');
            }}
            onNavigateToDisputes={() => setCurrentTab('disputes')}
            onNavigateToTransactions={() => setCurrentTab('transactions')}
            onSelectScenario={handleSelectScenario}
          />
        )}

        {currentTab === 'disputes' && (
          <DisputeCenter
            complaints={complaints}
            selectedComplaintId={selectedComplaintId}
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            policy={policy}
            onRefresh={loadAllData}
          />
        )}

        {currentTab === 'transactions' && (
          <TransactionsPage
            transactions={transactions}
            complaints={complaints}
            onOpenDisputesForTx={(id) => {
              setSelectedComplaintId(id);
              setCurrentTab('disputes');
            }}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsPage analytics={analytics} />}

        {currentTab === 'submit' && (
          <ComplaintForm
            onSuccess={(created) => {
              loadAllData();
              setSelectedComplaintId(created.id);
            }}
            onOpenDisputes={(id) => {
              setSelectedComplaintId(id);
              setCurrentTab('disputes');
            }}
          />
        )}
      </main>

      {/* Policy & PayPal Configuration Modal */}
      <PolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        policy={policy}
        paypalStatus={paypalStatus}
        onPolicyUpdated={(up) => setPolicy(up)}
      />

      {/* Automated Testing Suite Modal */}
      <TestingSuiteModal
        isOpen={testSuiteModalOpen}
        onClose={() => setTestSuiteModalOpen(false)}
      />
    </div>
  );
}
