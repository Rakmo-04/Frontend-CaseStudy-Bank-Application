import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Loader2, Calendar, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from './../../services/api';
import type { ApiError } from '../../services/api';

interface CustomerRegisterProps {
  onNavigate: (view: string) => void;
  onRegister: (user: any) => void;
}

console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(apiService)));


export default function CustomerRegister({ onNavigate, onRegister }: CustomerRegisterProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    aadharNumber: '',
    panNumber: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiService.customerRegisterInitiate({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      });

      setStep(3);
      toast.success('Verification code sent to your email');
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // First verify the email OTP
      await apiService.verifyEmailOTP({
        email: formData.email,
        otpCode: formData.otp
      });

      // Then complete registration
      const response = await apiService.completeRegistration({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      });

      console.log('Registration Response:', response);
      apiService.getTokenManager().setToken(response.token, 'customer');
      console.log('Request Headers:', Headers);

      const response1 = await apiService.customerLogin({ email: formData.email, password: formData.password });

      const customerProfile = await apiService.getCurrentCustomer();
            
            const user = {
              id: response.customerId,
              name: `${customerProfile.firstName} ${customerProfile.lastName}`,
              type: 'customer',
              accountId: response.accountId,
              ...customerProfile
            };

      onRegister(user);
      toast.success('Account created successfully!');
      onNavigate('customer-dashboard');
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message);
      toast.error(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await apiService.sendOTP({
        destination: formData.email,
        channel: 'EMAIL',
        purpose: 'REGISTRATION'
      });
      toast.success('Verification code sent again');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/10 flex items-center justify-center p-6">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #d4af37 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #1a1d29 0%, transparent 50%)`
        }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 1) {
                onNavigate('landing');
              } else {
                setStep(step - 1);
              }
            }}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Back to Home' : 'Previous Step'}</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-2xl border-accent/20 backdrop-blur-sm">
            <CardHeader className="text-center space-y-1">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-accent font-bold text-2xl">W</span>
              </div>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>
                Join WTF Bank - Step {step} of 3
              </CardDescription>
              <div className="pt-4">
                <Progress value={progress} className="h-2" />
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="border-destructive/50 text-destructive mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Basic Information */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="pl-10 pr-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all hover:shadow-lg hover:scale-105"
                  >
                    Continue
                  </Button>
                </form>
              )}

              {/* Step 2: Personal Information */}
              {step === 2 && (
                <form onSubmit={handleStep2Submit} className="space-y-6">
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <p className="text-muted-foreground">Please provide your personal details for KYC verification</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="h-12 border-accent/20 focus:border-accent transition-colors">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="aadharNumber"
                        placeholder="1234 5678 9012"
                        value={formData.aadharNumber}
                        onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                        className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="panNumber"
                        placeholder="ABCDE1234F"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                        className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="pl-10 h-12 border-accent/20 focus:border-accent transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="Maharashtra"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="h-12 border-accent/20 focus:border-accent transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Pin Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="400001"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="h-12 border-accent/20 focus:border-accent transition-colors"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all hover:shadow-lg hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Continue to Verification'
                    )}
                  </Button>
                </form>
              )}

              {/* Step 3: Email Verification */}
              {step === 3 && (
                <form onSubmit={handleStep3Submit} className="space-y-6">
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-accent mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold">Verify Your Email</h3>
                      <p className="text-muted-foreground">
                        We've sent a verification code to {formData.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit code"
                      value={formData.otp}
                      onChange={(e) => handleInputChange('otp', e.target.value)}
                      className="h-12 text-center text-2xl tracking-widest border-accent/20 focus:border-accent transition-colors"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      type="button" 
                      className="text-accent hover:text-accent/80"
                      onClick={handleResendOTP}
                    >
                      Resend Code
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all hover:shadow-lg hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              )}

              <div className="text-center mt-6">
                <span className="text-muted-foreground">Already have an account? </span>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onNavigate('customer-login')}
                  className="p-0 h-auto text-accent hover:text-accent/80"
                >
                  Sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}