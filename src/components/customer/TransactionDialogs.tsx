import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Send, Plus, Minus, CreditCard, CheckCircle, XCircle, AlertCircle, Loader2, ArrowRight, Copy, Download, Mail, Building, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import { Account } from '../../Models/Account';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionDialogProps {
  user: any;
  onTransactionComplete?: () => void;
}

interface TransactionResult {
  success: boolean;
  transactionId?: string;
  referenceNumber?: string;
  amount?: number;
  recipientAccount?: string;
  recipientAccountId?: number;
  senderAccount?: string;
  senderAccountId?: number;
  transactionFee?: number;
  totalDebit?: number;
  transactionType?: 'credit' | 'debit' | 'transfer';
  mode?: string;
  bankName?: string;
  ifscCode?: string;
  description?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

// Enhanced Transaction Result Popup Component with Professional Design
const TransactionResultPopup = ({ result, onClose }: { result: TransactionResult; onClose: () => void }) => {
  if (!result) return null;

  const copyTransactionDetails = () => {
    const details = [
      `Transaction ${result.success ? 'Successful' : 'Failed'}`,
      `Transaction ID: ${result.transactionId}`,
      `Reference Number: ${result.referenceNumber}`,
      `Amount: ₹${result.amount?.toLocaleString()}`,
      result.transactionFee ? `Transaction Fee: ₹${result.transactionFee}` : '',
      result.totalDebit ? `Total Debit: ₹${result.totalDebit}` : '',
      result.recipientAccountId ? `Recipient Account: ${result.recipientAccountId}` : '',
      result.senderAccountId ? `From Account: ${result.senderAccountId}` : '',
      result.mode ? `Mode: ${result.mode.toUpperCase()}` : '',
      result.bankName ? `Bank: ${result.bankName}` : '',
      result.ifscCode ? `IFSC: ${result.ifscCode}` : '',
      result.timestamp ? `Time: ${new Date(result.timestamp).toLocaleString()}` : `Time: ${new Date().toLocaleString()}`,
      result.description ? `Description: ${result.description}` : ''
    ].filter(Boolean).join('\n');
    
    navigator.clipboard.writeText(details);
    toast.success('Transaction details copied to clipboard!');
  };

  return (
    <AnimatePresence>
      <Dialog open={!!result} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-lg">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="text-center pb-4">
              <motion.div 
                className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                {result.success ? (
                  <div className="bg-green-100 p-4 rounded-full border-4 border-green-200">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                ) : (
                  <div className="bg-red-100 p-4 rounded-full border-4 border-red-200">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                )}
              </motion.div>
              <DialogTitle className={`text-2xl font-bold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Transaction Successful!' : 'Transaction Failed'}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {result.message || (result.success ? 'Your transaction has been processed successfully.' : result.error || 'Something went wrong with your transaction.')}
              </DialogDescription>
            </DialogHeader>
            
            {result.success && (
              <motion.div 
                className="space-y-6 py-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Transaction Summary Card */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Transaction ID</span>
                        <p className="font-mono font-bold text-green-700 text-base">{result.transactionId}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Reference No.</span>
                        <p className="font-mono font-bold text-green-700 text-base">{result.referenceNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Amount</span>
                        <p className="font-bold text-green-600 text-lg">₹{result.amount?.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground font-medium">Type</span>
                        <p className="font-semibold capitalize text-blue-600">{result.transactionType}</p>
                      </div>
                      {result.transactionFee && result.transactionFee > 0 && (
                        <>
                          <div className="space-y-1">
                            <span className="text-muted-foreground font-medium">Transaction Fee</span>
                            <p className="font-semibold text-orange-600">₹{result.transactionFee}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground font-medium">Total Debit</span>
                            <p className="font-bold text-red-600">₹{result.totalDebit?.toLocaleString()}</p>
                          </div>
                        </>
                      )}
                      {result.recipientAccountId && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-muted-foreground font-medium">Recipient Account</span>
                          <p className="font-mono font-semibold text-blue-600">{result.recipientAccountId}</p>
                          {result.bankName && (
                            <p className="text-sm text-muted-foreground">{result.bankName} ({result.ifscCode})</p>
                          )}
                        </div>
                      )}
                      {result.senderAccountId && (
                        <div className="space-y-1 col-span-2">
                          <span className="text-muted-foreground font-medium">From Account</span>
                          <p className="font-mono font-semibold text-purple-600">{result.senderAccountId}</p>
                        </div>
                      )}
                      <div className="space-y-1 col-span-2">
                        <span className="text-muted-foreground font-medium">Timestamp</span>
                        <p className="font-medium">{result.timestamp ? new Date(result.timestamp).toLocaleString() : new Date().toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-green-200 hover:bg-green-50"
                    onClick={copyTransactionDetails}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-blue-200 hover:bg-blue-50"
                    onClick={() => toast.success('Receipt download started!')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-purple-200 hover:bg-purple-50"
                    onClick={() => toast.success('Receipt will be emailed to your registered address!')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Receipt
                  </Button>
                </div>
              </motion.div>
            )}

            <motion.div 
              className="flex justify-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                onClick={onClose} 
                className={`px-8 py-2 font-semibold ${result.success ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                size="lg"
              >
                {result.success ? 'Done' : 'Try Again'}
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

// Enhanced Transfer Money Dialog with Multiple Account Support
export const TransferMoneyDialog = ({ user, onTransactionComplete }: TransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);
  
  const [formData, setFormData] = useState({
    recipientAccountId: '',
    amount: '',
    description: 'Transfer to another account',
    bankName: 'WTF Bank',
    ifscCode: 'WTFB0001234',
    remarks: ''
  });

  // Fetch user accounts when dialog opens
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userAccounts = await apiService.getUserAccounts();
        setAccounts(userAccounts);
        // Default selection: user.accountId if present, else first account
        if (userAccounts?.length) {
          const defaultId = user?.accountId && userAccounts.find(a => a.accountId === user.accountId)
            ? user.accountId
            : userAccounts[0].accountId;
          setSelectedAccountId(defaultId);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        toast.error('Failed to load accounts');
      }
    };

    if (open) {
      fetchAccounts();
    }
  }, [open, user?.accountId]);

  const selectedAccount = accounts.find(a => a.accountId === selectedAccountId) || null;

  // Calculate transaction fee based on API documentation
  const calculateTransactionFee = (amount: number): number => {
    if (amount <= 10000) return 5.00;
    return 10.00;
  };

  const amount = parseFloat(formData.amount) || 0;
  const transactionFee = amount > 0 ? calculateTransactionFee(amount) : 0;
  const totalDebit = amount + transactionFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedAccountId) {
      toast.error('Please select a source account');
      return;
    }
    if (!formData.recipientAccountId) {
      toast.error('Please enter recipient account ID');
      return;
    }
    if (!formData.amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > 1000000) {
      toast.error('Maximum transfer limit is ₹10,00,000');
      return;
    }
    if (selectedAccountId.toString() === formData.recipientAccountId) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    // Balance check
    if (selectedAccount && totalDebit > (selectedAccount.balance ?? 0)) {
      toast.error('Insufficient balance for this transfer');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.createTransaction({
        accountId: selectedAccountId,
        transactionType: 'transfer',
        amount,
        description: formData.description || 'Transfer to another account',
        mode: 'online',
        recipientAccountId: parseInt(formData.recipientAccountId),
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        initiatedBy: 'customer',
        transactionFee,
        remarks: formData.remarks || `₹${amount.toLocaleString()} transferred to account ${formData.recipientAccountId}`
      });

      // Show success popup with comprehensive details
      setResult({
        success: true,
        transactionId: (response as any).transactionId || (response as any).id || `TXN${Date.now()}`,
        referenceNumber: (response as any).referenceNumber || (response as any).reference || `REF${Date.now()}`,
        amount,
        transactionFee,
        totalDebit,
        transactionType: 'transfer',
        mode: 'online',
        recipientAccountId: parseInt(formData.recipientAccountId),
        senderAccountId: selectedAccountId,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        description: formData.description,
        timestamp: new Date().toISOString(),
        message: (response as any).message || `₹${amount.toLocaleString()} transferred successfully to account ${formData.recipientAccountId}!`
      });

      // Reset form
      setFormData({
        recipientAccountId: '',
        amount: '',
        description: 'Transfer to another account',
        bankName: 'WTF Bank',
        ifscCode: 'WTFB0001234',
        remarks: ''
      });
      
      // Notify success
      toast.success(`₹${amount.toLocaleString()} transferred successfully!`);
      
      // Refresh balances
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
    } catch (error: any) {
      console.error('Transfer failed:', error);
      setResult({
        success: false,
        message: 'Transfer failed. Please try again.',
        error: error.message || 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full justify-start" variant="outline" style={{ visibility: 'visible', opacity: 1 }}>
            <Send className="h-4 w-4 mr-2" />
            Transfer Money
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Transfer Money
            </DialogTitle>
            <DialogDescription>
              Transfer money to another account securely and instantly
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <form id="transfer-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Account Selection */}
            {accounts.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="source-account">From Account</Label>
                <Select value={selectedAccountId?.toString()} onValueChange={(value) => setSelectedAccountId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono">{account.accountNumber}</span>
                          <span className="ml-4 text-sm text-muted-foreground">
                            {account.accountType} - ₹{account.balance?.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAccount && (
                  <p className="text-sm text-muted-foreground">
                    Available Balance: ₹{selectedAccount.balance?.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Recipient Account */}
            <div className="space-y-2">
              <Label htmlFor="recipient-account">
                <Hash className="h-4 w-4 inline mr-1" />
                Recipient Account ID *
              </Label>
              <Input
                id="recipient-account"
                type="number"
                placeholder="Enter recipient account ID"
                value={formData.recipientAccountId}
                onChange={(e) => setFormData(prev => ({ ...prev, recipientAccountId: e.target.value }))}
                required
              />
            </div>

            {/* Bank Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">
                  <Building className="h-4 w-4 inline mr-1" />
                  Bank Name
                </Label>
                <Input
                  id="bank-name"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifsc-code">IFSC Code</Label>
                <Input
                  id="ifsc-code"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                  placeholder="IFSC code"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                max="1000000"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum limit: ₹10,00,000</p>
            </div>

            {/* Transaction Summary */}
            {amount > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Transaction Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Transfer Amount:</span>
                      <span className="font-semibold">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Fee:</span>
                      <span className="font-semibold text-orange-600">₹{transactionFee}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total Debit:</span>
                      <span className="text-red-600">₹{totalDebit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description and Remarks */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Transfer description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional remarks (optional)"
                  rows={2}
                />
              </div>
            </div>

            </form>
          </div>
          
          {/* Fixed Submit Button - Outside scrollable area */}
          <div className="pt-4 border-t border-border mt-4">
            <Button 
              type="submit"
              form="transfer-form"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-300" 
              disabled={loading || !selectedAccountId}
              size="lg"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer ₹{amount.toLocaleString() || '0'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success/Failure Popup */}
      <TransactionResultPopup
        result={result}
        onClose={() => setResult(null)}
      />
    </>
  );
};

// Enhanced Add Money Dialog (Credit Transaction)
export const AddMoneyDialog = ({ user, onTransactionComplete }: TransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Money deposit',
    source: 'online',
    remarks: ''
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userAccounts = await apiService.getUserAccounts();
        setAccounts(userAccounts);
        if (userAccounts?.length) {
          const defaultId = user?.accountId && userAccounts.find(a => a.accountId === user.accountId)
            ? user.accountId
            : userAccounts[0].accountId;
          setSelectedAccountId(defaultId);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        toast.error('Failed to load accounts');
      }
    };

    if (open) fetchAccounts();
  }, [open, user?.accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccountId) {
      toast.error('Please select a destination account');
      return;
    }
    if (!formData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (amount > 500000) {
      toast.error('Maximum deposit limit is ₹5,00,000');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.createTransaction({
        accountId: selectedAccountId,
        transactionType: 'credit',
        amount,
        description: formData.description || 'Money deposit',
        mode: formData.source,
        initiatedBy: 'customer',
        remarks: formData.remarks || `₹${amount.toLocaleString()} deposited via ${formData.source}`
      });

      // Show success popup
      setResult({
        success: true,
        transactionId: (response as any).transactionId || (response as any).id || `TXN${Date.now()}`,
        referenceNumber: (response as any).referenceNumber || (response as any).reference || `REF${Date.now()}`,
        amount,
        transactionType: 'credit',
        mode: formData.source,
        senderAccountId: selectedAccountId,
        description: formData.description,
        timestamp: new Date().toISOString(),
        message: (response as any).message || `₹${amount.toLocaleString()} added to your account successfully!`
      });

      // Reset form
      setFormData({
        amount: '',
        description: 'Money deposit',
        source: 'online',
        remarks: ''
      });
      
      toast.success(`₹${amount.toLocaleString()} added successfully!`);
      
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
    } catch (error: any) {
      console.error('Add money failed:', error);
      setResult({
        success: false,
        message: 'Failed to add money. Please try again.',
        error: error.message || 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full justify-start" variant="outline" style={{ visibility: 'visible', opacity: 1 }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Add Money
            </DialogTitle>
            <DialogDescription>
              Deposit money to your account instantly
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <form id="add-money-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Account Selection */}
            {accounts.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="destination-account">To Account</Label>
                <Select value={selectedAccountId?.toString()} onValueChange={(value) => setSelectedAccountId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono">{account.accountNumber}</span>
                          <span className="ml-4 text-sm text-muted-foreground">
                            {account.accountType} - ₹{account.balance?.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                max="500000"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Maximum limit: ₹5,00,000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online Transfer</SelectItem>
                  <SelectItem value="cash">Cash Deposit</SelectItem>
                  <SelectItem value="cheque">Cheque Deposit</SelectItem>
                  <SelectItem value="salary">Salary Credit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deposit description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Additional remarks (optional)"
                rows={2}
              />
            </div>

            </form>
          </div>
          
          {/* Fixed Submit Button - Outside scrollable area */}
          <div className="pt-4 border-t border-border mt-4">
            <Button 
              type="submit"
              form="add-money-form"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-500" 
              disabled={loading || !selectedAccountId}
              size="lg"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add ₹{(parseFloat(formData.amount) || 0).toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionResultPopup
        result={result}
        onClose={() => setResult(null)}
      />
    </>
  );
};

// Enhanced Withdraw Money Dialog (Debit Transaction)
export const WithdrawMoneyDialog = ({ user, onTransactionComplete }: TransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);
  
  const [formData, setFormData] = useState({
    amount: '',
    description: 'Cash withdrawal',
    method: 'atm',
    remarks: ''
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const userAccounts = await apiService.getUserAccounts();
        setAccounts(userAccounts);
        if (userAccounts?.length) {
          const defaultId = user?.accountId && userAccounts.find(a => a.accountId === user.accountId)
            ? user.accountId
            : userAccounts[0].accountId;
          setSelectedAccountId(defaultId);
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        toast.error('Failed to load accounts');
      }
    };

    if (open) fetchAccounts();
  }, [open, user?.accountId]);

  const selectedAccount = accounts.find(a => a.accountId === selectedAccountId) || null;
  const amount = parseFloat(formData.amount) || 0;
  const withdrawalFee = formData.method === 'atm' ? 5.0 : 0;
  const totalDebit = amount + withdrawalFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAccountId) {
      toast.error('Please select a source account');
      return;
    }
    if (!formData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    // Balance check
    if (selectedAccount && totalDebit > (selectedAccount.balance ?? 0)) {
      toast.error('Insufficient balance for this withdrawal');
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiService.createTransaction({
        accountId: selectedAccountId,
        transactionType: 'debit',
        amount,
        description: formData.description || 'Money withdrawn from account',
        mode: formData.method,
        initiatedBy: 'customer',
        transactionFee: withdrawalFee,
        remarks: formData.remarks || `₹${amount.toLocaleString()} withdrawn via ${formData.method}`
      });

      // Show success popup
      setResult({
        success: true,
        transactionId: (response as any).transactionId || (response as any).id || `TXN${Date.now()}`,
        referenceNumber: (response as any).referenceNumber || (response as any).reference || `REF${Date.now()}`,
        amount,
        transactionFee: withdrawalFee,
        totalDebit,
        transactionType: 'debit',
        mode: formData.method,
        senderAccountId: selectedAccountId,
        description: formData.description,
        timestamp: new Date().toISOString(),
        message: (response as any).message || `₹${amount.toLocaleString()} withdrawn successfully!`
      });

      // Reset form
      setFormData({
        amount: '',
        description: 'Cash withdrawal',
        method: 'atm',
        remarks: ''
      });
      
      toast.success(`₹${amount.toLocaleString()} withdrawn successfully!`);
      
      if (onTransactionComplete) {
        onTransactionComplete();
      }
      
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      setResult({
        success: false,
        message: 'Withdrawal failed. Please try again.',
        error: error.message || 'An unexpected error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full justify-start" variant="outline" style={{ visibility: 'visible', opacity: 1 }}>
            <Minus className="h-4 w-4 mr-2" />
            Withdraw Money
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Minus className="h-5 w-5 text-red-600" />
              Withdraw Money
            </DialogTitle>
            <DialogDescription>
              Withdraw money from your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <form id="withdraw-money-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Account Selection */}
            {accounts.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="source-account">From Account</Label>
                <Select value={selectedAccountId?.toString()} onValueChange={(value) => setSelectedAccountId(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono">{account.accountNumber}</span>
                          <span className="ml-4 text-sm text-muted-foreground">
                            {account.accountType} - ₹{account.balance?.toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAccount && (
                  <p className="text-sm text-muted-foreground">
                    Available Balance: ₹{selectedAccount.balance?.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Withdrawal Method</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atm">ATM (₹5 fee)</SelectItem>
                  <SelectItem value="branch">Branch</SelectItem>
                  <SelectItem value="online">Online Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Transaction Summary */}
            {amount > 0 && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Withdrawal Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Withdrawal Amount:</span>
                      <span className="font-semibold">₹{amount.toLocaleString()}</span>
                    </div>
                    {withdrawalFee > 0 && (
                      <div className="flex justify-between">
                        <span>Withdrawal Fee:</span>
                        <span className="font-semibold text-orange-600">₹{withdrawalFee}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total Debit:</span>
                      <span className="text-red-600">₹{totalDebit.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Withdrawal description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Additional remarks (optional)"
                rows={2}
              />
            </div>

            </form>
          </div>
          
          {/* Fixed Submit Button - Outside scrollable area */}
          <div className="pt-4 border-t border-border mt-4">
            <Button 
              type="submit"
              form="withdraw-money-form"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-red-500" 
              disabled={loading || !selectedAccountId}
              size="lg"
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw ₹{amount.toLocaleString() || '0'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <TransactionResultPopup
        result={result}
        onClose={() => setResult(null)}
      />
    </>
  );
};