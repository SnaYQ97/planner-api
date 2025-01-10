import * as yup from 'yup';

const emailRegex = /^[^\s<>"\\;:]+@[a-zA-Z0-9.\-_]+\.[a-zA-Z0-9-_]+$/;

export const loginSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .matches(emailRegex, 'Nieprawidłowy adres email')
      .required('Email jest wymagany'),
    password: yup
      .string()
      .min(6, 'Hasło musi mieć minimum 6 znaków')
      .required('Hasło jest wymagane'),
  }),
});

export const registerSchema = yup.object({
  body: yup.object({
    email: yup
      .string()
      .matches(emailRegex, 'Nieprawidłowy adres email')
      .required('Email jest wymagany'),
    password: yup
      .string()
      .min(6, 'Hasło musi mieć minimum 6 znaków')
      .required('Hasło jest wymagane'),
    firstName: yup.string().optional(),
    lastName: yup.string().optional(),
  }),
}); 