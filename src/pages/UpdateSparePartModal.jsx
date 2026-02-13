import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
// Component for adding a new Product
const UpdateSparePartModal = ({ part, onClose, onUpdateSuccess, showMessage }) => {
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
  const getInitialID = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return String(val._id || val.id || val.CategoryID || val.ManufacturerID || '');
    return String(val);
  };

  const [formData, setFormData] = useState({
    Name: part?.Name ?? '',
    Category: getInitialID(part?.Category),
    manufacturer_id: getInitialID(part?.manufacturer_id || part?.Manufacturer),
    Quantity: part?.Quantity ?? 0,
    buying_price: part?.buying_price ?? '',
    selling_price: part?.selling_price ?? '',
    lowstock_threshold: part?.lowstock_threshold ?? '5'
  });
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingManufacturers, setLoadingManufacturers] = useState(true);

  // Fetch categories from the database
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showMessage?.('Failed to load categories.', 'error');
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
      showMessage?.('Failed to load manufacturers.', 'error');
    } finally {
      setLoadingManufacturers(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchManufacturers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = part?.PartID ?? part?.id ?? part?._id;
    if (!id) {
      showMessage?.('Unable to update: item id is missing', 'error');
      return;
    }
    const submissionData = {
      ...formData,
      Category: formData.Category || null,
      manufacturer_id: formData.manufacturer_id || null,
      Quantity: parseInt(formData.Quantity),
      buying_price: formData.buying_price ? parseFloat(formData.buying_price) : null,
      selling_price: formData.selling_price ? parseFloat(formData.selling_price) : null,
      lowstock_threshold: parseInt(formData.lowstock_threshold)
    };
    try {
      await axios.put(`${API_BASE_URL}/spare_parts/${id}`, submissionData);
      showMessage?.('Item updated successfully', 'success');
      onUpdateSuccess?.();
    } catch (err) {
      console.error('Error updating item:', err);
      showMessage?.(err?.response?.data?.message || 'Failed to update item', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Edit Spare Part (ID: {part.PartID})</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editPartName" className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
            <input
              type="text"
              id="editPartName"
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="editCategory"
              name="Category"
              value={String(formData.Category ?? '')}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a category</option>
              {categories.map((category, idx) => (
                <option key={category._id || category.id || category.CategoryID || idx} value={String(category._id || category.id || category.CategoryID || '')}>
                  {category.name ?? category.CategoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="editManufacturer" className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
            <select
              id="editManufacturer"
              name="manufacturer_id"
              value={String(formData.manufacturer_id ?? '')}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Select a manufacturer</option>
              {manufacturers.map((man, idx) => (
                <option key={man._id || man.id || man.ManufacturerID || idx} value={String(man._id || man.id || man.ManufacturerID || '')}>
                  {man.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              id="editQuantity"
              name="Quantity"
              value={formData.Quantity}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
              required
            />
          </div>
          <div>
            <label htmlFor="editBuyingPrice" className="block text-sm font-medium text-gray-700 mb-1">Buying Price</label>
            <input
              type="number"
              id="editBuyingPrice"
              name="buying_price"
              value={formData.buying_price}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="editSellingPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
            <input
              type="number"
              id="editSellingPrice"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="editLowStockThreshold" className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
            <input
              type="number"
              id="editLowStockThreshold"
              name="lowstock_threshold"
              value={formData.lowstock_threshold}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdateSparePartModal;