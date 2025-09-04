import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { User, Mail, Phone, Shield, Bell, Eye, CreditCard, MapPin, Calendar, Check, X, Loader2, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { CustomerProfile } from '../../Models/CustomerProfile';
import { enhancedApiService as apiService } from '../../services/enhanced-api';

interface ProfileViewProps {
  user: any;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    loginAlerts: true,
    marketingEmails: false
  });

  // Fetch current customer data on component mount
  useEffect(() => {
    fetchCustomerProfile();
  }, []);

  const fetchCustomerProfile = async () => {
    try {
      setIsLoading(true);
      const customerProfile = await apiService.getCurrentCustomer();
      console.log('Fetched customer profile:', customerProfile);
      setProfileData(customerProfile);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      toast.error('Failed to load profile data');
      // Fallback to user prop data if API fails
      if (user) {
        setProfileData({
          customerId: user.customerId || user.id,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ')[1] || '',
          email: user.email || '',
          passwordHash: '',
          phoneNumber: user.phoneNumber || user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          aadharNumber: user.aadharNumber || '',
          panNumber: user.panNumber || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          country: user.country || '',
          profilePhotoUrl: user.profilePhotoUrl || null,
          emailVerified: user.emailVerified || false,
          phoneVerified: user.phoneVerified || false,
          kycStatus: user.kycStatus || 'PENDING',
          hasAadharDocument: user.hasAadharDocument || false,
          hasPanDocument: user.hasPanDocument || false,
          documentsUploadTimestamp: user.documentsUploadTimestamp || null,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCustomerProfile();
    setIsRefreshing(false);
    toast.success('Profile data refreshed');
  };

  const handleProfileUpdate = async () => {
    if (!profileData) return;
    
    try {
      setIsSaving(true);
      
      // Prepare data for API (excluding read-only fields)
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        country: profileData.country,
        profilePhotoUrl: profileData.profilePhotoUrl,
      };

      await apiService.updateCustomerProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh data to get updated values
      await fetchCustomerProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecurityToggle = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    toast.success(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleInputChange = (field: keyof CustomerProfile, value: string) => {
    if (!profileData) return;
    setProfileData(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!profileData) {
    return (
      <div className="text-center space-y-4 p-8">
        <X className="w-12 h-12 text-destructive mx-auto" />
        <h3 className="text-lg font-semibold">Failed to load profile</h3>
        <p className="text-muted-foreground">We couldn't load your profile data.</p>
        <Button onClick={fetchCustomerProfile}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const verificationStatus = {
    email: profileData.emailVerified,
    phone: profileData.phoneVerified,
    identity: profileData.kycStatus === 'VERIFIED',
    address: profileData.kycStatus === 'VERIFIED'
  };

  const getKycStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant={profileData.kycStatus === 'VERIFIED' ? 'default' : 'secondary'} className={getKycStatusColor(profileData.kycStatus)}>
            {profileData.kycStatus === 'VERIFIED' ? 'Account Verified' : `KYC ${profileData.kycStatus}`}
          </Badge>
        </div>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl">
                  {`${profileData.firstName[0]}${profileData.lastName[0]}`}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{`${profileData.firstName} ${profileData.lastName}`}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>Customer ID: {profileData.customerId}</span>
                  </Badge>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {formatDate(profileData.documentsUploadTimestamp || new Date().toISOString())}</span>
                  </Badge>
                  {profileData.phoneVerified && (
                    <Badge variant="outline" className="flex items-center space-x-1 bg-green-100 text-green-800">
                      <Check className="w-3 h-3" />
                      <span>Phone Verified</span>
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant={isEditing ? "destructive" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
                disabled={isSaving}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={true} // Email should not be editable
                      className="flex-1"
                    />
                    {verificationStatus.email ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <X className="w-3 h-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    {verificationStatus.phone ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        <X className="w-3 h-3 mr-1" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.dateOfBirth}
                      disabled={true} // DOB should not be editable
                    />
                    <p className="text-xs text-muted-foreground">Date of birth cannot be changed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      value={profileData.gender}
                      disabled={true} // Gender should not be editable
                    />
                    <p className="text-xs text-muted-foreground">Gender cannot be changed.</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Address Information</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={profileData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={profileData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={profileData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={profileData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Identity Information</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="aadharNumber">Aadhar Number</Label>
                      <Input
                        id="aadharNumber"
                        value={profileData.aadharNumber ? `****-****-${profileData.aadharNumber.slice(-4)}` : 'Not provided'}
                        disabled={true}
                      />
                      <p className="text-xs text-muted-foreground">Aadhar number is masked for security.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        value={profileData.panNumber ? `*****${profileData.panNumber.slice(-4)}` : 'Not provided'}
                        disabled={true}
                      />
                      <p className="text-xs text-muted-foreground">PAN number is masked for security.</p>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3">
                    <Button onClick={handleProfileUpdate} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <Label className="font-medium">Two-Factor Authentication</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(value) => handleSecurityToggle('twoFactorAuth', value)}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Password & Login</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Login Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
                      </div>
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(value) => handleSecurityToggle('loginAlerts', value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Active Sessions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome on Windows • New York, NY • Current
                        </p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-muted-foreground">
                          iPhone App • Last active 2 hours ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Bell className="w-4 h-4" />
                    <span>Transaction Notifications</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Transaction Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified of all transactions</p>
                      </div>
                      <Switch
                        checked={securitySettings.transactionAlerts}
                        onCheckedChange={(value) => handleSecurityToggle('transactionAlerts', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={securitySettings.emailNotifications}
                        onCheckedChange={(value) => handleSecurityToggle('emailNotifications', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                      </div>
                      <Switch
                        checked={securitySettings.smsNotifications}
                        onCheckedChange={(value) => handleSecurityToggle('smsNotifications', value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Marketing & Updates</span>
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">Product updates and promotional offers</p>
                    </div>
                    <Switch
                      checked={securitySettings.marketingEmails}
                      onCheckedChange={(value) => handleSecurityToggle('marketingEmails', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Verification Status */}
        <TabsContent value="verification" className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Verification</CardTitle>
                <CardDescription>Status of your account verification processes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-muted-foreground">{profileData.email}</p>
                        </div>
                      </div>
                      {verificationStatus.email ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">Verify</Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-medium">Phone Verification</p>
                          <p className="text-sm text-muted-foreground">{profileData.phoneNumber}</p>
                        </div>
                      </div>
                      {verificationStatus.phone ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">Verify</Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <User className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="font-medium">Identity Verification (KYC)</p>
                          <p className="text-sm text-muted-foreground">Overall KYC Status: {profileData.kycStatus}</p>
                        </div>
                      </div>
                      <Badge className={getKycStatusColor(profileData.kycStatus)}>
                        {verificationStatus.identity ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          profileData.kycStatus
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="font-medium">Document Status</p>
                          <p className="text-sm text-muted-foreground">
                            Aadhar: {profileData.hasAadharDocument ? 'Uploaded' : 'Not uploaded'} | 
                            PAN: {profileData.hasPanDocument ? 'Uploaded' : 'Not uploaded'}
                          </p>
                        </div>
                      </div>
                      {profileData.hasAadharDocument && profileData.hasPanDocument ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">Upload</Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* KYC Documents Status */}
                {(profileData.hasAadharDocument || profileData.hasPanDocument) && (
                  <div className="space-y-4">
                    <Separator />
                    <h4 className="font-medium">Document Upload Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">Aadhar Card</h5>
                          {profileData.hasAadharDocument ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <X className="w-3 h-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profileData.hasAadharDocument 
                            ? `Uploaded on ${formatDate(profileData.documentsUploadTimestamp || '')}`
                            : 'Please upload your Aadhar card for verification'
                          }
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">PAN Card</h5>
                          {profileData.hasPanDocument ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Uploaded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600">
                              <X className="w-3 h-3 mr-1" />
                              Missing
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {profileData.hasPanDocument 
                            ? `Uploaded on ${formatDate(profileData.documentsUploadTimestamp || '')}`
                            : 'Please upload your PAN card for verification'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-accent" />
                    <h4 className="font-medium">Verification Benefits</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Higher transaction limits</li>
                    <li>• Priority customer support</li>
                    <li>• Access to premium features</li>
                    <li>• Enhanced account security</li>
                    <li>• Lower transaction fees</li>
                    <li>• Loan and credit card eligibility</li>
                  </ul>
                </div>

                {/* Next Steps if KYC not complete */}
                {profileData.kycStatus !== 'VERIFIED' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Complete Your Verification</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      {!profileData.hasAadharDocument || !profileData.hasPanDocument
                        ? 'Upload your missing documents to complete KYC verification.'
                        : 'Your documents are under review. We\'ll notify you once verification is complete.'
                      }
                    </p>
                    {(!profileData.hasAadharDocument || !profileData.hasPanDocument) && (
                      <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                        Go to KYC Upload
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}