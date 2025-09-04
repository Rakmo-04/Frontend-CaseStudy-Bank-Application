// Possible statuses as per your backend
export type KYCStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'verified';

export type DocumentType = 'AADHAR' | 'PAN';

// Status stored on each uploaded document
export type DocumentVerificationStatus = 'verified' | 'verified' | 'rejected';

// Document metadata (in case backend starts returning documents later)
export interface KYCDocument {
  documentId: number;
  documentType: 'aadhar' | 'pan';
  originalFilename: string;
  uploadTimestamp: string; // ISO date string
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationNotes: string;
  fileSize: number;
}

export interface KYCUploadResponse {
  document: KYCDocument;
}

// Response for /api/kyc/my-documents
export interface MyDocumentsResponse {
  documents: KYCDocument[];
  kycStatus: KYCStatus;
}

// Response for /api/kyc/status
export interface KYCStatusResponse {
  documentsUploaded: number;
  kycStatus: KYCStatus;
  isComplete: boolean;
  documentsRequired: number;
  hasPanCard: boolean;
  documentsVerified: number;
  hasAadharCard: boolean;
}

// Response for /api/customers/kyc-status
// (just the string)
export type CustomerKYCStatusResponse = KYCStatus;
