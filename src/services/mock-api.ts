import { DEV_CONFIG, mockApiCall, mockApiError } from './dev-config';

// Mock API service for development when backend is not available
class MockApiService {
  private mockToken = 'mock-jwt-token-for-development';
  
  async customerLogin(data: { email: string; password: string }) {
    // Simulate authentication
    if (data.email === 'demo@wtfbank.com' && data.password === 'demo123') {
      return mockApiCall({
        token: this.mockToken,
        customerId: DEV_CONFIG.MOCK_CUSTOMER.customerId,
        accountId: DEV_CONFIG.MOCK_ACCOUNTS[0].accountId,
        userType: 'CUSTOMER',
        kycStatus: DEV_CONFIG.MOCK_CUSTOMER.kycStatus,
        message: 'Login successful'
      });
    } else {
      return mockApiError('Invalid email or password', 401);
    }
  }
  
  async adminLogin(data: { username: string; password: string }) {
    // Simulate admin authentication
    if (data.username === 'admin001' && data.password === 'admin123') {
      return mockApiCall({
        token: this.mockToken,
        adminId: DEV_CONFIG.MOCK_ADMIN.adminId,
        role: DEV_CONFIG.MOCK_ADMIN.role,
        message: 'Admin login successful'
      });
    } else {
      return mockApiError('Invalid username or password', 401);
    }
  }
  
  async getCurrentCustomer() {
    return mockApiCall(DEV_CONFIG.MOCK_CUSTOMER);
  }
  
  async getUserAccounts() {
    return mockApiCall({
      content: DEV_CONFIG.MOCK_ACCOUNTS,
      totalElements: DEV_CONFIG.MOCK_ACCOUNTS.length,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  async getTransactionHistory(accountId: number, params?: any) {
    const transactions = DEV_CONFIG.MOCK_TRANSACTIONS.filter(
      t => t.sourceAccountId === accountId || t.destinationAccountId === accountId
    );
    
    return mockApiCall({
      content: transactions,
      totalElements: transactions.length,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  async getKYCStatus() {
    return mockApiCall({
      kycStatus: DEV_CONFIG.MOCK_CUSTOMER.kycStatus,
      documents: [
        {
          documentType: 'AADHAR_CARD',
          status: 'VERIFIED',
          uploadedAt: '2024-01-01T00:00:00Z',
          verifiedAt: '2024-01-02T00:00:00Z'
        },
        {
          documentType: 'PAN_CARD',
          status: 'VERIFIED',
          uploadedAt: '2024-01-01T00:00:00Z',
          verifiedAt: '2024-01-02T00:00:00Z'
        }
      ]
    });
  }
  
  async createTransaction(data: any) {
    const newTransaction = {
      transactionId: Math.floor(Math.random() * 10000),
      ...data,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      balanceAfter: DEV_CONFIG.MOCK_ACCOUNTS[0].balance - data.amount
    };
    
    return mockApiCall(newTransaction);
  }
  
  async createSupportTicket(data: any) {
    return mockApiCall({
      ticketId: 'TKT-' + Math.floor(Math.random() * 10000),
      ...data,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      customerId: DEV_CONFIG.MOCK_CUSTOMER.customerId
    });
  }
  
  async getCustomerTickets() {
    return mockApiCall({
      content: [
        {
          ticketId: 'TKT-1001',
          subject: 'Account Balance Inquiry',
          status: 'RESOLVED',
          priority: 'MEDIUM',
          category: 'ACCOUNT',
          createdAt: '2024-08-20T10:00:00Z',
          updatedAt: '2024-08-21T15:30:00Z'
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  // Admin endpoints
  async getAllCustomers() {
    return mockApiCall({
      content: [DEV_CONFIG.MOCK_CUSTOMER],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  async getPendingKYCRequests() {
    return mockApiCall({
      content: [],
      totalElements: 0,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  async getAdminSupportTickets() {
    return mockApiCall({
      content: [
        {
          ticketId: 'TKT-1001',
          subject: 'Account Balance Inquiry',
          status: 'RESOLVED',
          priority: 'MEDIUM',
          category: 'ACCOUNT',
          customerName: 'John Doe',
          createdAt: '2024-08-20T10:00:00Z',
          updatedAt: '2024-08-21T15:30:00Z'
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0
    });
  }
  
  async logout(): Promise<void> {
  // just simulate clearing logout, but don't return anything
  console.log("🔵 Mock logout executed");
}
  
  // Generic method for other endpoints
  async mockCall(endpoint: string, options?: any) {
    console.log(`Mock API call to ${endpoint}`, options);
    return mockApiCall({ message: 'Mock response', endpoint });
  }
}

export const mockApiService = new MockApiService();