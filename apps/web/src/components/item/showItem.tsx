'use client';

import { axiosInstance } from '@/libs/axios';
import { TProduct } from '@/models/product.model';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { BiSearch } from 'react-icons/bi';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { formatPrice } from '@/helpers/format';
import { FiEdit } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { IoMdAdd } from 'react-icons/io';

const ItemList = () => {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [product, setProduct] = useState<TProduct[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('');
  const [valueName] = useDebounce(name, 2000);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const queryName = queryParams.get('name') || '';
    const queryType = queryParams.get('type') || '';
    const querySort = queryParams.get('sort') || '';
    const queryPage = parseInt(queryParams.get('page') || '1', 10);

    setName(queryName);
    setFilterType(queryType);
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
        name: valueName,
        ...(filterType && { type: filterType }),
        ...(sortBy && { sort: sortBy }),
        page,
      };

      const response = await axiosInstance().get('/products/all', {
        params: queryParams,
      });
      const { data } = response.data;
      const { paginations } = response.data;

      setProduct(data);
      setTotalPages(paginations.totalPages);
      setLimit(paginations.limit);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setProduct([]);
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
  }, [valueName, filterType, sortBy]);

  useEffect(() => {
    fetchOrder();
  }, [valueName, sortBy, filterType, page]);

  useEffect(() => {
    updateURL({
      name: valueName,
      type: filterType,
      sort: sortBy,
      page,
    });
  }, [valueName, filterType, sortBy, page]);

  const disabledNext =
    page === totalPages || totalPages === 0 || page > totalPages;

  const noProduct = product.length === 8 || product.length === 0;

  return (
    <>
      <section className="tracking-tighter p-10 rounded-xl h-full flex flex-col justify-between gap-5">
        <div className="flex flex-col gap-3 h-full ">
          <div className="flex flex-col gap-3 w-full bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
            <div className="flex gap-5 items-center w-full lg:justify-between lg:flex-row flex-col">
              <div className="flex items-center gap-5">
                <div className="pr-5 text-3xl font-semibold border-r-2 border-gray-300 w-36">
                  Items
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 shadow-sm w-full lg:w-[300px] border border-gray-300">
                  <BiSearch />
                  <input
                    type="text"
                    placeholder="Search item name"
                    className="placeholder-gray-500 outline-none w-full text-sm"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      updateURL({ name: e.target.value, page: 1 });
                    }}
                  />
                </div>
                <div className="flex items-center">
                  <select
                    id="type"
                    className="bg-gray-50 border border-gray-300 text-gray-500 text-sm lg:text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 min-h-10 px-2 block w-full h-full lg:w-28"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      updateURL({ type: e.target.value, page: 1 });
                    }}
                  >
                    <option value="">All type</option>
                    <option value="goods">Goods</option>
                    <option value="service">Service</option>
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
                href={'/item/create'}
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
                <th className="px-4 py-2 text-left w-60">Name</th>
                <th className="px-4 py-2 text-center w-24">Type</th>
                <th className="px-4 py-2 text-left w-80">Description</th>
                <th className="px-4 py-2 text-left w-40">Price</th>
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
              ) : product.length === 0 ? (
                <tr className="h-[310px] w-full">
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <Image
                        src="/register.png"
                        alt="No Data"
                        width={200}
                        height={200}
                      />
                      <div className="text-gray-500 mt-4 text-base">
                        No product found
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                product.map((product, index) => (
                  <tr key={product.id}>
                    <td className="border-b px-4 py-2 text-center w-16">
                      {index + 1}
                    </td>
                    <td className="border-b px-4 py-2 text-left w-60">
                      {product.name}
                    </td>
                    <td className="border-b py-2 text-center w-24">
                      {product.type}
                    </td>
                    <td className="border-b text-left">
                      <div className="px-4 py-2 w-80 text-ellipsis overflow-hidden whitespace-nowrap">
                        {product.description}
                      </div>
                    </td>

                    <td className="border-b px-4 py-2 text-left w-40">
                      {formatPrice(product.price)}
                    </td>
                    <td className="border-b px-4 py-2 text-center w-14 flex h-full items-center justify-center">
                      <Link href={`/item/${product.id}`}>
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
            {product.length > 0 ? (
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

export default ItemList;
