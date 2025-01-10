import * as yup from 'yup';

export const createCategorySchema = yup.object({
  body: yup.object({
    name: yup
      .string()
      .required('Nazwa kategorii jest wymagana')
      .min(2, 'Nazwa musi mieć minimum 2 znaki'),
    budget: yup
      .number()
      .typeError('Budżet musi być liczbą')
      .min(0, 'Budżet nie może być ujemny')
      .required('Budżet jest wymagany'),
    color: yup
      .string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Nieprawidłowy format koloru')
      .required('Kolor jest wymagany'),
  }),
});

export const updateCategorySchema = yup.object({
  params: yup.object({
    id: yup.string().required('ID kategorii jest wymagane'),
  }),
  body: yup.object({
    name: yup
      .string()
      .min(2, 'Nazwa musi mieć minimum 2 znaki')
      .optional(),
    budget: yup
      .number()
      .typeError('Budżet musi być liczbą')
      .min(0, 'Budżet nie może być ujemny')
      .optional(),
    color: yup
      .string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Nieprawidłowy format koloru')
      .optional(),
  }),
}); 