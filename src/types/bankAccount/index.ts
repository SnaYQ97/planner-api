import { Decimal } from '@prisma/client/runtime/library';

export interface BankAccount {
  id: string;
  accountType: string;
  name: string;
  balance: Decimal;
  interestRate: Decimal | null;
  interestRateLimit: Decimal | null;
  interestStartDate: Date | null;
  interestEndDate: Date | null;
  accountNumber: string;
  targetAmount: Decimal | null;
  targetDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBankAccountRequest {
  accountType: string;
  name: string;
  balance: number | string;
  accountNumber: string;
  interestRate?: number | string;
  interestRateLimit?: number | string;
  interestStartDate?: string;
  interestEndDate?: string;
  targetAmount?: number | string;
  targetDate?: string;
}

export type BankAccountResponse = {
  message: string;
} & (
  | { accounts: BankAccount[]; error?: never }
  | { account: BankAccount; error?: never }
  | { error: string }
  | { error?: never }
); 