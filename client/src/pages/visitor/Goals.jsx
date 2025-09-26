import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaBullseye, FaPlus, FaEdit, FaTrash, FaCheck, FaCalendar, FaArrowUp, FaChartLine } from 'react-icons/fa';
import { toast } from 'sonner';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('active');

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'course-completion',
    type: 'monthly',
    target: 1,
    unit: 'courses',
    targetDate: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sort', 'createdAt');

      const response = await fetch(`/api/progress/goals?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');

      // Mock data fallback
      setGoals([
        {
          _id: '1',
          title: 'Complete 5 Heritage Courses',
          description: 'Finish 5 courses about Ethiopian heritage and culture',
          category: 'course-completion',
          type: 'monthly',
          target: 5,
          unit: 'courses',
          current: 2,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Visit 10 Virtual Museums',
          description: 'Explore virtual tours of different Ethiopian museums',
          category: 'exploration',
          type: 'quarterly',
          target: 10,
          unit: 'museums-visited',
          current: 7,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'medium',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Earn Heritage Expert Badge',
          description: 'Complete learning path to earn the expert-level achievement',
          category: 'certification',
          type: 'yearly',
          target: 1,
          unit: 'items',
          current: 0,
          targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async () => {
    try {
      const method = editingGoal ? 'PUT' : 'POST';
      const url = editingGoal ? `/api/progress/goals/${editingGoal._id}` : '/api/progress/goals';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newGoal)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingGoal ? 'update' : 'create'} goal`);
      }

      toast.success(`Goal ${editingGoal ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      setEditingGoal(null);
      setNewGoal({
        title: '',
        description: '',
        category: 'course-completion',
        type: 'monthly',
        target: 1,
        unit: 'courses',
        targetDate: '',
        priority: 'medium'
      });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error(`Failed to ${editingGoal ? 'update' : 'create'} goal`);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      const response = await fetch(`/api/progress/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const updateProgress = async (goalId) => {
    try {
      const response = await fetch(`/api/progress/goals/${goalId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ increment: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      toast.success('Progress updated!');
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const startEdit = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      type: goal.type,
      target: goal.target,
      unit: goal.unit,
      targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
      priority: goal.priority
    });
    setShowModal(true);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDaysRemaining = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaBullseye className="text-orange-600" />
                Learning Goals
              </h1>
              <p className="text-gray-600 mt-2">Set and track your learning objectives</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> New Goal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            {['active', 'completed', 'paused', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${goals.filter(g => g.status === status).length})`}
                {status === 'all' && ` (${goals.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBullseye className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No goals set</h3>
            <p className="text-gray-500">Create your first learning goal to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map(goal => (
              <div key={goal._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">{goal.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{goal.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {goal.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(goal)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{goal.current || 0}/{goal.target} {goal.unit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(goal.current || 0, goal.target)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {getProgressPercentage(goal.current || 0, goal.target).toFixed(1)}%
                  </div>
                </div>

                {/* Target Date */}
                {goal.targetDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <FaCalendar className="h-4 w-4" />
                    <span>
                      {getDaysRemaining(goal.targetDate) > 0
                        ? `${getDaysRemaining(goal.targetDate)} days left`
                        : 'Overdue'
                      }
                    </span>
                  </div>
                )}

                {/* Action Button */}
                {goal.status === 'active' && (
                  <button
                    onClick={() => updateProgress(goal._id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FaChartLine /> Update Progress
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Goal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-90vh overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />

                <textarea
                  placeholder="Description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="course-completion">Course Completion</option>
                    <option value="skill-building">Skill Building</option>
                    <option value="knowledge">Knowledge</option>
                    <option value="certification">Certification</option>
                    <option value="exploration">Exploration</option>
                    <option value="social">Social</option>
                  </select>

                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="Target"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 1 })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />

                  <select
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="courses">Courses</option>
                    <option value="lessons">Lessons</option>
                    <option value="hours">Hours</option>
                    <option value="museums-visited">Museums</option>
                    <option value="artifacts-viewed">Artifacts</option>
                    <option value="items">Items</option>
                  </select>

                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingGoal(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGoal}
                  disabled={!newGoal.title || !newGoal.targetDate}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                >
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
