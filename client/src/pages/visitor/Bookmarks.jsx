import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaBookmark, FaTrash, FaEdit, FaPlus, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Bookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);

  // Fetch bookmarks
  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
  }, [filter]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks?category=${filter === 'all' ? '' : filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookmarks');
      }

      const data = await response.json();
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/bookmarks/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deleteBookmark = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete bookmark');
      }

      toast.success('Bookmark deleted successfully');
      fetchBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      toast.error('Failed to delete bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBookmark className="text-blue-600" />
                My Bookmarks
              </h1>
              <p className="text-gray-600 mt-2">Manage your saved museums, artifacts, and educational content</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Bookmark
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <FaFilter className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {bookmarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBookmark className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No bookmarks yet</h3>
            <p className="text-gray-500">Start bookmarking your favorite content to see it here</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map(bookmark => (
              <div key={bookmark._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {bookmark.imageUrl && (
                  <div className="h-48 bg-gray-200">
                    <img
                      src={bookmark.imageUrl}
                      alt={bookmark.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 flex-1">
                      {bookmark.title}
                    </h3>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => setEditingBookmark(bookmark)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteBookmark(bookmark._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {bookmark.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {bookmark.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(bookmark.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {bookmark.url && (
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Visit Link →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
