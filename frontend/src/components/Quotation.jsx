import React, { useState, useEffect } from 'react';
import PricingPopup from './PricingPopup';
import axios from 'axios';

const Quotation = ({ quotationNumber }) => {
  const [quotationData, setQuotationData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotationItems = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/items/${quotationNumber}`);
        setQuotationData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quotation items:', error);
        setLoading(false);
      }
    };
    fetchQuotationItems();
  }, [quotationNumber]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const updateItemLocally = (updatedItem) => {
    setQuotationData((prevData) => {
      const updatedItems = prevData.items.map((item) =>
        item.item_code === updatedItem.item_code ? { ...item, ...updatedItem } : item
      );
      return { ...prevData, items: updatedItems };
    });
  };
  
  if (loading) return <div>Loading...</div>;
  if (!quotationData) return <div>No data available for this quotation.</div>;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SST Cutting Tools</h1>
            <div className="mt-2">
              <span className="font-semibold">Quotation Number: </span>
              <span className="text-gray-600">{quotationNumber}</span>
            </div>
          </div>
          <div>
            <span className="font-semibold">Date: </span>
            <span className="text-gray-600">
              {new Date(quotationData.date).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Sl. No.
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Item Code
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Item Description
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-600">
                  Qty.
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-600">
                  Pcs.
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  High
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Medium
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-right text-sm font-semibold text-gray-600">
                  Economical
                </th>
              </tr>
            </thead>
            <tbody>
              {quotationData.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td
                    className="border-b border-gray-200 px-6 py-4 text-sm text-blue-600 font-medium cursor-pointer hover:text-blue-800 hover:underline"
                    onClick={() => handleItemClick(item)}
                  >
                    {item.item_code}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600">
                    {item.description}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600 text-center">
                    {item.qty}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600 text-center">
                    {item.pcs}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600 text-right">
                    ₹ {item.prices_high.toFixed(2)}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600 text-right">
                    ₹ {item.prices_medium.toFixed(2)}
                  </td>
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-600 text-right">
                    ₹ {item.prices_economical.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPopupOpen && selectedItem && (
        <PricingPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        itemData={selectedItem}
        updateItem={updateItemLocally} 
      />
      
      )}
    </>
  );
};

export default Quotation;
