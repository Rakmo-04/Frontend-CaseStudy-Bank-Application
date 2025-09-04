import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, CreditCard } from 'lucide-react';

interface AdminAnalyticsProps {
  user: any;
}

export default function AdminAnalytics({ user }: AdminAnalyticsProps) {
  const transactionData = [
    { month: 'Jan', credits: 1200000, debits: 890000, netFlow: 310000 },
    { month: 'Feb', credits: 1350000, debits: 920000, netFlow: 430000 },
    { month: 'Mar', credits: 1450000, debits: 1100000, netFlow: 350000 },
    { month: 'Apr', credits: 1600000, debits: 1150000, netFlow: 450000 },
    { month: 'May', credits: 1720000, debits: 1200000, netFlow: 520000 },
    { month: 'Jun', credits: 1850000, debits: 1280000, netFlow: 570000 },
    { month: 'Jul', credits: 1950000, debits: 1350000, netFlow: 600000 }
  ];

  const userActivityData = [
    { day: 'Mon', logins: 2400, transactions: 1890, support: 45 },
    { day: 'Tue', logins: 2100, transactions: 1650, support: 38 },
    { day: 'Wed', logins: 2600, transactions: 2100, support: 52 },
    { day: 'Thu', logins: 2300, transactions: 1890, support: 41 },
    { day: 'Fri', logins: 2800, transactions: 2250, support: 35 },
    { day: 'Sat', logins: 1900, transactions: 1450, support: 28 },
    { day: 'Sun', logins: 1650, transactions: 1200, support: 22 }
  ];

  const accountTypeDistribution = [
    { name: 'Checking', value: 6547, percentage: 52.1, color: '#1a1d29' },
    { name: 'Savings', value: 3892, percentage: 31.0, color: '#d4af37' },
    { name: 'Investment', value: 2108, percentage: 16.9, color: '#64748b' }
  ];

  const transactionCategories = [
    { category: 'Transfers', amount: 850000, count: 12450 },
    { category: 'Bill Payments', amount: 620000, count: 8920 },
    { category: 'Deposits', amount: 1200000, count: 5630 },
    { category: 'Withdrawals', amount: 450000, count: 7820 },
    { category: 'Investments', amount: 320000, count: 2340 }
  ];

  const revenueData = [
    { month: 'Jan', fees: 45000, interest: 78000, total: 123000 },
    { month: 'Feb', fees: 48000, interest: 82000, total: 130000 },
    { month: 'Mar', fees: 52000, interest: 85000, total: 137000 },
    { month: 'Apr', fees: 55000, interest: 89000, total: 144000 },
    { month: 'May', fees: 58000, interest: 92000, total: 150000 },
    { month: 'Jun', fees: 62000, interest: 95000, total: 157000 },
    { month: 'Jul', fees: 65000, interest: 98000, total: 163000 }
  ];

  const kycMetrics = [
    { month: 'Jan', submitted: 420, approved: 380, rejected: 40, pending: 25 },
    { month: 'Feb', submitted: 380, approved: 345, rejected: 35, pending: 22 },
    { month: 'Mar', submitted: 450, approved: 410, rejected: 40, pending: 28 },
    { month: 'Apr', submitted: 520, approved: 485, rejected: 35, pending: 32 },
    { month: 'May', submitted: 580, approved: 545, rejected: 35, pending: 38 },
    { month: 'Jun', submitted: 620, approved: 585, rejected: 35, pending: 42 },
    { month: 'Jul', submitted: 680, approved: 635, rejected: 45, pending: 48 }
  ];

  const keyMetrics = [
    {
      title: 'Total Transaction Volume',
      value: '$19.5M',
      change: '+18.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Users',
      value: '10,650',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Daily Transactions',
      value: '2,847',
      change: '+8.3%',
      trend: 'up',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue This Month',
      value: '$163K',
      change: '+15.7%',
      trend: 'up',
      icon: CreditCard,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive insights into bank operations and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                      {metric.change}
                    </span>
                    <span className="ml-1">vs last month</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="kyc">KYC Metrics</TabsTrigger>
        </TabsList>

        {/* Transaction Analytics */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Flow</CardTitle>
                  <CardDescription>Monthly credits, debits, and net flow</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={transactionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, '']} />
                      <Area 
                        type="monotone" 
                        dataKey="credits" 
                        stackId="1" 
                        stroke="#22c55e" 
                        fill="#22c55e" 
                        fillOpacity={0.6}
                        name="Credits"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="debits" 
                        stackId="1" 
                        stroke="#ef4444" 
                        fill="#ef4444" 
                        fillOpacity={0.6}
                        name="Debits"
                      />
                    </AreaChart>
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
                  <CardTitle>Transaction Categories</CardTitle>
                  <CardDescription>Breakdown by transaction type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={transactionCategories}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'amount' ? `$${(value as number).toLocaleString()}` : value,
                          name === 'amount' ? 'Volume' : 'Count'
                        ]}
                      />
                      <Bar dataKey="amount" fill="#1a1d29" name="amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* User Analytics */}
        <TabsContent value="users" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Weekly User Activity</CardTitle>
                <CardDescription>User logins, transactions, and support interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke="#1a1d29" 
                      strokeWidth={3}
                      name="Logins"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="transactions" 
                      stroke="#d4af37" 
                      strokeWidth={3}
                      name="Transactions"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="support" 
                      stroke="#64748b" 
                      strokeWidth={3}
                      name="Support Tickets"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Account Analytics */}
        <TabsContent value="accounts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Account Type Distribution</CardTitle>
                  <CardDescription>Breakdown of account types by count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={accountTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {accountTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Accounts']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center space-x-4 mt-4">
                    {accountTypeDistribution.map((entry) => (
                      <div key={entry.name} className="text-center">
                        <div className="flex items-center space-x-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <span className="text-sm font-medium">{entry.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.value} ({entry.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>Key account metrics and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">12,547</div>
                        <div className="text-sm text-muted-foreground">Total Accounts</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold">$147M</div>
                        <div className="text-sm text-muted-foreground">Total Deposits</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Account Growth Rate</span>
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Balance</span>
                        <span className="text-sm font-medium">$11,720</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Active Accounts</span>
                        <span className="text-sm font-medium">10,650 (84.9%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Dormant Accounts</span>
                        <span className="text-sm font-medium">1,897 (15.1%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Monthly fees and interest income</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${(value as number).toLocaleString()}`, '']} />
                    <Bar dataKey="fees" fill="#d4af37" name="Fees" />
                    <Bar dataKey="interest" fill="#1a1d29" name="Interest" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* KYC Analytics */}
        <TabsContent value="kyc" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>KYC Processing Metrics</CardTitle>
                <CardDescription>Monthly KYC submission and approval trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={kycMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="submitted" 
                      stroke="#64748b" 
                      strokeWidth={3}
                      name="Submitted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approved" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      name="Approved"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rejected" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      name="Rejected"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pending" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="Pending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}