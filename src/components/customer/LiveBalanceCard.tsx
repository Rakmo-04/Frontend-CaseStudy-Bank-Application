import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import { Account } from '../../Models/Account';

interface LiveBalanceCardProps {
  user: any;
  refreshTrigger?: number; // Used to trigger refresh from parent components
}

interface BalanceData {
  balance: number;
  accountId: number;
  accountNumber?: string;
  accountType?: string;
  lastUpdated: string;
  todayChange?: number;
  monthChange?: number;
}

export default function LiveBalanceCard({ user, refreshTrigger = 0 }: LiveBalanceCardProps) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch balance data from API
  const fetchBalanceData = useCallback(async (showLoading = true) => {
    if (!user?.accountId) {
      setError('Account information not available');
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Get account details with balance
      const accountData = await apiService.getAccountById(user.accountId);
      
      // Calculate today's change (would need backend API for real data)
      const todayChange = 0; // TODO: Add real change calculation from backend
      const monthChange = 0; // TODO: Add real monthly change from backend
      
      setBalanceData({
        balance: accountData.balance,
        accountId: accountData.accountId,
        accountNumber: accountData.accountNumber,
        accountType: accountData.accountType,
        lastUpdated: new Date().toISOString(),
        todayChange,
        monthChange
      });
      
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Failed to fetch balance:', err);
      setError(err.message || 'Failed to load balance');
      toast.error('Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  }, [user?.accountId]);

  // Manual refresh
  const handleRefresh = async () => {
    await fetchBalanceData(true);
    toast.success('Balance refreshed successfully!');
  };

  // Auto-refresh every 5 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchBalanceData(false); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchBalanceData, autoRefresh]);

  // Initial load and refresh trigger
  useEffect(() => {
    fetchBalanceData(true);
  }, [fetchBalanceData, refreshTrigger]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format large numbers
  const formatLargeNumber = (amount: number) => {
    if (Math.abs(amount) >= 10000000) { // 1 crore
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (Math.abs(amount) >= 100000) { // 1 lakh
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (Math.abs(amount) >= 1000) { // 1 thousand
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return formatCurrency(amount);
  };

  if (loading && !balanceData) {
    return (
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin" />
            <div className="ml-4">
              <h3 className="text-xl font-bold">Loading Balance...</h3>
              <p className="text-blue-100">Fetching your latest account information</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }


  if (!balanceData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-24 translate-y-24"></div>
        </div>

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                Live Balance
                <AnimatePresence>
                  {autoRefresh && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Badge variant="secondary" className="bg-green-500 text-white border-green-400">
                        <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse mr-1"></div>
                        Live
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Updates every 5 seconds • Last updated: {lastRefresh.toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:bg-white/20"
              >
                {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={showBalance ? 'visible' : 'hidden'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {showBalance ? (
                <div className="space-y-4">
                  {/* Main Balance */}
                  <div>
                    <motion.h2 
                      className="text-4xl md:text-5xl font-bold text-white"
                      key={balanceData.balance}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {formatLargeNumber(balanceData.balance)}
                    </motion.h2>
                    <p className="text-blue-100 text-sm mt-1">
                      Account: {balanceData.accountNumber} • {balanceData.accountType}
                    </p>
                  </div>

                  {/* Change Indicators */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {balanceData.todayChange && balanceData.todayChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-300" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-300" />
                      )}
                      <span className={`text-sm font-medium ${
                        balanceData.todayChange && balanceData.todayChange >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {balanceData.todayChange && balanceData.todayChange >= 0 ? '+' : ''}
                        {formatCurrency(balanceData.todayChange || 0)} today
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {balanceData.monthChange && balanceData.monthChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-300" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-300" />
                      )}
                      <span className={`text-sm font-medium ${
                        balanceData.monthChange && balanceData.monthChange >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {balanceData.monthChange && balanceData.monthChange >= 0 ? '+' : ''}
                        {((balanceData.monthChange || 0) / (balanceData.balance || 1) * 100).toFixed(1)}% this month
                      </span>
                    </div>
                  </div>

                  {/* Auto-refresh toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoRefresh(!autoRefresh)}
                      className="text-blue-100 hover:bg-white/20"
                    >
                      {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
                    </Button>
                    <span className="text-xs text-blue-200">
                      Account ID: {balanceData.accountId}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <EyeOff className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white">Balance Hidden</h3>
                  <p className="text-blue-100">Click the eye icon to show your balance</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
