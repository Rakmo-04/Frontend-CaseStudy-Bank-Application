import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, User, FileText, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface KYCManagementProps {
  user: any;
}

export default function KYCManagement({ user }: KYCManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const kycRequests = [
    {
      id: 'KYC-001',
      userId: 'USR-1234',
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1-555-0123',
      status: 'pending',
      submittedAt: '2024-01-15',
      documents: {
        identity: { type: 'Passport', status: 'uploaded', url: '#' },
        address: { type: 'Utility Bill', status: 'uploaded', url: '#' },
        income: { type: 'Salary Slip', status: 'uploaded', url: '#' }
      },
      riskScore: 'Low',
      notes: ''
    },
    {
      id: 'KYC-002',
      userId: 'USR-1235',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1-555-0124',
      status: 'pending',
      submittedAt: '2024-01-14',
      documents: {
        identity: { type: 'Driver License', status: 'uploaded', url: '#' },
        address: { type: 'Bank Statement', status: 'uploaded', url: '#' },
        income: { type: 'Tax Return', status: 'uploaded', url: '#' }
      },
      riskScore: 'Medium',
      notes: 'Additional verification required for income documents'
    },
    {
      id: 'KYC-003',
      userId: 'USR-1236',
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      phone: '+1-555-0125',
      status: 'under_review',
      submittedAt: '2024-01-13',
      documents: {
        identity: { type: 'Passport', status: 'uploaded', url: '#' },
        address: { type: 'Rental Agreement', status: 'uploaded', url: '#' },
        income: { type: 'Employment Letter', status: 'rejected', url: '#' }
      },
      riskScore: 'High',
      notes: 'Income document needs to be more recent'
    }
  ];

  const recentlyProcessed = [
    {
      id: 'KYC-004',
      name: 'Sarah Wilson',
      status: 'approved',
      processedAt: '2024-01-15',
      processedBy: 'Admin User'
    },
    {
      id: 'KYC-005',
      name: 'David Brown',
      status: 'rejected',
      processedAt: '2024-01-14',
      processedBy: 'Admin User'
    },
    {
      id: 'KYC-006',
      name: 'Lisa Garcia',
      status: 'approved',
      processedAt: '2024-01-14',
      processedBy: 'Admin User'
    }
  ];

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
          <Badge className="bg-yellow-100 text-yellow-800">
            {kycRequests.filter(r => r.status === 'pending').length} Pending
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            {kycRequests.filter(r => r.status === 'under_review').length} Under Review
          </Badge>
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
              <div className="text-2xl font-bold">847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
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
              <div className="text-2xl font-bold">89</div>
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
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">95.8% approval rate</p>
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
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">-15min from yesterday</p>
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
                  {filteredRequests.map((request, index) => {
                    const statusInfo = getStatusInfo(request.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
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

        <TabsContent value="processed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recently Processed</CardTitle>
              <CardDescription>KYC requests processed in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentlyProcessed.map((request, index) => {
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
                })}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(selectedRequest.documents).map(([type, doc]: [string, any]) => (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium capitalize">{type}</h5>
                        <Badge 
                          variant={doc.status === 'uploaded' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {doc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{doc.type}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-1" />
                        View Document
                      </Button>
                    </div>
                  ))}
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
            {selectedRequest.status !== 'approved' && selectedRequest.status !== 'rejected' && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleKYCAction(selectedRequest.id, 'approve')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve KYC
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleKYCAction(selectedRequest.id, 'reject')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject KYC
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}