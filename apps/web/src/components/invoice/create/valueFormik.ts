import dayjs from 'dayjs';
import * as Yup from 'yup';

const today = dayjs().startOf('day').format('YYYY-MM-DD');

export const initialValues = {
  client_id: '',
  recurring: false,
  payment_terms: 'Due on Receipt',
  expiration_days: 0,
  due_date: today,
  invoice_date: today,
  recurring_end: '',
  recurring_interval: '',
  payment_method: '',
  shipping_cost: '',
  tax: '',
  discount: '',
  tax_type: 'nominal',
  discount_type: 'nominal',
};

export const validationSchema = Yup.object().shape({
  client_id: Yup.string().required('Client ID is required'),
  invoice_date: Yup.date()
    .required('Invoice date is required')
    .min(today, 'Invoice date cannot be in the past'),
  payment_terms: Yup.number().required('Payment terms are required'),
  due_date: Yup.date()
    .min(Yup.ref('invoice_date'), 'Due date cannot be before invoice date')
    .min(today, 'Due date cannot be in the past'),
  recurring: Yup.boolean(),
  recurring_end: Yup.date().when('recurring', {
    is: (val: boolean) => val === true,
    then: (schema) =>
      schema
        .required('Recurring end date is required')
        .min(
          Yup.ref('invoice_date'),
          'Recurring end date cannot be before invoice date',
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  recurring_interval: Yup.number()
    .nullable()
    .when('recurring', {
      is: (val: boolean) => val === true,
      then: (schema) =>
        schema
          .required('Recurring interval is required')
          .min(1, 'Must be at least 1 day'),
      otherwise: (schema) => schema.nullable(),
    }),
  payment_method: Yup.string().required('Payment method is required'),
  shipping_cost: Yup.number().nullable(),
  tax: Yup.number().nullable(),
  tax_type: Yup.string().oneOf(['nominal', 'percentage']).nullable(),
  discount: Yup.number().nullable(),
  discount_type: Yup.string().oneOf(['nominal', 'percentage']).nullable(),
});

export const getIntervalFromValue = (value: string): number | '' => {
  switch (value) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'year':
      return 365;
    default:
      return '';
  }
};
