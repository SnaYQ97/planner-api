import { RootState } from '../store/index.store';

export const getBankAccounts = (state: RootState) => state.bankAccount.accounts;
export const getTotalBalance = (state: RootState) => state.bankAccount.totalBalance; 