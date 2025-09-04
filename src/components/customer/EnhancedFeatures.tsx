import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { 
  Send, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Smartphone, 
  QrCode, 
  Banknote,
  Calculator,
  Target,
  Zap,
  Gift,
  ShieldCheck,
  Bell,
  Settings,
  MapPin,
  Calendar,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedFeaturesProps {
  user: any;
}

export default function EnhancedFeatures({ user }: EnhancedFeaturesProps) {
  const [showAmounts, setShowAmounts] = useState(true);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loanAmount, setLoanAmount] = useState([500000]);
  const [loanTenure, setLoanTenure] = useState([5]);
  const [autoInvest, setAutoInvest] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [realTimeBalance, setRealTimeBalance] = useState(12290074.50);

  // Simulate real-time balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10000; // Random change between -5000 to +5000
      setRealTimeBalance(prev => Math.max(0, prev + change));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const quickTransferOptions = [
    { name: 'HDFC Bank', upi: 'hdfc@upi', logo: '🏦' },
    { name: 'ICICI Bank', upi: 'icici@upi', logo: '🏛️' },
    { name: 'SBI', upi: 'sbi@upi', logo: '🏗️' },
    { name: 'Axis Bank', upi: 'axis@upi', logo: '🏢' }
  ];

  const investmentOptions = [
    { 
      name: 'SIP - Equity Mutual Fund', 
      returns: '12-15%', 
      risk: 'Medium', 
      minAmount: 500,
      category: 'Mutual Fund'
    },
    { 
      name: 'Fixed Deposit', 
      returns: '6.5-7%', 
      risk: 'Low', 
      minAmount: 10000,
      category: 'Fixed Income'
    },
    { 
      name: 'Gold ETF', 
      returns: '8-12%', 
      risk: 'Medium', 
      minAmount: 1000,
      category: 'Commodity'
    },
    { 
      name: 'PPF (Public Provident Fund)', 
      returns: '7.1%', 
      risk: 'Very Low', 
      minAmount: 500,
      category: 'Tax Saving'
    }
  ];

  const creditCards = [
    {
      name: 'WTF Platinum Card',
      annualFee: 5000,
      cashback: '2%',
      limit: 500000,
      benefits: ['Airport Lounge Access', 'Fuel Surcharge Waiver', 'Dining Discounts']
    },
    {
      name: 'WTF Gold Card',
      annualFee: 2500,
      cashback: '1.5%',
      limit: 200000,
      benefits: ['Shopping Discounts', 'Movie Tickets', 'Fuel Points']
    }
  ];

  const recentOffers = [
    {
      title: 'Festive Season Cashback',
      description: 'Get 5% cashback on all UPI transactions',
      validTill: '2024-12-31',
      code: 'FESTIVE5'
    },
    {
      title: 'Investment Bonus',
      description: 'Start SIP and get ₹1000 bonus',
      validTill: '2024-12-15',
      code: 'SIP1000'
    }
  ];

  const calculateLoanEMI = () => {
    const principal = loanAmount[0];
    const rate = 8.5 / 100 / 12; // 8.5% annual rate
    const tenure = loanTenure[0] * 12;
    const emi = (principal * rate * Math.pow(1 + rate, tenure)) / (Math.pow(1 + rate, tenure) - 1);
    return emi;
  };

  const handleQuickTransfer = (amount: number) => {
    toast.success(`Quick transfer of ₹${amount.toLocaleString('en-IN')} initiated!`);
  };

  const handleUpiTransfer = () => {
    if (transferAmount && upiId) {
      toast.success(`UPI transfer of ₹${parseFloat(transferAmount).toLocaleString('en-IN')} to ${upiId} successful!`);
      setTransferAmount('');
      setUpiId('');
    }
  };

  const handleInvestment = (option: any) => {
    toast.success(`Investment in ${option.name} initiated! Minimum amount: ₹${option.minAmount.toLocaleString('en-IN')}`);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
      >
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Live Balance</CardTitle>
                <CardDescription className="text-white/80">Updates every 5 seconds</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAmounts(!showAmounts)}
                  className="text-white hover:bg-white/20"
                >
                  {showAmounts ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {showAmounts ? `₹${realTimeBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '••••••••'}
            </div>
            <div className="flex items-center space-x-4 text-white/80">
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span className="text-sm">+₹45,230 today</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">+2.3% this month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="transfers" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="transfers">Quick Transfer</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Transfer Amounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Quick Transfer
                </CardTitle>
                <CardDescription>Instant transfers to common amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[500, 1000, 2000, 5000, 10000, 25000].map((amount) => (
                    <Button 
                      key={amount}
                      variant="outline" 
                      onClick={() => handleQuickTransfer(amount)}
                      className="h-12"
                    >
                      ₹{amount.toLocaleString('en-IN')}
                    </Button>
                  ))}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <Input
                      id="custom-amount"
                      placeholder="Enter amount"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="upi-id">UPI ID / Phone Number</Label>
                    <Input
                      id="upi-id"
                      placeholder="user@upi or +91XXXXXXXXXX"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleUpiTransfer} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Money
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* UPI QR Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-accent" />
                  UPI Payments
                </CardTitle>
                <CardDescription>Scan QR or pay to UPI ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                  </div>
                  <Button variant="outline" className="w-full mb-4">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Quick Pay to Banks</Label>
                  {quickTransferOptions.map((bank) => (
                    <div key={bank.name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <div>
                          <p className="font-medium">{bank.name}</p>
                          <p className="text-sm text-muted-foreground">{bank.upi}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Pay</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Investment Options
                </CardTitle>
                <CardDescription>Grow your wealth with smart investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investmentOptions.map((option) => (
                    <div key={option.name} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{option.name}</h4>
                        <Badge variant="outline">{option.category}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Returns:</span>
                          <p className="font-medium text-green-600">{option.returns}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>
                          <p className="font-medium">{option.risk}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Min Amount:</span>
                          <p className="font-medium">₹{option.minAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleInvestment(option)}
                        className="w-full mt-3" 
                        variant="outline"
                      >
                        Invest Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Auto Investment
                </CardTitle>
                <CardDescription>Set up automatic investments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-invest">Enable Auto-Invest</Label>
                  <Switch 
                    id="auto-invest"
                    checked={autoInvest}
                    onCheckedChange={setAutoInvest}
                  />
                </div>
                
                {autoInvest && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Monthly SIP Amount</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select amount" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1000">₹1,000</SelectItem>
                          <SelectItem value="2500">₹2,500</SelectItem>
                          <SelectItem value="5000">₹5,000</SelectItem>
                          <SelectItem value="10000">₹10,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Investment Date</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 5, 10, 15, 20, 25].map(date => (
                            <SelectItem key={date} value={date.toString()}>
                              {date} of every month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full">
                      Start Auto-Investment
                    </Button>
                  </motion.div>
                )}
                
                <div className="p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Investment Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with small amounts and gradually increase your SIP. 
                    Consistent investing over time can help build substantial wealth.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-accent" />
                Loan Calculator
              </CardTitle>
              <CardDescription>Calculate your loan EMI instantly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Loan Amount: ₹{loanAmount[0].toLocaleString('en-IN')}</Label>
                    <Slider
                      value={loanAmount}
                      onValueChange={setLoanAmount}
                      max={5000000}
                      min={100000}
                      step={50000}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>₹1L</span>
                      <span>₹50L</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Tenure: {loanTenure[0]} years</Label>
                    <Slider
                      value={loanTenure}
                      onValueChange={setLoanTenure}
                      max={30}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold mb-2">Loan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-medium">₹{loanAmount[0].toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interest Rate:</span>
                        <span className="font-medium">8.5% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tenure:</span>
                        <span className="font-medium">{loanTenure[0]} years</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-accent border-t pt-2">
                        <span>Monthly EMI:</span>
                        <span>₹{calculateLoanEMI().toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    Apply for Loan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {creditCards.map((card) => (
              <Card key={card.name} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full -mr-16 -mt-16"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent" />
                    {card.name}
                  </CardTitle>
                  <CardDescription>Premium credit card benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Annual Fee</span>
                      <p className="font-semibold">₹{card.annualFee.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cashback</span>
                      <p className="font-semibold text-green-600">{card.cashback}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Credit Limit</span>
                      <p className="font-semibold">₹{card.limit.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Reward Points</span>
                      <p className="font-semibold">1X on all spends</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Benefits</h4>
                    <ul className="space-y-1">
                      {card.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Star className="h-3 w-3 text-accent mr-2" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button className="w-full">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentOffers.map((offer) => (
              <Card key={offer.title} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full -mr-8 -mt-8 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <CardHeader>
                  <CardTitle>{offer.title}</CardTitle>
                  <CardDescription>{offer.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valid till:</span>
                      <span className="font-medium">{new Date(offer.validTill).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Promo Code:</span>
                      <Badge variant="outline">{offer.code}</Badge>
                    </div>
                    <Button variant="outline" className="w-full">
                      Use Offer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}