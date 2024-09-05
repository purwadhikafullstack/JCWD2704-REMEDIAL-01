'use client';

import { axiosInstance } from '@/libs/axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { BiSearch } from 'react-icons/bi';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { TClient } from '@/models/client.model';
import { IoMdAdd } from 'react-icons/io';

const ClientList = () => {
  const router = useRouter();
  const [search, setSearch] = useState<string>('');
  const [client, setClient] = useState<TClient[]>([]);
  const [filterPayment, setFilterPayment] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [valueSearch] = useDebounce(search, 2000);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const querySearch = queryParams.get('search') || '';
    const queryPayment = queryParams.get('payment') || '';
    const querySort = queryParams.get('sort') || '';
    const queryPage = parseInt(queryParams.get('page') || '1', 10);

    setSearch(querySearch);
    setFilterPayment(queryPayment);
    setSortBy(querySort);
    setPage(queryPage);
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
      const queryParams: Record<string, any> = {
        search: valueSearch,
        ...(filterPayment && { payment: filterPayment }),
        ...(sortBy && { sort: sortBy }),
        page,
      };

      const response = await axiosInstance().get('/clients/all', {
        params: queryParams,
      });
      const { data } = response.data;
      const { paginations } = response.data;

      setClient(data);
      setTotalPages(paginations.totalPages);
      setLimit(paginations.limit);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setClient([]);
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
  }, [valueSearch, filterPayment, sortBy]);

  useEffect(() => {
    fetchOrder();
  }, [valueSearch, sortBy, filterPayment, page]);

  useEffect(() => {
    updateURL({
      search: valueSearch,
      payment: filterPayment,
      sort: sortBy,
      page,
    });
  }, [valueSearch, filterPayment, sortBy, page]);

  const disabledNext =
    page === totalPages || totalPages === 0 || page > totalPages;

  const noClient = client.length === 8 || client.length === 0;

  return (
    <>
      <section className="tracking-tighter p-10 rounded-xl h-full flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-3 h-full ">
          <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
            <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
              <div className="flex items-center gap-5">
                <div className="pr-5 text-3xl font-semibold border-r-2 border-gray-300 w-36">
                  Clients
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 shadow-sm w-full lg:w-[300px] border border-gray-300">
                  <BiSearch />
                  <input
                    type="text"
                    placeholder="Search client name/email/phone"
                    className="placeholder-gray-500 outline-none w-full text-sm"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      updateURL({ search: e.target.value, page: 1 });
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <select
                    id="payment"
                    className="bg-gray-50 border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                    value={filterPayment}
                    onChange={(e) => {
                      setFilterPayment(e.target.value);
                      updateURL({ payment: e.target.value, page: 1 });
                    }}
                  >
                    <option value="">All payment</option>
                    <option value="credit">credit</option>
                    <option value="debit">debit</option>
                    <option value="bank_transfer">bank transfer</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <select
                    id="sort"
                    className="bg-gray-50 border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      updateURL({ sort: e.target.value, page: 1 });
                    }}
                  >
                    <option value="">Sort by</option>
                    <option value="desc">Newest</option>
                    <option value="asc">Latest</option>
                  </select>
                </div>
              </div>

              <Link
                href={'/client/create'}
                className="flex items-center px-4 py-2 bg-amber-200 font-semibold rounded-xl justify-center gap-2"
              >
                <IoMdAdd className="text-lg" /> Add
              </Link>
            </div>
          </div>
          <table
            className={`min-w-full border border-gray-300 shadow-sm rounded-xl overflow-hidden h-fit`}
          >
            <thead className="bg-amber-200">
              <tr>
                <th className="px-4 py-2 text-center w-16">No</th>
                <th className="px-4 py-2 text-left w-36">Name</th>
                <th className="px-4 py-2 text-center w-44">Email</th>
                <th className="px-4 py-2 text-center w-36">Phone</th>
                <th className="px-4 py-2 text-center w-28">Payment</th>
                <th className="px-4 py-2 text-left w-60">Address</th>
                <th className="px-4 py-2 text-center w-14 text-amber-200">.</th>
              </tr>
            </thead>
            <tbody className="bg-white text-sm">
              {initialLoad ? (
                <tr className="h-[310px] w-full">
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <div className="animate-spin w-16 h-16 border-4 border-t-transparent border-amber-300 rounded-full"></div>
                      <p className="text-gray-500 mt-2">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : client.length === 0 ? (
                <tr className="h-[310px] w-full">
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <Image
                        src="/register.png"
                        alt="No Data"
                        width={200}
                        height={200}
                      />
                      <div className="text-gray-500 mt-4 text-base">
                        No client found
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                client.map((client, index) => (
                  <tr key={client.id}>
                    <td className="border-b px-4 py-2 text-center w-16">
                      {index + 1}
                    </td>
                    <td className="border-b px-4 py-2 text-left w-36">
                      {client.name}
                    </td>

                    <td className="border-b py-2 text-center w-44">
                      {client.email}
                    </td>
                    <td className="border-b py-2 text-center w-36">
                      {client.phone ? client.phone : '-'}
                    </td>
                    <td className="border-b py-2 text-center w-28">
                      {client.payment_preference === 'bank_transfer'
                        ? 'Bank Transfer'
                        : client.payment_preference === 'credit' ||
                            client.payment_preference === 'debit'
                          ? client.payment_preference
                          : '-'}
                    </td>

                    <td className="border-b text-left">
                      <div className="px-4 py-2 w-60 text-ellipsis overflow-hidden whitespace-nowrap">
                        {client.address}
                      </div>
                    </td>

                    <td className="border-b px-4 py-2 text-center w-14 flex h-full items-center justify-center">
                      <Link href={`/client/${client.id}`}>
                        <FiEdit className="text-center text-lg" />
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
            {client.length > 0 ? (
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

export default ClientList;
