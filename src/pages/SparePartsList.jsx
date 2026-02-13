// import React, { useState } from 'react';
import UpdateSparePartModal from "./UpdateSparePartModal";
import ConfirmationModal from "./ConfirmationModal";
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { exportToCSV, printTable, exportSparePartsToCSV } from '../utils/exportUtils';
// Component for adding a new Product
const API_BASE_URL = 'http://localhost:5050/api';
// Component for displaying and managing Products
const SparePartsList = ({ showMessage }) => {
   if(!localStorage.getItem('user')){
        window.location.href='/login';
    }
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPart, setEditingPart] = useState(null); // State to hold part being edited
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);

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

  // Handle Edit button click
  const handleEdit = (part) => {
    setEditingPart(part); // Set the part data to pre-fill the modal
  };

  // Handle Delete button click (show confirmation)
  const handleDeleteClick = (partId) => {
    setPartToDelete(partId);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete action
  const confirmDelete = async () => {
    setShowDeleteConfirm(false); // Close confirmation modal
    if (!partToDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/spare_parts/${partToDelete}`);
      showMessage(response.data.message, 'success');
      fetchSpareParts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.response) {
        showMessage(error.response.data.message || 'Failed to delete item.', 'error');
      } else {
        showMessage('Network error or server is unreachable.', 'error');
      }
    } finally {
      setPartToDelete(null);
    }
  };

  // Cancel Delete action
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPartToDelete(null);
  };

  // Handle print functionality
  const handlePrint = () => {
    printTable('sparePartsTable');
  };

  // Handle export to CSV
  const handleExport = () => {
    exportSparePartsToCSV(spareParts, 'spare_parts_list');
  };

  // Calculate total inventory value based on buying price
  const calculateTotalInventoryValue = () => {
    return spareParts.reduce((total, part) => {
      const quantity = parseFloat(part.Quantity) || 0;
      const buyingPrice = parseFloat(part.buying_price) || 0;
      return total + (quantity * buyingPrice);
    }, 0);
  };

  // Calculate total potential revenue based on selling price
  const calculateTotalPotentialRevenue = () => {
    return spareParts.reduce((total, part) => {
      const quantity = parseFloat(part.Quantity) || 0;
      const sellingPrice = parseFloat(part.selling_price) || 0;
      return total + (quantity * sellingPrice);
    }, 0);
  };

  const getStockStatus = (quantity, threshold = 5) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= threshold) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const checkForAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE_URL}/alerts/check`);
      showMessage(`Alert check completed: ${data.alertsCreated} created, ${data.alertsUpdated} updated, ${data.alertsResolved} resolved`, 'success');
      fetchSpareParts(); // Refresh the list
    } catch (e) {
      showMessage('Failed to check for alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium text-gray-700">Loading inventory...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
                <p className="text-gray-600">Complete inventory overview and management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href='/add-category'}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Add Category
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={checkForAlerts}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Check Alerts
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{spareParts.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{spareParts.filter(p => p.Quantity > (p.lowstock_threshold || 5)).length}</div>
                <div className="text-sm text-gray-600">In Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{spareParts.filter(p => p.Quantity <= (p.lowstock_threshold || 5) && p.Quantity > 0).length}</div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{spareParts.filter(p => p.Quantity === 0).length}</div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        {spareParts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-6">Start building your inventory by adding your first product.</p>
            <button 
              onClick={() => window.location.href='/add-part'}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
              <p className="text-sm text-gray-600 mt-1">Complete list of all products with pricing and stock information</p>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto" id="sparePartsTable">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Manufacturer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Buy Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sell Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {spareParts.map((part) => {
                    const stockStatus = getStockStatus(part.Quantity, part.lowstock_threshold || 5);
                    const totalBuying = ((parseFloat(part.Quantity) || 0) * (parseFloat(part.buying_price) || 0));
                    const totalSelling = ((parseFloat(part.Quantity) || 0) * (parseFloat(part.selling_price) || 0));
                    
                    return (
                      <tr key={part.PartID} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{part.Name}</div>
                              <div className="text-sm text-gray-500">ID: {part.PartID} | Threshold: {part.lowstock_threshold || 5}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {part.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-sm text-gray-700">{part.manufacturer_name || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                              <div className={`w-2 h-2 rounded-full mr-2 ${part.Quantity === 0 ? 'bg-red-500' : part.Quantity <= (part.lowstock_threshold || 5) ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                              {part.Quantity} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-sm font-medium text-gray-900">
                            {part.buying_price ? `${parseFloat(part.buying_price).toLocaleString()} RWF` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-sm font-medium text-gray-900">
                            {part.selling_price ? `${parseFloat(part.selling_price).toLocaleString()} RWF` : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Buy: {totalBuying.toLocaleString()} RWF
                            </div>
                            <div className="text-sm text-green-600">
                              Sell: {totalSelling.toLocaleString()} RWF
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleEdit(part)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(part.PartID)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                
                {/* Summary Footer */}
                <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      Inventory Totals:
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900"></td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900"></td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold">
                        <div className="text-gray-900">Buy: {calculateTotalInventoryValue().toLocaleString()} RWF</div>
                        <div className="text-green-600">Sell: {calculateTotalPotentialRevenue().toLocaleString()} RWF</div>
                      </div>
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Update Spare Part Modal */}
        {editingPart && (
          <UpdateSparePartModal
            part={editingPart}
            onClose={() => setEditingPart(null)}
            onUpdateSuccess={() => {
              setEditingPart(null);
              fetchSpareParts(); // Refresh list after update
              showMessage('Product updated successfully!', 'success');
            }}
            showMessage={showMessage}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <ConfirmationModal
            message="Are you sure you want to delete this product? This action cannot be undone."
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </div>
  );
};

export default SparePartsList;
