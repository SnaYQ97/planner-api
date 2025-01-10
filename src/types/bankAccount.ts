export type AccountType = 'SAVINGS' | 'DAILY';

export interface CreateBankAccountRequest {
  accountType: AccountType;
  name: string;
  balance: number;
  accountNumber: string;
  interestRate?: number | null;
  interestRateLimit?: number | null;
  interestStartDate?: string | null;
  interestEndDate?: string | null;
  targetAmount?: number | null;
  targetDate?: string | null;
}

export interface BankAccountResponse {
  message: string;
  accounts?: BankAccount[];
  account?: BankAccount;
  error?: string;
}

export interface BankAccount extends CreateBankAccountRequest {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 