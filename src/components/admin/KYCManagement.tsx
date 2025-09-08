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
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, User, FileText, MapPin, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { enhancedApiService as apiService } from '../../services/enhanced-api';

interface KYCManagementProps {
  user: any;
}

export default function KYCManagement({ user }: KYCManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [kycStatistics, setKycStatistics] = useState<any>(null);
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 50,
    totalElements: 0,
    totalPages: 0
  });

  // Fetch KYC data on component mount
  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Fetch pending KYC requests (this now includes statistics)
      const response = await apiService.getPendingKYCRequests();
      
      // Handle the new API response format
      if (response && typeof response === 'object' && 'count' in response && 'pendingKycRequests' in response) {
        const { count, pendingKycRequests } = response as { count: number; pendingKycRequests: any[] };
        
        // Set statistics from the response
        setKycStatistics({
          totalCustomers: count || 0,
          pendingKyc: count || 0,
          verifiedKyc: 0,
          rejectedKyc: 0,
          underReviewKyc: 0,
          pendingDocuments: count || 0
        });
        
        // Set pending requests
        setPendingRequests(pendingKycRequests || []);
      } else {
        setKycStatistics({
          totalCustomers: 0,
          pendingKyc: 0,
          verifiedKyc: 0,
          rejectedKyc: 0,
          underReviewKyc: 0,
          pendingDocuments: 0
        });
        setPendingRequests([]);
      }
      
      setPendingDocuments([]); // Not using separate documents endpoint

    } catch (error: any) {
      console.error('❌ Failed to fetch KYC data:', error);
      toast.error('Failed to load KYC data. Please check your backend connection.');
      setPendingRequests([]);
      setPendingDocuments([]);
      setKycStatistics({
        totalCustomers: 0,
        pendingKyc: 0,
        verifiedKyc: 0,
        rejectedKyc: 0,
        underReviewKyc: 0,
        pendingDocuments: 0
      });
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      const customerId = selectedRequest?.customerId || selectedRequest?.userId?.replace('USR-', '');

      if (!customerId) {
        toast.error('Customer ID not found');
        return;
      }

      const requestBody = {
        kycStatus: status,
        reason: status === 'VERIFIED' 
          ? 'All documents verified successfully by admin'
          : 'Incomplete documentation - please resubmit with valid ID proof'
      };

      const response = await apiService.updateKYCStatus(parseInt(customerId), requestBody);
      toast.success(`KYC ${status.toLowerCase()} successfully`);

      setSelectedRequest(null);

      // Refresh data after a delay
      setTimeout(async () => {
        setPendingRequests([]);
        setPendingDocuments([]);
        await fetchKYCData(true);
        toast.success('KYC data refreshed');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Failed to update KYC status:', error);
      toast.error(error.message || 'Failed to update KYC status');
    }
  };

  const handleUpdateKYCStatus = async (customerId: number, status: 'VERIFIED' | 'REJECTED', reason: string) => {
    setUpdatingStatus(customerId.toString());
    try {
      const response = await apiService.updateKYCStatus(customerId, {
        kycStatus: status,
        reason: reason
      });

      toast.success(`KYC ${status.toLowerCase()} successfully`);
      
      // Refresh data
      setTimeout(async () => {
        await fetchKYCData(true);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Failed to update KYC status:', error);
      toast.error(error.message || 'Failed to update KYC status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const viewKYCDocument = async (request: any) => {
    setSelectedRequest(request);
    setViewingDocument(true);
  };
  

  // Transform API data to match the expected format
  const kycRequests = pendingRequests.map((item: any, index: number) => {
    const customerName = `${item.firstName || ''} ${item.lastName || ''}`.trim() || `Customer ${item.customerId || index + 1}`;

    return {
      id: `KYC-${String(item.customerId || index + 1).padStart(3, '0')}`,
      customerId: item.customerId,
      name: customerName,
      email: item.email || 'N/A',
      phoneNumber: item.phoneNumber || 'N/A',
      aadharNumber: item.aadharNumber || 'N/A',
      panNumber: item.panNumber || 'N/A',
      status: (item.kycStatus || 'PENDING').toLowerCase(),
      submittedAt: new Date().toLocaleDateString(), // API doesn't provide submission date
      documentType: 'KYC Documents',
      documentId: `DOC-${item.customerId}`,
      originalFilename: `kyc_documents_${item.customerId}.pdf`
    };
  });

  // Compute statistics from the actual data
  const computedStatistics = {
    totalCustomers: kycRequests.length,
    pendingKyc: kycRequests.filter(req => req.status === 'pending').length,
    verifiedKyc: kycRequests.filter(req => req.status === 'verified' || req.status === 'approved').length,
    rejectedKyc: kycRequests.filter(req => req.status === 'rejected').length,
    underReviewKyc: kycRequests.filter(req => req.status === 'under_review').length,
    pendingDocuments: kycRequests.filter(req => req.status === 'pending').length
  };

  // Transform processed documents (empty for now since API only returns pending)
  const recentlyProcessed: any[] = [];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, label: 'Pending' };
      case 'verified':
      case 'approved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Verified' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Rejected' };
      case 'under_review':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Eye, label: 'Under Review' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock, label: 'Unknown' };
    }
  };

  // Filter requests based on search term and status
  const filteredRequests = kycRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Management</h1>
          <p className="text-muted-foreground">
            Review and manage customer KYC verification requests
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchKYCData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (kycStatistics?.totalCustomers || computedStatistics.totalCustomers)}
              </div>
              <p className="text-xs text-muted-foreground">Total KYC requests</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (kycStatistics?.pendingKyc || computedStatistics.pendingKyc)}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (kycStatistics?.verifiedKyc || computedStatistics.verifiedKyc)}
              </div>
              <p className="text-xs text-muted-foreground">Verified customers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (kycStatistics?.pendingDocuments || computedStatistics.pendingDocuments)}
              </div>
              <p className="text-xs text-muted-foreground">Documents pending review</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="processed">Recently Processed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* KYC Requests Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pending KYC Verification Requests</h3>
                <p className="text-sm text-muted-foreground">
                  Review and approve customer KYC documents
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading KYC requests...</span>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No KYC requests found</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No pending documents to review'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRequests.map((request, index) => {
                  const statusInfo = getStatusInfo(request.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="text-lg">
                                {request.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{request.name}</h4>
                              <p className="text-sm text-muted-foreground">{request.id}</p>
                              <Badge className={`${statusInfo.bg} ${statusInfo.color} mt-1`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Email:</span>
                              <span className="truncate">{request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Phone:</span>
                              <span>{request.phoneNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Aadhar:</span>
                              <span className="font-mono text-xs">{request.aadharNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">PAN:</span>
                              <span className="font-mono text-xs">{request.panNumber}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewKYCDocument(request)}
                              className="flex-1"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Docs
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateKYCStatus(request.customerId, 'VERIFIED', 'Documents verified successfully')}
                              disabled={updatingStatus === request.customerId.toString()}
                              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              {updatingStatus === request.customerId.toString() ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateKYCStatus(request.customerId, 'REJECTED', 'Incomplete documentation')}
                              disabled={updatingStatus === request.customerId.toString()}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Processed</CardTitle>
              <CardDescription>
                KYC requests that have been approved or rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed At</TableHead>
                    <TableHead>Processed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentlyProcessed.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No processed requests found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentlyProcessed.map((request) => {
                      const statusInfo = getStatusInfo(request.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {request.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.name}</p>
                                <p className="text-sm text-muted-foreground">{request.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusInfo.bg} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{request.processedAt}</TableCell>
                          <TableCell>{request.processedBy}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document View Modal */}
      {selectedRequest && (
        <Dialog open={viewingDocument} onOpenChange={setViewingDocument}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>KYC Document Review</DialogTitle>
              <DialogDescription>
                Review documents for {selectedRequest.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-lg">Customer Information</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedRequest.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedRequest.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{selectedRequest.phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer ID:</span>
                      <span className="font-mono text-xs">{selectedRequest.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className={`${getStatusInfo(selectedRequest.status).bg} ${getStatusInfo(selectedRequest.status).color}`}>
                        {getStatusInfo(selectedRequest.status).label}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3 text-lg">KYC Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aadhar Number:</span>
                      <span className="font-mono text-xs">{selectedRequest.aadharNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">PAN Number:</span>
                      <span className="font-mono text-xs">{selectedRequest.panNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document Type:</span>
                      <span className="font-medium">{selectedRequest.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted:</span>
                      <span className="font-medium">{selectedRequest.submittedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3 text-lg">Uploaded Documents</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium">Aadhar Document</p>
                        <p className="text-sm text-muted-foreground">Aadhar Number: {selectedRequest.aadharNumber}</p>
                        <p className="text-xs text-muted-foreground">Uploaded for verification</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">PAN Document</p>
                        <p className="text-sm text-muted-foreground">PAN Number: {selectedRequest.panNumber}</p>
                        <p className="text-xs text-muted-foreground">Uploaded for verification</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Click "View" buttons to open and review the actual uploaded documents. 
                    Ensure all documents are clear, valid, and match the provided information.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Review all documents carefully before making a decision
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setViewingDocument(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => handleVerifyDocument(selectedRequest.documentId, 'VERIFIED')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve KYC
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerifyDocument(selectedRequest.documentId, 'REJECTED')}
                    size="lg"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}