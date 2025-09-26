import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaGamepad, 
  FaPlay, 
  FaStar, 
  FaUsers, 
  FaClock, 
  FaTrophy,
  FaFilter,
  FaSearch,
  FaChartBar,
  FaMedal,
  FaArrowLeft,
  FaSpinner,
  FaExternalLinkAlt,
  FaLevelUpAlt,
  FaFire,
  FaRocket
} from 'react-icons/fa';
import { toast } from 'sonner';
import VisitorLayout from '../../components/layout/VisitorLayout';
import api from '../../utils/api';

const Games = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameId } = useParams();

  // State management
  const [games, setGames] = useState([]);
  const [featuredGames, setFeaturedGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playLoading, setPlayLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [view, setView] = useState(gameId ? 'detail' : 'browse');

  // Game categories
  const gameCategories = [
    { value: 'all', label: 'All Games' },
    { value: 'quiz', label: 'Quiz Games' },
    { value: 'puzzle', label: 'Puzzles' },
    { value: 'memory', label: 'Memory Games' },
    { value: 'matching', label: 'Matching Games' },
    { value: 'trivia', label: 'Trivia' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'simulation', label: 'Simulation' }
  ];

  const difficultyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  // Load games data
  useEffect(() => {
    loadGames();
    if (gameId) {
      loadGameDetail(gameId);
      setView('detail');
    }
  }, [gameId]);

  const loadGames = async () => {
    try {
      setLoading(true);
      
      // Load all games and featured games
      const [allGamesResponse, featuredResponse] = await Promise.all([
        fetch('/api/games/public', {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
        }),
        fetch('/api/games/featured', {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
        })
      ]);

      if (allGamesResponse.ok && featuredResponse.ok) {
        const allGames = await allGamesResponse.json();
        const featured = await featuredResponse.json();
        
        setGames(allGames.games || []);
        setFeaturedGames(featured.games || []);
      }
    } catch (error) {
      console.error('Error loading games:', error);
      toast.error('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGameDetail = async (id) => {
    try {
      const response = await fetch(`/api/games/public/${id}`, {
        headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('token')}` } : {}
      });
      
      if (response.ok) {
        const gameData = await response.json();
        setSelectedGame(gameData.game);
        
        // Load additional data for authenticated users
        if (user) {
          Promise.all([
            loadGameHistory(id),
            loadGameLeaderboard(id)
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading game detail:', error);
    }
  };

  const loadGameHistory = async (id) => {
    try {
      const response = await fetch(`/api/games/${id}/history`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGameHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading game history:', error);
    }
  };

  const loadGameLeaderboard = async (id) => {
    try {
      const response = await fetch(`/api/games/${id}/leaderboard`);
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handlePlayGame = async (game) => {
    if (!user) {
      toast.error('Please sign in to play games');
      navigate('/auth');
      return;
    }

    try {
      setPlayLoading(true);
      
      // Start game session
      const response = await fetch(`/api/games/${game._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const sessionData = await response.json();
        
        // Handle different game types
        if (game.gameType === 'external' || game.gameType === 'embedded') {
          // For external games, open in new tab or embedded iframe
          if (game.configuration?.gameUrl) {
            const gameUrl = new URL(game.configuration.gameUrl);
            gameUrl.searchParams.set('sessionId', sessionData.sessionId);
            gameUrl.searchParams.set('userId', user.id);
            
            if (game.configuration.embedMode === 'iframe') {
              // Open in game player modal/page
              navigate(`/visitor/games/${game._id}/play`);
            } else {
              // Open in new tab
              window.open(gameUrl.toString(), '_blank');
            }
          }
        } else {
          // For built-in games, navigate to game interface
          navigate(`/visitor/games/${game._id}/play`, { 
            state: { session: sessionData.session } 
          });
        }

        toast.success('Game started! Good luck!');
      } else {
        throw new Error('Failed to start game session');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game. Please try again.');
    } finally {
      setPlayLoading(false);
    }
  };

  const handleViewGame = (game) => {
    setSelectedGame(game);
    setView('detail');
    navigate(`/visitor/games/${game._id}`);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-yellow-600 bg-yellow-100',
      advanced: 'text-orange-600 bg-orange-100',
      expert: 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      beginner: FaRocket,
      intermediate: FaLevelUpAlt,
      advanced: FaFire,
      expert: FaTrophy
    };
    return icons[difficulty] || FaGamepad;
  };

  // Filter games based on search and filters
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.gameType === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || game.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4 mx-auto" />
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  // Game Detail View
  if (view === 'detail' && selectedGame) {
    const DifficultyIcon = getDifficultyIcon(selectedGame.difficulty);
    
    return (
      <VisitorLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
          <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
              onClick={() => {
                setView('browse');
                navigate('/visitor/games');
              }}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <FaArrowLeft />
              <span>Back to Games</span>
            </button>

          {/* Game Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Game Image */}
              <div className="lg:w-1/3">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  {selectedGame.imageUrl ? (
                    <img
                      src={selectedGame.imageUrl}
                      alt={selectedGame.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <FaGamepad className="text-6xl opacity-75" />
                  )}
                </div>
              </div>

              {/* Game Info */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {selectedGame.title}
                    </h1>
                    <p className="text-gray-600 mb-4">{selectedGame.description}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedGame.difficulty)}`}>
                    <DifficultyIcon className="inline mr-1" />
                    {selectedGame.difficulty}
                  </span>
                </div>

                {/* Game Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedGame.stats?.totalPlays || 0}</div>
                    <div className="text-sm text-gray-500">Total Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedGame.stats?.averageScore || 0}</div>
                    <div className="text-sm text-gray-500">Avg Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedGame.stats?.averageTime || '0m'}</div>
                    <div className="text-sm text-gray-500">Avg Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedGame.rating ? selectedGame.rating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">Rating</div>
                  </div>
                </div>

                {/* Play Button */}
                <button
                  onClick={() => handlePlayGame(selectedGame)}
                  disabled={playLoading || !selectedGame.isPublished}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {playLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Starting Game...
                    </>
                  ) : (
                    <>
                      <FaPlay />
                      Play Game
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Game Content Sections */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Instructions */}
              {selectedGame.instructions && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">How to Play</h3>
                  <div className="prose max-w-none text-gray-700">
                    {selectedGame.instructions.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Your History */}
              {user && gameHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Your Game History</h3>
                  <div className="space-y-3">
                    {gameHistory.slice(0, 5).map((history, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FaTrophy className="text-yellow-500" />
                          <div>
                            <div className="font-medium">Score: {history.score}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(history.playedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          <FaClock className="inline mr-1" />
                          {history.timeSpent}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Game Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Game Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium capitalize">{selectedGame.gameType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{selectedGame.estimatedTime || '15-20 min'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Points:</span>
                    <span className="font-medium text-blue-600">{selectedGame.points || 50}</span>
                  </div>
                  {selectedGame.tags && selectedGame.tags.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedGame.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" />
                    Top Players
                  </h3>
                  <div className="space-y-3">
                    {leaderboard.slice(0, 5).map((player, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium">
                            {player.isCurrentUser ? 'You' : `Player ${index + 1}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{player.highScore}</div>
                          <div className="text-xs text-gray-500">{player.playCount} plays</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </VisitorLayout>
    );
  }

  // Games Browser View
  return (
    <VisitorLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <FaGamepad className="text-blue-600" />
                Interactive Learning Games
              </h1>
              <p className="text-gray-600 mt-2">
                Enhance your heritage knowledge through fun and educational games
              </p>
            </div>
            
            {user && (
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Level {user.stats?.level || 1}</div>
                  <div className="text-gray-500">Your Level</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{user.stats?.totalPoints || 0}</div>
                  <div className="text-gray-500">Total Points</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaStar className="text-yellow-500" />
              Featured Games
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGames.slice(0, 3).map((game) => {
                const DifficultyIcon = getDifficultyIcon(game.difficulty);
                return (
                  <div
                    key={game._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleViewGame(game)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt={game.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaGamepad className="text-4xl opacity-75" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {game.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                          <DifficultyIcon className="inline mr-1" />
                          {game.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {game.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FaUsers />
                            {game.stats?.totalPlays || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaTrophy />
                            {game.stats?.averageScore || 0}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayGame(game);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <FaPlay className="text-xs" />
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {gameCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {difficultyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const DifficultyIcon = getDifficultyIcon(game.difficulty);
            return (
              <div
                key={game._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleViewGame(game)}
              >
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaGamepad className="text-4xl opacity-75" />
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {game.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                      <DifficultyIcon className="inline mr-1" />
                      {game.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaUsers />
                        {game.stats?.totalPlays || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMedal />
                        {game.points || 50}
                      </span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayGame(game);
                      }}
                      disabled={!game.isPublished}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPlay className="text-xs" />
                      Play
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaGamepad className="text-6xl text-gray-300 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Games Found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                ? 'Try adjusting your search filters'
                : 'Games will appear here once they are available'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {user && games.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <FaChartBar />
              Your Gaming Progress
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{user.stats?.gamesPlayed || 0}</div>
                <div className="text-sm text-blue-700">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{user.stats?.bestScore || 0}</div>
                <div className="text-sm text-green-700">Best Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{user.stats?.achievements || 0}</div>
                <div className="text-sm text-purple-700">Achievements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">#{user.stats?.globalRank || 'N/A'}</div>
                <div className="text-sm text-orange-700">Global Rank</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </VisitorLayout>
  );
};

export default Games;
