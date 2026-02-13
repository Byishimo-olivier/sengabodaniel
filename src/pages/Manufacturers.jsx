import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddManufacturerModal from './AddManufacturerModal';

const Manufacturers = ({ showMessage }) => {
  if (!localStorage.getItem('user')) {
    window.location.href = '/login';
  }

  const API_BASE_URL = 'http://localhost:5050/api';
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch manufacturers from the database
  const fetchManufacturers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/manufacturers`);
      setManufacturers(response.data);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      showMessage('Failed to load manufacturers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  // Handle delete manufacturer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this manufacturer?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/manufacturers/${id}`);
        showMessage(response.data.message, 'success');
        fetchManufacturers(); // Refresh the list
      } catch (error) {
        console.error('Error:', error);
        if (error.response) {
          showMessage(error.response.data.message || 'Failed to delete manufacturer.', 'error');
        } else {
          showMessage('Network error or server is unreachable.', 'error');
        }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manufacturers Management</h1>
      
      {/* Add Manufacturer Button */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manufacturers</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add New Manufacturer
        </button>
      </div>

      {/* Manufacturers List */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Manufacturers List</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading manufacturers...</p>
          </div>
        ) : manufacturers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No manufacturers found. Add your first manufacturer above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manufacturers.map((manufacturer) => (
                  <tr key={manufacturer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{manufacturer.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{manufacturer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{manufacturer.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{manufacturer.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(manufacturer.id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Manufacturer Modal */}
      {showAddModal && (
        <AddManufacturerModal
          onClose={() => setShowAddModal(false)}
          onAddSuccess={() => {
            setShowAddModal(false);
            fetchManufacturers(); // Refresh list after adding
            showMessage('Manufacturer added successfully!', 'success');
          }}
          showMessage={showMessage}
        />
      )}
    </div>
  );
};

export default Manufacturers;
