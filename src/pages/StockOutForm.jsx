import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
// Component for recording Stock Out
// Component for recording Stock Out
const StockOutForm = ({ showMessage }) => {
   if(!localStorage.getItem('user')){
        window.location.href='/login';
    }
    const [loading, setLoading] = useState(true);
    const [spareParts, setSpareParts] = useState([]);
    const API_BASE_URL = 'http://localhost:5050/api';
  const [formData, setFormData] = useState({
    PartID: '',
    StockOutQuantity: '',
    buying_price: '',
    selling_price: '',
    StockOutDate: new Date().toISOString().split('T')[0] // Default to today's date
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'PartID') {
      // When a product is selected, automatically populate the buying and selling prices
      const selectedPartID = parseInt(value);
      const selectedProduct = spareParts.find(part => part.PartID === selectedPartID);
      setFormData({ 
        ...formData, 
        PartID: selectedPartID,
        buying_price: selectedProduct ? selectedProduct.buying_price : '',
        selling_price: selectedProduct ? selectedProduct.selling_price : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
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


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/stock_out`, {
        ...formData,
        PartID: parseInt(formData.PartID),
        StockOutQuantity: parseInt(formData.StockOutQuantity),
        buying_price: parseFloat(formData.buying_price),
        selling_price: parseFloat(formData.selling_price)
      });
      showMessage(response.data.message, 'success');
      setFormData({ ...formData, PartID: '', StockOutQuantity: '', buying_price: '', selling_price: '' }); // Clear relevant fields
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        showMessage(error.response.data.message || 'Failed to record stock out.', 'error');
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

  const selectedProduct = spareParts.find(part => part.PartID === parseInt(formData.PartID));
  const profit = formData.selling_price && formData.buying_price ? 
    (parseFloat(formData.selling_price) - parseFloat(formData.buying_price)) * parseFloat(formData.StockOutQuantity || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Record Stock Out</h1>
              <p className="text-gray-600">Process sales and remove inventory from stock</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Stock Out Details
            </h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Selection */}
              <div className="lg:col-span-2">
                <label htmlFor="stockOutPartID" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Product *
                </label>
                <div className="relative">
                  <select 
                    value={formData.PartID}
                    onChange={handleChange}
                    name="PartID" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pl-12 appearance-none bg-white"
                    id="stockOutPartID"
                    required
                  >
                    <option value="">Select a product</option>
                    {spareParts.map((part) => (
                      <option key={part.PartID} value={part.PartID}>
                        {part.Name} - Available: {part.Quantity}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                {selectedProduct && (
                  <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-red-900">{selectedProduct.Name}</div>
                          <div className="text-sm text-red-700">
                            Available Stock: {selectedProduct.Quantity} units | 
                            Category: {selectedProduct.category_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                      {selectedProduct.Quantity <= 5 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="stockOutQuantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity to Sell *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="stockOutQuantity"
                    name="StockOutQuantity"
                    value={formData.StockOutQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter quantity"
                    min="1"
                    max={selectedProduct ? selectedProduct.Quantity : undefined}
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                {selectedProduct && formData.StockOutQuantity && parseInt(formData.StockOutQuantity) > selectedProduct.Quantity && (
                  <p className="mt-1 text-sm text-red-600">Insufficient stock available</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="stockOutDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Sale Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="stockOutDate"
                    name="StockOutDate"
                    value={formData.StockOutDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pl-12"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Buying Price */}
              <div>
                <label htmlFor="buyingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Buying Price (per unit) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="buyingPrice"
                    name="buying_price"
                    value={formData.buying_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter buying price"
                    min="0"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Selling Price (per unit) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="sellingPrice"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter selling price"
                    min="0"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>

              {/* Transaction Summary */}
              {formData.StockOutQuantity && formData.buying_price && formData.selling_price && (
                <div className="lg:col-span-2 mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <div className="font-semibold text-gray-900">
                        {(parseFloat(formData.StockOutQuantity) * parseFloat(formData.buying_price)).toLocaleString()} RWF
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Revenue:</span>
                      <div className="font-semibold text-green-600">
                        {(parseFloat(formData.StockOutQuantity) * parseFloat(formData.selling_price)).toLocaleString()} RWF
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit/Loss:</span>
                      <div className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, PartID: '', StockOutQuantity: '', buying_price: '', selling_price: '' })}
                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={selectedProduct && formData.StockOutQuantity && parseInt(formData.StockOutQuantity) > selectedProduct.Quantity}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m16 0l-4-4m4 4l-4 4" />
                </svg>
                Record Stock Out
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-red-800 mb-1">Stock Out Guidelines</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Select the product being sold from inventory</li>
                <li>• Quantity cannot exceed available stock</li>
                <li>• Buying and selling prices will auto-populate but can be updated</li>
                <li>• Review transaction summary before submitting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

 export default StockOutForm;