
import { CustomerProfile } from './CustomerProfile';

export interface Account {
  accountId: number;
  customer: CustomerProfile;
  accountType: string;
  holderType: string;
  balance: number;
  accountStatus: string;
  createdDate: string;
  accountNumber: string;
  // add other optional fields if needed
}