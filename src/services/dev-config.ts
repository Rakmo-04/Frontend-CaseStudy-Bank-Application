// Development Configuration and Mock Data
export const DEV_CONFIG = {
  ENABLE_MOCK_MODE: false, // Set to false when real API is available
  MOCK_DELAY: 1000, // Simulate network delay
  
  // Mock user data for development
  MOCK_CUSTOMER: {
    customerId: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'demo@wtfbank.com',
    phoneNumber: '+91-9876543210',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    country: 'India',
    kycStatus: 'VERIFIED',
    profilePhotoUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  
  MOCK_ADMIN: {
    adminId: 1,
    username: 'admin001',
    role: 'SUPER_ADMIN',
    permissions: ['kyc_management', 'support_management', 'analytics']
  },
  
  MOCK_ACCOUNTS: [
    {
      accountId: 1,
      customerId: 1,
      accountNumber: 'WTF123456789',
      accountType: 'Savings',
      balance: 125000.50,
      currency: 'INR',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      accountId: 2,
      customerId: 1,
      accountNumber: 'WTF987654321',
      accountType: 'Current',
      balance: 75000.25,
      currency: 'INR',
      status: 'ACTIVE',
      createdAt: '2024-02-01T00:00:00Z'
    }
  ],
  
  MOCK_TRANSACTIONS: [
    {
      transactionId: 1,
      sourceAccountId: 1,
      destinationAccountId: null,
      amount: -2500.00,
      transactionType: 'WITHDRAWAL',
      status: 'COMPLETED',
      description: 'ATM Withdrawal',
      timestamp: '2024-09-01T10:30:00Z',
      balanceAfter: 125000.50
    },
    {
      transactionId: 2,
      sourceAccountId: 1,
      destinationAccountId: 2,
      amount: 10000.00,
      transactionType: 'TRANSFER',
      status: 'COMPLETED',
      description: 'Internal Transfer',
      timestamp: '2024-08-28T14:15:00Z',
      balanceAfter: 127500.50
    },
    {
      transactionId: 3,
      sourceAccountId: 1,
      destinationAccountId: null,
      amount: 50000.00,
      transactionType: 'DEPOSIT',
      status: 'COMPLETED',
      description: 'Salary Credit',
      timestamp: '2024-08-25T09:00:00Z',
      balanceAfter: 117500.50
    }
  ]
};

// Mock API responses
export const mockApiCall = <T,>(data: T, delay: number = DEV_CONFIG.MOCK_DELAY): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message: string, status: number = 400): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        message,
        status
      });
    }, DEV_CONFIG.MOCK_DELAY);
  });
};