import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Skeleton } from '../ui/skeleton';
import { Plus, Eye, EyeOff, Copy, MoreHorizontal, CreditCard, PiggyBank, TrendingUp, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import type { ApiError } from '../../services/api';

interface AccountsViewProps {
  user: any;
}

export default function AccountsView({ user }: AccountsViewProps) {
  const [showBalances, setShowBalances] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccountType, setNewAccountType] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load accounts on component mount
  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getUserAccounts();

        // For each account, fetch additional transaction data
        const transformedAccounts = await Promise.all((response || []).map(async (account: any) => {
          let monthlyActivity = 0;
          let lastTransaction = null;

          try {
            // Fetch recent transactions to get real data
            const recentTransactions = await apiService.getRecentTransactions(account.accountId) as any[];
            
            // Count transactions from this month
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            if (Array.isArray(recentTransactions)) {
              monthlyActivity = recentTransactions.filter((transaction: any) => {
                const transactionDate = new Date(transaction.timestamp || transaction.createdAt);
                return transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
              }).length;

              // Get the most recent transaction
              if (recentTransactions.length > 0) {
                const sortedTransactions = recentTransactions.sort((a: any, b: any) => 
                  new Date(b.timestamp || b.createdAt).getTime() - 
                  new Date(a.timestamp || a.createdAt).getTime()
                );
                lastTransaction = sortedTransactions[0].timestamp || sortedTransactions[0].createdAt;
              }
            }
          } catch (error) {
            console.log(`No transactions found for account ${account.accountId}:`, error);
            // Keep defaults: monthlyActivity = 0, lastTransaction = null
          }

          return {
            id: account.accountId,
            type: account.accountType,
            name:
              account.accountType === 'Savings'
                ? 'Savings Account'
                : account.accountType === 'Current'
                  ? 'Current Account'
                  : 'Checking Account',
            balance: account.balance || 0,
            accountNumber:
              account.accountNumber ||
              `ACC${account.accountId.toString().padStart(10, '0')}`,
            routingNumber: account.routingNumber || 'WTFB0001234',
            status: account.accountStatus || account.status || 'Active',
            interestRate:
              account.interestRate ||
              (account.accountType === 'Savings' ? 4.5 : 2.5),
            icon:
              account.accountType === 'Savings'
                ? PiggyBank
                : account.accountType === 'Investment'
                  ? TrendingUp
                  : CreditCard,
            color:
              account.accountType === 'Savings'
                ? 'bg-green-500'
                : account.accountType === 'Investment'
                  ? 'bg-purple-500'
                  : 'bg-blue-500',
            lastTransaction: lastTransaction,
            monthlyActivity: monthlyActivity,
            createdDate: account.createdDate || account.createdAt
          };
        }));

        setAccounts(transformedAccounts);
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(`Failed to load accounts: ${apiError.message}`);

        // Fallback to default empty array
        setAccounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', description: 'For daily transactions and bill payments' },
    { value: 'savings', label: 'Savings Account', description: 'Earn interest on your deposits' },
    { value: 'investment', label: 'Investment Account', description: 'Grow your wealth with market investments' }
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleCreateAccount = async () => {
    if (!newAccountType || !newAccountName) return;

    setIsCreating(true);
    try {
      await apiService.createAccount({
        accountType: newAccountType.toUpperCase(),
        initialDeposit: 0 // Default to 0 for now
      });

      toast.success('Account created successfully!');

      // Reload accounts with real data
      const response = await apiService.getUserAccounts();
      const transformedAccounts = await Promise.all((response || []).map(async (account: any) => {
        let monthlyActivity = 0;
        let lastTransaction = null;

        try {
          const recentTransactions = await apiService.getRecentTransactions(account.accountId) as any[];
          
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          
          if (Array.isArray(recentTransactions)) {
            monthlyActivity = recentTransactions.filter((transaction: any) => {
              const transactionDate = new Date(transaction.timestamp || transaction.createdAt);
              return transactionDate.getMonth() === currentMonth && 
                     transactionDate.getFullYear() === currentYear;
            }).length;

            if (recentTransactions.length > 0) {
              const sortedTransactions = recentTransactions.sort((a: any, b: any) => 
                new Date(b.timestamp || b.createdAt).getTime() - 
                new Date(a.timestamp || a.createdAt).getTime()
              );
              lastTransaction = sortedTransactions[0].timestamp || sortedTransactions[0].createdAt;
            }
          }
        } catch (error) {
          console.log(`No transactions found for account ${account.accountId}:`, error);
        }

        return {
          id: account.accountId,
          type: account.accountType,
          name:
            account.accountType === 'Savings'
              ? 'Savings Account'
              : account.accountType === 'Current'
                ? 'Current Account'
                : 'Checking Account',
          balance: account.balance || 0,
          accountNumber:
            account.accountNumber ||
            `ACC${account.accountId.toString().padStart(10, '0')}`,
          routingNumber: account.routingNumber || 'WTFB0001234',
          status: account.accountStatus || account.status || 'Active',
          interestRate:
            account.interestRate ||
            (account.accountType === 'Savings' ? 4.5 : 2.5),
          icon:
            account.accountType === 'Savings'
              ? PiggyBank
              : account.accountType === 'Investment'
                ? TrendingUp
                : CreditCard,
          color:
            account.accountType === 'Savings'
              ? 'bg-green-500'
              : account.accountType === 'Investment'
                ? 'bg-purple-500'
                : 'bg-blue-500',
          lastTransaction: lastTransaction,
          monthlyActivity: monthlyActivity,
          createdDate: account.createdDate || account.createdAt
        };
      }));

      //const response = await apiService.getUserAccounts();
      // const transformedAccounts = response.content?.map((account: any) => ({
      //   id: account.accountId,
      //   type: account.accountType,
      //   name: account.accountType === 'Savings' ? 'Savings Account' : 
      //         account.accountType === 'Current' ? 'Current Account' : 
      //         'Checking Account',
      //   balance: account.balance,
      //   accountNumber: account.accountNumber || `${account.accountId.toString().padStart(4, '0')} •••• •••• ••••`,
      //   routingNumber: 'WTFB0001234',
      //   status: account.status || 'Active',
      //   interestRate: account.interestRate || (account.accountType === 'Savings' ? 6.5 : 3.5),
      //   icon: account.accountType === 'Savings' ? PiggyBank : 
      //         account.accountType === 'Investment' ? TrendingUp : CreditCard,
      //   color: account.accountType === 'Savings' ? 'bg-green-500' : 
      //          account.accountType === 'Investment' ? 'bg-purple-500' : 'bg-blue-500',
      //   lastTransaction: account.lastTransactionDate || '2024-08-31',
      //   monthlyActivity: Math.floor(Math.random() * 50) + 10
      // })) || [];

      setAccounts(transformedAccounts);
      setIsCreateDialogOpen(false);
      setNewAccountType('');
      setNewAccountName('');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(`Failed to create account: ${apiError.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Accounts</h1>
          <p className="text-muted-foreground">Manage your banking accounts and view balances</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center space-x-2"
          >
            {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Account</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Account</DialogTitle>
                <DialogDescription>
                  Choose the type of account you'd like to open with WTF Bank.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select value={newAccountType} onValueChange={setNewAccountType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Enter a name for your account"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateAccount}
                  className="w-full"
                  disabled={!newAccountType || !newAccountName || isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : showBalances ? (
                  `₹${accounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ) : (
                  '••••••'
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? <Skeleton className="h-3 w-24" /> : `Across ${accounts.length} accounts`}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-12" /> : accounts.filter(acc => acc.status === 'Active').length}
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? <Skeleton className="h-3 w-28" /> : 'All accounts operational'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Interest</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : accounts.length > 0 ? (
                  `${(accounts.reduce((sum, acc) => sum + acc.interestRate, 0) / accounts.length).toFixed(1)}%`
                ) : (
                  '0.0%'
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading ? <Skeleton className="h-3 w-32" /> : 'Annual percentage yield'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 2 }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-8 w-40" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-16 rounded-lg" />
                      <Skeleton className="h-16 rounded-lg" />
                    </div>
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="p-8 text-center">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Accounts Found</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any accounts yet. Create your first account to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          accounts.map((account, index) => {
            const Icon = account.icon;

            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-xl ${account.color} flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <CardDescription>{account.type} Account</CardDescription>
                        </div>
                      </div>
                      <Badge variant={account.status === 'Active' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Balance */}
                    <div>
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-3xl font-bold">
                        {showBalances
                          ? `₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          : '••••••'
                        }
                      </p>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Account Number</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {showBalances ? account.accountNumber : '•••• •••• •••• ••••'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.accountNumber, 'Account number')}
                          disabled={!showBalances}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Routing Number</p>
                          <p className="text-sm text-muted-foreground font-mono">{account.routingNumber}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(account.routingNumber, 'Routing number')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Interest Rate</p>
                          <p className="text-sm text-muted-foreground">{account.interestRate}% APY</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium">Monthly Activity</p>
                          <p className="text-sm text-muted-foreground">
                            {account.monthlyActivity} transaction{account.monthlyActivity !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Last Transaction</p>
                          <p className="text-sm text-muted-foreground">
                            {account.lastTransaction 
                              ? new Date(account.lastTransaction).toLocaleDateString('en-IN')
                              : account.createdDate 
                                ? `Account created ${new Date(account.createdDate).toLocaleDateString('en-IN')}`
                                : 'No transactions yet'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Transfer
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Statement
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}