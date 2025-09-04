import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, FileCheck, MessageSquare, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminOverviewProps {
  user: any;
}

export default function AdminOverview({ user }: AdminOverviewProps) {
  const stats = [
    {
      title: 'Total Users',
      value: '12,547',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Pending KYC',
      value: '89',
      change: '-5.2%',
      trend: 'down',
      icon: FileCheck,
      color: 'text-orange-600'
    },
    {
      title: 'Support Tickets',
      value: '156',
      change: '+3.1%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      title: 'Total Deposits',
      value: '₹20.2Cr',
      change: '+18.7%',
      trend: 'up',
      icon: DollarSign,
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

  const kycStatusData = [
    { name: 'Verified', value: 10892, color: '#22c55e' },
    { name: 'Pending', value: 1189, color: '#f59e0b' },
    { name: 'Rejected', value: 466, color: '#ef4444' }
  ];

  const recentActivities = [
    { id: 1, type: 'kyc_approved', user: 'John Doe', details: 'KYC verification approved', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'support_ticket', user: 'Jane Smith', details: 'New support ticket created', time: '5 minutes ago', status: 'pending' },
    { id: 3, type: 'kyc_rejected', user: 'Mike Johnson', details: 'KYC verification rejected', time: '10 minutes ago', status: 'error' },
    { id: 4, type: 'user_registered', user: 'Sarah Wilson', details: 'New user registration', time: '15 minutes ago', status: 'info' },
    { id: 5, type: 'kyc_submitted', user: 'David Brown', details: 'KYC documents submitted', time: '20 minutes ago', status: 'pending' }
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
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <FileCheck className="w-8 h-8 text-orange-600 mb-2" />
                <h4 className="font-semibold">Review KYC</h4>
                <p className="text-sm text-muted-foreground">89 pending verifications</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-semibold">Support Tickets</h4>
                <p className="text-sm text-muted-foreground">156 open tickets</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-semibold">User Management</h4>
                <p className="text-sm text-muted-foreground">Manage user accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}