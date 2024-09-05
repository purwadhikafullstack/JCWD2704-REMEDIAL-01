'use client';

import { axiosInstance } from '@/libs/axios';
import { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { TInvoice, TRecurring } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ItemTable from './tableItem';
import ClientBusiness from './clientBusiness';
import Terms from './terms';
import Status from './status';
import RecurringTable from './tableRecurring';

const DetailInvoice = () => {
  const router = useRouter();
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<TInvoice | null>(null);
  const [recurring, setRecurring] = useState<TRecurring | null>(null);
  const [recurringId, setRecurringId] = useState('');

  dayjs.extend(relativeTime);
  const fetchInvoice = async () => {
    try {
      if (invoiceId) {
        const response = await axiosInstance().get(`/invoices/${invoiceId}`);
        const product = response.data.data;
        setInvoice(product);
        setRecurringId(product.idNowRecurring);
      }
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  useEffect(() => {
    const fetchRecurring = async () => {
      if (invoice?.recurring) {
        try {
          const response = await axiosInstance().get(
            `/invoices/recdet/${recurringId}`,
          );
          const product = response.data.data;
          setRecurring(product);
          setRecurringId(product.id);
        } catch (error) {
          console.error('Error fetching recurring invoice data:', error);
        }
      }
    };

    if (invoice && invoice.recurring && recurringId) {
      fetchRecurring();
    }
  }, [invoice, recurringId]);

  const cancelInv = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance().patch(
            `/invoices/ci/${invoiceId}`,
          );
          Swal.fire({
            title: 'Success!',
            text: 'Order has been cancelled successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          window.location.reload();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to cancel the order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          console.error('Failed to cancel order:', error);
        }
      }
    });
  };

  const paidInv = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosInstance().patch(
            `/invoices/p/${invoiceId}`,
          );
          Swal.fire({
            title: 'Success!',
            text: 'Order has been cancelled successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          window.location.reload();
        } catch (error) {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to cancel the order. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          console.error('Failed to cancel order:', error);
        }
      }
    });
  };

  return (
    <>
      <section className="tracking-tighter m-10 bg-white p-10 rounded-xl h-full shadow-md flex flex-col gap-5">
        <div className=" flex items-center justify-between w-full">
          <div className="text-3xl font-semibold">
            Invoice{' '}
            {invoice
              ? `
            ${
              invoice?.recurring && recurring
                ? `#${recurring?.no_invoice}`
                : `#${invoice?.no_invoice}`
            }`
              : ''}
          </div>
          <div className="flex flex-col items-end">
            {invoice && (
              <>
                {invoice.recurring && recurring ? (
                  <div
                    className={`border-2 w-32 capitalize  text-center font-semibold px-2 py-1 h-full rounded-full ${recurring.status === 'cancelled' || recurring.status === 'expired' ? 'border-gray-400 text-gray-500 bg-gray-100' : recurring.status === 'paid' ? 'border-green-400 text-green-500 bg-green-100' : recurring.status === 'unpaid' ? 'border-amber-400 text-amber-500 bg-amber-100' : 'border-blue-400 text-blue-500 bg-blue-100'}`}
                  >
                    {recurring.status}
                  </div>
                ) : (
                  <div
                    className={`border-2 w-32 capitalize  text-center font-semibold px-2 py-1 h-full rounded-full ${invoice.status === 'cancelled' || invoice.status === 'expired' ? 'border-gray-400 text-gray-500 bg-gray-100' : invoice.status === 'paid' ? 'border-green-400 text-green-500 bg-green-100' : invoice.status === 'unpaid' ? 'border-amber-400 text-amber-500 bg-amber-100' : 'border-blue-400 text-blue-500 bg-blue-100'}`}
                  >
                    {invoice.status}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {invoice && (
          <>
            <Status invoice={invoice} recurring={recurring} />
            <ClientBusiness invoice={invoice} />
            <Terms invoice={invoice} recurring={recurring} />
            <ItemTable invoice={invoice} recurring={recurring} />
          </>
        )}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => router.push('/invoice')}
            className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
          >
            Back
          </button>
          {invoice?.status === 'unpaid' && (
            <button
              type="button"
              onClick={cancelInv}
              className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
            >
              Cancel Invoice
            </button>
          )}
          {invoice?.status === 'unpaid' && (
            <button
              type="button"
              onClick={paidInv}
              className="bg-amber-100 p-2 rounded-xl font-semibold w-36"
            >
              Confirm Paid
            </button>
          )}
        </div>
      </section>
      {invoice && invoice.recurring && (
        <RecurringTable
          invoice={invoice}
          invoiceId={invoiceId}
          setRecurringId={setRecurringId}
          recurring={recurring}
        />
      )}
    </>
  );
};

export default DetailInvoice;
