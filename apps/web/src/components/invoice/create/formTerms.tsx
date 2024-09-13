import { ChangeEvent, useEffect, useState } from 'react';
import { getIntervalFromValue } from './valueFormik';
import dayjs from 'dayjs';

interface ClientSelectorProps {
  formik: any;
}
const FormTerms: React.FC<ClientSelectorProps> = ({ formik }) => {
  const [localPaymentTerms, setLocalPaymentTerms] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [recurringInterval, setRecurringInterval] = useState('');

  const handlePaymentTermsChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedTerm = e.target.value;
    setLocalPaymentTerms(selectedTerm);

    const invoiceDate = formik.values.invoice_date
      ? new Date(formik.values.invoice_date)
      : new Date();

    let newDueDate: Date | null = null;
    switch (selectedTerm) {
      case 'Net 7':
        newDueDate = new Date(invoiceDate.setDate(invoiceDate.getDate() + 7));
        break;
      case 'Net 30':
        newDueDate = new Date(invoiceDate.setDate(invoiceDate.getDate() + 30));
        break;
      case 'Due on Receipt':
        newDueDate = new Date(invoiceDate);
        break;
      case 'Custom':
        newDueDate = null;
        break;
      default:
        break;
    }

    if (newDueDate) {
      const formattedDueDate = dayjs(newDueDate)
        .startOf('day')
        .format('YYYY-MM-DD');
      setDueDate(formattedDueDate);
      formik.setFieldValue('due_date', formattedDueDate);

      const invoiceDayjs = dayjs(formik.values.invoice_date);
      const dueDayjs = dayjs(formattedDueDate);
      const diffInDays = dueDayjs.diff(invoiceDayjs, 'day');
      formik.setFieldValue('payment_terms', diffInDays);
    } else {
      setDueDate('');
      formik.setFieldValue('due_date', '');
      formik.setFieldValue('payment_terms', '');
    }
  };

  const handleDueDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    setDueDate(selectedDate);
    formik.setFieldValue('due_date', selectedDate);

    const invoiceDayjs = dayjs(formik.values.invoice_date);
    const dueDayjs = dayjs(selectedDate);
    const diffInDays = dueDayjs.diff(invoiceDayjs, 'day');
    formik.setFieldValue('payment_terms', diffInDays);
  };

  useEffect(() => {
    if (localPaymentTerms === 'Custom' && formik.values.due_date) {
      setDueDate(formik.values.due_date);
    }
  }, [formik.values.due_date, localPaymentTerms]);

  const today = dayjs().startOf('day').format('YYYY-MM-DD');
  const handleRecurringIntervalChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const days = getIntervalFromValue(value);
    setRecurringInterval(value);
    formik.setFieldValue('recurring_interval', days);
  };

  const handleCustomInterval = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseInt(value, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      formik.setFieldValue('recurring_interval', numericValue);
    } else {
      formik.setFieldValue('recurring_interval', '');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-start">
          <label htmlFor="recurring" className="w-48 py-4">
            Type
          </label>
          <div className="flex items-center gap-5 py-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="recurring"
                value="false"
                id="type_goods"
                checked={!formik.values.recurring}
                onChange={() => formik.setFieldValue('recurring', false)}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
              />
              <div>
                <label htmlFor="type_goods" className="text-md">
                  Non-Recurring
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="recurring"
                value="true"
                id="type_service"
                checked={formik.values.recurring}
                onChange={() => formik.setFieldValue('recurring', true)}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
              />
              <div>
                <label htmlFor="type_service" className="text-md">
                  Recurring
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-start">
            <label htmlFor="invoice_date" className="w-48 py-4">
              {formik.values.recurring ? 'Start Recurring' : 'Invoice Date'}
            </label>
            <div className="">
              <input
                type="date"
                id="invoice_date"
                name="invoice_date"
                value={formik.values.invoice_date || today}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
              />
              {formik.touched.invoice_date && formik.errors.invoice_date && (
                <div className="text-red-500 text-sm">
                  {formik.errors.invoice_date}
                </div>
              )}
            </div>
          </div>

          {formik.values.recurring && (
            <div className="flex items-start">
              <label htmlFor="recurring_end_date" className="w-48 py-4">
                End Recurring
              </label>
              <div className="">
                <input
                  type="date"
                  id="recurring_end"
                  name="recurring_end"
                  value={formik.values.recurring_end}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    formik.touched.recurring_end && formik.errors.recurring_end
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                {formik.touched.recurring_end &&
                  formik.errors.recurring_end && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.recurring_end}
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="flex items-start">
            <label htmlFor="payment_terms" className="w-48 py-4">
              Payment Terms
            </label>
            <div className="">
              <select
                id="payment_terms"
                name="payment_terms"
                value={localPaymentTerms}
                onChange={handlePaymentTermsChange}
                onBlur={formik.handleBlur}
                className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                  formik.touched.payment_terms && formik.errors.payment_terms
                    ? 'border-red-500'
                    : ''
                }`}
              >
                <option value="">Select</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Net 7">Net 7</option>
                <option value="Net 30">Net 30</option>
                <option value="Custom">Custom</option>
              </select>
              {formik.touched.payment_terms &&
                formik.errors.payment_terms &&
                localPaymentTerms !== 'Custom' && (
                  <div className="text-red-500 text-sm">
                    {formik.errors.payment_terms}
                  </div>
                )}
            </div>
          </div>

          {localPaymentTerms === 'Custom' && (
            <div className="flex items-start">
              <label htmlFor="due_date" className="w-48 py-4">
                Custom Due Date
              </label>
              <div className="">
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  value={dueDate}
                  onChange={handleDueDateChange}
                  onBlur={formik.handleBlur}
                  className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                    formik.touched.due_date && formik.errors.due_date
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                {formik.touched.payment_terms &&
                  formik.errors.payment_terms &&
                  localPaymentTerms == 'Custom' && (
                    <div className="text-red-500 text-sm">
                      {formik.errors.payment_terms}
                    </div>
                  )}
              </div>
            </div>
          )}

          {formik.values.recurring && (
            <>
              <div className="flex items-start">
                <label htmlFor="recurring_interval" className="w-48 py-4">
                  Repeat Every
                </label>
                <div className="">
                  <select
                    id="recurring_interval"
                    name="recurring_interval"
                    value={recurringInterval}
                    onChange={handleRecurringIntervalChange}
                    onBlur={formik.handleBlur}
                    className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                      formik.touched.recurring_interval &&
                      formik.errors.recurring_interval
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="custom">Custom</option>
                  </select>
                  {formik.touched.recurring_interval &&
                    formik.errors.recurring_interval &&
                    recurringInterval !== 'custom' && (
                      <div className="text-red-500 text-sm">
                        {formik.errors.recurring_interval}
                      </div>
                    )}
                  {recurringInterval === 'custom' && (
                    <div className="">
                      <input
                        type="text"
                        id="custom_recurring_interval"
                        name="recurring_interval"
                        value={formik.values.recurring_interval}
                        onChange={handleCustomInterval}
                        onBlur={formik.handleBlur}
                        placeholder="Enter number of days"
                        className={`cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500 ${
                          formik.touched.recurring_interval &&
                          formik.errors.recurring_interval
                            ? 'border-red-500'
                            : ''
                        }`}
                      />
                      {formik.touched.recurring_interval &&
                        formik.errors.recurring_interval &&
                        recurringInterval === 'custom' && (
                          <div className="text-red-500 text-sm">
                            {formik.errors.recurring_interval}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FormTerms;
