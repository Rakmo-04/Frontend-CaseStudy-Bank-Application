import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Zap, 
  Download, 
  Mail, 
  Eye, 
  FileText, 
  CreditCard, 
  Plus, 
  Wallet, 
  Building,
  Calendar,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import { TransferMoneyDialog, AddMoneyDialog, WithdrawMoneyDialog } from './TransactionDialogs';
import { motion } from 'framer-motion';

interface PaymentsAndMoreCardProps {
  user: any;
  onTransactionComplete?: () => void;
}

// Passbook Download Dialog Component
const PassbookDialog = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'download' | 'email' | 'preview'>('download');
  const [dateRange, setDateRange] = useState({
    fromDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 months ago
    toDate: new Date().toISOString().split('T')[0] // today
  });
  const [customEmail, setCustomEmail] = useState('');

  const handlePassbookAction = async () => {
    if (!user?.accountId) {
      toast.error('Account information not available');
      return;
    }

    setLoading(true);
    try {
      switch (action) {
        case 'download':
          const downloadBlob = await apiService.downloadPassbookPDF(
            user.accountId,
            dateRange.fromDate,
            dateRange.toDate
          );
          const downloadUrl = window.URL.createObjectURL(downloadBlob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          downloadLink.download = `Passbook_${user.accountId}_${dateRange.fromDate}_to_${dateRange.toDate}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadUrl);
          toast.success('Passbook PDF downloaded successfully!');
          break;

        case 'email':
          await apiService.emailPassbookPDF(
            user.accountId,
            dateRange.fromDate,
            dateRange.toDate,
            customEmail || undefined
          );
          toast.success(`Passbook PDF has been emailed to ${customEmail || 'your registered email address'}!`);
          break;

        case 'preview':
          const previewBlob = await apiService.previewPassbookPDF(
            user.accountId,
            dateRange.fromDate,
            dateRange.toDate
          );
          const previewUrl = window.URL.createObjectURL(previewBlob);
          window.open(previewUrl, '_blank');
          toast.success('Passbook PDF opened in new tab!');
          break;
      }
      setOpen(false);
    } catch (error: any) {
      console.error('Passbook action failed:', error);
      toast.error(error.message || 'Failed to process passbook request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Passbook & Statements
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Passbook & Statements
          </DialogTitle>
          <DialogDescription>
            Download, email, or preview your account passbook
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Action Selection */}
          <div className="space-y-2">
            <Label>Select Action</Label>
            <Select value={action} onValueChange={(value: 'download' | 'email' | 'preview') => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="download">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email PDF
                  </div>
                </SelectItem>
                <SelectItem value="preview">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={dateRange.fromDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={dateRange.toDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Custom Email for Email Action */}
          {action === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="custom-email">Email Address (Optional)</Label>
              <Input
                id="custom-email"
                type="email"
                placeholder="Leave empty to use registered email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={handlePassbookAction}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {action === 'download' && <Download className="h-4 w-4 mr-2" />}
                {action === 'email' && <Mail className="h-4 w-4 mr-2" />}
                {action === 'preview' && <Eye className="h-4 w-4 mr-2" />}
                {action === 'download' && 'Download Passbook'}
                {action === 'email' && 'Email Passbook'}
                {action === 'preview' && 'Preview Passbook'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mini Statement Dialog
const MiniStatementDialog = ({ user }: { user: any }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statement, setStatement] = useState<any>(null);

  const fetchMiniStatement = async () => {
    if (!user?.accountId) {
      toast.error('Account information not available');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.getMiniStatement(user.accountId);
      setStatement(response);
      toast.success('Mini statement loaded successfully!');
    } catch (error: any) {
      console.error('Failed to fetch mini statement:', error);
      toast.error('Failed to load mini statement');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchMiniStatement();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Mini Statement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-green-600" />
            Mini Statement
          </DialogTitle>
          <DialogDescription>
            Last 5 transactions for your account
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading statement...</span>
          </div>
        ) : statement ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Account Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Account ID:</span>
                  <p className="font-mono font-semibold">{statement.accountId}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Statement Type:</span>
                  <p className="font-semibold">{statement.statementType}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Recent Transactions</h4>
              {statement.transactions && statement.transactions.length > 0 ? (
                <div className="space-y-2">
                  {statement.transactions.map((transaction: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-bold ${transaction.type?.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type?.toLowerCase() === 'credit' ? '+' : '-'}₹{transaction.amount?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent transactions found</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Click to load mini statement</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Create Account Dialog
const CreateAccountDialog = ({ user, onTransactionComplete }: { user: any; onTransactionComplete?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountType: 'Savings',
    holderType: 'Individual',
    initialDeposit: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const response = await apiService.createAccount({
        accountType: formData.accountType,
        initialDeposit: formData.initialDeposit ? parseFloat(formData.initialDeposit) : undefined
      });
      
      toast.success('New account created successfully!');
      setOpen(false);
      setFormData({
        accountType: 'Savings',
        holderType: 'Individual',
        initialDeposit: ''
      });
      
      if (onTransactionComplete) {
        onTransactionComplete();
      }
    } catch (error: any) {
      console.error('Failed to create account:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Create New Account
          </DialogTitle>
          <DialogDescription>
            Open a new bank account with us
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Savings">Savings Account</SelectItem>
                <SelectItem value="Current">Current Account</SelectItem>
                <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
                <SelectItem value="Recurring Deposit">Recurring Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Holder Type</Label>
            <Select value={formData.holderType} onValueChange={(value) => setFormData(prev => ({ ...prev, holderType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Joint">Joint Account</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-deposit">Initial Deposit (₹) - Optional</Label>
            <Input
              id="initial-deposit"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter initial deposit amount"
              value={formData.initialDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, initialDeposit: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Minimum balance requirements apply</p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function PaymentsAndMoreCard({ user, onTransactionComplete }: PaymentsAndMoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="lg:col-span-1"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Payments & More
          </CardTitle>
          <CardDescription>Essential banking operations and services</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Primary Transaction Actions */}
          <TransferMoneyDialog user={user} onTransactionComplete={onTransactionComplete} />
          <AddMoneyDialog user={user} onTransactionComplete={onTransactionComplete} />
          <WithdrawMoneyDialog user={user} onTransactionComplete={onTransactionComplete} />
          
          {/* Account Management */}
          <CreateAccountDialog user={user} onTransactionComplete={onTransactionComplete} />
          
          {/* Statements and Reports */}
          <PassbookDialog user={user} />
          <MiniStatementDialog user={user} />
          
          {/* Additional Services */}
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => toast.success('Card request feature coming soon!')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Request Debit Card
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => toast.success('Bill payment feature coming soon!')}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Pay Bills & Recharge
          </Button>
          
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => toast.success('Branch locator opening...')}
          >
            <Building className="h-4 w-4 mr-2" />
            Find Branch/ATM
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
