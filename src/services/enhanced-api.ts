import { apiService } from './api';

// Direct API service - no mock fallbacks, real data only
class EnhancedApiService {
  // Authentication
  async customerLogin(data: { email: string; password: string }) {
    return apiService.customerLogin(data);
  }

  async adminLogin(data: { username: string; password: string }) {
    return apiService.adminLogin(data);
  }

  async logout() {
    return apiService.logout();
  }

  // Customer APIs
  async getCurrentCustomer() {
    return apiService.getCurrentCustomer();
  }

  async updateCustomerProfile(data: any) {
    return apiService.updateCustomerProfile(data);
  }

  async getUserAccounts() {
    return apiService.getUserAccounts();
  }

  async getTransactionHistory(accountId: number, params?: any) {
    return apiService.getTransactionHistory(accountId, params);
  }

  async getKYCStatus() {
    return apiService.getKYCStatus();
  }

  async getMyKYCDocuments() {
    return apiService.getMyKYCDocuments();
  }

  async uploadAadharDocument(file: File) {
    return apiService.uploadAadharDocument(file);
  }

  async uploadPanDocument(file: File) {
    return apiService.uploadPanDocument(file);
  }

  async downloadAadharDocument(documentId: string) {
    return apiService.downloadAadharDocument(documentId);
  }

  async downloadPanDocument(documentId: string) {
    return apiService.downloadPanDocument(documentId);
  }

  async createTransaction(data: any) {
    return apiService.createTransaction(data);
  }

  async createSupportTicket(data: any) {
    return apiService.createSupportTicket(data);
  }

  async getCustomerTickets(params?: any) {
    return apiService.getCustomerTickets(params);
  }

  // Admin APIs
  async getAllCustomers(params?: any) {
    return apiService.getAllCustomers(params);
  }

  async getCustomerDetails(customerId: number) {
    return apiService.getCustomerDetails(customerId);
  }

  async getPendingKYCRequests(params?: any) {
    // Now uses /admin/kyc/pending-documents route
    return apiService.getPendingKYCRequests(params);
  }

  async getAdminSupportTickets(params?: any) {
    return apiService.getAdminSupportTickets(params);
  }

  async getKYCStatistics() {
    return apiService.getKYCStatistics();
  }

  async getPendingKYCDocuments(params?: any) {
    return apiService.getPendingKYCDocuments(params);
  }

  async viewKYCDocument(documentId: string, documentType: string = 'aadhar') {
    return apiService.viewKYCDocument(documentId, documentType);
  }

  async verifyKYCDocument(documentId: string, data: any) {
    return apiService.verifyKYCDocument(documentId, data);
  }

  async updateKYCStatus(customerId: number, data: any) {
    return apiService.updateKYCStatus(customerId, data);
  }

  async getEnhancedCustomerKYCDetails(customerId: number) {
    return apiService.getEnhancedCustomerKYCDetails(customerId);
  }

  // Token management
  getTokenManager() {
    return apiService.getTokenManager();
  }

  isAuthenticated() {
    return apiService.isAuthenticated();
  }

  getAuthType() {
    return apiService.getAuthType();
  }
}

export const enhancedApiService = new EnhancedApiService();