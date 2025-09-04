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
import { Search, Filter, Download, Mail, Calendar as CalendarIcon, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
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

  // const transactions = [
  //   { id: 1, type: 'credit', description: 'Salary Deposit', amount: 425000.00, date: '2024-08-31', category: 'Income', account: 'Checking', status: 'Completed', reference: 'SAL240831001' },
  //   { id: 2, type: 'debit', description: 'House Rent Payment', amount: -102000.00, date: '2024-08-31', category: 'Housing', account: 'Checking', status: 'Completed', reference: 'RENT240831002' },
  //   { id: 3, type: 'debit', description: 'Big Bazaar Grocery', amount: -10750.50, date: '2024-08-30', category: 'Groceries', account: 'Checking', status: 'Completed', reference: 'POS240830003' },
  //   { id: 4, type: 'transfer', description: 'Transfer to Emergency Fund', amount: -50000.00, date: '2024-08-30', category: 'Transfer', account: 'Checking', status: 'Completed', reference: 'TXN240830004' },
  //   { id: 5, type: 'credit', description: 'Mutual Fund SIP Return', amount: 19825.75, date: '2024-08-29', category: 'Investment', account: 'Investment', status: 'Completed', reference: 'INV240829005' },
  //   { id: 6, type: 'debit', description: 'Netflix Subscription', amount: -1349.00, date: '2024-08-29', category: 'Entertainment', account: 'Checking', status: 'Completed', reference: 'SUB240829006' },
  //   { id: 7, type: 'debit', description: 'Petrol - Indian Oil', amount: -3825.00, date: '2024-08-28', category: 'Transportation', account: 'Checking', status: 'Completed', reference: 'POS240828007' },
  //   { id: 8, type: 'credit', description: 'Freelance Consulting', amount: 63500.00, date: '2024-08-28', category: 'Income', account: 'Checking', status: 'Completed', reference: 'NEFT240828008' },
  //   { id: 9, type: 'debit', description: 'Swiggy Food Order', amount: -5735.00, date: '2024-08-27', category: 'Dining', account: 'Checking', status: 'Completed', reference: 'UPI240827009' },
  //   { id: 10, type: 'debit', description: 'Airtel Mobile Recharge', amount: -7650.00, date: '2024-08-26', category: 'Bills', account: 'Checking', status: 'Completed', reference: 'PAY240826010' },
  //   { id: 11, type: 'debit', description: 'Metro Card Recharge', amount: -2000.00, date: '2024-08-26', category: 'Transportation', account: 'Checking', status: 'Pending', reference: 'MET240826011' },
  //   { id: 12, type: 'credit', description: 'Interest Credit - Savings', amount: 15420.50, date: '2024-08-25', category: 'Interest', account: 'Savings', status: 'Completed', reference: 'INT240825012' }
  // ];

  const categories = ['all', 'Income', 'Housing', 'Groceries', 'Entertainment', 'Transportation', 'Dining', 'Bills', 'Investment', 'Transfer', 'Interest'];

  useEffect(() => {
  if (!user?.accountId) {
    console.warn("No accountId provided for transactions.");
    setTransactions([]);
    setLoading(false);
    return;
  }

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTransactionsByAccount(user.accountId, 0, 20);
      console.log('Fetched transactions:', res);
      setTransactions(res.content || []);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };
  fetchTransactions();
}, [user?.accountId]);


  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'credit' && transaction.amount > 0) ||
                      (activeTab === 'debit' && transaction.amount < 0) ||
                      (activeTab === 'transfer' && transaction.type === 'transfer');
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
    if (!user?.accountId) return toast.error("No accountId available");

    try {
      const params: any = {};
      if (dateRange.from) params.fromDate = dateRange.from.toISOString().split('T')[0];
      if (dateRange.to) params.toDate = dateRange.to.toISOString().split('T')[0];

      const blob = await apiService.downloadPassbook(user.accountId, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `passbook_${user.accountId}.pdf`;
      a.click();
      toast.success("Passbook downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to download passbook");
    }
  };

  

  const emailPassbook = () => {
    toast.success('Passbook sent to your email');
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
                  {filteredTransactions.map((transaction) => (
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
                      <TableCell className={`font-medium ${getAmountColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'Completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </motion.tr>
                  ))}
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