import * as yup from 'yup';

const ACCOUNT_TYPES = ['SAVINGS', 'DAILY'] as const;
type AccountType = typeof ACCOUNT_TYPES[number];

export const createBankAccountSchema = yup.object({
  body: yup.object({
    accountType: yup
      .string()
      .oneOf(ACCOUNT_TYPES, 'Nieprawidłowy typ konta')
      .required('Typ konta jest wymagany'),
    name: yup
      .string()
      .min(3, 'Nazwa konta musi mieć co najmniej 3 znaki')
      .max(50, 'Nazwa konta nie może być dłuższa niż 50 znaków')
      .required('Nazwa konta jest wymagana'),
    balance: yup
      .number()
      .typeError('Saldo musi być liczbą')
      .min(0, 'Saldo nie może być ujemne')
      .required('Saldo jest wymagane'),
    accountNumber: yup
      .string()
      .matches(/^[0-9]{26}$/, 'Nieprawidłowy format numeru konta. Format: 26 cyfr')
      .required('Numer konta jest wymagany'),
    interestRate: yup
      .number()
      .typeError('Oprocentowanie musi być liczbą')
      .min(0, 'Oprocentowanie nie może być ujemne')
      .max(100, 'Oprocentowanie nie może być większe niż 100%')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Oprocentowanie jest wymagane dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    interestRateLimit: yup
      .number()
      .typeError('Limit oprocentowania musi być liczbą')
      .min(0, 'Limit oprocentowania nie może być ujemny')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Limit oprocentowania jest wymagany dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    interestStartDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Data rozpoczęcia oprocentowania jest wymagana dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    interestEndDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Data zakończenia oprocentowania jest wymagana dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    targetAmount: yup
      .number()
      .typeError('Kwota docelowa musi być liczbą')
      .min(0, 'Kwota docelowa nie może być ujemna')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Kwota docelowa jest wymagana dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    targetDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .when('accountType', {
        is: 'SAVINGS',
        then: (schema) => schema.required('Data docelowa jest wymagana dla konta oszczędnościowego'),
        otherwise: (schema) => schema.nullable(),
      }),
    color: yup
      .string()
      .matches(/^#[0-9A-Fa-f]{6}$/, 'Nieprawidłowy format koloru')
      .nullable(),
  }),
});

export const updateBankAccountSchema = yup.object({
  params: yup.object({
    id: yup.string().required('ID konta jest wymagane'),
  }),
  body: yup.object({
    accountType: yup
      .string()
      .oneOf(ACCOUNT_TYPES, 'Nieprawidłowy typ konta')
      .optional(),
    name: yup
      .string()
      .min(3, 'Nazwa konta musi mieć co najmniej 3 znaki')
      .max(50, 'Nazwa konta nie może być dłuższa niż 50 znaków')
      .optional(),
    balance: yup
      .number()
      .typeError('Saldo musi być liczbą')
      .min(0, 'Saldo nie może być ujemne')
      .optional(),
    accountNumber: yup
      .string()
      .matches(/^[0-9]{26}$/, 'Nieprawidłowy format numeru konta. Format: 26 cyfr')
      .optional(),
    interestRate: yup
      .number()
      .typeError('Oprocentowanie musi być liczbą')
      .min(0, 'Oprocentowanie nie może być ujemne')
      .max(100, 'Oprocentowanie nie może być większe niż 100%')
      .nullable()
      .optional(),
    interestRateLimit: yup
      .number()
      .typeError('Limit oprocentowania musi być liczbą')
      .min(0, 'Limit oprocentowania nie może być ujemny')
      .nullable()
      .optional(),
    interestStartDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .optional(),
    interestEndDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .optional(),
    targetAmount: yup
      .number()
      .typeError('Kwota docelowa musi być liczbą')
      .min(0, 'Kwota docelowa nie może być ujemna')
      .nullable()
      .optional(),
    targetDate: yup
      .date()
      .typeError('Nieprawidłowa data')
      .nullable()
      .optional(),
    color: yup
      .string()
      .matches(/^#[0-9A-Fa-f]{6}$/, 'Nieprawidłowy format koloru')
      .nullable()
      .optional(),
  }),
}); 