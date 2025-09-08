import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, FileCheck, MessageSquare, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { enhancedApiService as apiService } from '../../services/enhanced-api';
import { toast } from 'sonner';

interface AdminOverviewProps {
  user: any;
}

export default function AdminOverview({ user }: AdminOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [kycStatistics, setKycStatistics] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [supportTickets, setSupportTickets] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOverviewData();
    
    // Auto-refresh every 30 seconds for real-time data
    const refreshInterval = setInterval(() => {
      refreshData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const refreshData = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Auto-refreshing admin overview data...');
      
      // Fetch only the essential data for Quick Actions
      const [kycStats, tickets] = await Promise.all([
        apiService.getKYCStatistics().catch(() => null),
        apiService.getAdminSupportTickets({ page: 0, size: 1 }).catch(() => null)
      ]);
      
      if (kycStats) {
        setKycStatistics(kycStats);
        setCustomerData({ totalElements: kycStats?.totalCustomers || 0 });
      }
      
      if (tickets) {
        setSupportTickets(tickets);
      }
      
      setLastUpdate(new Date());
      console.log('✅ Quick Actions data refreshed successfully');
    } catch (error) {
      console.error('❌ Auto-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'kyc':
        toast.info('Navigating to KYC Management...');
        // You can add navigation logic here
        break;
      case 'support':
        toast.info('Navigating to Support Management...');
        // You can add navigation logic here
        break;
      case 'users':
        toast.info('Navigating to User Management...');
        // You can add navigation logic here
        break;
      default:
        break;
    }
  };

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Starting admin overview data fetch...');
      
      // Debug: Check if admin token exists
      const tokenManager = apiService.getTokenManager();
      const token = tokenManager.getToken();
      const userType = tokenManager.getTokenType();
      console.log('🔑 Admin token exists:', !!token);
      console.log('👤 User type:', userType);
      
      // Decode JWT to see what claims it contains
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🎫 JWT Token Claims:', {
              sub: payload.sub,
              role: payload.role,
              roles: payload.roles,
              authorities: payload.authorities,
              scope: payload.scope,
              iat: payload.iat,
              exp: payload.exp,
              fullPayload: payload
            });
            
            // Check if user has KYC officer role
            const hasKycRole =
              payload.role === 'ROLE_KYC_OFFICER' ||
              payload.role === 'KYC_OFFICER' ||
              (payload.roles && (payload.roles.includes('KYC_OFFICER') || payload.roles.includes('ROLE_KYC_OFFICER'))) ||
              (payload.authorities &&
                (payload.authorities.includes('ROLE_KYC_OFFICER') ||
                 payload.authorities.includes('ROLE_COMPLIANCE_OFFICER') ||
                 payload.authorities.includes('ROLE_BRANCH_MANAGER') ||
                 payload.authorities.includes('ROLE_REGIONAL_MANAGER') ||
                 payload.authorities.includes('ROLE_SYSTEM_ADMIN') ||
                 payload.authorities.includes('ROLE_SUPER_ADMIN')));
            
            console.log('🔍 KYC Role Check:', {
              hasKycRole,
              currentRole: payload.role,
              allRoles: payload.roles,
              authorities: payload.authorities
            });
            
            if (!hasKycRole) {
              console.warn('⚠️ WARNING: Current admin user may not have required role for KYC endpoints');
              console.warn('📋 Current Role:', payload.role);
              console.warn('📋 Current Authorities:', payload.authorities);
              console.warn('📋 Required roles: ROLE_KYC_OFFICER, ROLE_COMPLIANCE_OFFICER, ROLE_BRANCH_MANAGER, ROLE_REGIONAL_MANAGER, ROLE_SYSTEM_ADMIN, ROLE_SUPER_ADMIN');
              console.warn("💡 SOLUTION: Logout and login with 'super.admin' / 'admin123'");
            }
          }
        } catch (e) {
          console.error('❌ Failed to decode JWT token:', e);
        }
      }
      
      if (!token) {
        throw new Error('No admin token found. Please login again.');
      }
      
      if (userType !== 'admin') {
        throw new Error(`Invalid user type: ${userType}. Expected 'admin'. Please login as admin.`);
      }

      // MANUAL TEST: Try direct fetch to see exact error
      console.log('🧪 MANUAL TEST: Making direct fetch request to debug...');
      
      try {
        const directResponse = await fetch('http://localhost:8080/admin/kyc/pending-documents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 DIRECT FETCH RESPONSE:');
        console.log('   Status:', directResponse.status);
        console.log('   Status Text:', directResponse.statusText);
        console.log('   Headers:', Object.fromEntries(directResponse.headers.entries()));
        
        if (!directResponse.ok) {
          const errorText = await directResponse.text();
          console.log('   Error Body:', errorText);
          
          try {
            const errorJson = JSON.parse(errorText);
            console.log('   Error JSON:', errorJson);
          } catch (e) {
            console.log('   Error is not JSON, raw text:', errorText);
          }
        } else {
          const successData = await directResponse.json();
          console.log('   Success Data:', successData);
        }
      } catch (fetchError) {
        console.error('🚨 DIRECT FETCH FAILED:', fetchError);
      }
      
      try {
        // Test if admin endpoints are working at all by trying a different one
        console.log('🔍 Testing admin endpoints via API service...');
        console.log('🎫 Current admin token:', token ? `${token.substring(0, 30)}...` : 'NO TOKEN');
        
        // Try KYC statistics first
        console.log('📊 Fetching KYC statistics...');
        console.log('🔗 Backend URL:', 'http://localhost:8080/admin/kyc/pending-documents');
        
        const kycStats = await apiService.getKYCStatistics();
        console.log('✅ KYC Statistics received:', kycStats);
        
        // Try support tickets
        console.log('🎫 Fetching support tickets...');
        console.log('🔗 Backend URL:', 'http://localhost:8080/admin/support/tickets?page=0&size=1');
        
        const tickets = await apiService.getAdminSupportTickets({ page: 0, size: 1 });
        console.log('✅ Support tickets received:', tickets);

        setKycStatistics(kycStats);
        setSupportTickets(tickets);
        
        // Derive customer count from KYC statistics (totalCustomers field)
        setCustomerData({ totalElements: (kycStats as any)?.totalCustomers || 0 });

        // Generate recent activities from the data
        const activities = generateRecentActivities(kycStats || {}, { totalElements: (kycStats as any)?.totalCustomers || 0 }, tickets);
        setRecentActivities(activities);
        
        console.log('🎉 Admin overview data loaded successfully!');
      } catch (apiError: any) {
        console.error('❌ API calls failed:', apiError);
        throw apiError;
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch overview data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        stack: error.stack,
        name: error.name,
        response: error.response
      });
      
      // Show the exact backend response
      if (error.status === 403) {
        console.error('🚨 403 FORBIDDEN - Backend rejected admin token for KYC endpoint');
        console.error('📋 Allowed roles include: ROLE_KYC_OFFICER, ROLE_COMPLIANCE_OFFICER, ROLE_BRANCH_MANAGER, ROLE_REGIONAL_MANAGER, ROLE_SYSTEM_ADMIN, ROLE_SUPER_ADMIN');
        toast.error('403 Forbidden: Admin role lacks permission for /admin/kyc/* endpoints.');
      } else if (error.status === 401) {
        toast.error('Admin session expired. Please login again.');
        // Auto-logout on expired token
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (error.status === 404) {
        console.error('🚨 404 NOT FOUND - Admin endpoints missing from backend');
        toast.error('Admin API endpoints not found. Check backend implementation.');
      } else if (error.status === 0 || error.message?.includes('Network error')) {
        toast.error('Cannot connect to backend. Is your backend running on http://localhost:8080?');
      } else {
        toast.error(`Backend Error ${error.status}: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (kyc: any, customers: any, tickets: any) => {
    // Generate activities based on real data
    const activities: any[] = [];
    
    if (kyc?.verifiedKyc > 0) {
      activities.push({
        id: 1,
        type: 'kyc_approved',
        user: 'Recent Customer',
        details: 'KYC verification approved',
        time: '2 minutes ago',
        status: 'success'
      });
    }
    
    if (tickets?.totalElements > 0) {
      activities.push({
        id: 2,
        type: 'support_ticket',
        user: 'Customer',
        details: 'New support ticket created',
        time: '5 minutes ago',
        status: 'pending'
      });
    }
    
    if (customers?.totalElements > 0) {
      activities.push({
        id: 3,
        type: 'user_registered',
        user: 'New Customer',
        details: 'New user registration',
        time: '15 minutes ago',
        status: 'info'
      });
    }
    
    return activities;
  };

  const stats = [
    {
      title: 'Total Users',
      value: loading ? '...' : (customerData?.totalElements?.toLocaleString() || '0'),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Pending KYC',
      value: loading ? '...' : (kycStatistics?.pendingKyc?.toString() || '0'),
      change: '-5.2%',
      trend: 'down',
      icon: FileCheck,
      color: 'text-orange-600'
    },
    {
      title: 'Support Tickets',
      value: loading ? '...' : (supportTickets?.totalElements?.toString() || '0'),
      change: '+3.1%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Verified KYC',
      value: loading ? '...' : (kycStatistics?.verifiedKyc?.toString() || '0'),
      change: '+18.7%',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600'
    }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 8500, active: 7200 },
    { month: 'Feb', users: 9200, active: 7800 },
    { month: 'Mar', users: 9800, active: 8300 },
    { month: 'Apr', users: 10500, active: 8900 },
    { month: 'May', users: 11200, active: 9500 },
    { month: 'Jun', users: 11800, active: 10100 },
    { month: 'Jul', users: 12547, active: 10650 }
  ];

  const kycStatusData = loading ? [] : [
    { name: 'Verified', value: kycStatistics?.verifiedKyc || 0, color: '#22c55e' },
    { name: 'Pending', value: kycStatistics?.pendingKyc || 0, color: '#f59e0b' },
    { name: 'Rejected', value: kycStatistics?.rejectedKyc || 0, color: '#ef4444' },
    { name: 'Under Review', value: kycStatistics?.underReviewKyc || 0, color: '#3b82f6' }
  ];


  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'kyc_approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'kyc_rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'support_ticket':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'user_registered':
        return <Users className="w-4 h-4 text-blue-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, Admin!</h1>
        <p className="text-muted-foreground">Here's what's happening with WTF Bank today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                    )}
                    <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                    <span className="ml-1">from last month</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Total and active users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#1a1d29" 
                    strokeWidth={3}
                    name="Total Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#d4af37" 
                    strokeWidth={3}
                    name="Active Users"
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
              <CardTitle>KYC Status Distribution</CardTitle>
              <CardDescription>Current verification status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                  <Pie
                    data={kycStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {kycStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Users']} />
                </PieChart>
                </ResponsiveContainer>
              )}
              <div className="flex justify-center space-x-4 mt-4">
                {kycStatusData.map((entry) => (
                  <div key={entry.name} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-sm text-muted-foreground">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest system activities and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.user}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(activity.status)}
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => handleQuickAction('kyc')}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer group hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileCheck className="w-8 h-8 text-orange-600 group-hover:text-orange-700 transition-colors" />
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <h4 className="font-semibold group-hover:text-orange-700 transition-colors">Review KYC</h4>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${kycStatistics?.pendingKyc || 0} pending verifications`}
                </p>
                <div className="mt-2 text-xs text-orange-600 font-medium">
                  {!loading && kycStatistics?.pendingKyc > 0 && 'Action Required'}
                </div>
                {!loading && kycStatistics?.pendingKyc > 0 && (
                  <div className="mt-2 text-xs text-orange-500">
                    Click to review pending documents
                  </div>
                )}
              </div>
              
              <div 
                onClick={() => handleQuickAction('support')}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer group hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="w-8 h-8 text-purple-600 group-hover:text-purple-700 transition-colors" />
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <h4 className="font-semibold group-hover:text-purple-700 transition-colors">Support Tickets</h4>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${supportTickets?.totalElements || 0} open tickets`}
                </p>
                <div className="mt-2 text-xs text-purple-600 font-medium">
                  {!loading && supportTickets?.totalElements > 0 && 'Needs Attention'}
                </div>
                {!loading && supportTickets?.totalElements > 0 && (
                  <div className="mt-2 text-xs text-purple-500">
                    Click to manage support requests
                  </div>
                )}
              </div>
              
              <div 
                onClick={() => handleQuickAction('users')}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-all cursor-pointer group hover:shadow-md hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <h4 className="font-semibold group-hover:text-blue-700 transition-colors">User Management</h4>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Loading...' : `${customerData?.totalElements || 0} total users`}
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  {!loading && customerData?.totalElements > 0 && 'Active Users'}
                </div>
                {!loading && customerData?.totalElements > 0 && (
                  <div className="mt-2 text-xs text-blue-500">
                    Click to manage user accounts
                  </div>
                )}
              </div>
            </div>
            
            {/* Real-time Status Indicators */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live Data</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Auto-refresh</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  {isRefreshing && <Loader2 className="w-3 h-3 animate-spin" />}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}