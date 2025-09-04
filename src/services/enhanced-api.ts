import { apiService } from './api';
import { mockApiService } from './mock-api';
import { DEV_CONFIG } from './dev-config';
import { getApiBaseUrl } from '../utils/environment';

console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(apiService)));

// Enhanced API service that can fallback to mock data
class EnhancedApiService {
  private useMockMode = DEV_CONFIG.ENABLE_MOCK_MODE;
  private backendAvailable: boolean | null = null;
  
  constructor() {
    // Check backend availability on initialization
    this.checkBackendAvailability();
  }
  
  private async checkBackendAvailability(): Promise<boolean> {
    if (this.useMockMode) {
      console.log('🟡 Mock mode enabled - using mock data');
      this.backendAvailable = false;
      return false;
    }
    
    try {
      // Try a simple health check or minimal endpoint
      const response = await fetch(`${getApiBaseUrl()}/health`, {
        method: 'GET',
        timeout: 5000
      } as any);
      
      this.backendAvailable = response.ok;
      if (this.backendAvailable) {
        console.log('🟢 Backend server is available');
      } else {
        console.log('🔴 Backend server returned error status');
      }
    } catch (error) {
      console.log('🔴 Backend server is not available - falling back to mock mode');
      this.backendAvailable = false;
    }
    
    return this.backendAvailable;
  }
  
  private async executeWithFallback<T>(
    realApiCall: () => Promise<T>,
    mockApiCall: () => Promise<T>,
    methodName: string
  ): Promise<T> {
    // Force mock mode if enabled
    if (this.useMockMode) {
      console.log(`📝 Using mock data for: ${methodName}`);
      return mockApiCall();
    }
    
    // Check backend availability if not yet determined
    if (this.backendAvailable === null) {
      await this.checkBackendAvailability();
    }
    
    // Use mock if backend is not available
    if (!this.backendAvailable) {
      console.log(`📝 Backend unavailable, using mock data for: ${methodName}`);
      return mockApiCall();
    }
    
    try {
      return await realApiCall();
    } catch (error: any) {
      // If it's a network error, fallback to mock
      if (error.status === 0 || error.message?.includes('Network error')) {
        console.log(`📝 Network error, falling back to mock data for: ${methodName}`);
        this.backendAvailable = false;
        return mockApiCall();
      }
      throw error;
    }
  }
  
  // Authentication methods
  async customerLogin(data: { email: string; password: string }) {
    return this.executeWithFallback(
      () => apiService.customerLogin(data),
      () => mockApiService.customerLogin(data),
      'customerLogin'
    );
  }
  
  async adminLogin(data: { username: string; password: string }) {
    return this.executeWithFallback(
      () => apiService.adminLogin(data),
      () => mockApiService.adminLogin(data),
      'adminLogin'
    );
  }
  
  async getCurrentCustomer() {
    return this.executeWithFallback(
      () => apiService.getCurrentCustomer(),
      () => mockApiService.getCurrentCustomer(),
      'getCurrentCustomer'
    );
  }
  
  async getUserAccounts() {
    return this.executeWithFallback(
      () => apiService.getUserAccounts(),
      () => mockApiService.getUserAccounts(),
      'getUserAccounts'
    );
  }
  
  async getTransactionHistory(accountId: number, params?: any) {
    return this.executeWithFallback(
      () => apiService.getTransactionHistory(accountId, params),
      () => mockApiService.getTransactionHistory(accountId, params),
      'getTransactionHistory'
    );
  }
  
  async getKYCStatus() {
    return this.executeWithFallback(
      () => apiService.getKYCStatus(),
      () => mockApiService.getKYCStatus(),
      'getKYCStatus'
    );
  }
  
  async createTransaction(data: any) {
    return this.executeWithFallback(
      () => apiService.createTransaction(data),
      () => mockApiService.createTransaction(data),
      'createTransaction'
    );
  }
  
  async createSupportTicket(data: any) {
    return this.executeWithFallback(
      () => apiService.createSupportTicket(data),
      () => mockApiService.createSupportTicket(data),
      'createSupportTicket'
    );
  }
  
  async getCustomerTickets(params?: any) {
    return this.executeWithFallback(
      () => apiService.getCustomerTickets(params),
      () => mockApiService.getCustomerTickets(),
      'getCustomerTickets'
    );
  }
  
  // Admin methods
  async getAllCustomers(params?: any) {
    return this.executeWithFallback(
      () => apiService.getAllCustomers(params),
      () => mockApiService.getAllCustomers(),
      'getAllCustomers'
    );
  }
  
  async getPendingKYCRequests(params?: any) {
    return this.executeWithFallback(
      () => apiService.getPendingKYCRequests(params),
      () => mockApiService.getPendingKYCRequests(),
      'getPendingKYCRequests'
    );
  }
  
  async getAdminSupportTickets(params?: any) {
    return this.executeWithFallback(
      () => apiService.getAdminSupportTickets(params),
      () => mockApiService.getAdminSupportTickets(),
      'getAdminSupportTickets'
    );
  }
  
  async logout() {
    return this.executeWithFallback(
      () => apiService.logout(),
      () => mockApiService.logout(),
      'logout'
    );
  }
  
  // Utility methods - delegate to original API service
  getTokenManager() {
    return apiService.getTokenManager();
  }
  
  isAuthenticated() {
    return apiService.isAuthenticated();
  }
  
  getAuthType() {
    return apiService.getAuthType();
  }
  
  // Method to toggle mock mode
  setMockMode(enabled: boolean) {
    this.useMockMode = enabled;
    this.backendAvailable = enabled ? false : null;
    console.log(`Mock mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Method to force backend check
  async refreshBackendStatus() {
    this.backendAvailable = null;
    return this.checkBackendAvailability();
  }
  
  // Get current mode info
  getModeInfo() {
    return {
      mockMode: this.useMockMode,
      backendAvailable: this.backendAvailable,
      currentMode: this.useMockMode || !this.backendAvailable ? 'mock' : 'real'
    };
  }
}

export const enhancedApiService = new EnhancedApiService();