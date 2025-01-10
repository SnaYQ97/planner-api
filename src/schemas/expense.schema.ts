import * as yup from 'yup';

export const createTransactionSchema = yup.object().shape({
  body: yup.object().shape({
    amount: yup
      .number()
      .required('Kwota jest wymagana')
      .positive('Kwota musi być dodatnia'),
    description: yup
      .string()
      .required('Opis jest wymagany')
      .min(3, 'Opis musi mieć minimum 3 znaki'),
    categoryId: yup
      .string()
      .required('Kategoria jest wymagana'),
    accountId: yup
      .string()
      .required('Konto jest wymagane'),
    date: yup
      .date()
      .required('Data jest wymagana')
      .max(new Date(), 'Data nie może być z przyszłości'),
    type: yup
      .string()
      .required('Typ transakcji jest wymagany')
      .oneOf(['EXPENSE', 'INCOME'], 'Nieprawidłowy typ transakcji')
  }),
});

export const updateTransactionSchema = yup.object().shape({
  body: yup.object().shape({
    amount: yup
      .number()
      .required('Kwota jest wymagana')
      .positive('Kwota musi być dodatnia'),
    description: yup
      .string()
      .required('Opis jest wymagany')
      .min(3, 'Opis musi mieć minimum 3 znaki'),
    categoryId: yup
      .string()
      .required('Kategoria jest wymagana'),
    accountId: yup
      .string()
      .required('Konto jest wymagane'),
    date: yup
      .date()
      .required('Data jest wymagana')
      .max(new Date(), 'Data nie może być z przyszłości'),
    type: yup
      .string()
      .required('Typ transakcji jest wymagany')
      .oneOf(['EXPENSE', 'INCOME'], 'Nieprawidłowy typ transakcji')
  }),
}); 