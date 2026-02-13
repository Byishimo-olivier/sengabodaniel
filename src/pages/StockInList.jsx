import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToCSV, printTable } from '../utils/exportUtils';

const StockInList = ({ showMessage }) => {
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
  const [stockInRecords, setStockInRecords] = useState([]);
  const [parts, setParts] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const fetchStockInRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/stock_in`);
      setStockInRecords(response.data);
      setFilteredRecords(response.data);
    } catch (error) {
      console.error('Error fetching stock in records:', error);
      showMessage('Failed to load stock in records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/spare_parts`);
      setParts(response.data);
    } catch (error) {
      console.error('Error fetching parts:', error);
    }
  };

  useEffect(() => {
    fetchStockInRecords();
    fetchParts();
  }, []);

  // Filter records based on selected time period and search term
  useEffect(() => {
    let filtered = stockInRecords;

    // Apply Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => {
        // Mapping for search:
        const mappedName = (record.PartName && record.PartName !== 'N/A') ? record.PartName : (parts.find(p => p.PartID === record.PartID || p._id === record.PartID)?.Name || 'N/A');

        return (mappedName.toLowerCase().includes(term)) ||
          (record.PartID && record.PartID.toLowerCase().includes(term)) ||
          (record.StockInID && String(record.StockInID).toLowerCase().includes(term))
      });
    }

    // Apply Date Filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.StockInDate);
        switch (dateFilter) {
          case 'daily':
            return recordDate.toDateString() === now.toDateString();
          case 'weekly':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return recordDate >= weekAgo;
          case 'monthly':
            return recordDate.getMonth() === now.getMonth() &&
              recordDate.getFullYear() === now.getFullYear();
          case 'yearly':
            return recordDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
  }, [dateFilter, searchTerm, stockInRecords]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 pt-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-64">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 font-bold">Loading records...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    printTable('stockInTable');
  };

  const handleExport = () => {
    const headers = ['StockInID', 'PartID', 'PartName', 'StockInQuantity', 'BuyingPrice', 'TotalPrice', 'StockInDate'];
    const data = filteredRecords.map(record => {
      const totalPrice = calculateProductTotal(record.StockInQuantity, record.buying_price);
      const mappedName = (record.PartName && record.PartName !== 'N/A') ? record.PartName : (parts.find(p => p.PartID === record.PartID || p._id === record.PartID)?.Name || 'N/A');
      return {
        StockInID: record.StockInID || record._id,
        PartID: record.PartID,
        PartName: mappedName,
        StockInQuantity: record.StockInQuantity,
        BuyingPrice: record.buying_price,
        TotalPrice: totalPrice,
        StockInDate: new Date(record.StockInDate).toLocaleDateString()
      };
    });
    exportToCSV(data, headers, `stock_in_records_${dateFilter}`);
  };

  const calculateProductTotal = (quantity, buyingPrice) => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(buyingPrice) || 0;
    return qty * price;
  };

  const calculateTotalStockInQuantity = () => {
    return filteredRecords.reduce((total, record) => total + (record.StockInQuantity || 0), 0);
  };

  const calculateTotalCost = () => {
    return filteredRecords.reduce((total, record) => {
      return total + calculateProductTotal(record.StockInQuantity, record.buying_price);
    }, 0);
  };

  const getFilterDisplayName = () => {
    switch (dateFilter) {
      case 'all': return 'All Time';
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'yearly': return 'This Year';
      default: return 'Filter';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-2 sm:p-4 pt-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Stock In Report</h1>
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tight">Inventory Additions History</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Records</p>
                <p className="text-lg font-black text-black">{filteredRecords.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Quantity</p>
                <p className="text-lg font-black text-black">{calculateTotalStockInQuantity()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
              </div>
              <div className="ml-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Total Investment</p>
                <p className="text-lg font-black text-green-700">{calculateTotalCost().toLocaleString()} RWF</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header with Actions and Filter Dropdown */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3">
            <div className="flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {dateFilter === 'all' ? 'All Stock In Records' : getFilterDisplayName() + ' Stock In Records'}
                </h2>

                <div className="flex flex-wrap gap-2 items-center">
                  {/* Filter Dropdown */}
                  <div className="relative filter-dropdown">
                    <button
                      onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      className="inline-flex items-center px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-md border border-gray-200"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter: {getFilterDisplayName()}
                      <svg className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isFilterDropdownOpen && (
                      <div className="absolute left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                        {['all', 'daily', 'weekly', 'monthly', 'yearly'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => {
                              setDateFilter(filter);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-green-50 transition-colors ${dateFilter === filter ? 'text-green-600 font-bold' : 'text-black'
                              }`}
                          >
                            <span className="flex items-center">
                              {dateFilter === filter && <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              {filter === 'all' ? 'All Time' : filter === 'daily' ? 'Today' : filter === 'weekly' ? 'This Week' : filter === 'monthly' ? 'This Month' : 'This Year'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-md border border-gray-200"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-1.5 bg-white text-black rounded-lg hover:bg-gray-50 transition-all text-xs font-bold shadow-md border border-gray-200"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>

              {/* Search Field in Header Area */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Product Name or ID..."
                  className="block w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 text-black font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto" id="stockInTable">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 font-black text-black uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 text-left">Record ID</th>
                  <th className="px-4 py-2.5 text-left">Product Details</th>
                  <th className="px-4 py-2.5 text-center">Quantity</th>
                  <th className="px-4 py-2.5 text-right">Unit Price</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5 text-center">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic font-bold">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => {
                    const totalPrice = calculateProductTotal(record.StockInQuantity, record.buying_price);
                    return (
                      <tr key={record._id || record.StockInID || index} className="hover:bg-green-50 transition-colors duration-150">
                        <td className="px-4 py-1.5 whitespace-nowrap font-bold text-black border-l-4 border-green-500">
                          #{record.StockInID || (record._id ? record._id.substring(0, 8) : '')}
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap">
                          <div className="font-black text-black">
                            {(record.PartName && record.PartName !== 'N/A') ? record.PartName : (parts.find(p => p.PartID === record.PartID || p._id === record.PartID)?.Name || 'N/A')}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono tracking-tighter">ID: {record.PartID || record._id}</div>
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-black bg-blue-50 text-blue-800 border border-blue-100">
                            {record.StockInQuantity}
                          </span>
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap text-right font-bold text-black">
                          {record.buying_price ? `${parseFloat(record.buying_price).toLocaleString()} RWF` : '-'}
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap text-right font-black text-green-700">
                          {totalPrice.toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-1.5 whitespace-nowrap text-center text-black font-bold">
                          {new Date(record.StockInDate).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-black text-black border-t-2 border-green-200">
                <tr>
                  <td colSpan="2" className="px-4 py-2 text-right">Global Total:</td>
                  <td className="px-4 py-2 text-center">
                    <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded text-xs">{calculateTotalStockInQuantity()} Units</span>
                  </td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-right text-green-700">
                    {calculateTotalCost().toLocaleString()} RWF
                  </td>
                  <td className="px-4 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInList;
