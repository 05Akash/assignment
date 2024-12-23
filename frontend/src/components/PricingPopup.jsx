import React, { useState } from 'react';
import axios from 'axios';

const PricingPopup = ({ isOpen, onClose, itemData, updateItem }) => {
  const [editableFields, setEditableFields] = useState({
    high: {
      packing: itemData?.high_packing || '',
      profit_margin: itemData?.high_profit_margin || '',
      discount: itemData?.high_discount || '',
    },
    medium: {
      packing: itemData?.medium_packing || '',
      profit_margin: itemData?.medium_profit_margin || '',
      discount: itemData?.medium_discount || '',
    },
    economical: {
      packing: itemData?.economical_packing || '',
      profit_margin: itemData?.economical_profit_margin || '',
      discount: itemData?.economical_discount || '',
    },
  });

  const handleInputChange = (field, value, category) => {
    if (!/^\d*\.?\d*$/.test(value) && value !== '') return;

    setEditableFields((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleUpdate = async () => {
    try {
      const updates = Object.entries(editableFields).map(([category, fields]) =>
        axios.put(
          `http://127.0.0.1:8000/items/${itemData.quotation_number}/${itemData.item_code}/${category}`,
          fields
        )
      );

      await Promise.all(updates);

      const updatedItem = {
        ...itemData,
        ...Object.fromEntries(
          Object.entries(editableFields).flatMap(([category, fields]) =>
            Object.entries(fields).map(([key, value]) => [`${category}_${key}`, value])
          )
        ),
      };

      updateItem(updatedItem); // Call the parent function to update the state
      onClose();
    } catch (error) {
      console.error('Update error:', error.response || error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  if (!isOpen || !itemData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{itemData.item_code}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-b-2 border-gray-200 bg-gray-50 px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Field
                  </th>
                  <th className="border-b-2 border-gray-200 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-gray-600">
                    High
                  </th>
                  <th className="border-b-2 border-gray-200 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-gray-600">
                    Medium
                  </th>
                  <th className="border-b-2 border-gray-200 bg-gray-50 px-6 py-3 text-center text-sm font-semibold text-gray-600">
                    Economical
                  </th>
                </tr>
              </thead>
              <tbody>
                {['rod', 'coating', 'pre_process', 'post_process'].map((field) => (
                  <tr key={field}>
                    <td className="border-b border-gray-200 px-6 py-4 capitalize">{field.replace('_', ' ')}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center">₹ {itemData[field]}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center">₹ {itemData[field]}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center">₹ {itemData[field]}</td>
                  </tr>
                ))}
                {['packing', 'profit_margin', 'discount'].map((field) => (
                  <tr key={field}>
                    <td className="border-b border-gray-200 px-6 py-4">
                      <span className="capitalize">{field.replace('_', ' ')}</span>
                    </td>
                    {['high', 'medium', 'economical'].map((category) => (
                      <td key={category} className="border-b border-gray-200 px-6 py-4 text-center">
                        <input
                          type="text"
                          className="w-24 text-center border border-gray-300 rounded px-2 py-1"
                          value={editableFields[category][field]}
                          onChange={(e) => handleInputChange(field, e.target.value, category)}
                          placeholder="Enter number"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gray-800 text-white">
                  <td className="px-6 py-4 text-sm font-semibold">Total</td>
                  <td className="px-6 py-4 text-center">₹ {itemData.prices_high}</td>
                  <td className="px-6 py-4 text-center">₹ {itemData.prices_medium}</td>
                  <td className="px-6 py-4 text-center">₹ {itemData.prices_economical}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPopup;

