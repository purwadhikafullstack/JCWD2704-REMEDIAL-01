'use client';

import React, { useEffect, useState } from 'react';
import { TInvoice, TRecurring } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatPrice, logoSrc } from '@/helpers/format';

interface Props {
  invoice: TInvoice;
}
const ClientBusiness: React.FC<Props> = ({ invoice }) => {
  dayjs.extend(relativeTime);

  return (
    <>
      <div className="flex h-60 gap-5 justify-center w-full border-t border-gray-300 pt-5">
        <div className="w-1/2 flex-col fle p-3 rounded-xl border bg-gray-100 border-gray-300 h-full">
          <div className="text-lg font-semibold">Client Detail:</div>
          <div className="flex flex-col pb-2">
            <div className="capitalize text-base font-semibold">
              {invoice?.client.name}
            </div>
            <div>{invoice?.client.email}</div>
            <div>{invoice?.client.phone}</div>
          </div>
          <hr />
          <div className="capitalize text-sm pt-2">
            <div className="text-base">Addresss:</div>
            {invoice?.client.address}
          </div>
        </div>
        <div className="w-1/2 flex-col fle p-3 rounded-xl border bg-gray-100 border-gray-300 h-full">
          <div className="text-lg font-semibold">Business Detail:</div>
          <div className="flex items-center gap-3 w-full pb-2">
            <div>
              <img
                src={`${logoSrc}${invoice?.business.id}`}
                alt={`${invoice?.business.name}-logo`}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div>
              <div className="capitalize text-base font-semibold">
                {invoice?.business.name}
              </div>
              <div>{invoice?.business.email}</div>
              <div>{invoice?.business.phone}</div>
            </div>
          </div>
          <hr />
          <div className="capitalize text-sm pt-2">
            <div className="text-base">Addresss:</div>
            {invoice?.business.address}
          </div>
        </div>
      </div>
    </>
  );
};

export default ClientBusiness;
