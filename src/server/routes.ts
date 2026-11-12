import { Router, Request, Response } from 'express';
import { Database } from './db.js';
import { geminiService } from './geminiService.js';
import { paypalService } from './paypalService.js';
import { Complaint, RecommendedAction } from '../types/index.js';

export const apiRouter = Router();

// ----------------------------------------------------
// Health & PayPal Status
// ----------------------------------------------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'ResolvePay AI',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/paypal/status', (req: Request, res: Response) => {
  const status = paypalService.getStatus();
  res.json(status);
});

// ----------------------------------------------------
// Analytics
// ----------------------------------------------------
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const analytics = Database.getAnalytics();
  res.json(analytics);
});

// ----------------------------------------------------
// Merchant Policy
// ----------------------------------------------------
apiRouter.get('/merchant/policy', (req: Request, res: Response) => {
  const policy = Database.getPolicy();
  res.json(policy);
});

apiRouter.put('/merchant/policy', (req: Request, res: Response) => {
  const updated = Database.updatePolicy(req.body);
  res.json(updated);
});

// ----------------------------------------------------
// Transactions
// ----------------------------------------------------
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const transactions = Database.getTransactions();
  res.json(transactions);
});

apiRouter.get('/transactions/:id', (req: Request, res: Response) => {
  const tx = Database.getTransactionById(req.params.id);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(tx);
});

apiRouter.get('/paypal/transaction/:id', async (req: Request, res: Response) => {
  try {
    const result = await paypalService.getTransactionDetails(req.params.id);
    if (!result.found) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Complaints
// ----------------------------------------------------
apiRouter.get('/complaints', (req: Request, res: Response) => {
  const { status, category, search } = req.query as {
    status?: string;
    category?: string;
    search?: string;
  };
  const list = Database.getComplaints({ status, category, search });
  res.json(list);
});

apiRouter.get('/complaints/:id', (req: Request, res: Response) => {
  const complaint = Database.getComplaintById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const transaction = complaint.transactionId
    ? Database.getTransactionById(complaint.transactionId)
    : undefined;
  const auditLogs = Database.getAuditLogs(complaint.id);

  res.json({
    ...complaint,
    transaction,
    auditLogs,
  });
});

apiRouter.post('/complaints', async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, transactionId, orderId, description } =
      req.body;

    if (!customerName || !customerEmail || !description) {
      return res.status(400).json({
        error: 'customerName, customerEmail, and description are required',
      });
    }

    const id = `cmp-${Date.now()}`;
    const trackingId = `RPC-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newComplaint: Complaint = {
      id,
      trackingId,
      customerName,
      customerEmail,
      transactionId: transactionId?.trim() || undefined,
      orderId: orderId?.trim() || undefined,
      description,
      status: 'submitted',
      createdAt: now,
      updatedAt: now,
    };

    Database.saveComplaint(newComplaint);
    Database.addAuditLog(
      id,
      'COMPLAINT_SUBMITTED',
      `Customer (${customerName})`,
      `Complaint registered with tracking ID ${trackingId}`
    );

    // Automatically trigger AI analysis
    const policy = Database.getPolicy();
    let txData = newComplaint.transactionId
      ? Database.getTransactionById(newComplaint.transactionId)
      : null;

    if (!txData && newComplaint.transactionId) {
      // Check paypal lookup
      const lookup = await paypalService.getTransactionDetails(
        newComplaint.transactionId
      );
      if (lookup.found && lookup.details) {
        txData = lookup.details as any;
      }
    }

    const aiResult = await geminiService.analyzeComplaint({
      complaintDescription: description,
      customerName,
      customerEmail,
      transactionReference: newComplaint.transactionId,
      transactionData: txData,
      policy,
    });

    aiResult.complaintId = id;
    newComplaint.aiAnalysis = aiResult;
    newComplaint.category = aiResult.category;
    newComplaint.status = 'awaiting_merchant_approval';
    newComplaint.updatedAt = new Date().toISOString();

    Database.saveComplaint(newComplaint);
    Database.addAuditLog(
      id,
      'AI_ANALYSIS_COMPLETED',
      'ResolvePay AI Engine (Gemini 3.8 Flash)',
      `Dispute evaluated. Recommended action: ${aiResult.recommendedActionLabel} (Confidence: ${(
        aiResult.confidence * 100
      ).toFixed(0)}%)`
    );

    res.status(201).json(newComplaint);
  } catch (err: any) {
    console.error('[Create Complaint Error]', err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/complaints/:id/analyze', async (req: Request, res: Response) => {
  try {
    const complaint = Database.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const policy = Database.getPolicy();
    let txData = complaint.transactionId
      ? Database.getTransactionById(complaint.transactionId)
      : null;

    if (!txData && complaint.transactionId) {
      const lookup = await paypalService.getTransactionDetails(
        complaint.transactionId
      );
      if (lookup.found && lookup.details) {
        txData = lookup.details as any;
      }
    }

    const analysis = await geminiService.analyzeComplaint({
      complaintDescription: complaint.description,
      customerName: complaint.customerName,
      customerEmail: complaint.customerEmail,
      transactionReference: complaint.transactionId,
      transactionData: txData,
      policy,
    });

    analysis.complaintId = complaint.id;
    complaint.aiAnalysis = analysis;
    complaint.category = analysis.category;
    complaint.status = 'awaiting_merchant_approval';
    complaint.updatedAt = new Date().toISOString();

    Database.saveComplaint(complaint);
    Database.addAuditLog(
      complaint.id,
      'AI_REANALYZED',
      'Merchant Operator / Gemini 3.8 Flash',
      `Re-analyzed with updated policy parameters. Recommended action: ${analysis.recommendedActionLabel}`
    );

    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Merchant Approval Action
apiRouter.post('/complaints/:id/approve', async (req: Request, res: Response) => {
  try {
    const complaint = Database.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const { merchantNotes, customCustomerResponse } = req.body;
    const actionToExecute =
      complaint.aiAnalysis?.recommendedAction || 'verify_order_status';

    let paypalRefundResult: any = null;
    let newStatus: Complaint['status'] = 'resolved';

    // If recommended or approved action is refund, execute via PayPal Sandbox
    if (
      actionToExecute === 'approve_full_refund' ||
      actionToExecute === 'approve_partial_refund'
    ) {
      const tx = complaint.transactionId
        ? Database.getTransactionById(complaint.transactionId)
        : null;
      const refundAmount = tx ? tx.amount : 50.0;
      const refundTxId =
        tx?.paypalTransactionId ||
        complaint.transactionId ||
        `PAYPAL-TX-${Date.now()}`;

      paypalRefundResult = await paypalService.executeRefund({
        transactionId: refundTxId,
        amount: refundAmount,
        currency: tx?.currency || 'USD',
        noteToPayer:
          customCustomerResponse ||
          complaint.aiAnalysis?.customerResponse ||
          'Dispute resolved in your favor.',
        idempotencyKey: `REFUND-${complaint.trackingId}`,
      });

      newStatus = 'refunded';
    }

    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();
    complaint.resolution = {
      id: `res-${Date.now()}`,
      complaintId: complaint.id,
      merchantDecision: 'APPROVED',
      actionTaken: actionToExecute,
      merchantNotes,
      paypalRefundId: paypalRefundResult?.refundId,
      refundAmount: paypalRefundResult?.amountRefunded,
      customerResponseSent:
        customCustomerResponse || complaint.aiAnalysis?.customerResponse,
      status: 'EXECUTED',
      executedAt: new Date().toISOString(),
      decidedBy: 'Merchant Administrator (Authorized)',
    };

    Database.saveComplaint(complaint);
    Database.addAuditLog(
      complaint.id,
      'MERCHANT_ACTION_APPROVED',
      'Merchant Administrator',
      `Merchant explicitly APPROVED action: ${actionToExecute}.${
        paypalRefundResult
          ? ` PayPal Refund ${paypalRefundResult.refundId} processed successfully ($${paypalRefundResult.amountRefunded} ${paypalRefundResult.currency}).`
          : ''
      }`
    );

    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Merchant Rejection Action
apiRouter.post('/complaints/:id/reject', (req: Request, res: Response) => {
  try {
    const complaint = Database.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const { rejectionReason, customCustomerResponse } = req.body;
    complaint.status = 'rejected';
    complaint.updatedAt = new Date().toISOString();
    complaint.resolution = {
      id: `res-${Date.now()}`,
      complaintId: complaint.id,
      merchantDecision: 'REJECTED',
      actionTaken: 'reject_claim',
      merchantNotes: rejectionReason,
      customerResponseSent:
        customCustomerResponse ||
        `Your dispute has been reviewed and closed as ineligible per merchant return policy terms. Reason: ${
          rejectionReason || 'Policy terms not met'
        }`,
      status: 'EXECUTED',
      executedAt: new Date().toISOString(),
      decidedBy: 'Merchant Administrator',
    };

    Database.saveComplaint(complaint);
    Database.addAuditLog(
      complaint.id,
      'MERCHANT_ACTION_REJECTED',
      'Merchant Administrator',
      `Merchant rejected dispute claim. Reason: ${rejectionReason || 'Ineligible per policy'}`
    );

    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Merchant Escalation Action
apiRouter.post('/complaints/:id/escalate', (req: Request, res: Response) => {
  try {
    const complaint = Database.getComplaintById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const { escalationNotes } = req.body;
    complaint.status = 'escalated';
    complaint.updatedAt = new Date().toISOString();

    Database.saveComplaint(complaint);
    Database.addAuditLog(
      complaint.id,
      'MERCHANT_ACTION_ESCALATED',
      'Merchant Administrator',
      `Dispute escalated to Tier-2 Operations / Manual Investigation. Note: ${
        escalationNotes || 'Complex dispute'
      }`
    );

    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset / Seed Demo
apiRouter.post('/demo/seed', (req: Request, res: Response) => {
  Database.reset();
  res.json({ success: true, message: 'Demo scenarios reloaded successfully' });
});
