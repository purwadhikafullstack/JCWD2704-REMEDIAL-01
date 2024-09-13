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
const Status: React.FC<Props> = ({ invoice, recurring }) => {
  dayjs.extend(relativeTime);

  return (
    <>
      <div className="flex flex-col gap-2 w-full border-t border-gray-300 pt-5">
        <div className="text-lg font-semibold">Status Invoice</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="font-medium">Created at:</div>
            {invoice.recurring
              ? `${dayjs(recurring?.createdAt).format('DD MMMM YYYY - HH:mm:ss')}`
              : `${dayjs(invoice?.createdAt).format('DD MMMM YYYY - HH:mm:ss')}`}
          </div>

          {invoice.recurring ? (
            <>
              {recurring?.status === 'unpaid' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Send at:</div>
                  {dayjs(recurring?.sendAt).format('DD MMMM YYYY - HH:mm:ss')}
                </div>
              )}
            </>
          ) : (
            <>
              {invoice.status === 'unpaid' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Send at:</div>
                  {dayjs(invoice?.sendAt).format('DD MMMM YYYY - HH:mm:ss')}
                </div>
              )}
            </>
          )}
          {invoice.recurring ? (
            <>
              {recurring?.status === 'cancelled' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Cancelled at:</div>
                  {dayjs(recurring?.cancelledAt).format(
                    'DD MMMM YYYY - HH:mm:ss',
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {invoice.status === 'cancelled' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Cancelled at:</div>
                  {dayjs(invoice?.cancelledAt).format(
                    'DD MMMM YYYY - HH:mm:ss',
                  )}
                </div>
              )}
            </>
          )}
          {invoice.recurring ? (
            <>
              {recurring?.status === 'paid' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Paid at:</div>
                  {dayjs(recurring?.paidAt).format('DD MMMM YYYY - HH:mm:ss')}
                </div>
              )}
            </>
          ) : (
            <>
              {invoice.status === 'paid' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Paid at:</div>
                  {dayjs(invoice?.paidAt).format('DD MMMM YYYY - HH:mm:ss')}
                </div>
              )}
            </>
          )}

          {invoice.recurring ? (
            <>
              {recurring?.status === 'expired' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Expired at:</div>
                  {dayjs(recurring?.due_date).format('DD MMMM YYYY')}
                </div>
              )}
            </>
          ) : (
            <>
              {invoice.status === 'expired' && (
                <div className="flex items-center gap-2">
                  <div className="font-medium">Expired at:</div>
                  {dayjs(invoice?.due_date).format('DD MMMM YYYY')}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Status;
