import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Search, MessageSquare, Clock, CheckCircle, AlertTriangle, Send, User, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SupportManagementProps {
  user: any;
}

export default function SupportManagement({ user }: SupportManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [replyMessage, setReplyMessage] = useState('');

  const supportTickets = [
    {
      id: 'TKT-1001',
      customerId: 'USR-1234',
      customerName: 'John Doe',
      customerEmail: 'john.doe@email.com',
      subject: 'Unable to access mobile app',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      createdAt: '2024-01-15 10:30 AM',
      updatedAt: '2024-01-15 11:15 AM',
      assignedTo: 'Support Agent 1',
      responseTime: '45 minutes',
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'John Doe',
          message: 'I am unable to log into the mobile app. It keeps showing authentication error.',
          timestamp: '2024-01-15 10:30 AM'
        },
        {
          id: 2,
          sender: 'support',
          senderName: 'Support Agent 1',
          message: 'Thank you for contacting us. We are investigating this issue. Please try clearing the app cache and restart your phone.',
          timestamp: '2024-01-15 11:15 AM'
        }
      ]
    },
    {
      id: 'TKT-1002',
      customerId: 'USR-1235',
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@email.com',
      subject: 'Transaction not reflected in account',
      category: 'Account',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: '2024-01-14 2:30 PM',
      updatedAt: '2024-01-15 9:00 AM',
      assignedTo: 'Support Agent 2',
      responseTime: '2 hours',
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'Jane Smith',
          message: 'I made a transfer of $500 on Jan 12th but it is not showing in my account.',
          timestamp: '2024-01-14 2:30 PM'
        },
        {
          id: 2,
          sender: 'support',
          senderName: 'Support Agent 2',
          message: 'We have located your transaction. It is currently being processed and should reflect within 24 hours.',
          timestamp: '2024-01-15 9:00 AM'
        }
      ]
    },
    {
      id: 'TKT-1003',
      customerId: 'USR-1236',
      customerName: 'Mike Johnson',
      customerEmail: 'mike.johnson@email.com',
      subject: 'Need account statement for loan application',
      category: 'Documentation',
      priority: 'Low',
      status: 'Waiting for Customer',
      createdAt: '2024-01-13 4:45 PM',
      updatedAt: '2024-01-14 10:00 AM',
      assignedTo: 'Support Agent 1',
      responseTime: '15 minutes',
      messages: [
        {
          id: 1,
          sender: 'customer',
          senderName: 'Mike Johnson',
          message: 'I need my account statement for the last 6 months for loan application.',
          timestamp: '2024-01-13 4:45 PM'
        },
        {
          id: 2,
          sender: 'support',
          senderName: 'Support Agent 1',
          message: 'Your statement has been generated. Please confirm your mailing address for delivery.',
          timestamp: '2024-01-14 10:00 AM'
        }
      ]
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: AlertTriangle, label: 'Open' };
      case 'in progress':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, label: 'In Progress' };
      case 'waiting for customer':
        return { color: 'text-purple-600', bg: 'bg-purple-100', icon: User, label: 'Waiting for Customer' };
      case 'resolved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Resolved' };
      case 'closed':
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle, label: 'Closed' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertTriangle, label: status };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    toast.success('Reply sent successfully');
    setReplyMessage('');
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    toast.success(`Ticket ${ticketId} status updated to ${newStatus}`);
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === 'all' || ticket.priority.toLowerCase() === filterPriority.toLowerCase();
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Management</h1>
          <p className="text-muted-foreground">Manage customer support tickets and inquiries</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            {supportTickets.filter(t => t.status === 'Open').length} Open
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {supportTickets.filter(t => t.status === 'In Progress').length} In Progress
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
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+8% from last week</p>
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
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">-30min from yesterday</p>
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
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+1.2% from last week</p>
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
              <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7/5</div>
              <p className="text-xs text-muted-foreground">Based on 127 reviews</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="waiting for customer">Waiting for Customer</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>Click on a ticket to view details and respond</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket, index) => {
                const statusInfo = getStatusInfo(ticket.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {ticket.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{ticket.customerName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.customerEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{ticket.id}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate font-medium">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">{ticket.category}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} w-fit`}>
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{ticket.assignedTo}</TableCell>
                    <TableCell>{ticket.createdAt}</TableCell>
                    <TableCell>{ticket.responseTime}</TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span>{selectedTicket.subject}</span>
                <Badge variant="outline">{selectedTicket.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Customer: {selectedTicket.customerName} | Priority: {selectedTicket.priority} | Status: {selectedTicket.status}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Customer Info & Actions */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{selectedTicket.customerName}</span>
                    </div>
                    <div className="text-sm">{selectedTicket.customerEmail}</div>
                    <div className="text-sm">ID: {selectedTicket.customerId}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Ticket Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Priority:</span>
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Assigned:</span>
                      <span className="text-sm">{selectedTicket.assignedTo}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Change Status</h4>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Waiting for Customer">Waiting for Customer</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conversation */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="font-semibold">Conversation</h4>
                <div className="space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
                  {selectedTicket.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.sender === 'customer' 
                          ? 'bg-muted ml-8' 
                          : 'bg-blue-50 mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
                
                {/* Reply Section */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Type your reply here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleSendReply} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
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