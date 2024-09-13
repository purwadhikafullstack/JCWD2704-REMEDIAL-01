'use client';

import { axiosInstance } from '@/libs/axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { BiSearch } from 'react-icons/bi';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { formatPrice } from '@/helpers/format';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import {
  IoIosArrowDown,
  IoIosCloseCircleOutline,
  IoMdAdd,
} from 'react-icons/io';
import { TInvoice } from '@/models/invoice.model';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { FaRegCalendar } from 'react-icons/fa';
import { DateRange, Range, RangeKeyDict } from 'react-date-range';

const InvoiceList = () => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [invoice, setInvoice] = useState<TInvoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [filterRecurring, setFilterRecurring] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [valueSearch] = useDebounce(search, 2000);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const dateRangeRef = useRef<HTMLDivElement>(null);
  const [showDateRange, setShowDateRange] = useState<boolean>(false);
  const [byDate, setByDate] = useState<string>('no');
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: undefined,
      endDate: undefined,
      key: 'selection',
    },
  ]);
  const [tempDateRange, setTempDateRange] = useState<Range[]>([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const querySearch = queryParams.get('search') || '';
    const queryStatus = queryParams.get('status') || '';
    const queryRecurring = queryParams.get('recurring') || '';
    const querySort = queryParams.get('sort') || '';
    const queryPage = parseInt(queryParams.get('page') || '1', 10);
    const queryByDate = queryParams.get('byDate') || 'no';
    const queryStartDate = queryParams.get('startDate');
    const queryEndDate = queryParams.get('endDate');

    setSearch(querySearch);
    setFilterStatus(queryStatus);
    setFilterRecurring(queryRecurring);
    setSortBy(querySort);
    setPage(queryPage);

    if (queryByDate === 'yes' && queryStartDate && queryEndDate) {
      setDateRange([
        {
          startDate: new Date(queryStartDate),
          endDate: new Date(queryEndDate),
          key: 'selection',
        },
      ]);
    }
  }, []);

  const updateURL = (newParams: Record<string, any>) => {
    const url = new URL(window.location.href);
    Object.keys(newParams).forEach((key) => {
      if (
        newParams[key] !== undefined &&
        newParams[key] !== null &&
        newParams[key] !== ''
      ) {
        url.searchParams.set(key, newParams[key]);
      } else {
        url.searchParams.delete(key);
      }
    });
    router.push(url.toString());
  };

  const fetchOrder = async () => {
    try {
      const startDate = dateRange[0]?.startDate?.toISOString();
      const endDate = dateRange[0]?.endDate?.toISOString();
      const queryParams: Record<string, any> = {
        search: valueSearch,
        byDate,
        ...(filterStatus && { status: filterStatus }),
        ...(filterRecurring && { recurring: filterRecurring }),
        ...(filterPayment && { payment: filterPayment }),
        ...(sortBy && { sort: sortBy }),
        ...(byDate === 'yes' && startDate && { startDate: startDate }),
        ...(byDate === 'yes' && endDate && { endDate: endDate }),
        page,
      };

      console.log(queryParams);

      const response = await axiosInstance().get('/invoices/all', {
        params: queryParams,
      });
      const { data } = response.data;
      const { paginations } = response.data;

      setInvoice(data);
      setTotalPages(paginations.totalPages);
      setLimit(paginations.limit);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setInvoice([]);
    } finally {
      setInitialLoad(false);
    }
  };

  const handleNextPage = () => {
    setPage((prevPage) => {
      const newPage = prevPage + 1;
      updateURL({ page: newPage });
      return newPage;
    });
  };

  const handlePrevPage = () => {
    setPage((prevPage) => {
      if (prevPage > 1) {
        const newPage = prevPage - 1;
        updateURL({ page: newPage });
        return newPage;
      }
      return prevPage;
    });
  };

  useEffect(() => {
    setPage(1);
  }, [
    valueSearch,
    filterPayment,
    filterRecurring,
    filterStatus,
    sortBy,
    dateRange,
  ]);

  useEffect(() => {
    fetchOrder();
  }, [
    valueSearch,
    sortBy,
    filterPayment,
    filterRecurring,
    filterStatus,
    page,
    dateRange,
    byDate,
  ]);

  useEffect(() => {
    const debounceUpdateURL = setTimeout(() => {
      updateURL({
        search: valueSearch,
        payment: filterPayment,
        status: filterStatus,
        recurring: filterRecurring,
        sort: sortBy,
        page,
      });
    }, 2000);
  }, [valueSearch, filterPayment, filterRecurring, filterStatus, sortBy, page]);

  const disabledNext =
    page === totalPages || totalPages === 0 || page > totalPages;

  const isActive = (status: string) => filterStatus === status;

  const handleStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleDateOpen = () => {
    if (showDateRange) {
      setShowDateRange(false);
      setTempDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      ]);
    } else {
      setShowDateRange(true);
    }
  };

  const handleResetDateRange = () => {
    setDateRange([
      {
        startDate: undefined,
        endDate: undefined,
        key: 'selection',
      },
    ]);
    setByDate('no');
    setShowDateRange(false);

    updateURL({
      byDate: 'no',
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  };

  const handleApplyDateRange = () => {
    const startDate = tempDateRange[0].startDate
      ? tempDateRange[0].startDate.toISOString()
      : undefined;
    const endDate = tempDateRange[0].endDate
      ? tempDateRange[0].endDate.toISOString()
      : undefined;

    setDateRange(tempDateRange);
    setByDate('yes');
    setShowDateRange(false);

    updateURL({
      byDate: 'yes',
      startDate,
      endDate,
      page: 1, // Reset page to 1
    });
  };

  const handleDateRangeChange = (rangesByKey: RangeKeyDict) => {
    const { selection } = rangesByKey;
    if (selection) {
      setTempDateRange([selection]);
    }
  };

  return (
    <>
      <section className="tracking-tighter p-10 rounded-xl h-full flex flex-col justify-between gap-3">
        <div className="flex flex-col gap-3 h-full ">
          <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 pt-3 pb-2 shadow-sm border border-gray-200">
            <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
              <div className="flex items-center gap-5 w-full">
                <div className="text-3xl font-semibold pr-3 border-r-2 border-gray-300 w-32 h-full flex flex-col justify-center">
                  Invoices
                </div>
                <div className="flex items-center gap-3 justify-between w-full">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 shadow-sm w-full lg:w-60 border border-gray-300">
                    <BiSearch />
                    <input
                      type="text"
                      placeholder="Search invoce/name/email"
                      className="placeholder-gray-500 bg-gray-50  outline-none w-full text-sm"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        updateURL({ search: e.target.value, page: 1 });
                      }}
                    />
                  </div>
                  <div className="flex items-center">
                    <select
                      id="recurring"
                      className="bg-gray-50 outline-none border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-32"
                      value={filterRecurring}
                      onChange={(e) => {
                        setFilterRecurring(e.target.value);
                        updateURL({ recurring: e.target.value, page: 1 });
                      }}
                    >
                      <option value="">All type</option>
                      <option value="yes">Recurring</option>
                      <option value="no">Non recurring</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <select
                      id="sort"
                      className="bg-gray-50 outline-none border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-24"
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        updateURL({ sort: e.target.value, page: 1 });
                      }}
                    >
                      <option value="">Sort by</option>
                      <option value="desc">Newest</option>
                      <option value="asc">Latest</option>
                      <option value="descStart">Desc Start</option>
                      <option value="ascStart">Asc Start</option>
                    </select>
                  </div>
                  <div className="relative z-10" ref={dateRangeRef}>
                    <div className="flex justify-center bg-gray-50  gap-1 text-sm lg:text-sm text-gray-500 border rounded-xl border-gray-300 items-center w-full h-full lg:w-64 min-h-10">
                      <button
                        onClick={handleDateOpen}
                        className="w-full h-full ml-3"
                      >
                        <span>
                          {dateRange[0]?.startDate && dateRange[0]?.endDate ? (
                            <div className="flex items-center justify-start gap-2">
                              <FaRegCalendar />
                              <div>
                                {dayjs(dateRange[0].startDate).format(
                                  'DD MMM YYYY',
                                )}
                              </div>
                              <div>-</div>
                              <div>
                                {dayjs(dateRange[0].endDate).format(
                                  'DD MMM YYYY',
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-start gap-2 ">
                              <FaRegCalendar />
                              Select the start date
                            </div>
                          )}
                        </span>
                      </button>
                      {dateRange[0]?.startDate && dateRange[0]?.endDate ? (
                        <button onClick={handleResetDateRange} className="mr-3">
                          <IoIosCloseCircleOutline className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={handleDateOpen} className="mr-3">
                          <IoIosArrowDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {showDateRange && (
                      <div className="absolute top-0 right-0 bg-white p-4 shadow-lg rounded-xl overflow-hidden border border-gray-300">
                        <DateRange
                          ranges={tempDateRange}
                          onChange={handleDateRangeChange}
                        />
                        <div className="flex justify-center items-center gap-2 mt-4">
                          <button
                            onClick={handleDateOpen}
                            className="bg-gray-300 py-1 px-3 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleApplyDateRange}
                            className="bg-amber-300 py-1 px-3 rounded-xl"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between overflow-auto gap-20 bg-white border-t border-gray-300">
              <div className="flex justify-between overflow-auto gap-2 w-full">
                <button
                  className={`w-20 border-b-2 ${isActive('') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('')}
                >
                  All
                </button>
                <button
                  className={`w-20 border-b-2 ${isActive('pending') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('pending')}
                >
                  Pending
                </button>
                <button
                  className={`w-20 border-b-2 ${isActive('unpaid') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('unpaid')}
                >
                  Unpaid
                </button>
                <button
                  className={`w-20 border-b-2  ${isActive('paid') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('paid')}
                >
                  Paid
                </button>

                <button
                  className={`w-20 border-b-2 ${isActive('expired') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('expired')}
                >
                  Expired
                </button>
                <button
                  className={`w-20 border-b-2 ${isActive('cancelled') ? 'text-amber-500 border-amber-500' : 'text-gray-500 border-transparent'} hover:text-amber-500`}
                  onClick={() => handleStatus('cancelled')}
                >
                  Cancelled
                </button>
              </div>
              <Link
                href={'/invoice/create'}
                className="flex items-center px-4 py-2 mt-1 bg-amber-200 font-semibold rounded-xl justify-center gap-2"
              >
                <IoMdAdd className="text-lg" /> Add
              </Link>
            </div>
          </div>
          <table
            className={`border border-gray-300 shadow-sm rounded-xl overflow-hidden h-fit`}
          >
            <thead className="bg-amber-200">
              <tr>
                <th className="px-4 py-2 text-left w-40">Invoice</th>
                <th className="px-4 py-2 text-center w-52">Client</th>
                <th className="px-2 py-2 text-center w-40">Start - End</th>
                <th className="px-4 py-2 text-center w-40">Status</th>
                <th className="px-4 py-2 text-center w-32">Recurring</th>
                <th className="px-2 py-2 text-left w-32">Price</th>
                <th className="py-2 text-center w-8 text-amber-200">.</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {initialLoad ? (
                <tr className="h-72 w-full">
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="animate-spin w-16 h-16 border-4 border-t-transparent border-amber-300 rounded-full"></div>
                      <p className="text-gray-500 mt-2">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : invoice.length === 0 ? (
                <tr className="h-72 w-full">
                  <td colSpan={7}>
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
                invoice.map((invoice, index) => (
                  <tr key={invoice.id}>
                    <td className="border-b px-4 py-2 text-left w-40">
                      {invoice.no_invoice}
                    </td>
                    <td className="border-b px-4 py-2 text-center w-52">
                      <div className=" flex flex-col items-center justify-center h-full">
                        <div> {invoice.client.name}</div>
                        <div> {invoice.client.email}</div>
                      </div>
                    </td>
                    <td className="border-b px-2 py-2 text-center w-40">
                      <div className=" flex flex-col items-center justify-center h-full w-full">
                        <div>
                          {dayjs(invoice.invoice_date).format('DD MMM YY ')} -
                        </div>
                        <div>
                          {invoice.recurring
                            ? `${dayjs(invoice.recurring_end).format('DD MMM YY ')}`
                            : `${dayjs(invoice.due_date).format('DD MMM YY ')}`}
                        </div>
                      </div>
                    </td>
                    <td className="border-b px-4 py-2 text-center w-40 capitalize">
                      <div
                        className={` w-32 h-8 border-2 text-sm flex flex-col justify-center font-medium py-1 rounded-full ${invoice.status === 'cancelled' || invoice.status === 'expired' ? 'border-gray-400 text-gray-500 bg-gray-100' : invoice.status === 'paid' ? 'border-green-400 text-green-500 bg-green-100' : invoice.status === 'unpaid' ? 'border-blue-400 text-blue-500 bg-blue-100' : 'border-amber-400 text-amber-500 bg-amber-100'}`}
                      >
                        {invoice.status}
                      </div>
                    </td>
                    <td className="border-b px-4 py-2 text-center w-32">
                      {invoice.recurring_interval
                        ? `${invoice.recurring_interval} days`
                        : '-'}
                    </td>
                    <td className="border-b px-2 py-2 text-left w-32">
                      {formatPrice(invoice.total_price)}
                    </td>
                    <td className="border-b py-2 pr-1 text-center w-8 flex h-full items-center justify-center">
                      <Link href={`/invoice/${invoice.id}`}>
                        <FiEdit className="text-center text-lg text-amber-500" />
                      </Link>
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
            {invoice.length > 0 ? (
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
    </>
  );
};

export default InvoiceList;
