import React from 'react';
import { 
  Play, 
  Star, 
  Clock, 
  Users,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Import local assets for educational games
import ethiopianHistoryImg from '../../assets/Ethiopian History Fundamentals.jpg';
import coffeeImg from '../../assets/Ethiopian Coffee Culture.jpg';
import archaeologicalImg from '../../assets/Archaeological Wonders.jpg';
import festivalsImg from '../../assets/Ethiopian Festivals and Celebrations.jpg';

const EducationalGames = () => {
  // Educational games using local heritage images
  const educationalGames = [
    {
      id: 1,
      title: 'Ethiopian Kingdoms Quest',
      description: 'Travel through time and explore the great kingdoms of Ethiopia from Aksum to the Zagwe dynasty!',
      category: 'history',
      difficulty: 'Medium',
      playTime: '15-20 min',
      image: ethiopianHistoryImg,
    },
    {
      id: 2,
      title: 'Coffee Culture Quiz',
      description: 'Test your knowledge about Ethiopian coffee culture and the traditional coffee ceremony!',
      category: 'culture',
      difficulty: 'Easy',
      playTime: '5-10 min',
      image: coffeeImg,
    },
    {
      id: 3,
      title: 'Archaeological Treasures Hunt',
      description: 'Discover Ethiopia\'s ancient archaeological wonders and unlock the secrets of the past!',
      category: 'archaeology',
      difficulty: 'Medium',
      playTime: '10-15 min',
      image: archaeologicalImg,
    },
    {
      id: 4,
      title: 'Festival Memory Match',
      description: 'Match traditional festival images and learn about Ethiopian celebrations like Timkat and Meskel!',
      category: 'memory',
      difficulty: 'Easy',
      playTime: '5-8 min',
      image: festivalsImg,
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Educational Games</h2>
          <p className="text-muted-foreground">Learn through play with these interactive heritage games</p>
        </div>
        <Link to="/education/games" className="flex items-center text-primary hover:text-primary/80 font-medium">
          View All Games
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {educationalGames.map(game => (
          <div 
            key={game.id} 
            className="group bg-card rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={game.image} 
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
              
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </span>
              </div>
              
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center text-white text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{game.playTime}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {game.category}
                </span>
              </div>
              
              <h3 className="font-bold text-base mb-2 text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                {game.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {game.description}
              </p>
              
              <button className="w-full bg-primary/10 text-primary py-2 rounded-lg font-semibold hover:bg-primary/20 transition-all duration-300 flex items-center justify-center">
                <Play className="w-4 h-4 mr-2" />
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationalGames;
