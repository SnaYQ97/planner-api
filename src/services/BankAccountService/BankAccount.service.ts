import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BankAccountService {
  async createBankAccount(data: any) {
    return prisma.bankAccount.create({
      data
    });
  }

  async getBankAccounts() {
    return prisma.bankAccount.findMany();
  }

  async getBankAccountById(id: string) {
    return prisma.bankAccount.findUnique({
      where: { id }
    });
  }

  async updateBankAccount(id: string, data: any) {
    return prisma.bankAccount.update({
      where: { id },
      data
    });
  }

  async deleteBankAccount(id: string) {
    return prisma.bankAccount.delete({
      where: { id }
    });
  }
} 