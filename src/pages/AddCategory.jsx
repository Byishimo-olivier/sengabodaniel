import React, { useState } from 'react';
import axios from 'axios';

const AddCategory = ({ showMessage }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5050/api/categories', { name: categoryName });
      showMessage(response.data.message, 'success');
      setCategoryName('');
    } catch (error) {
      console.error('Error adding category:', error);
      showMessage('Failed to add category.', 'error');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Category</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Add Category
        </button>
      </form>
    </div>
  );
};

export default AddCategory;
