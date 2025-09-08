import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  Users,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { enhancedApiService as apiService } from '../../services/enhanced-api';

interface UserManagementProps {
  user: any;
}

interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePhotoUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: string;
  hasAadharDocument: boolean;
  hasPanDocument: boolean;
  documentsUploadTimestamp: string | null;
}

export default function UserManagement({ user }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, statusFilter, sortBy, pagination.page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching customers...');
      
      let sortParam = 'customerId,desc'; // default
      switch(sortBy) {
        case 'newest':
          sortParam = 'customerId,desc';
          break;
        case 'oldest':
          sortParam = 'customerId,asc';
          break;
        case 'name':
          sortParam = 'firstName,asc';
          break;
        case 'email':
          sortParam = 'email,asc';
          break;
        default:
          sortParam = 'customerId,desc';
      }
      
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort: sortParam,
        ...(statusFilter !== 'all' && { kycStatus: statusFilter })
      };

      const response = await apiService.getAllCustomers(params) as any;
      console.log('✅ Customers fetched:', response);
      
      setCustomers(response.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      }));
    } catch (error: any) {
      console.error('❌ Failed to fetch customers:', error);
      toast.error('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchCustomers();
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewCustomer = async (customerId: number) => {
    try {
      const customer = await apiService.getCustomerDetails(customerId) as Customer;
      setSelectedCustomer(customer);
      setViewDialogOpen(true);
    } catch (error: any) {
      console.error('❌ Failed to fetch customer details:', error);
      toast.error('Failed to load customer details');
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleUpdateCustomer = async (formData: FormData) => {
    try {
      const updatedData = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        email: formData.get('email') as string,
        phoneNumber: formData.get('phone') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string
      };
      
      // TODO: Implement actual API call when available
      // await apiService.updateCustomer(selectedCustomer?.customerId, updatedData);
      console.log('Update data:', updatedData);
      
      toast.success('Customer updated successfully');
      setEditDialogOpen(false);
      await fetchCustomers();
    } catch (error: any) {
      console.error('❌ Failed to update customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = 
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm);
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'KYC Status', 'Email Verified', 'Phone Verified', 'City', 'State'],
        ...filteredCustomers.map((customer: Customer) => [
          customer.customerId,
          `${customer.firstName} ${customer.lastName}`,
          customer.email,
          customer.phoneNumber,
          customer.kycStatus,
          customer.emailVerified ? 'Yes' : 'No',
          customer.phoneVerified ? 'Yes' : 'No',
          customer.city,
          customer.state
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Customer data exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor customer accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{pagination.totalElements}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.kycStatus?.toLowerCase() === 'approved').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending KYC</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.kycStatus?.toLowerCase() === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <p className="text-2xl font-bold">
                  {customers.filter(c => c.emailVerified).length}
                </p>
              </div>
              <Mail className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="email">Email A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Accounts</CardTitle>
          <CardDescription>
            {filteredCustomers.length} of {pagination.totalElements} customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>KYC Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {customer.firstName[0]}{customer.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {customer.customerId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{customer.phoneNumber}</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{customer.city}, {customer.state}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {customer.country}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(customer.kycStatus)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(customer.emailVerified)}
                            <span className="text-sm">Email</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getVerificationIcon(customer.phoneVerified)}
                            <span className="text-sm">Phone</span>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleViewCustomer(customer.customerId)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditCustomer(customer)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {pagination.page * pagination.size + 1} to {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of {pagination.totalElements} customers
          </p>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 0}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages - 1}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View Customer Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Complete information for {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer ID</Label>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.customerId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date of Birth</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedCustomer.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">{selectedCustomer.email}</p>
                    {getVerificationIcon(selectedCustomer.emailVerified)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">{selectedCustomer.phoneNumber}</p>
                    {getVerificationIcon(selectedCustomer.phoneVerified)}
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}, {selectedCustomer.country}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">KYC Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCustomer.kycStatus)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Documents Uploaded</Label>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant={selectedCustomer.hasAadharDocument ? "default" : "outline"}>
                      Aadhar
                    </Badge>
                    <Badge variant={selectedCustomer.hasPanDocument ? "default" : "outline"}>
                      PAN
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleUpdateCustomer(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    defaultValue={selectedCustomer.firstName}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    defaultValue={selectedCustomer.lastName}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedCustomer.email}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={selectedCustomer.phoneNumber}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={selectedCustomer.city}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={selectedCustomer.state}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={selectedCustomer.zipCode}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
