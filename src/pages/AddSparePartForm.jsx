
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
// Component for adding a new Product
const AddSparePartForm = ({ showMessage }) => {
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
  const [formData, setFormData] = useState({
    Name: '',
    Category: '',
    manufacturer_id: '',
    Quantity: '',
    buying_price: '',
    selling_price: '',
    lowstock_threshold: '5'
  });
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturerId, setManufacturerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);

  // Fetch categories from the database
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage('Failed to load categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch manufacturers from the database
  const fetchManufacturers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/manufacturers`);
      setManufacturers(response.data);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      showMessage('Failed to load manufacturers.', 'error');
    } finally {
      setLoadingManufacturers(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        Category: formData.Category || null, // Handle as string for MongoDB ObjectID
        manufacturer_id: formData.manufacturer_id || null, // Handle as string for MongoDB ObjectID
        Quantity: parseInt(formData.Quantity) || 0,
        buying_price: formData.buying_price ? parseFloat(formData.buying_price) : null,
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null,
        lowstock_threshold: parseInt(formData.lowstock_threshold) || 5
      };
      const response = await axios.post(`${API_BASE_URL}/spare_parts`, submissionData);
      showMessage(response.data.message, 'success');
      setFormData({ Name: '', Category: '', manufacturer_id: '', Quantity: '', buying_price: '', selling_price: '', lowstock_threshold: '5' }); // Clear form
    } catch (error) {
      console.error('Error:', error);
      if (error.response) {
        showMessage(error.response.data.message || 'Failed to add item.', 'error');
      } else {
        showMessage('Network error or server is unreachable.', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-sm text-gray-600">Create a new product entry</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Product Information
            </h2>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="lg:col-span-2">
                <label htmlFor="partName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="partName"
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="Enter product name"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  {loading ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading categories...
                    </div>
                  ) : (
                    <select
                      name="Category"
                      value={String(formData.Category ?? '')}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12 appearance-none bg-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat, idx) => (
                        <option key={cat._id || cat.id || cat.CategoryID || idx} value={String(cat._id || cat.id || cat.CategoryID || '')}>
                          {cat.name ?? cat.CategoryName}
                        </option>
                      ))}
                    </select>
                  )}
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>

              {/* Manufacturer */}
              <div>
                <label htmlFor="manufacturer" className="block text-sm font-semibold text-gray-700 mb-2">
                  Manufacturer
                </label>
                <div className="relative">
                  {loadingManufacturers ? (
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Loading manufacturers...
                    </div>
                  ) : (
                    <select
                      name="manufacturer_id"
                      value={String(formData.manufacturer_id ?? '')}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12 appearance-none bg-white"
                    >
                      <option value="">Select manufacturer</option>
                      {manufacturers.map((m, idx) => (
                        <option key={m._id || m.id || m.ManufacturerID || idx} value={String(m._id || m.id || m.ManufacturerID || '')}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    name="Quantity"
                    value={formData.Quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="0"
                    min="0"
                    required
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-semibold text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowstock_threshold"
                    value={formData.lowstock_threshold}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="5"
                    min="0"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>

              {/* Buying Price */}
              <div>
                <label htmlFor="buyingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Buying Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="buyingPrice"
                    name="buying_price"
                    value={formData.buying_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="0.00"
                    min="0"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>

              {/* Selling Price */}
              <div className="lg:col-span-2">
                <label htmlFor="sellingPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                  Selling Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="sellingPrice"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-12"
                    placeholder="0.00"
                    min="0"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ Name: '', Category: '', manufacturer_id: '', Quantity: '', buying_price: '', selling_price: '', lowstock_threshold: '5' })}
                className="px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Product
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Tips for adding products</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Product name is required and should be descriptive</li>
                <li>• Category and manufacturer help organize your inventory</li>
                <li>• Initial quantity sets the starting stock level</li>
                <li>• Buying and selling prices are optional but recommended for profit tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSparePartForm;