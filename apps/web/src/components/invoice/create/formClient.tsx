import { ChangeEvent, useEffect, useState } from 'react';
import { Client, TClient } from '@/models/client.model';
import { axiosInstance } from '@/libs/axios';
import { useDebounce } from 'use-debounce';

interface ClientSelectorProps {
  clients: Client[];
  selectedClientName: string;
  setSelectedClientName: (name: string) => void;
  formik: any;
  setClients: (data: Client[]) => void;
}
const FormClient: React.FC<ClientSelectorProps> = ({
  clients,
  selectedClientName,
  setSelectedClientName,
  formik,
  setClients,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [debounceClient] = useDebounce(searchQuery, 1000);
  const [clientChose, setClientChose] = useState<TClient | undefined>(
    undefined,
  );

  const fetchClients = async (query = '') => {
    try {
      const response = await axiosInstance().get('/clients/all', {
        params: { search: query },
      });

      const { data } = response.data;
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchClients(debounceClient);
    }
  }, [isModalOpen, debounceClient]);

  const handleClientSelect = (clientId: string, clientName: string) => {
    const selectedClient = clients.find((client) => client.id === clientId);
    if (selectedClient) {
      setClientChose(selectedClient);
      formik.setFieldValue('client_id', clientId);
      formik.setFieldValue(
        'payment_method',
        selectedClient.payment_preference || '',
      );
    }
    setSelectedClientName(clientName);
    setIsModalOpen(false);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      <div className="flex items-start">
        <label htmlFor="client_id" className="w-48 py-4">
          Client Name
        </label>
        <div className="">
          <input
            type="text"
            id="client_id"
            value={selectedClientName}
            onClick={() => setIsModalOpen(true)}
            readOnly
            className="cursor-pointer rounded-xl my-2 w-72 p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
          />
          {isModalOpen && (
            <div className="bg-white rounded-xl shadow-lg w-72 absolute text-sm border border-gray-200">
              <div className="mb-4 pt-2 px-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search client name or email..."
                  className="rounded-xl w-full p-2 outline-none border border-gray-300 transition-colors duration-300 ease-in-out focus:border-amber-200 focus:ring-0 bg-gray-50 text-gray-900 placeholder-gray-500"
                />
              </div>
              <ul className="max-h-60 overflow-y-auto px-1 mx-1">
                {clients.map((client) => (
                  <li
                    key={client.id}
                    onClick={() => handleClientSelect(client.id, client.name)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div>{client.name}</div>
                    <div>{client.email}</div>
                  </li>
                ))}
              </ul>
              <div className="py-2 px-2 flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-gray-200 p-2 rounded-xl text-center"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {formik.values.client_id && clientChose && (
            <div className="flex flex-col text-wrap w-72 p-2 gap-1">
              <div className="font-semibold">Client Contact</div>
              <div className="text-sm">Email: {clientChose.email}</div>
              {clientChose.phone && (
                <div className="text-sm">Phone: {clientChose.phone}</div>
              )}
              <div className="text-sm">{clientChose.address}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FormClient;
