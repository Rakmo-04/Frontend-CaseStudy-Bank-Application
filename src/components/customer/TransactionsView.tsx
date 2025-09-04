import React, { useState,useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Filter, Download, Mail, Calendar as CalendarIcon, TrendingUp, TrendingDown, ArrowUpDown, RefreshCw } from 'lucide-react';
// Removed date-fns import and using simple date formatting
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface TransactionsViewProps {
  user: any;
}

export default function TransactionsView({ user }: TransactionsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ['all', 'Income', 'Expense', 'Transfer', 'Investment', 'Bills', 'Entertainment', 'Transportation', 'Dining', 'Housing', 'Groceries', 'Interest'];

  // Function to fetch transactions (extracted for reuse)
  const fetchTransactions = async () => {
    setRefreshing(true);
    
    try {
      setLoading(true);
      setError(null);
      
      // Get user accounts first
      const accounts = await apiService.getUserAccounts();
      
      if (!accounts || accounts.length === 0) {
        console.warn("No accounts found for user.");
        setError("No accounts found. Please contact customer support.");
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      // Use the first account
      const accountId = accounts[0].accountId;
      console.log('Fetching transactions for accountId:', accountId);
      
      // Apply filters based on active tab and date range
      let response;
      
      if (activeTab !== 'all' && ['credit', 'debit', 'transfer'].includes(activeTab)) {
        // Filter by transaction type
        response = await apiService.getTransactionsByType(accountId, activeTab as any, 0, 50);
      } else if (dateRange.from && dateRange.to) {
        // Filter by date range
        const fromDate = dateRange.from.toISOString().split('T')[0];
        const toDate = dateRange.to.toISOString().split('T')[0];
        response = await apiService.getTransactionsByDateRange(accountId, fromDate, toDate, 0, 50);
      } else {
        // Get all transactions
        response = await apiService.getTransactionsByAccount(accountId, 0, 50);
      }
      
      console.log('Fetched transactions:', response);
      
      if (response && response.content && Array.isArray(response.content)) {
        // Transform the data to match our component's expectations
        const transformedTransactions = response.content.map(transaction => ({
          id: transaction.transactionId || transaction.id,
          type: transaction.transactionType?.toLowerCase() || 'debit',
          description: transaction.description || 'Transaction',
          amount: transaction.amount || 0,
          date: new Date(transaction.transactionDate || transaction.timestamp).toLocaleDateString() || new Date().toLocaleDateString(),
          category: transaction.transactionType === 'credit' ? 'Income' : 
                   transaction.transactionType === 'transfer' ? 'Transfer' : 'Expense',
          account: 'Primary Account',
          status: transaction.transactionStatus || 'Completed',
          reference: transaction.referenceNumber || `TXN${transaction.transactionId || transaction.id}`,
          // Add additional fields from API for more context
          recipientAccountId: transaction.recipientAccountId,
          transactionFee: transaction.transactionFee,
          remarks: transaction.remarks
        }));
        
        setTransactions(transformedTransactions);
        toast.success(`Loaded ${transformedTransactions.length} transactions`);
      } else if (response && response.transactions && Array.isArray(response.transactions)) {
        // Alternative response format
        const transformedTransactions = response.transactions.map((transaction: any) => ({
          id: transaction.transactionId || transaction.id,
          type: transaction.transactionType?.toLowerCase() || 'debit',
          description: transaction.description || 'Transaction',
          amount: transaction.amount || 0,
          date: new Date(transaction.transactionDate || transaction.timestamp).toLocaleDateString() || new Date().toLocaleDateString(),
          category: transaction.transactionType === 'credit' ? 'Income' : 
                   transaction.transactionType === 'transfer' ? 'Transfer' : 'Expense',
          account: 'Primary Account',
          status: transaction.transactionStatus || 'Completed',
          reference: transaction.referenceNumber || `TXN${transaction.transactionId || transaction.id}`,
          // Add additional fields from API for more context
          recipientAccountId: transaction.recipientAccountId,
          transactionFee: transaction.transactionFee,
          remarks: transaction.remarks
        }));
        
        setTransactions(transformedTransactions);
        toast.success(`Loaded ${transformedTransactions.length} transactions`);
      } else {
        setTransactions([]);
        toast.info('No transactions found for the selected criteria');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || "Failed to load transactions");
      setTransactions([]);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    toast.info('Refreshing transactions...');
    await fetchTransactions();
  };

  // Fetch transactions when user, active tab, or date range changes
  useEffect(() => {
    fetchTransactions();
  }, [user?.accountId, user?.id, activeTab]);


  const filteredTransactions = transactions.filter(transaction => {
    // Match search term in description or remarks
    const matchesSearch = (transaction.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (transaction.remarks?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Improved tab filtering logic
    const isTransfer = transaction.type === 'transfer';
    const isCredit = transaction.type === 'credit';
    const isDebit = transaction.type === 'debit';
    
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'credit' && isCredit) ||
      (activeTab === 'debit' && isDebit) ||
      (activeTab === 'transfer' && isTransfer);
    
    // Category filtering
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesTab && matchesCategory;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const downloadPassbook = async () => {
    const accountId = user?.accountId || user?.id;
    if (!accountId) {
      toast.error("Account information not available");
      return;
    }

    try {
      const params: any = {};
      if (dateRange.from) params.fromDate = dateRange.from.toISOString().split('T')[0];
      if (dateRange.to) params.toDate = dateRange.to.toISOString().split('T')[0];

      const blob = await apiService.downloadPassbook(accountId, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `passbook_${accountId}_${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Passbook downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to download passbook: " + (err.message || "Unknown error"));
    }
  };

  const emailPassbook = async () => {
    const accountId = user?.accountId || user?.id;
    if (!accountId) {
      toast.error("Account information not available");
      return;
    }

    try {
      const params: any = {};
      if (dateRange.from) params.fromDate = dateRange.from.toISOString().split('T')[0];
      if (dateRange.to) params.toDate = dateRange.to.toISOString().split('T')[0];

      await apiService.emailPassbook(accountId, params);
      toast.success('Passbook sent to your email address');
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to email passbook: " + (err.message || "Unknown error"));
    }
  };

  const getTransactionIcon = (transaction: any) => {
    // For transfers, we need to check if this is outgoing (debit) or incoming (credit)
    const isTransfer = transaction.type === 'transfer';
    const isCredit = transaction.type === 'credit';
    const isDebit = transaction.type === 'debit' || isTransfer; // Treat transfers as debits
    
    if (isCredit) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (isDebit) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
  };

  const getAmountColor = (transaction: any) => {
    // For transfers, we need to check if this is outgoing (debit) or incoming (credit)
    const isTransfer = transaction.type === 'transfer';
    const isCredit = transaction.type === 'credit';
    const isDebit = transaction.type === 'debit' || isTransfer; // Treat transfers as debits
    
    if (isCredit) return 'text-green-600';
    if (isDebit) return 'text-red-600';
    return 'text-blue-600';
  };

  const formatTransactionAmount = (transaction: any) => {
    // For transfers, we need to check if this is outgoing (debit) or incoming (credit)
    const isTransfer = transaction.type === 'transfer';
    const isCredit = transaction.type === 'credit';
    const isDebit = transaction.type === 'debit' || isTransfer; // Treat transfers as debits
    
    const amount = Math.abs(transaction.amount);
    const prefix = isCredit ? '+' : '-';
    return `${prefix}₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your account transactions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={emailPassbook} className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email Passbook</span>
          </Button>
          <Button onClick={downloadPassbook} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                    ) : (
                      dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    "Pick a date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setDateRange({});
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="credit">
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            Credits (In)
          </TabsTrigger>
          <TabsTrigger value="debit">
            <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
            Debits (Out)
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <ArrowUpDown className="h-4 w-4 mr-2 text-blue-600" />
            Transfers
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {activeTab === 'all' && 'All Transactions'}
                    {activeTab === 'credit' && 'Credit Transactions'}
                    {activeTab === 'debit' && 'Debit Transactions'}
                    {activeTab === 'transfer' && 'Transfer Transactions'}
                  </CardTitle>
                  <CardDescription>
                    {filteredTransactions.length} transactions found
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('description')}
                    >
                      Description
                      {sortField === 'description' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('amount')}
                    >
                      Amount
                      {sortField === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('date')}
                    >
                      Date
                      {sortField === 'date' && (
                        <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                      )}
                    </TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                          <span>Loading transactions...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found matching your criteria.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            {getTransactionIcon(transaction)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.description}
                          {transaction.remarks && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {transaction.remarks}
                            </div>
                          )}
                          {transaction.recipientAccountId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              To Account: {transaction.recipientAccountId}
                            </div>
                          )}
                          {transaction.transactionFee > 0 && (
                            <div className="text-xs text-amber-600 mt-1">
                              Fee: ₹{transaction.transactionFee.toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={`font-medium ${getAmountColor(transaction)}`}>
                          {formatTransactionAmount(transaction)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status.toLowerCase() === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found matching your criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}