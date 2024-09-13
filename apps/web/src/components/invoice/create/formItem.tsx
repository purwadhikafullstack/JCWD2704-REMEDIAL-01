'use client';
import { ChangeEvent, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { Product } from '@/models/product.model';
import { formatPrice } from '@/helpers/format';
import { axiosInstance } from '@/libs/axios';
import { useDebounce } from 'use-debounce';
import { toast } from 'react-toastify';

interface SelectedProduct {
  product_id: string;
  quantity: number;
  price?: number;
}

interface ProductListProps {
  formik: any;
  selectedProducts: SelectedProduct[];
  productData: Product[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  setProductData: React.Dispatch<React.SetStateAction<Product[]>>;
}

const FormItem: React.FC<ProductListProps> = ({
  formik,
  selectedProducts,
  productData,
  setSelectedProducts,
  setProductData,
}) => {
  const [productChose, setProductChose] = useState<Product | undefined>(
    undefined,
  );
  const [isPOpen, setIsPOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [debounceProduct] = useDebounce(searchProduct, 1000);

  const handleSearchProduct = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchProduct(e.target.value);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setSelectedProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      const validQuantity = isNaN(quantity) || quantity < 0 ? 0 : quantity;
      updatedProducts[index].quantity = validQuantity;
      return updatedProducts;
    });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const fetchItems = async (query = '') => {
    try {
      const response = await axiosInstance().get('/products/all', {
        params: { name: query },
      });
      const { data } = response.data;
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    if (isPOpen) {
      fetchItems(debounceProduct);
    }
  }, [isPOpen, debounceProduct]);

  const handlePSelect = (productId: string, productName: string) => {
    const isProductSelected = selectedProducts.some(
      (product) => product.product_id === productId,
    );

    if (isProductSelected) {
      toast.info('This product has already been selected.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    const selectedProduct = products.find(
      (product) => product.id === productId,
    );
    if (selectedProduct) {
      setProductChose(selectedProduct);

      setSelectedProducts((prevProducts) => {
        const emptyRowIndex = prevProducts.findIndex(
          (product) => product.product_id === '',
        );
        if (emptyRowIndex > -1) {
          const updatedProducts = [...prevProducts];
          updatedProducts[emptyRowIndex] = {
            product_id: productId,
            quantity: 1,
          };
          updatedProducts.push({ product_id: '', quantity: 0 });
          return updatedProducts;
        }
        return [
          ...prevProducts,
          { product_id: productId, quantity: 1 },
          { product_id: '', quantity: 1 },
        ];
      });
    }
    setIsPOpen(false);
  };

  useEffect(() => {
    setProductData((prevData) => {
      const newData = new Array(selectedProducts.length).fill(undefined);
      selectedProducts.forEach((product, index) => {
        const prod = products.find((p) => p.id === product.product_id);
        if (prod) {
          newData[index] = prod;
        }
      });
      return newData;
    });
  }, [selectedProducts, products]);
  return (
    <>
      <div className=" border border-gray-200 shadow-sm rounded-xl overflow-hidden w-full">
        <table
          className={`min-w-full w-full shadow-sm rounded-xl overflow-hidden h-fit`}
        >
          <thead className="bg-amber-200 border border-amber-200">
            <tr>
              <th className="px-4 py-2 text-left w-44">Item Details</th>
              <th className="px-4 py-2 text-center w-8">Quantity</th>
              <th className="px-4 py-2 text-center w-32">Price</th>
              <th className="px-4 py-2 text-center w-32">Total</th>
              <th className="py-2 text-lef w-5"></th>
            </tr>
          </thead>
          <tbody className="bg-white text-sm">
            {selectedProducts.map((product, index) => (
              <tr key={index} className="h-24">
                <td className="text-left w-44 px-4 py-2">
                  {product.product_id ? (
                    <div className="flex flex-col p-2 gap-2 w-full ">
                      <div
                        className={`capitalize ${productData[index] ? 'font-semibold ' : ''}`}
                      >
                        {productData[index]?.name}
                      </div>
                      {productChose && (
                        <div
                          className="capitalize text-ellipsis overflow-hidden whitespace-wrap"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {productData[index]?.description}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsPOpen(true)}
                      className="capitalize cursor-pointer rounded-xl w-full p-2 outline-none border bg-gray-50 border-gray-300 transition-colors duration-300 ease-in-out flex items-center gap-2 hover:bg-amber-50 hover:border-amber-300"
                    >
                      <IoMdAdd className="text-base" />
                      Add Product
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-left w-8">
                  <input
                    type="text"
                    value={product.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, parseInt(e.target.value, 10))
                    }
                    className="rounded-xl text-center w-full p-2 outline-none border bg-gray-50 border-gray-300 transition-colors duration-300 ease-in-out hover:border-amber-400 focus:border-amber-200 focus:ring-0 text-gray-900 placeholder-gray-500"
                    readOnly={!product.product_id}
                  />
                </td>
                <td className="px-4 py-2 text-center w-32">
                  <div className="rounded-xl w-full p-2 ">
                    {productData[index]?.price !== undefined
                      ? formatPrice(productData[index]?.price)
                      : '-'}
                  </div>
                </td>
                <td className="px-4 py-2 text-center w-32">
                  <div className="rounded-xl w-full p-2 ">
                    {productData[index]?.price
                      ? formatPrice(
                          productData[index]?.price * product.quantity,
                        )
                      : '-'}
                  </div>
                </td>
                <td className="py-2 w-5">
                  <div className="flex items-center py-2  w-full h-full">
                    {product.product_id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        className="text-lg text-red-600"
                      >
                        <IoMdClose />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isPOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-3 rounded-xl shadow-lg w-[350px] h-[500px] relative flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="mb-4 pt-2 px-2">
                <input
                  type="text"
                  value={searchProduct}
                  onChange={handleSearchProduct}
                  placeholder="Search product name..."
                  className="rounded-xl w-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
              <ul className="w-full h-80 overflow-y-auto px-1 mx-1">
                {products.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => handlePSelect(product.id, product.name)}
                    className="p-2 cursor-pointer hover:bg-gray-100 rounded-xl h-24 overflow-hidden my-2 border border-gray-300 flex flex-col gap-1"
                  >
                    <div className="font-semibold text-base justify-between flex items-center border-b border-gray-300 pb-1">
                      <div className="capitalize w-44">{product.name}</div>
                      <div>{formatPrice(product.price)}</div>
                    </div>
                    <div>{product.description}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="py-2 px-2 flex items-center gap-2">
              <button
                onClick={() => setIsPOpen(false)}
                className="w-full bg-gray-200 p-2 rounded-xl text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormItem;
