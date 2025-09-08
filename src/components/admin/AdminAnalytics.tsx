import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, CreditCard, RefreshCw, Wifi, WifiOff, Clock, Zap } from 'lucide-react';
import { enhancedApiService as apiService } from '../../services/enhanced-api';
import { toast } from 'sonner';

interface AdminAnalyticsProps {
  user: any;
}

export default function AdminAnalytics({ user }: AdminAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Real-time data states
  const [transactionData, setTransactionData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  const [accountTypeDistribution, setAccountTypeDistribution] = useState([]);
  const [transactionCategories, setTransactionCategories] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [kycMetrics, setKycMetrics] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState([]);

  // Fetch analytics data
  const fetchAnalyticsData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setIsRefreshing(true);

    try {
      // Fetch available admin data
      const [
        kycStats,
        customersData,
        pendingKycDocs,
        supportTickets
      ] = await Promise.all([
        apiService.getKYCStatistics(),
        apiService.getAllCustomers(),
        apiService.getPendingKYCDocuments(),
        apiService.getAdminSupportTickets()
      ]);

      // Process and format data
      setKycMetrics(kycStats || []);

      // Use customers data for user metrics
      const customerStats = customersData?.content || [];
      setUserActivityData(customerStats);

      // Set fallback data for charts that don't have real endpoints
      setTransactionData([]);
      setAccountTypeDistribution([]);
      setTransactionCategories([]);
      setRevenueData([]);

      // Calculate key metrics from available data
      const metrics = [
        {
          title: 'Total KYC Applications',
          value: (kycStats?.totalApplications || 0).toString(),
          change: '+12.5%',
          trend: 'up',
          icon: Users,
          color: 'text-blue-600'
        },
        {
          title: 'Approved KYC',
          value: (kycStats?.approved || 0).toString(),
          change: '+15.2%',
          trend: 'up',
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          title: 'Pending KYC',
          value: (kycStats?.pending || 0).toString(),
          change: '-8.3%',
          trend: 'down',
          icon: Clock,
          color: 'text-orange-600'
        },
        {
          title: 'Support Tickets',
          value: (supportTickets?.content?.length || 0).toString(),
          change: '+5.7%',
          trend: 'up',
          icon: Activity,
          color: 'text-purple-600'
        }
      ];
      setKeyMetrics(metrics);

      setLastUpdate(new Date());
      setIsOnline(true);

    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast.error('Failed to load analytics data');
      setIsOnline(false);

      // Fallback to mock data if API fails
      setFallbackData();
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fallback mock data
  const setFallbackData = () => {
    // Mock KYC stats
    setKycMetrics([
      { month: 'Jan', submitted: 420, approved: 380, rejected: 40, pending: 25 },
      { month: 'Feb', submitted: 380, approved: 345, rejected: 35, pending: 22 },
      { month: 'Mar', submitted: 450, approved: 410, rejected: 40, pending: 28 },
      { month: 'Apr', submitted: 520, approved: 485, rejected: 35, pending: 32 },
      { month: 'May', submitted: 580, approved: 545, rejected: 35, pending: 38 },
      { month: 'Jun', submitted: 620, approved: 585, rejected: 35, pending: 42 },
      { month: 'Jul', submitted: 680, approved: 635, rejected: 45, pending: 48 }
    ]);

    // Mock customer data
    setUserActivityData([
      { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive' }
    ]);

    // Empty arrays for charts without real endpoints
    setTransactionData([]);
    setAccountTypeDistribution([]);
    setTransactionCategories([]);
    setRevenueData([]);

    setKeyMetrics([
      {
        title: 'Total KYC Applications',
        value: '1,247',
        change: '+12.5%',
        trend: 'up',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: 'Approved KYC',
        value: '1,120',
        change: '+15.2%',
        trend: 'up',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Pending KYC',
        value: '127',
        change: '-8.3%',
        trend: 'down',
        icon: Clock,
        color: 'text-orange-600'
      },
      {
        title: 'Support Tickets',
        value: '45',
        change: '+5.7%',
        trend: 'up',
        icon: Activity,
        color: 'text-purple-600'
      }
    ]);
  };

  // Auto-refresh functionality
  useEffect(() => {
    fetchAnalyticsData(true);

    const interval = setInterval(() => {
      if (isOnline) {
        fetchAnalyticsData(false);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, isOnline]);

  // Manual refresh
  const handleRefresh = () => {
    fetchAnalyticsData(false);
    toast.success('Analytics data refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header with Real-time Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights into bank operations and performance</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <Badge variant={isOnline ? "secondary" : "destructive"} className="text-xs">
              {isOnline ? "Live" : "Offline"}
            </Badge>
          </div>

          {/* Last Update Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>

          {/* Auto-refresh Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {!isLoading && (
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
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    </div>
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
      )}

      {/* Main Analytics Tabs */}
      {!isLoading && (
        <Tabs defaultValue="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-5">
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="kyc">KYC Metrics</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Real-time data</span>
            </div>
          </div>

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
                  {transactionData.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Transaction data not available</p>
                        <p className="text-sm">This chart will show when transaction APIs are implemented</p>
                      </div>
                    </div>
                  )}
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
                  {transactionCategories.length > 0 ? (
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
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Transaction categories not available</p>
                        <p className="text-sm">This chart will show when category APIs are implemented</p>
                      </div>
                    </div>
                  )}
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
                {userActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={userActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="id"
                        stroke="#1a1d29"
                        strokeWidth={3}
                        name="Customer ID"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>User activity data not available</p>
                      <p className="text-sm">This chart will show when user analytics APIs are implemented</p>
                    </div>
                  </div>
                )}
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
                  {accountTypeDistribution.length > 0 ? (
                    <>
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
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Account distribution data not available</p>
                        <p className="text-sm">This chart will show when account APIs are implemented</p>
                      </div>
                    </div>
                  )}
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
                {revenueData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Revenue data not available</p>
                      <p className="text-sm">This chart will show when revenue APIs are implemented</p>
                    </div>
                  </div>
                )}
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
                {kycMetrics.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>KYC metrics data not available</p>
                      <p className="text-sm">This chart will show when KYC APIs are implemented</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}