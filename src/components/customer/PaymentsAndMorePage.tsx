import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Send, 
  Plus, 
  Minus, 
  CreditCard, 
  FileText, 
  Eye, 
  Building, 
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Mail,
  QrCode,
  Smartphone,
  Target,
  TrendingUp,
  PiggyBank
} from 'lucide-react';
import { toast } from 'sonner';
import { TransferMoneyDialog, AddMoneyDialog, WithdrawMoneyDialog } from './TransactionDialogs';
import { apiService } from '../../services/api';

interface PaymentsAndMorePageProps {
  user: any;
}

// Quick Amount Selection Component
const QuickAmountSelector = ({ onAmountSelect, title }: { onAmountSelect: (amount: number) => void; title: string }) => {
  const amounts = [500, 1000, 2000, 5000, 10000, 25000];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Select a quick amount or enter custom amount</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {amounts.map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="h-12 font-semibold"
              onClick={() => onAmountSelect(amount)}
            >
              ₹{amount.toLocaleString()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Transaction Stats Component
const TransactionStats = ({ user }: { user: any }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.accountId) return;
      
      try {
        const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const toDate = new Date().toISOString().split('T')[0];
        const response = await apiService.getTransactionStatistics(user.accountId, fromDate, toDate);
        setStats(response);
      } catch (error) {
        console.error('Failed to fetch transaction stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.accountId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading stats...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          This Month's Activity
        </CardTitle>
        <CardDescription>Your transaction summary for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <ArrowDownRight className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              ₹{stats?.summary?.totalCredits?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Money In</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <ArrowUpRight className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">
              ₹{stats?.summary?.totalDebits?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-muted-foreground">Money Out</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-lg font-semibold text-blue-600">
            {stats?.totalTransactions || 0} Transactions
          </p>
          <p className="text-sm text-muted-foreground">Total this month</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Passbook Actions Component
const PassbookActions = ({ user }: { user: any }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState<string>(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Fetch user's first account ID when component mounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await apiService.getUserAccounts();
        if (accounts && accounts.length > 0) {
          setAccountId(accounts[0].accountId);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      }
    };
    
    fetchAccounts();
  }, []);

  const handleDownloadPassbook = async () => {
    if (!accountId) {
      toast.error('Account information not available');
      return;
    }

    setLoading('download');
    try {
      const blob = await apiService.downloadPassbookPDF(accountId, fromDate, toDate);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Passbook_${accountId}_${fromDate}_to_${toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Passbook PDF downloaded successfully!');
    } catch (error: any) {
      console.error("Download passbook error:", error);
      toast.error(error.message || 'Failed to download passbook');
    } finally {
      setLoading(null);
    }
  };

  const handleEmailPassbook = async () => {
    if (!accountId) {
      toast.error('Account information not available');
      return;
    }

    setLoading('email');
    try {
      await apiService.emailPassbookPDF(accountId, fromDate, toDate);
      toast.success('Passbook PDF has been emailed to your registered address!');
    } catch (error: any) {
      console.error("Email passbook error:", error);
      toast.error(error.message || 'Failed to email passbook');
    } finally {
      setLoading(null);
    }
  };

  const handlePreviewPassbook = async () => {
    if (!accountId) {
      toast.error('Account information not available');
      return;
    }

    setLoading('preview');
    try {
      const blob = await apiService.previewPassbookPDF(accountId, fromDate, toDate);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.success('Passbook PDF opened in new tab!');
    } catch (error: any) {
      console.error("Preview passbook error:", error);
      toast.error(error.message || 'Failed to preview passbook');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Statements & Passbook
        </CardTitle>
        <CardDescription>Download, email, or preview your account statements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Selection */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Select Date Range</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="from-date" className="text-xs text-muted-foreground">From Date</label>
              <input 
                id="from-date"
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                max={toDate}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="to-date" className="text-xs text-muted-foreground">To Date</label>
              <input 
                id="to-date"
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                min={fromDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2 space-y-3">
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={handleDownloadPassbook}
          disabled={loading === 'download'}
        >
          {loading === 'download' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Passbook PDF
        </Button>
        
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={handleEmailPassbook}
          disabled={loading === 'email'}
        >
          {loading === 'email' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Mail className="h-4 w-4 mr-2" />
          )}
          Email Passbook PDF
        </Button>
        
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={handlePreviewPassbook}
          disabled={loading === 'preview'}
        >
          {loading === 'preview' ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )}
          Preview Passbook PDF
        </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PaymentsAndMorePage({ user }: PaymentsAndMorePageProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionComplete = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Transaction completed! Refreshing data...');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-accent" />
            Payments & More
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete banking operations and financial services
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Enhanced Banking
        </Badge>
      </motion.div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Transaction Actions */}
            <motion.div
              key={`transactions-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Money Transfers
                  </CardTitle>
                  <CardDescription>Send and receive money instantly</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TransferMoneyDialog user={user} onTransactionComplete={handleTransactionComplete} />
                  <AddMoneyDialog user={user} onTransactionComplete={handleTransactionComplete} />
                  <WithdrawMoneyDialog user={user} onTransactionComplete={handleTransactionComplete} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Amount Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <QuickAmountSelector
                title="Quick Transfer"
                onAmountSelect={(amount) => {
                  toast.success(`Selected ₹${amount.toLocaleString()} - Click Transfer Money to continue`);
                }}
              />
            </motion.div>

            {/* Transaction Stats */}
            <motion.div
              key={`stats-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <TransactionStats user={user} />
            </motion.div>
          </div>
        </TabsContent>

        {/* Statements Tab */}
        <TabsContent value="statements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PassbookActions user={user} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    Quick Statements
                  </CardTitle>
                  <CardDescription>View recent transaction summaries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={async () => {
                      try {
                        // Get user accounts first
                        const accounts = await apiService.getUserAccounts();
                        if (accounts && accounts.length > 0) {
                          const accountId = accounts[0].accountId; // Use first account
                          const statement = await apiService.getMiniStatement(accountId);
                          toast.success('Mini statement loaded successfully');
                          
                          // Create a new window to display the mini statement
                          if (statement && (statement as any).transactions) {
                            const transactions = (statement as any).transactions;
                            
                            // Create HTML content for the new window
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Mini Statement</title>
                                <style>
                                  body {
                                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                                    line-height: 1.5;
                                    padding: 2rem;
                                    max-width: 800px;
                                    margin: 0 auto;
                                    color: #111827;
                                    background-color: #f9fafb;
                                  }
                                  .header {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 1.5rem;
                                    border-bottom: 1px solid #e5e7eb;
                                    padding-bottom: 1rem;
                                  }
                                  .title {
                                    font-size: 1.5rem;
                                    font-weight: bold;
                                    margin: 0;
                                  }
                                  .subtitle {
                                    color: #6b7280;
                                    margin: 0;
                                  }
                                  .card {
                                    background-color: white;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                    margin-bottom: 1rem;
                                    overflow: hidden;
                                  }
                                  table {
                                    width: 100%;
                                    border-collapse: collapse;
                                  }
                                  th {
                                    text-align: left;
                                    padding: 0.75rem 1rem;
                                    font-weight: 600;
                                    border-bottom: 1px solid #e5e7eb;
                                    background-color: #f3f4f6;
                                  }
                                  td {
                                    padding: 0.75rem 1rem;
                                    border-bottom: 1px solid #e5e7eb;
                                  }
                                  tr:last-child td {
                                    border-bottom: none;
                                  }
                                  .credit {
                                    color: #059669;
                                    font-weight: 600;
                                  }
                                  .debit {
                                    color: #dc2626;
                                    font-weight: 600;
                                  }
                                  .badge {
                                    display: inline-block;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 9999px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                    background-color: #e5e7eb;
                                  }
                                  .badge-completed {
                                    background-color: #d1fae5;
                                    color: #065f46;
                                  }
                                  .date {
                                    color: #6b7280;
                                    font-size: 0.875rem;
                                  }
                                  .summary {
                                    margin-top: 1.5rem;
                                    background-color: white;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                    padding: 1rem;
                                  }
                                  .summary-title {
                                    font-weight: 600;
                                    margin-bottom: 0.5rem;
                                  }
                                  .summary-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 0.5rem 0;
                                    border-bottom: 1px solid #f3f4f6;
                                  }
                                  .summary-row:last-child {
                                    border-bottom: none;
                                    font-weight: 600;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div>
                                    <h1 class="title">Mini Statement</h1>
                                    <p class="subtitle">Last 5 transactions</p>
                                  </div>
                                  <div class="date">
                                    Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                                  </div>
                                </div>
                                
                                <div class="card">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${transactions.map((tx: any) => `
                                        <tr>
                                          <td>${tx.description || 'Transaction'}</td>
                                          <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                                          <td class="${tx.transactionType === 'credit' ? 'credit' : 'debit'}">
                                            ${tx.transactionType === 'credit' ? '+' : '-'}₹${tx.amount?.toLocaleString()}
                                          </td>
                                          <td>
                                            <span class="badge">${tx.transactionType || 'Unknown'}</span>
                                          </td>
                                          <td>
                                            <span class="badge badge-completed">Completed</span>
                                          </td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div class="summary">
                                  <div class="summary-title">Summary</div>
                                  <div class="summary-row">
                                    <span>Account ID</span>
                                    <span>${accountId}</span>
                                  </div>
                                  <div class="summary-row">
                                    <span>Statement Type</span>
                                    <span>Mini Statement</span>
                                  </div>
                                  <div class="summary-row">
                                    <span>Number of Transactions</span>
                                    <span>${transactions.length}</span>
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            
                            // Open a new window and write the HTML content
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                              newWindow.document.write(htmlContent);
                              newWindow.document.close();
                            } else {
                              toast.error('Pop-up blocked. Please allow pop-ups for this site.');
                            }
                          } else {
                            toast.error('No transactions found');
                          }
                        } else {
                          toast.error('No accounts found');
                        }
                      } catch (error) {
                        console.error('Mini statement error:', error);
                        toast.error('Failed to load mini statement');
                      }
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mini Statement (Last 5)
                  </Button>
                  
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={async () => {
                      try {
                        // Get user accounts first
                        const accounts = await apiService.getUserAccounts();
                        if (accounts && accounts.length > 0) {
                          const accountId = accounts[0].accountId; // Use first account
                          const recent = await apiService.getRecentTransactions(accountId);
                          toast.success('Recent transactions loaded successfully');
                          
                          // Create a new window to display the recent transactions
                          if (recent && (recent as any).transactions) {
                            const transactions = (recent as any).transactions;
                            
                            // Create HTML content for the new window
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html lang="en">
                              <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Recent Transactions</title>
                                <style>
                                  body {
                                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                                    line-height: 1.5;
                                    padding: 2rem;
                                    max-width: 800px;
                                    margin: 0 auto;
                                    color: #111827;
                                    background-color: #f9fafb;
                                  }
                                  .header {
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 1.5rem;
                                    border-bottom: 1px solid #e5e7eb;
                                    padding-bottom: 1rem;
                                  }
                                  .title {
                                    font-size: 1.5rem;
                                    font-weight: bold;
                                    margin: 0;
                                  }
                                  .subtitle {
                                    color: #6b7280;
                                    margin: 0;
                                  }
                                  .card {
                                    background-color: white;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                    margin-bottom: 1rem;
                                    overflow: hidden;
                                  }
                                  table {
                                    width: 100%;
                                    border-collapse: collapse;
                                  }
                                  th {
                                    text-align: left;
                                    padding: 0.75rem 1rem;
                                    font-weight: 600;
                                    border-bottom: 1px solid #e5e7eb;
                                    background-color: #f3f4f6;
                                  }
                                  td {
                                    padding: 0.75rem 1rem;
                                    border-bottom: 1px solid #e5e7eb;
                                  }
                                  tr:last-child td {
                                    border-bottom: none;
                                  }
                                  .credit {
                                    color: #059669;
                                    font-weight: 600;
                                  }
                                  .debit {
                                    color: #dc2626;
                                    font-weight: 600;
                                  }
                                  .badge {
                                    display: inline-block;
                                    padding: 0.25rem 0.5rem;
                                    border-radius: 9999px;
                                    font-size: 0.75rem;
                                    font-weight: 500;
                                    background-color: #e5e7eb;
                                  }
                                  .badge-completed {
                                    background-color: #d1fae5;
                                    color: #065f46;
                                  }
                                  .date {
                                    color: #6b7280;
                                    font-size: 0.875rem;
                                  }
                                  .summary {
                                    margin-top: 1.5rem;
                                    background-color: white;
                                    border-radius: 0.5rem;
                                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                                    padding: 1rem;
                                  }
                                  .summary-title {
                                    font-weight: 600;
                                    margin-bottom: 0.5rem;
                                  }
                                  .summary-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 0.5rem 0;
                                    border-bottom: 1px solid #f3f4f6;
                                  }
                                  .summary-row:last-child {
                                    border-bottom: none;
                                    font-weight: 600;
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div>
                                    <h1 class="title">Recent Transactions</h1>
                                    <p class="subtitle">Last 10 transactions</p>
                                  </div>
                                  <div class="date">
                                    Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                                  </div>
                                </div>
                                
                                <div class="card">
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${transactions.map((tx: any) => `
                                        <tr>
                                          <td>${tx.description || 'Transaction'}</td>
                                          <td>${new Date(tx.timestamp).toLocaleDateString()}</td>
                                          <td class="${tx.transactionType === 'credit' ? 'credit' : 'debit'}">
                                            ${tx.transactionType === 'credit' ? '+' : '-'}₹${tx.amount?.toLocaleString()}
                                          </td>
                                          <td>
                                            <span class="badge">${tx.transactionType || 'Unknown'}</span>
                                          </td>
                                          <td>
                                            <span class="badge badge-completed">Completed</span>
                                          </td>
                                        </tr>
                                      `).join('')}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div class="summary">
                                  <div class="summary-title">Summary</div>
                                  <div class="summary-row">
                                    <span>Account ID</span>
                                    <span>${accountId}</span>
                                  </div>
                                  <div class="summary-row">
                                    <span>Statement Type</span>
                                    <span>Recent Transactions</span>
                                  </div>
                                  <div class="summary-row">
                                    <span>Number of Transactions</span>
                                    <span>${transactions.length}</span>
                                  </div>
                                </div>
                              </body>
                              </html>
                            `;
                            
                            // Open a new window and write the HTML content
                            const newWindow = window.open('', '_blank');
                            if (newWindow) {
                              newWindow.document.write(htmlContent);
                              newWindow.document.close();
                            } else {
                              toast.error('Pop-up blocked. Please allow pop-ups for this site.');
                            }
                          } else {
                            toast.error('No transactions found');
                          }
                        } else {
                          toast.error('No accounts found');
                        }
                      } catch (error) {
                        console.error('Recent transactions error:', error);
                        toast.error('Failed to load recent transactions');
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recent Transactions
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    Card Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Request Debit Card
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Block/Unblock Card
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-orange-600" />
                    Bill Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Electricity Bill
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile Recharge
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Branch Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Building className="h-4 w-4 mr-2" />
                    Find Branch/ATM
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Target className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              key={`analytics-${refreshKey}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TransactionStats user={user} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    Financial Goals
                  </CardTitle>
                  <CardDescription>Track your savings and spending goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Financial goal tracking coming soon!</p>
                    <Button className="mt-4" variant="outline">
                      Set Financial Goals
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
