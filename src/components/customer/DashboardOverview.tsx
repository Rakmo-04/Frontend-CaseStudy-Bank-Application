import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Plus, Send, Download, CreditCard, Wallet, PiggyBank, Eye, EyeOff, RefreshCw, Bell, Target, Calendar, ArrowUpRight, ArrowDownRight, Zap, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface DashboardOverviewProps {
  user: any;
}

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const accounts = [
    { id: 1, type: 'Checking', name: 'Primary Checking', balance: 1047832.50, accountNumber: '****1234', change: +2.3 },
    { id: 2, type: 'Savings', name: 'Emergency Fund', balance: 3785420.75, accountNumber: '****5678', change: +5.1 },
    { id: 3, type: 'Investment', name: 'Growth Portfolio', balance: 7456821.25, accountNumber: '****9012', change: +12.8 }
  ];

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
      toast.success('Account data refreshed');
    }, 1500);
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

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

      {/* Account Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-8 w-8 p-0"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `₹${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••'}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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
                    {account.change > 0 ? '+' : ''}{account.change}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
                <CardDescription>Based on your spending patterns</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">8.5</div>
                <div className="text-sm text-muted-foreground mb-4">Excellent</div>
                <Progress value={85} className="h-3 mb-4" />
                <div className="text-xs text-muted-foreground">
                  Great savings rate and spending control
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Savings Rate</CardTitle>
                <CardDescription>Percentage of income saved</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">35%</div>
                <div className="text-sm text-muted-foreground mb-4">Above Average</div>
                <div className="flex items-center justify-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Growth</CardTitle>
                <CardDescription>Portfolio performance</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">+12.8%</div>
                <div className="text-sm text-muted-foreground mb-4">This Year</div>
                <div className="flex items-center justify-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Outperforming market
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                Quick Actions
              </CardTitle>
              <CardDescription>Common banking operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => toast.success('Transfer money feature coming soon!')}
              >
                <Send className="h-4 w-4 mr-2" />
                Transfer Money
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => toast.success('Add account feature coming soon!')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => toast.success('Statement download started!')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => toast.success('Card request submitted!')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Request Card
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => toast.success('Bill pay feature coming soon!')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Pay Bills
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-accent transition-colors">{transaction.description}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          <Badge 
                            variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}