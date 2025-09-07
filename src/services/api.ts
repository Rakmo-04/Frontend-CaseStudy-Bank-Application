import { CustomerProfile } from '../Models/CustomerProfile';
import { getApiBaseUrl } from '../utils/environment';
import {
  MyDocumentsResponse,
  KYCStatusResponse,
  CustomerKYCStatusResponse,
  KYCUploadResponse,
} from '../Models/Kyc';
import { Account } from '../Models/Account';
import { Page, Transaction } from '../Models/transaction';
import { SupportTicket } from '../Models/SupportTicket';

// API Configuration and Base Setup
const API_BASE_URL = getApiBaseUrl();

// Token management
class TokenManager {
  private static instance: TokenManager;
  private token: string | null = null;
  private tokenType: 'customer' | 'admin' | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  setToken(token: string, type: 'customer' | 'admin') {
    this.token = token;
    this.tokenType = type;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_type', type);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
      this.tokenType = localStorage.getItem('auth_type') as 'customer' | 'admin' | null;
    }
    
    // Check if token is expired
    if (this.token) {
      try {
        const tokenParts = this.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const isExpired = Date.now() >= payload.exp * 1000;
          if (isExpired) {
            console.warn('🚨 Token expired, clearing from storage');
            this.clearToken();
            return null;
          }
        }
      } catch (e) {
        console.error('❌ Failed to decode token:', e);
        this.clearToken();
        return null;
      }
    }
    
    return this.token;
  }

  getTokenType(): 'customer' | 'admin' | null {
    if (!this.tokenType) {
      this.tokenType = localStorage.getItem('auth_type') as 'customer' | 'admin' | null;
    }
    return this.tokenType;
  }

  clearToken() {
    this.token = null;
    this.tokenType = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_type');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// API Response types
interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Base API class
class ApiService {
  private tokenManager = TokenManager.getInstance();

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.tokenManager.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // Debug admin requests specifically
      if (endpoint.startsWith('/admin/')) {
        console.log(`🔑 Admin Request to ${url}:`, {
          tokenExists: !!token,
          tokenType: this.tokenManager.getTokenType(),
          tokenPreview: token.substring(0, 20) + '...',
          endpoint: endpoint,
          fullAuthHeader: `Bearer ${token.substring(0, 50)}...`
        });
        
        // Decode token again to verify what we're sending
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            const isExpired = Date.now() >= payload.exp * 1000;
            console.log(`🔍 Token being sent to ${endpoint}:`, {
              sub: payload.sub,
              role: payload.role,
              roles: payload.roles,
              authorities: payload.authorities,
              scope: payload.scope,
              exp: new Date(payload.exp * 1000).toLocaleString(),
              isExpired: isExpired,
              fullPayload: payload
            });
            
            // Check specific role requirements for this endpoint
            if (endpoint.includes('/admin/kyc/')) {
              const hasRequiredRole = payload.role === 'ROLE_SUPER_ADMIN' || 
                                    payload.role === 'ROLE_KYC_OFFICER' ||
                                    payload.role === 'ROLE_COMPLIANCE_OFFICER' ||
                                    payload.role === 'ROLE_BRANCH_MANAGER' ||
                                    payload.role === 'ROLE_REGIONAL_MANAGER' ||
                                    payload.role === 'ROLE_SYSTEM_ADMIN' ||
                                    (payload.authorities && payload.authorities.includes('ROLE_SUPER_ADMIN')) ||
                                    (payload.authorities && payload.authorities.includes('ROLE_KYC_OFFICER'));
              
              console.log(`🔐 Role check for ${endpoint}:`, {
                hasRequiredRole,
                currentRole: payload.role,
                authorities: payload.authorities,
                requiredRoles: ['ROLE_SUPER_ADMIN', 'ROLE_KYC_OFFICER', 'ROLE_COMPLIANCE_OFFICER', 'ROLE_BRANCH_MANAGER', 'ROLE_REGIONAL_MANAGER', 'ROLE_SYSTEM_ADMIN']
              });
              
              if (!hasRequiredRole) {
                console.error('🚨 TOKEN ROLE MISMATCH!');
                console.error('💡 Your token role:', payload.role);
                console.error('💡 Required roles:', ['ROLE_SUPER_ADMIN', 'ROLE_KYC_OFFICER', 'ROLE_COMPLIANCE_OFFICER']);
                console.error('💡 Try logging in with a different admin user');
              }
            }
            
            if (isExpired) {
              console.error(`🚨 TOKEN EXPIRED! Token expired at ${new Date(payload.exp * 1000).toLocaleString()}`);
              console.error('💡 SOLUTION: Logout and login again to get a fresh token');
              this.tokenManager.clearToken();
              throw {
                message: 'Your session has expired. Please login again.',
                status: 401,
              } as ApiError;
            }
          }
        } catch (e) {
          console.error('❌ Failed to decode token being sent:', e);
        }
      }
    } else if (endpoint.startsWith('/admin/')) {
      console.error(`🚫 Admin request to ${url} without token!`);
    }

    try {
      console.log(`📤 Making request to ${url}:`, {
        method: options.method || 'GET',
        headers: headers,
        hasBody: !!options.body,
        bodyPreview: options.body ? options.body.toString().substring(0, 100) : null
      });

      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`📡 Response from ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'An error occurred';
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }

        throw {
          message: errorMessage,
          status: response.status,
        } as ApiError;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response as any;
    } catch (error) {
      if (error instanceof TypeError) {
        console.error('Network error details:', error);
        throw {
          message: `Network error - Cannot connect to server at ${API_BASE_URL}. Please ensure your backend server is running.`,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  private async makeFileRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.tokenManager.getToken();

    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = 'An error occurred';
        
        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }

        throw {
          message: errorMessage,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError) {
        console.error('Network error details:', error);
        throw {
          message: `Network error - Cannot connect to server at ${API_BASE_URL}. Please ensure your backend server is running.`,
          status: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication APIs
  async customerRegisterInitiate(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    aadharNumber: string;
    panNumber: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    profilePhotoUrl?: string;
  }) {
    return this.makeRequest('/auth/register/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmailOTP(data: { email: string; otpCode: string }) {
    return this.makeRequest('/auth/register/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeRegistration(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    aadharNumber: string;
    panNumber: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    profilePhotoUrl?: string;
  }) {
    const response = await this.makeRequest<{
      token: string;
      customerId: number;
      accountId: number;
      userType: string;
      kycStatus: string;
    }>('/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.token) {
      this.tokenManager.setToken(response.token, 'customer');
    }

    return response;
  }

  async customerLogin(data: { email: string; password: string }) {
    const response = await this.makeRequest<{
      token: string;
      customerId: number;
      accountId: number;
      userType: string;
      kycStatus: string;
      ipAddress?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.token) {
      this.tokenManager.setToken(response.token, 'customer');
    }

    return response;
  }

  async adminLogin(data: { username: string; password: string }) {
    console.log('🔐 Admin Login Request:', { username: data.username });
    
    const response = await this.makeRequest<{
      token: string;
      adminId: number;
      role: string;
      message: string;
      ipAddress?: string;
    }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    console.log('✅ Admin Login Response:', {
      hasToken: !!response.token,
      adminId: response.adminId,
      role: response.role,
      message: response.message,
      tokenPreview: response.token ? response.token.substring(0, 30) + '...' : 'null'
    });

    if (response.token) {
      this.tokenManager.setToken(response.token, 'admin');
      console.log('🎫 Admin token stored successfully');
      
      // Immediately decode and log the JWT claims
      try {
        const tokenParts = response.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('🔍 IMMEDIATE JWT DECODE after login:', {
            username: data.username,
            sub: payload.sub,
            role: payload.role,
            roles: payload.roles,
            authorities: payload.authorities,
            scope: payload.scope,
            iat: new Date(payload.iat * 1000).toLocaleString(),
            exp: new Date(payload.exp * 1000).toLocaleString(),
            isKycOfficer: payload.role === 'ROLE_KYC_OFFICER' || payload.role === 'KYC_OFFICER',
            fullPayload: payload
          });
        }
      } catch (e) {
        console.error('❌ Failed to decode JWT token immediately after login:', e);
      }
    } else {
      console.error('❌ No token received from admin login');
    }

    return response;
  }

  async logout() {
    const tokenType = this.tokenManager.getTokenType();
    const endpoint = tokenType === 'admin' ? '/admin/auth/logout' : '/auth/logout';
    
    try {
      await this.makeRequest(endpoint, { method: 'POST' });
    } finally {
      this.tokenManager.clearToken();
    }
  }

  // Customer APIs
  async getCurrentCustomer(): Promise<CustomerProfile> {
    console.log("getCurrentCustomer called");
  return this.makeRequest('/api/customers/me');
}


  async updateCustomerProfile(data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    profilePhotoUrl?: string;
  }) {
    return this.makeRequest('/api/customers/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // async getKYCStatus() {
  //   return this.makeRequest('/api/customers/kyc-status');
  // }

    // =======================
  // KYC APIs
  // =======================

  async getMyKYCDocuments() {
  return this.makeRequest<MyDocumentsResponse>('/api/kyc/my-documents');
}

// async getKYCStatus() {
//   var a = this.makeRequest<CustomerKYCStatusResponse>('/api/customers/kyc-status');
//   console.log(a.text());
//   return a;
// }
async getKYCStatus() {
  const response = await fetch(`${API_BASE_URL}/api/customers/kyc-status`, {
    headers: {
      Authorization: `Bearer ${this.tokenManager.getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch KYC status');
  }

  return response.text(); // ✅ backend sends plain text like "VERIFIED"
}



  
  // Account APIs
  async getUserAccounts(): Promise<Account[]> {
    return this.makeRequest<Account[]>('/api/accounts');
  }

  async getAccountById(accountId: number): Promise<Account> {
    return this.makeRequest<Account>(`/api/accounts/${accountId}`);
  }

  async getAccountBalance(accountId: number): Promise<{ balance: number; accountId: number; lastUpdated: string }> {
    return this.makeRequest(`/api/accounts/${accountId}/balance`);
  }

  async refreshAccountBalance(accountId: number): Promise<Account> {
    return this.makeRequest<Account>(`/api/accounts/${accountId}/refresh`, {
      method: 'POST'
    });
  }

  async createAccount(data: { accountType: string; initialDeposit?: number }) {
    return this.makeRequest('/api/accounts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction APIs
  async createTransaction(data: {
    accountId: number;
    transactionType: 'credit' | 'debit' | 'transfer';
    amount: number;
    description?: string;
    mode?: string;
    recipientAccountId?: number;
    bankName?: string;
    ifscCode?: string;
    initiatedBy?: string;
    transactionFee?: number;
    remarks?: string;
  }) {
    return this.makeRequest('/api/transactions/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactionById(transactionId: number) {
  return this.makeRequest(`/api/transactions/${transactionId}`);
}

async getTransactionsByAccount(accountId: number, page = 0, size = 10): Promise<Page<Transaction>> {
  return this.makeRequest(`/api/transactions/account/${accountId}?page=${page}&size=${size}`);
}

async getTransactionsByDateRange(
  accountId: number,
  fromDate: string,
  toDate: string,
  page = 0,
  size = 20
) {
  return this.makeRequest(
    `/api/transactions/account/${accountId}/date-range?fromDate=${fromDate}&toDate=${toDate}&page=${page}&size=${size}`
  );
}

async getTransactionsByType(
  accountId: number,
  type: 'credit' | 'debit' | 'transfer',
  page = 0,
  size = 10
) {
  return this.makeRequest(
    `/api/transactions/account/${accountId}/type/${type}?page=${page}&size=${size}`
  );
}

async getTransactionStatistics(
  accountId: number,
  fromDate: string,
  toDate: string
) {
  return this.makeRequest(
    `/api/transactions/account/${accountId}/statistics?fromDate=${fromDate}&toDate=${toDate}`
  );
}

async getPassbook(
  accountId: number,
  fromDate: string,
  toDate: string,
  page = 0,
  size = 50
) {
  return this.makeRequest(
    `/api/transactions/account/${accountId}/passbook?fromDate=${fromDate}&toDate=${toDate}&page=${page}&size=${size}`
  );
}

/**
 * Get recent transactions for account
 */
async getRecentTransactions(accountId: number) {
  return this.makeRequest(`/api/transactions/account/${accountId}/recent`);
}

/**
 * Get mini statement (last 5 transactions)
 */
async getMiniStatement(accountId: number) {
  return this.makeRequest(`/api/transactions/account/${accountId}/mini-statement`);
}

/**
 * Download passbook as PDF
 */
async downloadPassbookPDF(accountId: number, fromDate?: string, toDate?: string): Promise<Blob> {
  const url = `/api/transactions/account/${accountId}/passbook/download${fromDate && toDate ? `?fromDate=${fromDate}&toDate=${toDate}` : ''}`;
  const token = this.tokenManager.getToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to download passbook PDF');
  }
  
  return response.blob();
}

/**
 * Email passbook PDF to registered or custom email
 */
async emailPassbookPDF(accountId: number, fromDate?: string, toDate?: string, emailAddress?: string) {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (emailAddress) params.append('emailAddress', emailAddress);
  
  const url = `/api/transactions/account/${accountId}/passbook/email${params.toString() ? `?${params.toString()}` : ''}`;
  return this.makeRequest(url, { method: 'POST' });
}

/**
 * Preview passbook PDF in browser
 */
async previewPassbookPDF(accountId: number, fromDate?: string, toDate?: string): Promise<Blob> {
  const url = `/api/transactions/account/${accountId}/passbook/preview${fromDate && toDate ? `?fromDate=${fromDate}&toDate=${toDate}` : ''}`;
  const token = this.tokenManager.getToken();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to preview passbook PDF');
  }
  
  return response.blob();
}



  async getTransactionHistory(
    accountId: number,
    params?: {
      page?: number;
      size?: number;
      sort?: string;
      fromDate?: string;
      toDate?: string;
      type?: string;
    }
  ) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/api/transactions/account/${accountId}${queryString}`);
  }

  async getPassbookData(accountId: number, params?: { fromDate?: string; toDate?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/api/transactions/account/${accountId}/passbook${queryString}`);
  }

  async downloadPassbook(accountId: number, params?: { fromDate?: string; toDate?: string }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const response = await fetch(`${API_BASE_URL}/api/transactions/account/${accountId}/passbook/download${queryString}`, {
      headers: {
        Authorization: `Bearer ${this.tokenManager.getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download passbook');
    }
    
    return response.blob();
  }

  async emailPassbook(
    accountId: number,
    data: {
      emailAddress?: string;
      fromDate?: string;
      toDate?: string;
      includeMessage?: string;
    }
  ) {
    return this.makeRequest(`/api/transactions/account/${accountId}/passbook/email`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async searchTransactions(accountId: number, query: string, page = 0, size = 10) {
  return this.makeRequest(
    `/api/transactions/account/${accountId}/search?query=${query}&page=${page}&size=${size}`
  );
}

  // KYC APIs
  async uploadKYCDocument(documentType: string, file: File) {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    return this.makeFileRequest('/api/kyc/upload', formData);
  }

  async getKYCDocumentStatus() {
    return this.makeRequest('/api/kyc/status');
  }

  // OTP APIs
  async sendOTP(data: {
    destination: string;
    channel: string;
    purpose: string;
  }) {
    return this.makeRequest('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: {
    destination: string;
    purpose: string;
    code: string;
  }) {
    return this.makeRequest('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Support APIs
  async createSupportTicket(data: {
    subject: string;
    description: string;
    category: string;
    priority: string;
  }) {
    return this.makeRequest('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log("Support ticket created");
  }

  async getCustomerTickets(params?: {
  status?: string;
  page?: number;
  size?: number;
}): Promise<SupportTicket[]> {
  const queryString = params
    ? "?" + new URLSearchParams(params as any).toString()
    : "";
    console.log("Fetching customer tickets with params:", params);
  return this.makeRequest(`/api/support/tickets${queryString}`);
}

  async getTicketDetails(ticketId: string) {
    return this.makeRequest(`/api/support/tickets/${ticketId}`);
  }

  async addMessageToTicket(ticketId: string, data: { content: string }) {
    return this.makeRequest(`/api/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin APIs
  async getAllCustomers(params?: {
    page?: number;
    size?: number;
    sort?: string;
    kycStatus?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/admin/customers${queryString}`);
  }

  async getCustomerDetails(customerId: number) {
    return this.makeRequest(`/admin/customers/${customerId}`);
  }

  async getPendingKYCRequests(params?: { page?: number; size?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/admin/kyc/pending${queryString}`);
  }

  async reviewKYCDocument(kycId: number, data: {
    documentType: string;
    action: string;
    comments?: string;
  }) {
    return this.makeRequest(`/admin/kyc/${kycId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdminSupportTickets(params?: {
    status?: string;
    priority?: string;
    page?: number;
    size?: number;
  }) {
    // Backend doesn't have /admin/support/tickets, use customer endpoint instead
    console.log('⚠️ Using customer support tickets endpoint (admin endpoint not implemented)');
    console.log('🔍 API: Calling /api/support/tickets with params:', params);
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    const result = await this.makeRequest(`/api/support/tickets${queryString}`);
    console.log('✅ API: Support tickets result (from customer endpoint):', result);
    return result;
  }

  // Additional Admin KYC APIs from the docs
  async getKYCStatistics() {
    console.log('🔍 API: Calling /admin/kyc/pending-documents (correct endpoint)');
    const token = this.tokenManager.getToken();
    const tokenType = this.tokenManager.getTokenType();
    console.log('🔑 API: Token exists:', !!token);
    console.log('👤 API: User type:', tokenType);
    console.log('🎫 API: Token preview:', token ? token.substring(0, 20) + '...' : 'null');
    
    try {
      // Use the correct endpoint from Postman collection
      const rawResult: any = await this.makeRequest('/admin/kyc/pending-documents');
      console.log('🔍 Raw pending documents response:', rawResult);
      
      // Extract statistics from the available data
      const pendingDocuments = rawResult.pendingDocuments || rawResult.content || rawResult || [];
      const totalCustomers = rawResult.totalCustomers || rawResult.totalElements || 0;
      
      // Extract real statistics from backend data
      const mappedResult = {
        totalCustomers: totalCustomers || 0,
        pendingKyc: Array.isArray(pendingDocuments) ? pendingDocuments.length : 0,
        verifiedKyc: 0, // TODO: Add real endpoint for verified count
        rejectedKyc: 0, // TODO: Add real endpoint for rejected count  
        underReviewKyc: 0, // TODO: Add real endpoint for under review count
        pendingDocuments: Array.isArray(pendingDocuments) ? pendingDocuments.length : 0
      };
      
      console.log('✅ API: KYC Statistics (from real data):', mappedResult);
      console.log('💡 Note: Add GET /admin/kyc/statistics endpoint to backend for complete data');
      return mappedResult as any;
    } catch (error: any) {
      console.error('❌ API: KYC Statistics failed:', error);
      console.error('🔍 API: Full error details:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        response: error.response,
                    url: `${API_BASE_URL}/admin/kyc/pending-documents`
      });
      
      // If API fails, return empty data instead of fake data
      console.log('🔧 API failed - returning empty statistics');
      return {
        totalCustomers: 0,
        pendingKyc: 0,
        verifiedKyc: 0,
        rejectedKyc: 0,
        underReviewKyc: 0,
        pendingDocuments: 0
      };
    }
  }

  async getPendingKYCDocuments(params?: { page?: number; size?: number }) {
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/admin/kyc/pending-documents${queryString}`);
  }

  async viewKYCDocument(documentId: string, documentType: string = 'aadhar') {
    // Try multiple possible endpoint patterns
    const endpoints = [
      // Pattern 1: Based on Java controller method names
      documentType === 'aadhar' 
        ? `/admin/kyc/download-aadhar/${documentId}`
        : `/admin/kyc/download-pan/${documentId}`,
      // Pattern 2: Alternative naming
      documentType === 'aadhar' 
        ? `/admin/kyc/aadhar/${documentId}/download`
        : `/admin/kyc/pan/${documentId}/download`,
      // Pattern 3: Generic document download
      `/admin/kyc/document/${documentId}/download`,
      // Pattern 4: Simple document endpoint
      `/admin/kyc/document/${documentId}`,
      // Pattern 5: With document type parameter
      `/admin/kyc/download?documentId=${documentId}&type=${documentType}`
    ];
    
    console.log(`🔍 API: Viewing ${documentType} document with ID: ${documentId}`);
    console.log(`🔗 API: Will try ${endpoints.length} different endpoint patterns`);
    
    const token = this.tokenManager.getToken();
    console.log(`🔑 API: Token exists: ${!!token}`);
    console.log(`🔑 API: Token preview: ${token ? token.substring(0, 20) + '...' : 'null'}`);
    
    let lastError: any = null;
    
    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      console.log(`🔗 API: Trying endpoint ${i + 1}/${endpoints.length}: ${endpoint}`);
      console.log(`🔗 API: Full URL: ${API_BASE_URL}${endpoint}`);
      
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`📡 API: Response status: ${response.status} ${response.statusText}`);
        console.log(`📡 API: Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
          console.log(`✅ API: Successfully retrieved ${documentType} document using endpoint: ${endpoint}`);
          return response.blob();
        } else {
          const errorText = await response.text();
          console.warn(`⚠️ API: Endpoint ${i + 1} failed: ${response.status} ${response.statusText}`);
          console.warn(`⚠️ API: Error response body:`, errorText);
          
          lastError = {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            errorText
          };
        }
      } catch (fetchError) {
        console.warn(`⚠️ API: Endpoint ${i + 1} fetch error:`, fetchError);
        lastError = {
          endpoint,
          error: fetchError
        };
      }
    }
    
    // If all endpoints failed, throw an error with details
    console.error(`❌ API: All ${endpoints.length} endpoints failed for ${documentType} document`);
    console.error(`❌ API: Last error:`, lastError);
    
    throw new Error(`Failed to view ${documentType} document. Tried ${endpoints.length} different endpoints. Last error: ${lastError?.status || 'Network error'}`);
  }

  async verifyKYCDocument(documentId: string, data: {
    verificationStatus: 'VERIFIED' | 'REJECTED';
    notes?: string;
  }) {
    return this.makeRequest(`/admin/kyc/verify-document/${documentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateKYCStatus(customerId: number, data: {
    kycStatus: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW';
    reason?: string;
  }) {
    return this.makeRequest(`/admin/kyc/update-status/${customerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEnhancedCustomerKYCDetails(customerId: number) {
    return this.makeRequest(`/admin/kyc/customer/${customerId}`);
  }

  // Note: Based on API docs, only KYC and support ticket admin endpoints are available
  // Customer and analytics data should be derived from KYC statistics and support tickets

  // Note: Other admin endpoints are already implemented above

  // Utility methods
  getTokenManager() {
    return this.tokenManager;
  }

  isAuthenticated() {
    return this.tokenManager.isAuthenticated();
  }

  getAuthType() {
    return this.tokenManager.getTokenType();
  }

  async uploadAadharDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  console.log("Uploading Aadhaar document...");

  return this.makeFileRequest<KYCUploadResponse>('/api/kyc/upload/AADHAR', formData);
}

async uploadPanDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  console.log("Uploading PAN document...");
  return this.makeFileRequest<KYCUploadResponse>('/api/kyc/upload/PAN', formData);
}

async downloadAadharDocument(aadharDocumentId: string) {
    const response = await fetch(
      `/api/kyc/download/${aadharDocumentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.tokenManager.getToken()}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to download Aadhaar document');
    return response.blob() as Promise<Blob>;
  }

  // Download PAN
  async downloadPanDocument(panDocumentId: string) {
    const response = await fetch(
      `/api/kyc/download/${panDocumentId}`,
      {
        headers: {
          Authorization: `Bearer ${this.tokenManager.getToken()}`,
        },
      }
    );
    if (!response.ok) throw new Error('Failed to download PAN document');
    return response.blob() as Promise<Blob>;
  }


}

// Export singleton instance
export const apiService = new ApiService();

export { TokenManager, type ApiError };