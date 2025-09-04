import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SupportViewProps {
  user: any;
}

export default function SupportView({ user }: SupportViewProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  });

  const tickets = [
    {
      id: 'TKT-001',
      subject: 'Unable to access mobile app',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I am unable to log into the mobile app. It keeps showing authentication error.',
          timestamp: '2024-01-15 10:30 AM'
        },
        {
          id: 2,
          sender: 'support',
          message: 'Thank you for contacting us. We are investigating this issue. Please try clearing the app cache and restart your phone.',
          timestamp: '2024-01-15 11:15 AM'
        }
      ]
    },
    {
      id: 'TKT-002',
      subject: 'Transaction not reflected',
      category: 'Account',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I made a transfer of $500 on Jan 12th but it is not showing in my account.',
          timestamp: '2024-01-12 2:30 PM'
        },
        {
          id: 2,
          sender: 'support',
          message: 'We have located your transaction. It is currently being processed and should reflect within 24 hours.',
          timestamp: '2024-01-14 9:00 AM'
        }
      ]
    },
    {
      id: 'TKT-003',
      subject: 'Request for statement',
      category: 'Documentation',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-09',
      messages: [
        {
          id: 1,
          sender: 'user',
          message: 'I need my account statement for the last 6 months for loan application.',
          timestamp: '2024-01-08 3:45 PM'
        },
        {
          id: 2,
          sender: 'support',
          message: 'Your statement has been generated and sent to your registered email address.',
          timestamp: '2024-01-09 10:00 AM'
        }
      ]
    }
  ];

  const categories = [
    { value: 'technical', label: 'Technical Issues' },
    { value: 'account', label: 'Account Related' },
    { value: 'transaction', label: 'Transaction Issues' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return { color: 'text-blue-600', bg: 'bg-blue-100', icon: AlertCircle, label: 'Open' };
      case 'in progress':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock, label: 'In Progress' };
      case 'resolved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, label: 'Resolved' };
      case 'closed':
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: XCircle, label: 'Closed' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: AlertCircle, label: status };
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

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.priority || !newTicket.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Support ticket created successfully! You will receive updates via email.');
    setIsCreateDialogOpen(false);
    setNewTicket({ subject: '', category: '', priority: '', description: '' });
  };

  const handleTicketUpdate = (ticketId: string, message: string) => {
    toast.success('Your message has been sent to our support team');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support Center</h1>
          <p className="text-muted-foreground">Get help with your banking needs</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create Ticket</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Tell us about your issue and we'll help you resolve it quickly.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Priority *</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={4}
                />
              </div>
              
              <Button onClick={handleCreateTicket} className="w-full">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Help Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Call Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Speak with our support team directly
              </p>
              <p className="font-semibold text-primary">1-800-WTF-BANK</p>
              <p className="text-xs text-muted-foreground">24/7 Available</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get instant help from our chat team
              </p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send us an email for detailed support
              </p>
              <p className="font-semibold text-primary">support@wtfbank.com</p>
              <p className="text-xs text-muted-foreground">Response within 4 hours</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Support Tickets */}
      <Tabs defaultValue="my-tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Support Tickets</CardTitle>
              <CardDescription>Track and manage your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket, index) => {
                  const statusInfo = getStatusInfo(ticket.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold">{ticket.subject}</h4>
                            <Badge variant="outline">{ticket.id}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Category: {ticket.category}</span>
                            <span>Created: {ticket.createdAt}</span>
                            <span>Updated: {ticket.updatedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`text-sm font-medium ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    question: 'How do I reset my password?',
                    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.'
                  },
                  {
                    question: 'How long does it take for transfers to process?',
                    answer: 'Internal transfers are instant. External transfers typically take 1-3 business days depending on the receiving bank.'
                  },
                  {
                    question: 'How do I update my contact information?',
                    answer: 'You can update your contact information in the Profile section of your dashboard or by contacting customer support.'
                  },
                  {
                    question: 'What are your customer service hours?',
                    answer: 'Our customer service is available 24/7 for urgent issues. For general inquiries, our standard hours are Monday-Friday 8 AM to 8 PM EST.'
                  }
                ].map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <span>{selectedTicket.subject}</span>
                <Badge variant="outline">{selectedTicket.id}</Badge>
              </DialogTitle>
              <DialogDescription>
                Category: {selectedTicket.category} | Priority: {selectedTicket.priority} | Status: {selectedTicket.status}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedTicket.messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary/10 ml-8' 
                      : 'bg-muted mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {message.sender === 'user' ? 'You' : 'Support Team'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  <p className="text-sm">{message.message}</p>
                </div>
              ))}
            </div>
            
            {selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your message here..."
                  rows={3}
                />
                <Button
                  onClick={() => handleTicketUpdate(selectedTicket.id, 'New message')}
                  className="w-full"
                >
                  Send Message
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}