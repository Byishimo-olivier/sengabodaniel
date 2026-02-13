// import React from 'react';
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

const HomePage = () => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [countersData, setCountersData] = useState([]);
  const [stockInRecords, setStockInRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [chartData, setChartData] = useState({
    monthlyStockIn: [],
    monthlyStockOut: [],
    topProducts: []
  });
  const [timeFrame, setTimeFrame] = useState('daily'); // 'daily', 'monthly' or 'yearly'

  const fetchStockOutRecords = async () => {
    setLoading(true);
    try {
      const [partsRes, inRes, outRes, lowRes, catsRes, mansRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/spare_parts`),
        axios.get(`${API_BASE_URL}/stock_in`),
        axios.get(`${API_BASE_URL}/stock_out`),
        axios.get(`${API_BASE_URL}/low_stock`),
        axios.get(`${API_BASE_URL}/categories`),
        axios.get(`${API_BASE_URL}/manufacturers`)
      ]);
      setStockInRecords(inRes.data);
      setSpareParts(partsRes.data);
      setStockOutRecords(outRes.data);
      setLowStockItems(lowRes.data || []);
      setCategories(catsRes.data);
      setManufacturers(mansRes.data);

      // Process chart data
      processChartData(inRes.data, outRes.data, partsRes.data);

      setCountersData([
        {
          id: 1,
          title: 'Total Products',
          value: `${partsRes.data.length}`,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
          bgColor: 'from-blue-500 to-blue-700',
        },
        {
          id: 2,
          title: 'Stock In Records',
          value: `${inRes.data.length}`,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'from-green-500 to-green-700',
        },
        {
          id: 3,
          title: 'Stock Out Records',
          value: `${outRes.data.length}`,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'from-red-500 to-red-700',
        },
        {
          id: 4,
          title: 'Low Stock Alerts',
          value: `${(lowRes.data || []).length}`,
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          bgColor: 'from-yellow-500 to-orange-600',
        },
      ]);

    } catch (error) {
      console.error('Error fetching stock out records:', error);
      // showMessage('Failed to load stock out records.', 'error'); // Assuming showMessage is defined elsewhere
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (stockInData, stockOutData, productsData) => {
    const currentDate = new Date();
    let periods = [];

    if (timeFrame === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        periods.push({
          label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullLabel: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate()
        });
      }
    } else if (timeFrame === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        periods.push({
          label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          fullLabel: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          year: date.getFullYear(),
          month: date.getMonth()
        });
      }
    } else {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = currentDate.getFullYear() - i;
        periods.push({
          label: year.toString(),
          fullLabel: year.toString(),
          year: year,
          month: null
        });
      }
    }

    const monthlyStockIn = periods.map(period => {
      const periodData = stockInData.filter(record => {
        const recordDate = new Date(record.StockInDate);
        if (timeFrame === 'daily') {
          return recordDate.getFullYear() === period.year &&
            recordDate.getMonth() === period.month &&
            recordDate.getDate() === period.day;
        } else if (timeFrame === 'monthly') {
          return recordDate.getFullYear() === period.year && recordDate.getMonth() === period.month;
        } else {
          return recordDate.getFullYear() === period.year;
        }
      });
      return {
        period: period.label,
        fullLabel: period.fullLabel,
        value: periodData.reduce((sum, record) => sum + (record.StockInQuantity || 0), 0),
        records: periodData.length
      };
    });

    const monthlyStockOut = periods.map(period => {
      const periodData = stockOutData.filter(record => {
        const recordDate = new Date(record.StockOutDate);
        if (timeFrame === 'daily') {
          return recordDate.getFullYear() === period.year &&
            recordDate.getMonth() === period.month &&
            recordDate.getDate() === period.day;
        } else if (timeFrame === 'monthly') {
          return recordDate.getFullYear() === period.year && recordDate.getMonth() === period.month;
        } else {
          return recordDate.getFullYear() === period.year;
        }
      });
      return {
        period: period.label,
        fullLabel: period.fullLabel,
        value: periodData.reduce((sum, record) => sum + (record.StockOutQuantity || 0), 0),
        records: periodData.length
      };
    });

    // Get top 5 products by quantity
    const topProducts = productsData
      .sort((a, b) => (b.Quantity || 0) - (a.Quantity || 0))
      .slice(0, 5)
      .map(product => ({
        name: product.Name,
        quantity: product.Quantity || 0,
        percentage: Math.min(100, ((product.Quantity || 0) / Math.max(...productsData.map(p => p.Quantity || 0))) * 100),
        manufacturer_name: product.manufacturer_name,
        manufacturer_id: product.manufacturer_id,
        Manufacturer: product.Manufacturer,
        category_name: product.category_name,
        Category: product.Category
      }));

    setChartData({
      monthlyStockIn,
      monthlyStockOut,
      topProducts
    });
  };

  const checkForAlerts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${API_BASE_URL}/alerts/check`);
      // Refresh data after checking alerts
      await fetchStockOutRecords();
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  };

  // Re-process chart data when timeFrame changes
  useEffect(() => {
    if (stockInRecords.length > 0 || stockOutRecords.length > 0) {
      processChartData(stockInRecords, stockOutRecords, spareParts);
    }
  }, [timeFrame, stockInRecords, stockOutRecords, spareParts]);

  useEffect(() => {
    fetchStockOutRecords();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-lg font-medium text-gray-700">Loading dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const maxStockValue = Math.max(
    ...chartData.monthlyStockIn.map(d => d.value),
    ...chartData.monthlyStockOut.map(d => d.value)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 pt-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Monitor your inventory movements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {countersData.map((counter) => (
            <div
              key={counter.id}
              className={`relative bg-gradient-to-br ${counter.bgColor} rounded-2xl shadow-xl p-6 text-white overflow-hidden group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white/20"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full border-2 border-white/10"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {counter.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{counter.value}</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold opacity-90">{counter.title}</h3>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock In/Out Trend Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-xl font-semibold text-white">Stock Movement Trends</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Stock In</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Stock Out</span>
                  </div>
                  <div className="flex items-center">
                    <select
                      className="bg-white border border-gray-300 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-700"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                    >
                      <option value="daily">Daily View</option>
                      <option value="monthly">Monthly View</option>
                      <option value="yearly">Yearly View</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Chart Container */}
              <div className="relative h-80 bg-gray-50 rounded-lg p-4">
                {/* Y-Axis */}
                <div className="absolute left-0 top-4 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-500">
                  <span>{maxStockValue}</span>
                  <span>{Math.round(maxStockValue * 0.75)}</span>
                  <span>{Math.round(maxStockValue * 0.5)}</span>
                  <span>{Math.round(maxStockValue * 0.25)}</span>
                  <span>0</span>
                </div>

                {/* Chart Area */}
                <div className="ml-12 mr-4 h-full relative">
                  {/* Horizontal Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full border-t border-gray-200"></div>
                    ))}
                  </div>

                  {/* Chart Content */}
                  <div className="relative h-full">
                    <svg className="w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
                      {/* Stock In Line (Green) */}
                      <polyline
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        points={chartData.monthlyStockIn.map((data, index) => {
                          const x = (index * 400) / (chartData.monthlyStockIn.length - 1);
                          const y = maxStockValue > 0 ? 240 - (data.value / maxStockValue) * 240 : 240;
                          return `${x},${y}`;
                        }).join(' ')}
                      />

                      {/* Stock Out Line (Red) */}
                      <polyline
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="3"
                        points={chartData.monthlyStockOut.map((data, index) => {
                          const x = (index * 400) / (chartData.monthlyStockOut.length - 1);
                          const y = maxStockValue > 0 ? 240 - (data.value / maxStockValue) * 240 : 240;
                          return `${x},${y}`;
                        }).join(' ')}
                      />

                      {/* Data Points for Stock In */}
                      {chartData.monthlyStockIn.map((data, index) => {
                        const x = (index * 400) / (chartData.monthlyStockIn.length - 1);
                        const y = maxStockValue > 0 ? 240 - (data.value / maxStockValue) * 240 : 240;
                        return (
                          <circle
                            key={`in-${index}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#10B981"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <title>Stock In {data.period}: {data.value} units ({data.records} records)</title>
                          </circle>
                        );
                      })}

                      {/* Data Points for Stock Out */}
                      {chartData.monthlyStockOut.map((data, index) => {
                        const x = (index * 400) / (chartData.monthlyStockOut.length - 1);
                        const y = maxStockValue > 0 ? 240 - (data.value / maxStockValue) * 240 : 240;
                        return (
                          <circle
                            key={`out-${index}`}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#EF4444"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <title>Stock Out {data.period}: {data.value} units ({data.records} records)</title>
                          </circle>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* X-Axis */}
                <div className="ml-12 mr-4 mt-2 flex justify-between text-xs text-gray-500">
                  {chartData.monthlyStockIn.map((data) => (
                    <span key={data.period} className="font-medium">{data.period}</span>
                  ))}
                </div>

                {/* Axis Labels */}
                <div className="absolute left-2 top-1/2 transform -rotate-90 text-xs text-gray-500 font-medium">
                  Quantity
                </div>
                <div className="text-center mt-2 text-xs text-gray-500 font-medium">
                  {timeFrame === 'daily' ? 'Days' : timeFrame === 'monthly' ? 'Months' : 'Years'}
                </div>
              </div>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-semibold text-white">Top Products by Stock</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {chartData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">{product.name}</span>
                        <span className="text-sm text-gray-600">{product.quantity} units</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        Manufacturer: {product.manufacturer_name ||
                          manufacturers.find(m => (m._id === product.manufacturer_id || m.id === product.manufacturer_id || m.ManufacturerID === product.manufacturer_id))?.name ||
                          product.Manufacturer?.name ||
                          product.manufacturer_id?.name ||
                          'N/A'}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${product.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert Section */}
        {lowStockItems.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Alert Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-8 py-6">
              <div className="flex items-center">
                <div className="p-2 bg-white/20 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Low Stock Alert</h2>
                  <p className="text-yellow-100">Items with quantity ≤ threshold require immediate attention</p>
                </div>
              </div>
            </div>

            {/* Alert Content */}
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Product Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Current Stock</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Category</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Manufacturer</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowStockItems.map((item) => (
                      <tr key={item.PartID} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-3 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{item.Name}</div>
                              <div className="text-xs text-gray-500">ID: {item.PartID || item._id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${item.Quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : item.Quantity <= item.low_stock_threshold
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.Quantity} units
                          </span>
                        </td>
                        <td className="py-3 px-6 text-gray-700 text-sm">
                          {item.category_name ||
                            categories.find(c => (c._id === item.Category || c.id === item.Category || c.CategoryID === item.Category))?.name ||
                            item.Category?.name ||
                            item.Category?.CategoryName ||
                            '-'}
                        </td>
                        <td className="py-4 px-6 text-gray-700">
                          {item.manufacturer_name ||
                            manufacturers.find(m => (m._id === item.manufacturer_id || m.id === item.manufacturer_id || m.ManufacturerID === item.manufacturer_id))?.name ||
                            item.Manufacturer?.name ||
                            item.manufacturer_id?.name ||
                            '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.Quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : item.Quantity <= item.low_stock_threshold
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.Quantity === 0 ? 'Out of Stock' : item.Quantity <= item.low_stock_threshold ? 'Critical' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Low Stock Message */}
        {lowStockItems.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">All Stock Levels Good</h3>
              <p className="text-gray-600">No items are currently running low on stock.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
