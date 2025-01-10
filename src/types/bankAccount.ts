import { Decimal } from '@prisma/client/runtime/library';

export type AccountType = 'SAVINGS' | 'DAILY';

export interface CreateBankAccountRequest {
  accountType: AccountType;
  name: string;
  balance: string | number;
  accountNumber: string;
  interestRate?: string | number | null;
  interestRateLimit?: string | number | null;
  interestStartDate?: string | Date | null;
  interestEndDate?: string | Date | null;
  targetAmount?: string | number | null;
  targetDate?: string | Date | null;
  color?: string | null;
}

export interface BankAccountSuccessResponse {
  message: string;
  accounts?: BankAccount[];
  account?: BankAccount;
}

export interface BankAccountErrorResponse {
  message: string;
  error: string;
}

export type BankAccountResponse = BankAccountSuccessResponse | BankAccountErrorResponse;

export interface BankAccount {
  id: string;
  userId: string;
  accountType: AccountType;
  name: string;
  balance: Decimal;
  accountNumber: string;
  interestRate: Decimal | null;
  interestRateLimit: Decimal | null;
  interestStartDate: Date | null;
  interestEndDate: Date | null;
  targetAmount: Decimal | null;
  targetDate: Date | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
} 