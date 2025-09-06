import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface KYCManagementProps {
  user: any;
}

export default function KYCManagement({ user }: KYCManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [kycRequests, setKycRequests] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<{ url: string; name: string } | null>(null);

  // Fetch KYC requests
  const fetchKYCRequests = async () => {
    try {
      const data = await apiService.allKYCRequests();
      if (data?.pendingKycRequests) {
        setKycRequests(data.pendingKycRequests);
      } else {
        console.error('Unexpected KYC response structure:', data);
        toast.error('Invalid response from server');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch KYC requests');
    }
  };

  useEffect(() => {
    fetchKYCRequests();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
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
    switch (score?.toLowerCase()) {
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

  const handleKYCAction = async (requestId: string, action: 'approve' | 'reject') => {
    const isApprove = action === 'approve';
    const body = {
      kycStatus: isApprove ? 'VERIFIED' : 'REJECTED',
      reason: isApprove
        ? 'All documents verified successfully by admin'
        : 'Documents were invalid or incomplete',
    };

    try {
      await apiService.updateKYCStatus(Number(requestId), body);
      toast.success(`KYC request ${requestId} has been ${isApprove ? 'approved' : 'rejected'}`);
      setSelectedRequest(null);
      fetchKYCRequests(); // Refresh list after updating
    } catch (err) {
      console.error('Failed to update KYC status:', err);
      toast.error('Failed to update KYC status');
    }
  };

  // Download document helper
  const downloadDocument = async (doc: any) => {
    if (doc.type.toLowerCase() === 'aadhar') {
      return await apiService.downloadAadharDocument(doc.documentId);
    } else if (doc.type.toLowerCase() === 'pan') {
      return await apiService.downloadPanDocument(doc.documentId);
    } else {
      throw new Error('Unknown document type');
    }
  };

  const filteredRequests = kycRequests.filter((request) => {
    const matchesSearch =
      request.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || request.kycStatus?.toLowerCase() === filterStatus;
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
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
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
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request, index) => {
                    const statusInfo = getStatusInfo(request.kycStatus);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.tr
                        key={request.customerId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {request.firstName?.[0]}
                                {request.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {request.firstName} {request.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.customerId}</Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} w-fit`}
                          >
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`text-sm font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
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
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  KYC Review - {selectedRequest.firstName} {selectedRequest.lastName}
                </span>
                <Badge variant="outline">{selectedRequest.customerId}</Badge>
              </DialogTitle>
              <DialogDescription>Review customer documents and take action</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Customer Info */}
              <div className="space-y-4">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="flex justify-between">
                      <div>
                        <p className="font-semibold">Name: </p>
                      </div>
                      <div className="pl-2">
                        {selectedRequest.firstName} {selectedRequest.lastName}
                      </div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex justify-between">
                      <div>
                        <p className="font-semibold">Email: </p>
                      </div>
                      <div className="pl-2">{selectedRequest.email}</div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex justify-between">
                      <div>
                        <p className="font-semibold">Phone No: </p>
                      </div>
                      <div className="pl-2">{selectedRequest.phoneNumber}</div>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="flex justify-between">
                      <div>
                        <p className="font-semibold">KYC Status: </p>
                      </div>
                      <div className="pl-2">{selectedRequest.kycStatus}</div>
                    </span>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <Badge className={getRiskScoreColor(selectedRequest.riskScore || 'low')}>
                    {selectedRequest.riskScore || 'Low'} Risk
                  </Badge>
                </div>
              </div>

              {/* Documents */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-semibold">Submitted Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(selectedRequest.kycDocuments || []).map((doc: any) => (
                    <div key={doc.documentId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium capitalize">{doc.type}</h5>
                        <Badge
                          variant={
                            doc.documentStatus?.toLowerCase() === 'uploaded' ? 'default' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {doc.documentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{doc.type}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const blob = await downloadDocument(doc);
                            const url = URL.createObjectURL(blob);
                            setSelectedDocument({ url, name: doc.type });
                          } catch (err) {
                            toast.error('Failed to load document');
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </Button>
                    </div>
                  ))}
                  {(!selectedRequest.kycDocuments || selectedRequest.kycDocuments.length === 0) && (
                    <p className="text-sm text-muted-foreground">No documents submitted yet.</p>
                  )}
                </div>

                {/* Inline PDF Viewer */}
                {selectedDocument && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Viewing Document: {selectedDocument.name}</h4>
                    <iframe
                      src={selectedDocument.url}
                      title={selectedDocument.name}
                      className="w-full h-[600px] border rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Close Viewer
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Review Notes */}
            {selectedRequest.notes && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Review Notes</h4>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedRequest.kycStatus.toLowerCase() !== 'approved' &&
              selectedRequest.kycStatus.toLowerCase() !== 'rejected' && (
                <div className="flex space-x-3 mt-4">
                  <Button
                    onClick={() => handleKYCAction(selectedRequest.customerId, 'approve')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve KYC
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleKYCAction(selectedRequest.customerId, 'reject')}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject KYC
                  </Button>
                </div>
              )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
