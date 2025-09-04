import React, { useState, useEffect } from 'react';
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
import { Search, Filter, Download, Mail, Calendar as CalendarIcon, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
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

  const categories = ['all', 'Income', 'Housing', 'Groceries', 'Entertainment', 'Transportation', 'Dining', 'Bills', 'Investment', 'Transfer', 'Interest'];

  // Fetch transactions with filters
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let res;

      // Search priority
      if (searchTerm.trim()) {
        res = await apiService.searchTransactions(user.accountId, searchTerm, 0, 20);
      }
      // Date range filter
      else if (dateRange.from && dateRange.to) {
        res = await apiService.getTransactionsByDateRange(
          user.accountId,
          dateRange.from.toISOString().split('T')[0],
          dateRange.to.toISOString().split('T')[0],
          0,
          20
        );
      }
      // Tab filter (credit/debit/transfer)
      else if (activeTab !== 'all') {
        res = await apiService.getTransactionsByType(user.accountId, activeTab as any, 0, 20);
      }
      // Default
      else {
        res = await apiService.getTransactionsByAccount(user.accountId, 0, 20);
      }

      setTransactions(res.content || res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user.accountId, searchTerm, activeTab, dateRange]);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesCategory =
      selectedCategory === 'all' || transaction.category === selectedCategory;
    return matchesCategory;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }

    // client-side sorting
    setTransactions((prev) =>
      [...prev].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (field === 'amount') {
          valA = Number(valA);
          valB = Number(valB);
        }
        if (field === 'date') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
    );
  };

  const downloadPassbook = async () => {
    try {
      const blob = await apiService.downloadPassbook(user.accountId, {
        fromDate: dateRange.from?.toISOString().split('T')[0],
        toDate: dateRange.to?.toISOString().split('T')[0],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'passbook.pdf';
      a.click();
      toast.success('Passbook downloaded');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download passbook');
    }
  };

  const emailPassbook = async () => {
    try {
      await apiService.emailPassbook(user.accountId, {
        fromDate: dateRange.from?.toISOString().split('T')[0],
        toDate: dateRange.to?.toISOString().split('T')[0],
      });
      toast.success('Passbook sent to your email');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send passbook');
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'credit') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (type === 'debit') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <ArrowUpDown className="h-4 w-4 text-blue-600" />;
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-blue-600';
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
                {categories.map((category) => (
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
                    'Pick a date'
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
          <TabsTrigger value="credit">Credits</TabsTrigger>
          <TabsTrigger value="debit">Debits</TabsTrigger>
          <TabsTrigger value="transfer">Transfers</TabsTrigger>
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
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-600">
                        {error}
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                            {getTransactionIcon(transaction.type)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.description}</TableCell>
                        <TableCell
                          className={`font-medium ${getAmountColor(transaction.amount)}`}
                        >
                          {transaction.amount > 0 ? '+' : ''}₹
                          {Math.abs(transaction.amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === 'Completed' ? 'default' : 'secondary'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No transactions found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
