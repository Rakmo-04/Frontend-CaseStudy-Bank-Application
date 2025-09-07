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
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, User, FileText, MapPin, Calendar, Loader2 } from 'lucide-react';
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

  // Fetch KYC data on component mount
  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    setLoading(true);
    try {
      // Fetch KYC statistics
      const stats = await apiService.getKYCStatistics();
      setKycStatistics(stats);

      // Fetch pending KYC requests (this might have better customer data)
      const requests = await apiService.getPendingKYCRequests();
      console.log('🔍 Raw pending KYC requests API response:', requests);
      
      // Debug email fields in the first request if available
      const firstRequest = Array.isArray(requests) ? requests[0] : 
                          (requests && typeof requests === 'object' && 'pendingKycRequests' in requests && Array.isArray((requests as any).pendingKycRequests)) ? 
                          (requests as any).pendingKycRequests[0] : null;
      
      if (firstRequest) {
        console.log('🔍 First KYC request structure for email debugging:', firstRequest);
        console.log('📧 Email fields in first request:', {
          directEmail: firstRequest.email,
          customerEmail: firstRequest.customer?.email,
          customerEmailAddress: firstRequest.customer?.emailAddress,
          userEmail: firstRequest.user?.email,
          profileEmail: firstRequest.profile?.email,
          allKeys: Object.keys(firstRequest),
          customerKeys: firstRequest.customer ? Object.keys(firstRequest.customer) : 'No customer object'
        });
      }
      
      if (
        requests &&
        typeof requests === 'object' &&
        'pendingKycRequests' in requests &&
        Array.isArray((requests as any).pendingKycRequests)
      ) {
        console.log('📋 Using pendingKycRequests array:', (requests as any).pendingKycRequests);
        setPendingRequests((requests as any).pendingKycRequests);
      } else if (Array.isArray(requests)) {
        console.log('📋 Using direct KYC requests array:', requests);
        setPendingRequests(requests);
      } else {
        console.log('⚠️ No valid KYC requests found, setting empty array');
        setPendingRequests([]);
      }

      // Fetch pending documents
      const documents = await apiService.getPendingKYCDocuments();
      console.log('🔍 Raw pending documents API response:', documents);
      
      // Debug email fields in the first document if available
      const firstDocument = Array.isArray(documents) ? documents[0] : 
                           (documents && typeof documents === 'object' && 'pendingDocuments' in documents && Array.isArray((documents as any).pendingDocuments)) ? 
                           (documents as any).pendingDocuments[0] : null;
      
      if (firstDocument) {
        console.log('🔍 First pending document structure for email debugging:', firstDocument);
        console.log('📧 Email fields in first document:', {
          directEmail: firstDocument.email,
          customerEmail: firstDocument.customer?.email,
          customerEmailAddress: firstDocument.customer?.emailAddress,
          userEmail: firstDocument.user?.email,
          profileEmail: firstDocument.profile?.email,
          allKeys: Object.keys(firstDocument),
          customerKeys: firstDocument.customer ? Object.keys(firstDocument.customer) : 'No customer object'
        });
      }
      
      if (
        documents &&
        typeof documents === 'object' &&
        'pendingDocuments' in documents &&
        Array.isArray((documents as any).pendingDocuments)
      ) {
        console.log('📋 Using pendingDocuments array:', (documents as any).pendingDocuments);
        setPendingDocuments((documents as any).pendingDocuments);
      } else if (Array.isArray(documents)) {
        console.log('📋 Using direct documents array:', documents);
        setPendingDocuments(documents);
      } else {
        console.log('⚠️ No valid documents found, setting empty array');
        setPendingDocuments([]);
      }
    } catch (error) {
      console.error('Failed to fetch KYC data:', error);
      toast.error('Failed to load KYC data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      // Find the customer ID from the selected request
      const customerId = selectedRequest?.customerId || selectedRequest?.userId?.replace('USR-', '');
      
      if (!customerId) {
        toast.error('Customer ID not found');
        console.error('Selected request:', selectedRequest);
        return;
      }

      // Prepare the request body based on status
      const requestBody = {
        kycStatus: status,
        reason: status === 'VERIFIED' 
          ? 'All documents verified successfully by admin'
          : 'Incomplete documentation - please resubmit with valid ID proof'
      };

      console.log('🔍 Updating KYC status for customer:', customerId, 'with body:', requestBody);

      // Call the customer KYC status update endpoint
      const response = await apiService.updateKYCStatus(parseInt(customerId), requestBody);

      // Type guard for response
      const message =
        typeof response === 'object' &&
        response !== null &&
        'message' in response &&
        typeof (response as any).message === 'string'
          ? (response as any).message
          : undefined;

      toast.success(message || `KYC ${status.toLowerCase()} successfully`);

      // Update local state immediately for instant UI feedback
      updateLocalKYCStatus(customerId, status);
      
      // Refresh data from API to ensure consistency
      await fetchKYCData();
      
      // Close the modal
      setSelectedRequest(null);
    } catch (error: any) {
      console.error('Failed to update KYC status:', error);
      toast.error(error.message || 'Failed to update KYC status');
    }
  };

  // Function to update local KYC status immediately for instant UI feedback
  const updateLocalKYCStatus = (customerId: string, status: 'VERIFIED' | 'REJECTED') => {
    console.log(`🔄 Updating local KYC status for customer ${customerId} to ${status}`);
    
    // Set updating state for visual feedback
    setUpdatingStatus(customerId);
    
    // Update pending requests
    setPendingRequests(prevRequests => 
      prevRequests.map(request => {
        if (request.customerId === customerId || request.userId === customerId) {
          console.log(`📝 Updating request status from ${request.status} to ${status.toLowerCase()}`);
          return {
            ...request,
            status: status.toLowerCase(),
            processedAt: new Date().toLocaleDateString(),
            processedBy: 'Admin'
          };
        }
        return request;
      })
    );
    
    // Update pending documents
    setPendingDocuments(prevDocuments => 
      prevDocuments.map(doc => {
        if (doc.customerId === customerId || doc.userId === customerId) {
          console.log(`📄 Updating document status from ${doc.verificationStatus} to ${status.toLowerCase()}`);
          return {
            ...doc,
            verificationStatus: status.toLowerCase(),
            processedAt: new Date().toLocaleDateString(),
            processedBy: 'Admin'
          };
        }
        return doc;
      })
    );
    
    // Show immediate visual feedback
    if (status === 'VERIFIED') {
      toast.success('✅ Document verified! Statistics updated in real-time.');
    } else {
      toast.error('❌ Document rejected. Statistics updated in real-time.');
    }
    
    // Clear updating state after a short delay
    setTimeout(() => {
      setUpdatingStatus(null);
    }, 2000);
    
    console.log(`✅ Local KYC status updated for customer ${customerId}`);
  };

  const handleUpdateKYCStatus = async (customerId: number, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
    try {
      const response = await apiService.updateKYCStatus(customerId, {
        kycStatus: status,
        reason
      });
      
      // Type guard for response
      const message =
        typeof response === 'object' &&
        response !== null &&
        'message' in response &&
        typeof (response as any).message === 'string'
          ? (response as any).message
          : undefined;

      toast.success(message || `KYC status updated to ${status.toLowerCase()}`);

      // Update local state immediately for instant UI feedback
      updateLocalKYCStatus(customerId.toString(), status);
      
      // Refresh data from API to ensure consistency
      await fetchKYCData();
    } catch (error: any) {
      console.error('Failed to update KYC status:', error);
      toast.error(error.message || 'Failed to update KYC status');
    }
  };

  const viewKYCDocument = async (documentId: string, documentType: string) => {
    if (!documentId) {
      toast.error('Document ID not found');
      return;
    }
    
    console.log(`🔍 KYC Management: Starting document view process`);
    console.log(`📄 Document ID: ${documentId} (type: ${typeof documentId})`);
    console.log(`📄 Document Type: ${documentType} (type: ${typeof documentType})`);
    console.log(`📄 Selected Request:`, selectedRequest);
    
    setViewingDocument(true);
    try {
      console.log(`🔍 Viewing ${documentType} document with ID: ${documentId}`);
      const blob = await (apiService as any).viewKYCDocument(documentId, documentType);
      console.log(`✅ Document blob received:`, blob);
      const url = URL.createObjectURL(blob);
      console.log(`🔗 Document URL created:`, url);
      window.open(url, '_blank');
      toast.success(`${documentType === 'aadhar' ? 'Aadhar' : 'PAN'} document opened in new tab`);
    } catch (error: any) {
      console.error('Failed to view document:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        documentId,
        documentType
      });
      toast.error(error.message || 'Failed to view document');
    } finally {
      setViewingDocument(false);
    }
  };

  // Transform API data to match the expected format
  // Try to use pendingRequests first (might have better customer data), fallback to pendingDocuments
  const sourceData = pendingRequests.length > 0 ? pendingRequests : pendingDocuments;
  
  const kycRequests = sourceData.map((item: any, index: number) => {
    // Handle different possible API response structures
    const customer = item.customer || item.user || item.customerProfile || item;
    
    // Debug: Log the actual API response structure
    console.log('🔍 KYC Item API Response:', item);
    console.log('👤 Customer fields found:', {
      customerName: item.customerName,
      customerId: item.customerId,
      customer: customer,
      hasCustomerName: !!item.customerName,
      hasCustomerId: !!item.customerId,
      // Email debugging
      itemEmail: item.email,
      customerEmail: customer.email,
      customerEmailAddress: customer.emailAddress,
      customerUserEmail: customer.userEmail,
      customerContactEmail: customer.contactEmail
    });
    
    // Extract customer info with fallbacks - prioritize direct fields from API
    const customerName = item.customerName || customer.customerName || customer.name || '';
    const customerId = item.customerId || customer.customerId || customer.id || customer.userId || '';
    
    // Fallback to individual name fields if customerName not available
    const firstName = customer.firstName || customer.first_name || customer.givenName || '';
    const lastName = customer.lastName || customer.last_name || customer.familyName || '';
    
    // Enhanced email extraction - check multiple possible locations
    const email = item.email || 
                  customer.email || 
                  customer.emailAddress || 
                  customer.userEmail || 
                  customer.contactEmail ||
                  customer.emailId ||
                  customer.primaryEmail ||
                  // Check if email is nested deeper in the structure
                  (customer.user && customer.user.email) ||
                  (customer.profile && customer.profile.email) ||
                  (customer.personalInfo && customer.personalInfo.email) ||
                  (customer.contact && customer.contact.email) ||
                  '';
    
    const phone = customer.phoneNumber || customer.phone || customer.mobileNumber || item.phone || '';
    
    // Create display name - use customerName if available, otherwise construct from firstName/lastName
    const displayName = customerName || 
      (firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName) || 
      `Customer ${customerId || index + 1}`;
    
    // Handle document info (might be in different structure)
    const documentInfo = item.document || item.documents || item;
    const documentId = documentInfo.documentId || documentInfo.id || item.documentId || item.id;
    const documentType = documentInfo.documentType || documentInfo.type || item.documentType || item.type;
    const verificationStatus = documentInfo.verificationStatus || documentInfo.status || item.verificationStatus || item.status || 'pending';
    
    // Debug document ID extraction
    console.log('📄 Document ID extraction:', {
      itemDocumentId: item.documentId,
      itemId: item.id,
      documentInfoDocumentId: documentInfo.documentId,
      documentInfoId: documentInfo.id,
      finalDocumentId: documentId,
      documentType: documentType,
      documentInfo: documentInfo
    });
    
    // Final email with better fallback
    const finalEmail = email || (customerId ? `customer-${customerId}@example.com` : `customer-${index + 1}@example.com`);
    
    // Debug the final email result
    console.log('📧 Email extraction result:', {
      extractedEmail: email,
      finalEmail: finalEmail,
      hasRealEmail: !!email,
      customerId: customerId
    });
    
    return {
      id: `KYC-${String(documentId || index + 1).padStart(3, '0')}`,
      userId: customerId || `USR-${index + 1}`,
      customerId: customerId, // Store the actual customer ID for API calls
      name: displayName,
      email: finalEmail,
      phone: phone || 'N/A',
      status: verificationStatus,
      submittedAt: new Date(item.uploadTimestamp || item.uploadedAt || item.createdAt || item.submittedAt || Date.now()).toLocaleDateString(),
      documents: {
        identity: { 
          type: documentType === 'aadhar' ? 'Aadhar Card' : 'PAN Card', 
          status: verificationStatus, 
          url: `#${documentId}` 
        }
      },
      riskScore: 'Medium', // Default risk score
      notes: item.verificationNotes || item.notes || '',
      documentId: documentId,
      documentType: documentType,
      originalFilename: item.originalFilename || item.filename || item.fileName
    };
  });

  // Compute statistics from the actual data we're displaying
  const computedStatistics = {
    totalCustomers: kycRequests.length,
    pendingKyc: kycRequests.filter(req => req.status === 'pending').length,
    verifiedKyc: kycRequests.filter(req => req.status === 'verified' || req.status === 'approved').length,
    rejectedKyc: kycRequests.filter(req => req.status === 'rejected').length,
    underReviewKyc: kycRequests.filter(req => req.status === 'under_review').length,
    pendingDocuments: kycRequests.filter(req => req.status === 'pending').length
  };

  // Transform processed documents (those with verified/rejected status)
  const recentlyProcessed = pendingDocuments
    .filter((doc: any) => doc.verificationStatus === 'verified' || doc.verificationStatus === 'rejected')
    .map((doc: any, index: number) => {
      const customer = doc.customer || {};
      return {
        id: `KYC-${String(doc.documentId || index + 1).padStart(3, '0')}`,
        name: `${customer.firstName || 'Unknown'} ${customer.lastName || 'User'}`,
        status: doc.verificationStatus === 'verified' ? 'approved' : 'rejected',
        processedAt: new Date(doc.uploadTimestamp || Date.now()).toLocaleDateString(),
      processedBy: 'Admin User'
      };
    });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, label: 'Pending' };
      case 'under_review':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: Eye, label: 'Under Review' };
      case 'approved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Rejected' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: Clock, label: status };
    }
  };

  const getRiskScoreColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleKYCAction = (requestId: string, action: 'approve' | 'reject', reason?: string) => {
    const actionText = action === 'approve' ? 'approved' : 'rejected';
    toast.success(`KYC request ${requestId} has been ${actionText}`);
    setSelectedRequest(null);
  };

  const filteredRequests = kycRequests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">KYC Management</h1>
          <p className="text-muted-foreground">Review and process customer verification requests</p>
        </div>
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <Badge className="bg-yellow-100 text-yellow-800">
                {computedStatistics.pendingKyc} Pending
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {computedStatistics.underReviewKyc} Under Review
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : computedStatistics.totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">Total KYC requests</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : computedStatistics.pendingKyc}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : computedStatistics.verifiedKyc}
              </div>
              <p className="text-xs text-muted-foreground">Verified customers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : computedStatistics.pendingDocuments}
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
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or KYC ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Requests</CardTitle>
              <CardDescription>Click on a request to view details and take action</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>KYC ID</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading KYC requests...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No KYC requests found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No pending documents to review'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request, index) => {
                    const statusInfo = getStatusInfo(request.status);
                    const StatusIcon = statusInfo.icon;

                    const isUpdating = updatingStatus === request.customerId || updatingStatus === request.userId;
                    
                    return (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`hover:bg-muted/50 transition-colors cursor-pointer ${isUpdating ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => setSelectedRequest(request)}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.name}</p>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.id}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskScoreColor(request.riskScore)}>
                            {request.riskScore}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.submittedAt}</TableCell>
                        <TableCell>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} w-fit`}>
                            {isUpdating ? (
                              <Loader2 className={`w-4 h-4 ${statusInfo.color} animate-spin`} />
                            ) : (
                              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            )}
                            <span className={`text-sm font-medium ${statusInfo.color}`}>
                              {isUpdating ? 'Updating...' : statusInfo.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </motion.tr>
                    );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Processed</CardTitle>
              <CardDescription>KYC requests processed in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading processed requests...</span>
                    </div>
                  </div>
                ) : recentlyProcessed.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No processed requests found</p>
                    <p className="text-sm text-muted-foreground">
                      Processed KYC requests will appear here
                    </p>
                  </div>
                ) : (
                  recentlyProcessed.map((request, index) => {
                  const statusInfo = getStatusInfo(request.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Processed by {request.processedBy} on {request.processedAt}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusInfo.bg + ' ' + statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </motion.div>
                  );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KYC Detail Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span>KYC Review - {selectedRequest.name}</span>
                <Badge variant="outline">{selectedRequest.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Review customer documents and make verification decision
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRequest.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{selectedRequest.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{selectedRequest.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Risk Assessment</h4>
                  <Badge className={getRiskScoreColor(selectedRequest.riskScore)}>
                    {selectedRequest.riskScore} Risk
                  </Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-semibold">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{selectedRequest.documentType === 'aadhar' ? 'Aadhar Card' : 'PAN Card'}</h5>
                        <Badge 
                        variant={selectedRequest.status === 'pending' ? 'default' : selectedRequest.status === 'verified' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                        {selectedRequest.status}
                        </Badge>
                      </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      File: {selectedRequest.originalFilename || 'Document'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Submitted: {selectedRequest.submittedAt}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      disabled={viewingDocument || !selectedRequest.documentId}
                      onClick={() => viewKYCDocument(selectedRequest.documentId, selectedRequest.documentType)}
                    >
                      {viewingDocument ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4 mr-1" />
                      )}
                      {viewingDocument ? 'Loading...' : 'View Document'}
                      </Button>
                    </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="font-semibold mb-2">Review Notes</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {selectedRequest.notes || 'No additional notes provided.'}
              </p>
            </div>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleVerifyDocument(selectedRequest.documentId, 'VERIFIED')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Document
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerifyDocument(selectedRequest.documentId, 'REJECTED')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Document
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}