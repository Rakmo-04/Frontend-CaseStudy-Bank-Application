import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Send, Download, CreditCard, Wallet, PiggyBank, Eye, EyeOff, RefreshCw, Bell, Target, Calendar, ArrowUpRight, ArrowDownRight, Zap, Shield, Minus, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TransferMoneyDialog, AddMoneyDialog, WithdrawMoneyDialog } from './TransactionDialogs.tsx';
import PaymentsAndMoreCard from './PaymentsAndMoreCard';
import LiveBalanceCard from './LiveBalanceCard';
import { apiService } from '../../services/api';

interface DashboardOverviewProps {
  user: any;
  onTransactionComplete?: () => void;
}

export default function DashboardOverview({ user, onTransactionComplete }: DashboardOverviewProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [realAccounts, setRealAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [realTransactions, setRealTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fallback mock accounts if API fails
  const accounts = [
    { id: 1, type: 'Checking', name: 'Primary Checking', balance: 1047832.50, accountNumber: '****1234', change: +2.3 },
    { id: 2, type: 'Savings', name: 'Emergency Fund', balance: 3785420.75, accountNumber: '****5678', change: +5.1 },
    { id: 3, type: 'Investment', name: 'Growth Portfolio', balance: 7456821.25, accountNumber: '****9012', change: +12.8 }
  ];

  // Function to fetch real account data
  const fetchRealAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const accountsData = await apiService.getUserAccounts();
      console.log('Fetched real accounts:', accountsData);
      
      if (Array.isArray(accountsData)) {
        setRealAccounts(accountsData);
        
        if (accountsData.length > 0) {
          // If we have accounts, let's also fetch their balances to ensure they're up to date
          try {
            const firstAccount = accountsData[0];
            const accountId = firstAccount.accountId;
            const accountDetails = await apiService.getAccountById(accountId);
            
            if (accountDetails) {
              console.log('Fetched account details:', accountDetails);
              // Update the first account with the latest balance
              const updatedAccounts = [...accountsData];
              updatedAccounts[0] = {
                ...updatedAccounts[0],
                balance: accountDetails.balance || updatedAccounts[0].balance
              };
              setRealAccounts(updatedAccounts);
            }
          } catch (detailsError) {
            console.error('Failed to fetch account details:', detailsError);
            // Continue with the accounts we already have
          }
        }
      } else {
        console.warn('Unexpected accounts data format:', accountsData);
        toast.error('Received unexpected account data format from API');
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoadingAccounts(false);
    }
  };
  
  // Function to fetch real transaction data
  const fetchRealTransactions = async () => {
    setLoadingTransactions(true);
    try {
      // First get accounts to get the first account ID
      const accounts = await apiService.getUserAccounts();
      
      if (accounts && accounts.length > 0) {
        const accountId = accounts[0].accountId;
        // Get recent transactions
        const response = await apiService.getRecentTransactions(accountId);
        
        console.log('API response for transactions:', response);
        
        if (response && (response as any).transactions) {
          console.log('Fetched real transactions:', (response as any).transactions);
          setRealTransactions((response as any).transactions);
        } else if (response && Array.isArray(response)) {
          // Handle case where API returns an array directly
          console.log('Fetched real transactions (array):', response);
          setRealTransactions(response);
        } else if (response && (response as any).content && Array.isArray((response as any).content)) {
          // Handle paginated response format
          console.log('Fetched real transactions (paginated):', (response as any).content);
          setRealTransactions((response as any).content);
        } else {
          console.warn('Unexpected response format:', response);
          toast.error('Received unexpected data format from API');
        }
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load recent transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Function to fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      // First get accounts to get the first account ID
      const accounts = await apiService.getUserAccounts();
      
      if (accounts && accounts.length > 0) {
        const accountId = accounts[0].accountId;
        
        // Get date range for last 90 days
        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 90);
        
        const fromDateStr = fromDate.toISOString().split('T')[0];
        const toDateStr = toDate.toISOString().split('T')[0];
        
        // Get transaction statistics
        const statistics = await apiService.getTransactionStatistics(
          accountId, 
          fromDateStr,
          toDateStr
        );
        
        console.log('Fetched analytics data:', statistics);
        setAnalyticsData(statistics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Effect to fetch real accounts and transactions on component mount
  useEffect(() => {
    fetchRealAccounts();
    fetchRealTransactions();
    fetchAnalyticsData();
  }, []);

  // Handle transaction completion
  const handleTransactionComplete = () => {
    // Refresh all dashboard data
    fetchRealAccounts();
    fetchRealTransactions();
    fetchAnalyticsData();
    setLastUpdated(new Date());
    if (onTransactionComplete) {
      onTransactionComplete();
    }
  };

  const recentTransactions = [
    { id: 1, type: 'debit', description: 'Cafe Coffee Day', amount: -415.00, date: '2024-08-31', category: 'Food & Dining', status: 'completed' },
    { id: 2, type: 'credit', description: 'Salary Deposit', amount: 425000.00, date: '2024-08-31', category: 'Income', status: 'completed' },
    { id: 3, type: 'debit', description: 'Netflix Subscription', amount: -1349.00, date: '2024-08-30', category: 'Entertainment', status: 'completed' },
    { id: 4, type: 'debit', description: 'Big Bazaar', amount: -10750.50, date: '2024-08-30', category: 'Groceries', status: 'completed' },
    { id: 5, type: 'credit', description: 'Investment Return', amount: 19825.75, date: '2024-08-29', category: 'Investment', status: 'completed' },
    { id: 6, type: 'debit', description: 'Uber Ride', amount: -285.00, date: '2024-08-29', category: 'Transport', status: 'pending' }
  ];

  const chartData = [
    { name: 'Jan', balance: 3800000, income: 400000, expenses: 180000 },
    { name: 'Feb', balance: 4350000, income: 450000, expenses: 200000 },
    { name: 'Mar', balance: 4020000, income: 420000, expenses: 250000 },
    { name: 'Apr', balance: 5100000, income: 500000, expenses: 220000 },
    { name: 'May', balance: 4620000, income: 480000, expenses: 280000 },
    { name: 'Jun', balance: 5600000, income: 520000, expenses: 240000 },
    { name: 'Jul', balance: 6110000, income: 550000, expenses: 190000 },
    { name: 'Aug', balance: 5780000, income: 530000, expenses: 260000 },
    { name: 'Sep', balance: 6520000, income: 580000, expenses: 210000 },
    { name: 'Oct', balance: 6890000, income: 600000, expenses: 230000 },
    { name: 'Nov', balance: 7450000, income: 650000, expenses: 190000 },
    { name: 'Dec', balance: 12290074, income: 680000, expenses: 165000 }
  ];

  const spendingData = [
    { category: 'Food & Dining', amount: 38500, color: '#d4af37', percentage: 22 },
    { category: 'Transport', amount: 27200, color: '#1a1d29', percentage: 16 },
    { category: 'Shopping', amount: 15300, color: '#64748b', percentage: 9 },
    { category: 'Entertainment', amount: 20400, color: '#f1f5f9', percentage: 12 },
    { category: 'Bills & Utilities', amount: 57800, color: '#e2e8f0', percentage: 33 },
    { category: 'Investment', amount: 13600, color: '#10b981', percentage: 8 }
  ];

  const goals = [
    { id: 1, title: 'Emergency Fund', target: 5000000, current: 3785420, deadline: '2024-12-31' },
    { id: 2, title: 'Home Down Payment', target: 2500000, current: 1850000, deadline: '2025-06-30' },
    { id: 3, title: 'Vacation Fund', target: 500000, current: 425000, deadline: '2024-12-15' }
  ];

  // Real-time balance simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchRealAccounts(),
        fetchRealTransactions(),
        fetchAnalyticsData()
      ]);
      setLastUpdated(new Date());
      toast.success('Dashboard data refreshed');
    } catch (error) {
      toast.error('Failed to refresh dashboard data');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1500);
    }
  };

  // Use real accounts if available, otherwise fallback to mock data
  const displayAccounts = realAccounts.length > 0 ? realAccounts.map(account => ({
    id: account.accountId,
    type: account.accountType,
    name: `${account.accountType} Account`,
    balance: account.balance,
    accountNumber: `****${account.accountNumber.slice(-4)}`,
    change: Math.random() * 10 - 5 // Random change for demo
  })) : accounts;

  const totalBalance = displayAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Here's your financial overview for today
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              Last updated: {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={user.kycStatus === 'verified' ? 'default' : 'secondary'} className="px-3 py-1 flex items-center gap-1">
            {user.kycStatus === 'verified' && <Shield className="h-3 w-3" />}
            KYC {user.kycStatus}
          </Badge>
        </div>
      </div>

      {/* Live Balance Card - Real-time data from API */}
      {loadingAccounts ? (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <div>
                <h3 className="text-xl font-bold">Loading Balance...</h3>
                <p className="text-blue-100">Fetching your latest account information</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : realAccounts.length === 0 ? (
        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <AlertCircle className="h-8 w-8" />
                <div>
                  <h3 className="text-xl font-bold">Welcome to WTF Bank!</h3>
                  <p className="text-amber-100">Let's set up your first account to get started</p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                variant="secondary"
                size="sm"
                className="bg-white text-amber-700 hover:bg-amber-50"
              >
                {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                {isRefreshing ? 'Checking...' : 'Create Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <LiveBalanceCard user={user} refreshTrigger={lastUpdated.getTime()} />
      )}

      {/* Account Details Cards */}
      {displayAccounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">{account.type}</CardTitle>
                  {account.type === 'Checking' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
                  {account.type === 'Savings' && <PiggyBank className="h-4 w-4 text-muted-foreground" />}
                  {account.type === 'Investment' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {showBalance ? `₹${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••'}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{account.accountNumber}</p>
                    <div className={`flex items-center text-xs ${account.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {account.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {account.change > 0 ? '+' : ''}{account.change.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : !loadingAccounts ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Checking', 'Savings', 'Investment'].map((type, index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-dashed border-2">
                <CardHeader className="px-6 pt-6 pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium">{type}</CardTitle>
                  {type === 'Checking' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
                  {type === 'Savings' && <PiggyBank className="h-4 w-4 text-muted-foreground" />}
                  {type === 'Investment' && <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">No {type} Account</p>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Open {type} Account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Charts and Analytics Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Account Balance Trend</CardTitle>
                  <CardDescription>Your balance over the past 12 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Balance']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#d4af37" 
                        strokeWidth={3}
                        dot={{ fill: '#d4af37', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>Financial flow over the past year</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, '']}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="expenses" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spending Breakdown</CardTitle>
                <CardDescription>This month's expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Spent']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed spending breakdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {spendingData.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.category}</span>
                      <span className="font-medium">₹{category.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-accent" />
                      {goal.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(goal.deadline).toLocaleDateString('en-IN')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">
                          {Math.round((goal.current / goal.target) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ₹{goal.current.toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Money
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mr-3" />
              <span className="text-lg text-muted-foreground">Loading analytics data...</span>
            </div>
          ) : analyticsData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Score</CardTitle>
                  <CardDescription>Based on your spending patterns</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {/* Calculate a health score based on credit-to-debit ratio */}
                  {(() => {
                    const totalCredits = analyticsData.totalCredits || 0;
                    const totalDebits = analyticsData.totalDebits || 0;
                    const ratio = totalDebits > 0 ? totalCredits / totalDebits : 1;
                    // Score between 1-10, higher is better
                    const score = Math.min(10, Math.max(1, Math.round(ratio * 5 * 10) / 10));
                    const scorePercent = score * 10;
                    
                    let scoreText = 'Poor';
                    let scoreColor = 'text-red-600';
                    
                    if (score >= 8) {
                      scoreText = 'Excellent';
                      scoreColor = 'text-green-600';
                    } else if (score >= 6) {
                      scoreText = 'Good';
                      scoreColor = 'text-blue-600';
                    } else if (score >= 4) {
                      scoreText = 'Average';
                      scoreColor = 'text-amber-600';
                    }
                    
                    return (
                      <>
                        <div className={`text-4xl font-bold ${scoreColor} mb-2`}>{score.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground mb-4">{scoreText}</div>
                        <Progress value={scorePercent} className="h-3 mb-4" />
                        <div className="text-xs text-muted-foreground">
                          {ratio >= 1 ? 'Income exceeds expenses' : 'Expenses exceed income'}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Savings Rate</CardTitle>
                  <CardDescription>Percentage of income saved</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {(() => {
                    const totalCredits = analyticsData.totalCredits || 0;
                    const totalDebits = analyticsData.totalDebits || 0;
                    // Calculate savings rate
                    const savingsRate = totalCredits > 0 
                      ? Math.round(((totalCredits - totalDebits) / totalCredits) * 100) 
                      : 0;
                    
                    // Determine if it's positive or negative
                    const isPositive = savingsRate > 0;
                    const displayRate = Math.abs(savingsRate);
                    
                    let rateText = 'Below Average';
                    if (savingsRate >= 30) rateText = 'Excellent';
                    else if (savingsRate >= 20) rateText = 'Above Average';
                    else if (savingsRate >= 10) rateText = 'Average';
                    
                    return (
                      <>
                        <div className={`text-4xl font-bold ${isPositive ? 'text-accent' : 'text-red-600'} mb-2`}>
                          {isPositive ? '' : '-'}{displayRate}%
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">{rateText}</div>
                        <div className={`flex items-center justify-center ${isPositive ? 'text-green-600' : 'text-red-600'} text-sm`}>
                          {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          {isPositive ? 'Saving' : 'Spending'} {displayRate}% of income
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Activity</CardTitle>
                  <CardDescription>Last 90 days summary</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analyticsData.totalTransactions || 0}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">Total Transactions</div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {analyticsData.totalCreditTransactions || 0} Credits
                    </div>
                    <div className="flex items-center text-red-600 text-sm">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      {analyticsData.totalDebitTransactions || 0} Debits
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No analytics data available</p>
              <Button variant="outline" onClick={fetchAnalyticsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Analytics Data
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentsAndMoreCard user={user} onTransactionComplete={handleTransactionComplete} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  // Navigate to transactions tab
                  const transactionsLink = document.querySelector('a[href="#transactions"]');
                  if (transactionsLink) {
                    (transactionsLink as HTMLElement).click();
                  }
                }}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">Loading transactions...</span>
                </div>
              ) : realTransactions.length > 0 ? (
                <div className="space-y-4">
                  {realTransactions.slice(0, 6).map((transaction) => {
                    // Handle different API response formats
                    const txnType = transaction.transactionType?.toLowerCase() || 
                                   transaction.type?.toLowerCase() || 'debit';
                    
                    const isCredit = txnType === 'credit';
                    const isTransfer = txnType === 'transfer';
                    // For transfers, we consider them as debits (money going out)
                    const isDebit = txnType === 'debit' || isTransfer;
                    const category = isCredit ? 'Income' : 
                                   isTransfer ? 'Transfer' : 'Expense';
                    
                    const txnId = transaction.transactionId || transaction.id;
                    const txnDescription = transaction.description || 'Transaction';
                    const txnAmount = transaction.amount || 0;
                    const txnDate = transaction.transactionDate || transaction.timestamp || transaction.date;
                    const txnStatus = transaction.transactionStatus || transaction.status || 'Completed';
                    const txnRecipient = transaction.recipientAccountId || transaction.recipientAccount;
                    
                    return (
                      <div key={txnId} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {isCredit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-accent transition-colors">
                              {txnDescription}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">{category}</p>
                              <Badge 
                                variant={txnStatus.toLowerCase() === 'completed' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {txnStatus}
                              </Badge>
                              {txnRecipient && (
                                <span className="text-xs text-muted-foreground">
                                  To: {txnRecipient}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            isCredit ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isCredit ? '+' : '-'}₹{Math.abs(txnAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(txnDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent transactions found</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={fetchRealTransactions}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}