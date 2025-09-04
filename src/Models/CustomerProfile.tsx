export interface CustomerProfile {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  aadharNumber: string;
  panNumber: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  profilePhotoUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: string; // could also be a union type: "PENDING" | "APPROVED" | "REJECTED"
  hasAadharDocument: boolean;
  hasPanDocument: boolean;
  documentsUploadTimestamp: string | null;
}
