'use client';

import React, { useEffect, useState } from 'react';
import { TInvoice, TRecurring } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatPrice, logoSrc } from '@/helpers/format';
import { useDebounce } from 'use-debounce';
import { axiosInstance } from '@/libs/axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiEdit } from 'react-icons/fi';
import { BiSearch } from 'react-icons/bi';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';

interface Props {
  invoice: TInvoice;
  invoiceId: any;
  setRecurringId: (newId: string) => void;
  recurring: TRecurring | null;
}
const RecurringTable: React.FC<Props> = ({
  invoice,
  invoiceId,
  setRecurringId,
  recurring,
}) => {
  const updateRecurringId = (newId: string) => {
    setRecurringId(newId);
  };

  dayjs.extend(relativeTime);
  const router = useRouter();
  const [recurringData, setRecurringData] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [valueSearch] = useDebounce(search, 2000);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const fetchOrder = async () => {
    setInitialLoad(true);
    try {
      const queryParams: Record<string, any> = {
        search: valueSearch,
        ...(filterStatus && { status: filterStatus }),
        ...(sortBy && { sort: sortBy }),
        page,
      };

      const response = await axiosInstance().get(`/invoices/rec/${invoiceId}`, {
        params: queryParams,
      });
      const { data } = response.data;
      const { paginations } = response.data;

      setRecurringData(data);
      setTotalPages(paginations.totalPages);
      setLimit(paginations.limit);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setRecurringData([]);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleNextPage = () => {
    setPage((prevPage) => {
      const newPage = prevPage + 1;
      return newPage;
    });
  };

  const handlePrevPage = () => {
    setPage((prevPage) => {
      if (prevPage > 1) {
        const newPage = prevPage - 1;
        return newPage;
      }
      return prevPage;
    });
  };

  useEffect(() => {
    setPage(1);
  }, [valueSearch, filterStatus, sortBy]);

  useEffect(() => {
    fetchOrder();
  }, [valueSearch, sortBy, filterStatus, page]);

  const disabledNext =
    page === totalPages || totalPages === 0 || page > totalPages;

  return (
    <>
      {invoice && (
        <section className="tracking-tighter px-10 pb-10 pt-5 rounded-xl h-screen flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3 h-full ">
            <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
              <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
                <div className="flex justify-between items-center gap-5 w-full">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 shadow-sm w-full lg:w-[300px] border border-gray-300">
                    <BiSearch />
                    <input
                      type="text"
                      placeholder="Search invoce..."
                      className="placeholder-gray-500 outline-none w-full text-sm bg-gray-50"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center">
                      <select
                        id="status"
                        className="bg-gray-50 border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(e.target.value);
                        }}
                      >
                        <option value="">All status</option>
                        <option value="pending">Pending</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <select
                        id="sort"
                        className="bg-gray-50 border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                        }}
                      >
                        <option value="">Sort by</option>
                        <option value="desc">Newest</option>
                        <option value="asc">Latest</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <table
              className={`min-w-full border border-gray-300 shadow-sm rounded-xl overflow-hidden h-fit`}
            >
              <thead className="bg-amber-200">
                <tr>
                  <th className="px-4 py-2 text-center w-16">No</th>
                  <th className="px-4 py-2 text-left w-40">Invoice</th>
                  <th className="px-4 py-2 text-left w-36">Price</th>
                  <th className="px-4 py-2 text-center w-40">Status</th>
                  <th className="px-4 py-2 text-center w-28">Start</th>
                  <th className="px-4 py-2 text-center w-28">Due</th>
                  <th className="px-4 py-2 text-center w-14 text-amber-200">
                    .
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm">
                {recurringData.length === 0 ? (
                  <tr className="h-[310px] w-full">
                    <td colSpan={8}>
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <Image
                          src="/register.png"
                          alt="No Data"
                          width={200}
                          height={200}
                        />
                        <div className="text-gray-500 mt-4 text-base">
                          No invoice found
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recurringData.map((recurringData, index) => (
                    <tr
                      key={recurringData.id}
                      className={`${invoice.recurring && recurring && recurring.id === recurringData.id ? 'bg-amber-50 font-semibold' : ''} ${index !== recurringData.length - 1 ? 'border-b' : ''}`}
                    >
                      <td className=" px-4 py-2 text-center w-16">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-2 text-left w-40">
                        {recurringData.no_invoice}
                      </td>
                      <td className="px-4 py-2 text-left w-36">
                        {formatPrice(recurringData.total_price)}
                      </td>
                      <td className="px-4 py-2 text-center w-40 capitalize">
                        <div className="w-full flex justify-center">
                          <div
                            className={` w-32 text-sm font-medium px-2 py-1 h-full rounded-full ${recurringData.status === 'cancelled' || recurringData.status === 'expired' ? 'border-gray-400 text-gray-500 bg-gray-100' : recurringData.status === 'paid' ? 'border-green-400 text-green-500 bg-green-100' : recurringData.status === 'unpaid' ? 'border-amber-400 text-amber-500 bg-amber-100' : 'border-blue-400 text-blue-500 bg-blue-100'}`}
                          >
                            {recurringData.status}
                          </div>
                        </div>
                      </td>
                      <td className=" px-4 py-2 text-center w-28">
                        {dayjs(recurringData.invoice_date).format(
                          'DD MMM YYYY',
                        )}
                      </td>
                      <td className=" px-4 py-2 text-center w-28">
                        {dayjs(recurringData.due_date).format('DD MMM YYYY')}{' '}
                      </td>
                      <td className="px-4 py-2 text-center w-14 flex h-full items-center justify-center">
                        <button
                          type="button"
                          onClick={() => updateRecurringId(recurringData.id)}
                        >
                          <FiEdit className="text-center text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center gap-3 items-center text-sm ">
            <button
              className={`p-2 text-center rounded-full bg-amber-400 font-semibold ${
                page <= 1 ? 'opacity-50' : ''
              }`}
              onClick={handlePrevPage}
              disabled={page <= 1}
            >
              <MdNavigateBefore />
            </button>
            <div className="font-semibold w-24 gap-2 text-center py-2 px-5 rounded-xl border-gray-300 border bg-gray-50">
              {recurringData.length > 0 ? (
                <>
                  {page} <span className="px-1">of</span> {totalPages}
                </>
              ) : (
                <>
                  0 <span className="px-1">of</span> {totalPages}
                </>
              )}
            </div>
            <button
              className={`p-2 text-center rounded-full bg-amber-400 font-semibold ${
                disabledNext ? 'opacity-50' : ''
              }`}
              onClick={handleNextPage}
              disabled={disabledNext}
            >
              <MdNavigateNext />
            </button>
          </div>
        </section>
      )}
    </>
  );
};

export default RecurringTable;
