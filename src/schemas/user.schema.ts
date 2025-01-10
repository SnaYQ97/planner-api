import * as yup from 'yup';

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

export const createUserSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .trim()
      .lowercase()
      .email('Nieprawidłowy adres email')
      .required('Email jest wymagany'),
    password: yup
      .string()
      .matches(passwordRules, {
        message: 'Hasło musi zawierać minimum 6 znaków, w tym jedną wielką literę, jedną małą literę i jedną cyfrę'
      })
      .min(6, 'Hasło musi mieć minimum 6 znaków')
      .max(20, 'Hasło nie może być dłuższe niż 20 znaków')
      .required('Hasło jest wymagane'),
    loginAfterCreate: yup
      .boolean()
      .default(false)
      .optional(),
  }),
});

export const updateUserSchema = yup.object({
  params: yup.object({
    id: yup
      .string()
      .uuid('Nieprawidłowy format ID')
      .required('ID użytkownika jest wymagane'),
  }),
  body: yup.object({
    email: yup
      .string()
      .trim()
      .lowercase()
      .email('Nieprawidłowy adres email')
      .optional(),
    password: yup
      .string()
      .matches(passwordRules, {
        message: 'Hasło musi zawierać minimum 6 znaków, w tym jedną wielką literę, jedną małą literę i jedną cyfrę'
      })
      .min(6, 'Hasło musi mieć minimum 6 znaków')
      .max(20, 'Hasło nie może być dłuższe niż 20 znaków')
      .optional(),
    firstName: yup
      .string()
      .trim()
      .min(2, 'Imię musi mieć minimum 2 znaki')
      .max(50, 'Imię nie może być dłuższe niż 50 znaków')
      .optional(),
    lastName: yup
      .string()
      .trim()
      .min(2, 'Nazwisko musi mieć minimum 2 znaki')
      .max(50, 'Nazwisko nie może być dłuższe niż 50 znaków')
      .optional(),
  }),
}); 