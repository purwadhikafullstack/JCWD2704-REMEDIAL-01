'use client';

import React, { useEffect, useState } from 'react';
import { TInvoice, TRecurring } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatPrice, formatPrice2, logoSrc } from '@/helpers/format';

interface Props {
  invoice: TInvoice;
  recurring: TRecurring | null;
}
const ItemTable: React.FC<Props> = ({ invoice, recurring }) => {
  dayjs.extend(relativeTime);

  const subtotal = invoice.InvoiceItem.reduce(
    (acc, item) => acc + item.total_price,
    0,
  );
  let discount = 0;
  if (invoice.discount) {
    if (invoice.discount_type === 'percentage') {
      discount = (subtotal * invoice.discount) / 100;
    } else if (invoice.discount_type === 'nominal') {
      discount = invoice.discount;
    }
  }
  const afterDiscount = subtotal - discount;
  const afterShipping = invoice.shipping_cost
    ? afterDiscount + invoice.shipping_cost
    : afterDiscount;
  let tax = 0;
  if (invoice.tax) {
    if (invoice.tax_type === 'percentage') {
      tax = (afterShipping * invoice.tax) / 100;
    } else if (invoice.tax_type === 'nominal') {
      tax = invoice.tax;
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5 border-t border-gray-300 pt-7 mb-10">
        <div className=" border border-gray-200 shadow-sm rounded-xl overflow-hidden w-full">
          <table
            className={`w-full shadow-sm rounded-xl overflow-hidden h-fit`}
          >
            <thead className="bg-amber-200 border border-amber-200">
              <tr>
                <th className="px-4 py-2 text-left w-80">Item Details</th>
                <th className="px-4 py-2 text-center w-40">Quantity</th>
                <th className="px-4 py-2 text-center w-52">Price</th>
                <th className="px-4 py-2 text-center w-52">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {invoice.InvoiceItem.map((item, index) => (
                <tr
                  key={index}
                  className={`h-24 ${index !== invoice.InvoiceItem.length - 1 ? 'border-b' : ''}`}
                >
                  <td className="text-left w-40 px-2 py-2">
                    <div className="flex flex-col p-2 gap-2 w-full  h-full">
                      <div className={`capitalize font-semibold `}>
                        {item.product.name}
                      </div>
                      <div
                        className="capitalize text-ellipsis overflow-hidden whitespace-wrap"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {item.product.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-left w-8">
                    <div className="rounded-xl text-center w-full p-2 h-full">
                      {item.quantity}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center w-52">
                    <div className="rounded-xl w-full p-2 h-full">
                      {formatPrice(item.price)}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center w-52">
                    <div className="rounded-xl w-full p-2 h-full ">
                      {formatPrice(item.total_price)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex flex-col p-5 rounded-xl  w-96 gap-5 justify-between">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <div>Discount</div>
                <div className="w-40 flex items-center h-10">
                  <div
                    className={`rounded-bl-xl rounded-tl-xl w-20 text-center outline-none flex justify-center  border-gray-300 border-y border-l bg-gray-100 p-2
                      `}
                  >
                    {invoice.discount_type === 'nominal' ? 'Rp' : '%'}
                  </div>
                  <div className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 bg-gray-50">
                    {invoice.discount
                      ? `${formatPrice2(invoice.discount)}`
                      : '-'}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div>Tax</div>
                <div className="w-40 flex items-center h-10">
                  <div
                    className={`rounded-bl-xl rounded-tl-xl w-20 text-center outline-none flex justify-center  border-gray-300 border-y border-l bg-gray-100 p-2
                      `}
                  >
                    {invoice.tax_type === 'nominal' ? 'Rp' : '%'}
                  </div>
                  <div className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 bg-gray-50">
                    {invoice.tax ? `${formatPrice2(invoice.tax)}` : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div>Shipping</div>
              <div className="w-40 flex items-center">
                <div
                  className={`rounded-bl-xl rounded-tl-xl w-20 text-center outline-none flex justify-center  border-gray-300 border-y border-l bg-gray-100 p-2
                    `}
                >
                  <div className="">Rp</div>
                </div>
                <div className="rounded-br-xl rounded-tr-xl w-full p-2 outline-none border border-gray-300 bg-gray-50">
                  {invoice.shipping_cost
                    ? `${formatPrice2(invoice.shipping_cost)}`
                    : '-'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-5 rounded-xl bg-amber-50 w-96 gap-2">
            <div className="flex items-center justify-between">
              <div>Subtotal</div>
              <div>{formatPrice(subtotal)}</div>
            </div>
            {invoice.discount && (
              <div className="flex items-center justify-between">
                <div>Dicount</div>
                <div>- {formatPrice(discount)}</div>
              </div>
            )}
            {invoice.shipping_cost && (
              <div className="flex items-center justify-between">
                <div>Shipping Cost</div>
                <div>+ {formatPrice(invoice.shipping_cost)}</div>
              </div>
            )}
            {invoice.tax && (
              <div className="flex items-center justify-between">
                <div>Tax</div>
                <div>+ {formatPrice(tax)}</div>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-400 pt-2">
              <div>Total Payment</div>
              <div>{formatPrice(invoice.total_price)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemTable;
