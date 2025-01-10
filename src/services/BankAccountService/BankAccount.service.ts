export const useUpdateBankAccount = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBankAccountRequest }) => 
      bankAccountService.updateBankAccount(id, data),
  });
}; 