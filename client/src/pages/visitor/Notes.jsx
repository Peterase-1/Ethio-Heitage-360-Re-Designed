import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaStickyNote, FaTrash, FaEdit, FaPlus, FaSearch, FaThumbtack, FaTags } from 'react-icons/fa';
import { toast } from 'sonner';

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPrivate: false
  });

  // Fetch notes
  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchNotes = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const response = await fetch(`/api/notes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const result = await response.json();
      if (result.success) {
        setNotes(result.data.notes || []);
        setCategories(result.data.categories || []);
      } else {
        throw new Error(result.message || 'Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Categories are now fetched with notes, so this is handled in fetchNotes
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const saveNote = async () => {
    try {
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote ? `/api/notes/${editingNote._id}` : '/api/notes';

      const noteData = {
        ...newNote,
        tags: newNote.tags ? newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || `Failed to ${editingNote ? 'update' : 'create'} note`);
      }

      toast.success(result.message || `Note ${editingNote ? 'updated' : 'created'} successfully`);
      setShowAddModal(false);
      setEditingNote(null);
      setNewNote({
        title: '',
        content: '',
        category: '',
        tags: '',
        isPrivate: false
      });
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(`Failed to ${editingNote ? 'update' : 'create'} note`);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete note');
      }

      toast.success(result.message || 'Note deleted successfully');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const togglePin = async (id, isPinned) => {
    try {
      const response = await fetch(`/api/notes/${id}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to toggle pin');
      }

      fetchNotes();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update note');
    }
  };

  const startEdit = (note) => {
    setEditingNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      category: note.category || '',
      tags: note.tags ? note.tags.join(', ') : '',
      isPrivate: note.isPrivate || false
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaStickyNote className="text-green-600" />
                My Notes
              </h1>
              <p className="text-gray-600 mt-2">Keep track of your thoughts and learning insights</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Note
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaStickyNote className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No notes yet</h3>
            <p className="text-gray-500">Create your first note to get started</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div
                key={note._id}
                className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
                  note.isPinned || note.pinned ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-800 flex-1">
                    {note.title}
                  </h3>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => togglePin(note._id, note.isPinned || note.pinned)}
                      className={`transition-colors ${
                        note.isPinned || note.pinned
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-yellow-500'
                        }`}
                    >
                      <FaThumbtack />
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteNote(note._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                  {note.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags && note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    {note.category && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {note.category}
                      </span>
                    )}
                    {note.isPrivate && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Private
                      </span>
                    )}
                  </div>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Note Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Note title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

                <textarea
                  placeholder="Write your note here..."
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  rows="6"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={newNote.tags}
                  onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newNote.isPrivate}
                    onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Private note</span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingNote(null);
                    setNewNote({
                      title: '',
                      content: '',
                      category: '',
                      tags: '',
                      isPrivate: false
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNote}
                  disabled={!newNote.title || !newNote.content}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {editingNote ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
