'use client';

import React, { useEffect, useState } from 'react';
import { TInvoice, TRecurring } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatPrice, logoSrc } from '@/helpers/format';

interface Props {
  invoice: TInvoice;
  recurring: TRecurring | null;
}
const Terms: React.FC<Props> = ({ invoice, recurring }) => {
  dayjs.extend(relativeTime);

  return (
    <>
      <div className="flex flex-col border-t border-gray-300 pt-5 gap-5">
        <div className="flex flex-col">
          <div className="text-lg font-semibold">
            {invoice.recurring ? 'Recurring Terms' : 'Invoice Date'}
          </div>
          <div className="flex gap-5 items-center">
            <div className="flex gap-5 items-center">
              <div
                className={`rounded-xl my-2 w-44 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
              >
                {invoice.recurring
                  ? `${dayjs(recurring?.invoice_date).format('DD MMMM YYYY')}`
                  : `${dayjs(invoice?.invoice_date).format('DD MMMM YYYY')}`}
              </div>
              <div>-</div>
              <div
                className={`rounded-xl my-2 w-44 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
              >
                {invoice.recurring
                  ? `${dayjs(invoice?.recurring_end).format('DD MMMM YYYY')}`
                  : `${dayjs(invoice?.due_date).format('DD MMMM YYYY')}`}
              </div>
            </div>
          </div>
          {invoice.recurring && (
            <>
              <div className="flex items-center">
                <div
                  className={`rounded-bl-xl rounded-tl-xl my-2 w-44 text-center p-2 outline-none border-y-2 border-l-2 border-gray-300 bg-gray-200`}
                >
                  Repeat On
                </div>
                <div
                  className={`rounded-br-xl rounded-tr-xl my-2 w-56 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
                >
                  {invoice.recurring_interval > 1
                    ? `${invoice.recurring_interval} days`
                    : `${invoice.recurring_interval} day`}{' '}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className={`rounded-bl-xl rounded-tl-xl my-2 w-44 text-center p-2 outline-none border-y-2 border-l-2 border-gray-300 bg-gray-200`}
                >
                  Recurring No
                </div>
                <div
                  className={`rounded-br-xl rounded-tr-xl my-2 w-56 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
                >
                  #{invoice.no_invoice}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col border-t border-gray-300 pt-5">
          <div className="text-lg font-semibold">Payment Terms</div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <div
                className={`rounded-bl-xl rounded-tl-xl my-2 w-44 text-center p-2 outline-none border-y-2 border-l-2 border-gray-300 bg-gray-200`}
              >
                {`Net ${invoice.payment_terms}`}
              </div>
              <div
                className={`rounded-br-xl rounded-tr-xl my-2 w-56 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
              >
                {dayjs(invoice?.due_date).format('DD MMMM YYYY')}
              </div>
            </div>
            <div className="flex items-center">
              <div
                className={`rounded-bl-xl rounded-tl-xl my-2 w-44 text-center p-2 outline-none border-y-2 border-l-2 border-gray-300 bg-gray-200`}
              >
                Payment Method
              </div>
              <div
                className={`rounded-br-xl rounded-tr-xl my-2 w-56 text-center p-2 outline-none border-2 border-gray-300 bg-gray-100`}
              >
                {invoice.payment_method}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
