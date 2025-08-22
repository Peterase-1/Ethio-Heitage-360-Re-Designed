import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Trophy, 
  Target, 
  Brain, 
  Gamepad2, 
  Zap, 
  Clock, 
  Users, 
  PlayCircle,
  CheckCircle,
  ArrowRight,
  Medal,
  Sparkles,
  RefreshCw,
  Heart,
  Crown
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const Games = ({ darkMode, toggleDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userStats, setUserStats] = useState({
    gamesPlayed: 25,
    highestScore: 1850,
    streak: 7,
    achievements: 12,
    totalPoints: 4250,
    level: 8
  });
  const [activeGame, setActiveGame] = useState(null);
  const [gameInProgress, setGameInProgress] = useState(false);

  const gameCategories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'history', name: 'History', icon: '🏛️' },
    { id: 'culture', name: 'Culture', icon: '🎭' },
    { id: 'geography', name: 'Geography', icon: '🗺️' },
    { id: 'trivia', name: 'Trivia', icon: '🧠' },
    { id: 'puzzle', name: 'Puzzles', icon: '🧩' },
    { id: 'memory', name: 'Memory', icon: '💭' },
    { id: 'arcade', name: 'Arcade', icon: '⚡' }
  ];

  const educationalGames = [
    {
      id: 1,
      title: 'Ethiopian Kingdoms Quest',
      description: 'Travel through time and explore the great kingdoms of Ethiopia from Aksum to the Zagwe dynasty!',
      category: 'history',
      difficulty: 'Medium',
      playTime: '15-20 min',
      players: 1,
      rating: 4.8,
      plays: '12K+',
      image: 'https://picsum.photos/400/300?random=1',
      featured: true,
      tags: ['Adventure', 'Educational', 'Historical'],
      rewards: ['100 XP', 'History Badge', 'Kingdom Explorer']
    },
    {
      id: 2,
      title: 'Coffee Culture Quiz',
      description: 'Test your knowledge about Ethiopian coffee culture and the traditional coffee ceremony!',
      category: 'culture',
      difficulty: 'Easy',
      playTime: '5-10 min',
      players: 1,
      rating: 4.9,
      plays: '8.5K+',
      image: 'https://picsum.photos/400/300?random=2',
      featured: true,
      tags: ['Quiz', 'Culture', 'Coffee'],
      rewards: ['50 XP', 'Coffee Master', 'Cultural Expert']
    },
    {
      id: 3,
      title: 'Ethiopian Geography Challenge',
      description: 'Explore the diverse landscapes of Ethiopia from highlands to lowlands in this interactive map game!',
      category: 'geography',
      difficulty: 'Medium',
      playTime: '10-15 min',
      players: 1,
      rating: 4.7,
      plays: '6.2K+',
      image: 'https://picsum.photos/400/300?random=3',
      featured: false,
      tags: ['Geography', 'Map', 'Exploration'],
      rewards: ['75 XP', 'Explorer Badge', 'Geography Guru']
    },
    {
      id: 4,
      title: 'Festival Memory Match',
      description: 'Match traditional festival images and learn about Ethiopian celebrations like Timkat and Meskel!',
      category: 'memory',
      difficulty: 'Easy',
      playTime: '5-8 min',
      players: 1,
      rating: 4.6,
      plays: '9.8K+',
      image: 'https://picsum.photos/400/300?random=4',
      featured: false,
      tags: ['Memory', 'Festivals', 'Matching'],
      rewards: ['40 XP', 'Memory Master', 'Festival Expert']
    },
    {
      id: 5,
      title: 'Ancient Scripts Puzzle',
      description: 'Decode ancient Ge\'ez scripts and learn about Ethiopian writing systems in this challenging puzzle!',
      category: 'puzzle',
      difficulty: 'Hard',
      playTime: '20-30 min',
      players: 1,
      rating: 4.5,
      plays: '3.7K+',
      image: 'https://picsum.photos/400/300?random=5',
      featured: false,
      tags: ['Puzzle', 'Language', 'Ancient'],
      rewards: ['150 XP', 'Script Scholar', 'Puzzle Master']
    },
    {
      id: 6,
      title: 'Traditional Music Rhythm',
      description: 'Learn traditional Ethiopian instruments and play along with authentic rhythms and melodies!',
      category: 'culture',
      difficulty: 'Medium',
      playTime: '10-15 min',
      players: 1,
      rating: 4.8,
      plays: '5.4K+',
      image: 'https://picsum.photos/400/300?random=6',
      featured: true,
      tags: ['Music', 'Rhythm', 'Instruments'],
      rewards: ['80 XP', 'Music Maestro', 'Rhythm Master']
    },
    {
      id: 7,
      title: 'Archaeological Discovery',
      description: 'Become an archaeologist and uncover ancient artifacts while learning about Ethiopian heritage!',
      category: 'history',
      difficulty: 'Medium',
      playTime: '15-25 min',
      players: 1,
      rating: 4.7,
      plays: '7.1K+',
      image: 'https://picsum.photos/400/300?random=7',
      featured: false,
      tags: ['Archaeology', 'Discovery', 'Adventure'],
      rewards: ['120 XP', 'Archaeologist', 'Artifact Hunter']
    },
    {
      id: 8,
      title: 'Ethiopian Cuisine Cook-Off',
      description: 'Learn to prepare traditional Ethiopian dishes in this fun cooking simulation game!',
      category: 'culture',
      difficulty: 'Easy',
      playTime: '10-15 min',
      players: 1,
      rating: 4.9,
      plays: '11.2K+',
      image: 'https://picsum.photos/400/300?random=8',
      featured: true,
      tags: ['Cooking', 'Food', 'Recipe'],
      rewards: ['70 XP', 'Master Chef', 'Culinary Expert']
    },
    {
      id: 9,
      title: 'Heritage Trivia Challenge',
      description: 'Test your overall knowledge of Ethiopian heritage in this comprehensive trivia game!',
      category: 'trivia',
      difficulty: 'Hard',
      playTime: '20-30 min',
      players: 1,
      rating: 4.6,
      plays: '4.8K+',
      image: 'https://picsum.photos/400/300?random=9',
      featured: false,
      tags: ['Trivia', 'Knowledge', 'Challenge'],
      rewards: ['200 XP', 'Heritage Master', 'Trivia Champion']
    },
    {
      id: 10,
      title: 'Traditional Craft Workshop',
      description: 'Learn about traditional Ethiopian crafts through interactive mini-games and tutorials!',
      category: 'culture',
      difficulty: 'Medium',
      playTime: '15-20 min',
      players: 1,
      rating: 4.7,
      plays: '6.5K+',
      image: 'https://picsum.photos/400/300?random=10',
      featured: false,
      tags: ['Crafts', 'Traditional', 'Workshop'],
      rewards: ['90 XP', 'Craft Master', 'Artisan']
    },
    {
      id: 11,
      title: 'Religious Sites Explorer',
      description: 'Virtually visit and learn about Ethiopian religious sites including Lalibela and ancient churches!',
      category: 'history',
      difficulty: 'Medium',
      playTime: '15-25 min',
      players: 1,
      rating: 4.8,
      plays: '8.9K+',
      image: 'https://picsum.photos/400/300?random=11',
      featured: true,
      tags: ['Religious', 'Virtual Tour', 'History'],
      rewards: ['110 XP', 'Pilgrim', 'Sacred Explorer']
    },
    {
      id: 12,
      title: 'Traditional Dance Steps',
      description: 'Learn traditional Ethiopian dance moves through this interactive rhythm and movement game!',
      category: 'culture',
      difficulty: 'Easy',
      playTime: '8-12 min',
      players: 1,
      rating: 4.6,
      plays: '7.3K+',
      image: 'https://picsum.photos/400/300?random=12',
      featured: false,
      tags: ['Dance', 'Movement', 'Traditional'],
      rewards: ['60 XP', 'Dance Master', 'Cultural Performer']
    }
  ];

  const recentAchievements = [
    { id: 1, title: 'Coffee Connoisseur', description: 'Completed all coffee culture challenges', icon: '☕', earnedAt: '2 hours ago' },
    { id: 2, title: 'History Buff', description: 'Scored 100% on Ethiopian Kingdoms Quiz', icon: '🏛️', earnedAt: '1 day ago' },
    { id: 3, title: 'Culture Explorer', description: 'Played 10 different cultural games', icon: '🎭', earnedAt: '3 days ago' },
    { id: 4, title: 'Learning Streak', description: 'Played games for 7 consecutive days', icon: '🔥', earnedAt: '1 week ago' }
  ];

  const filteredGames = selectedCategory === 'all' 
    ? educationalGames 
    : educationalGames.filter(game => game.category === selectedCategory);

  const featuredGames = educationalGames.filter(game => game.featured);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePlayGame = (game) => {
    setActiveGame(game);
    setGameInProgress(true);
    // In a real app, this would launch the actual game
    setTimeout(() => {
      setGameInProgress(false);
      // Simulate earning rewards
      setUserStats(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalPoints: prev.totalPoints + 50,
        streak: prev.streak + 1
      }));
    }, 3000);
  };

  const renderGameCard = (game, featured = false) => (
    <div 
      key={game.id} 
      className={`group bg-card rounded-3xl overflow-hidden shadow-sm border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
        featured ? 'border-accent/30 ring-2 ring-accent/20' : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
        
        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              <Crown className="w-3 h-3 mr-1" />
              Featured
            </div>
          </div>
        )}
        
        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
        </div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={() => handlePlayGame(game)}
            className="bg-primary-foreground/90 hover:bg-primary-foreground text-primary rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg"
          >
            <PlayCircle className="w-8 h-8" />
          </button>
        </div>
        
        {/* Game stats */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{game.playTime}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
              <span>{game.rating}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {game.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="font-bold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {game.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>{game.plays} plays</span>
          </div>
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            <span>{game.rewards.length} rewards</span>
          </div>
        </div>
        
        <button 
          onClick={() => handlePlayGame(game)}
          className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-3 rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 flex items-center justify-center"
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Play Now
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-primary-foreground/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Gamepad2 className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">Educational Gaming Platform</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Learn Ethiopian Heritage Through Fun Games!
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
                Discover history, culture, and traditions through interactive games, 
                quizzes, and challenges designed to make learning enjoyable and memorable.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-4 bg-primary-foreground text-primary rounded-xl font-semibold hover:bg-primary-foreground/90 transition-colors flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Start Playing
                </button>
                <button className="px-8 py-4 bg-primary/30 border border-primary-foreground/20 text-primary-foreground rounded-xl font-semibold hover:bg-primary/50 transition-colors flex items-center justify-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* User Stats Section */}
        <section className="py-8 bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gamepad2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.gamesPlayed}</div>
                <div className="text-sm text-muted-foreground">Games Played</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.highestScore}</div>
                <div className="text-sm text-muted-foreground">High Score</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.achievements}</div>
                <div className="text-sm text-muted-foreground">Achievements</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Medal className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-card-foreground">{userStats.level}</div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Featured Games</h2>
                <p className="text-muted-foreground">Popular and highly-rated educational games</p>
              </div>
              <button className="flex items-center text-primary hover:text-primary/80 font-medium">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredGames.map(game => renderGameCard(game, true))}
            </div>
          </div>
        </section>

        {/* Game Categories */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Game Categories</h2>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {gameCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-lg transform scale-105'
                      : 'bg-card text-card-foreground hover:bg-muted border border-border'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map(game => renderGameCard(game))}
            </div>
          </div>
        </section>

        {/* Recent Achievements */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Recent Achievements</h2>
                <p className="text-muted-foreground">Your latest gaming accomplishments</p>
              </div>
              <button className="flex items-center text-primary hover:text-primary/80 font-medium">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentAchievements.map(achievement => (
                <div key={achievement.id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4 flex-shrink-0">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-card-foreground mb-1">{achievement.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground/70">{achievement.earnedAt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning Tips */}
        <section className="py-12 bg-gradient-to-r from-accent to-secondary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center bg-primary-foreground/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-5 h-5 mr-2" />
                <span className="text-sm font-semibold">Learning Tips</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-8">Fast Learning Tips for Maximum Fun!</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Play Daily</h3>
                  <p className="text-primary-foreground/90">
                    Consistency is key! Play at least one game daily to maintain your learning streak and earn bonus points.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Challenge Yourself</h3>
                  <p className="text-primary-foreground/90">
                    Try games of different difficulty levels to expand your knowledge and earn more achievements.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Learn Together</h3>
                  <p className="text-primary-foreground/90">
                    Share your achievements and compete with friends to make learning more engaging and social.
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-primary-foreground/10 backdrop-blur-sm rounded-xl">
                <h3 className="text-xl font-bold mb-4">🎯 Daily Challenge</h3>
                <p className="text-lg mb-4">
                  Complete any 3 games today to unlock the "Heritage Explorer" badge and earn 200 bonus points!
                </p>
                <div className="flex items-center justify-center">
                  <div className="bg-primary-foreground/20 rounded-full px-4 py-2 mr-4">
                    <span className="font-semibold">Progress: 1/3 games</span>
                  </div>
                  <button className="bg-primary-foreground text-accent px-6 py-2 rounded-xl font-semibold hover:bg-primary-foreground/90 transition-colors">
                    Start Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Game Loading Modal */}
      {gameInProgress && activeGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-8 max-w-md w-full text-center border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-card-foreground">Loading {activeGame.title}...</h3>
            <p className="text-muted-foreground mb-6">
              Get ready to learn about Ethiopian heritage in a fun and interactive way!
            </p>
            <div className="flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Games;
