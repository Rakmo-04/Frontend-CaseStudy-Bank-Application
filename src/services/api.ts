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
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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

    if (response.token) {
      this.tokenManager.setToken(response.token, 'admin');
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

  async createAccount(data: { accountType: string; initialDeposit?: number }) {
    return this.makeRequest('/api/accounts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction APIs
  async createTransaction(data: {
    sourceAccountId: number;
    destinationAccountId?: number;
    amount: number;
    transactionType: string;
    description?: string;
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
    const queryString = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return this.makeRequest(`/admin/support/tickets${queryString}`);
  }

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