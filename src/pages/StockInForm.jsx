import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
// Component for recording Stock In
// Component for recording Stock In
const StockInForm = ({ showMessage }) => {
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
  const [formData, setFormData] = useState({
    PartID: '',
    StockInQuantity: '',
    buying_price: '',
    StockInDate: new Date().toISOString().split('T')[0] // Default to today's date
  });
  const fetchSpareParts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/spare_parts`);
      setSpareParts(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      showMessage('Failed to load items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange', { name, value });

    if (name === 'PartID') {
      // Keep select value as a string (matches option values) and populate buying price
      const selectedPartID = value;
      // prefer MongoDB _id, then PartID, then id
      const selectedProduct = spareParts.find(part => String(part._id ?? part.PartID ?? part.id ?? '') === selectedPartID);
      console.log('selectedProduct', selectedProduct);
      setFormData({
        ...formData,
        PartID: selectedPartID,
        buying_price: selectedProduct ? selectedProduct.buying_price : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('submitting', formData);
    const submissionData = {
      ...formData,
      PartID: formData.PartID, // Send as string to support MongoDB ObjectID
      StockInQuantity: parseInt(formData.StockInQuantity),
      buying_price: formData.buying_price ? parseFloat(formData.buying_price) : null
    };
    try {
      const response = await axios.post(`${API_BASE_URL}/stock_in`, submissionData);
      console.log('stock_in response', response.data);
      showMessage(response.data.message, 'success');
      setFormData({ ...formData, PartID: '', StockInQuantity: '' }); // Clear quantity and PartID
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        showMessage(error.response.data.message || 'Failed to record stock in.', 'error');
      } else {
        showMessage('Network error or server is unreachable.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium text-gray-700">Loading products...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedProduct = spareParts.find(part => String(part._id ?? part.PartID ?? part.id ?? '') === String(formData.PartID));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Record Stock In</h1>
              <p className="text-sm text-gray-600">Add inventory to your stock</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Stock In Details
            </h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2">
                <label htmlFor="stockInPartID" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Product *
                </label>
                <div className="relative">
                  <select
                    value={formData.PartID ?? ''}
                    onChange={handleChange}
                    name="PartID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-12 appearance-none bg-white"
                    id="stockInPartID"
                    required
                  >
                    <option value="">Select a product</option>
                    {spareParts.map((part, idx) => {
                      const val = String(part._id ?? part.PartID ?? part.id ?? '');
                      return (
                        <option key={part._id || part.PartID || part.id || idx} value={val}>
                          {part.Name} - Current Stock: {part.Quantity}
                        </option>
                      );
                    })}
                  </select>
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                {selectedProduct && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-green-900">{selectedProduct.Name}</div>
                        <div className="text-sm text-green-700">
                          Current Stock: {selectedProduct.Quantity} units |
                          Category: {selectedProduct.category_name || selectedProduct.Category?.name || selectedProduct.Category?.CategoryName || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="stockInQuantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Add *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="stockInQuantity"
                    name="StockInQuantity"
                    value={formData.StockInQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="stockInDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock In Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="stockInDate"
                    name="StockInDate"
                    value={formData.StockInDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-12"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Buying Price */}
              <div className="lg:col-span-2">
                <label htmlFor="buyingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Buying Price (per unit)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="buyingPrice"
                    name="buying_price"
                    value={formData.buying_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter buying price"
                    min="0"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                {formData.StockInQuantity && formData.buying_price && (
                  <div className="mt-2 text-sm text-gray-600">
                    Total Cost: <span className="font-semibold text-green-600">
                      {(parseFloat(formData.StockInQuantity) * parseFloat(formData.buying_price)).toLocaleString()} RWF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, PartID: '', StockInQuantity: '', buying_price: '' })}
                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                </svg>
                Record Stock In
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m-1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-green-800 mb-1">Stock In Guidelines</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Select the product you want to add stock for</li>
                <li>• Enter the quantity being added to inventory</li>
                <li>• Buying price will auto-populate but can be updated</li>
                <li>• Date defaults to today but can be changed if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInForm;