import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  Globe,
  Volume2,
  Book,
  Star,
  Search,
  Filter,
  Heart,
  Play,
  Users,
  Award,
  Clock,
  Bookmark,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const LanguageGuide = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  // Language categories with phrases
  const languageCategories = {
    basics: {
      name: 'Basic Greetings',
      icon: Users,
      phrases: [
        { amharic: 'ሰላም', pronunciation: 'selam', english: 'Hello/Peace', audio: null },
        { amharic: 'እንደምን አደርክ?', pronunciation: 'indemin aderk?', english: 'How are you? (to male)', audio: null },
        { amharic: 'እንደምን አደርሽ?', pronunciation: 'indemin adersh?', english: 'How are you? (to female)', audio: null },
        { amharic: 'ደህና ነኝ', pronunciation: 'dehna negn', english: 'I am fine', audio: null },
        { amharic: 'አመሰግናለሁ', pronunciation: 'amesegnalehu', english: 'Thank you', audio: null },
        { amharic: 'ይቅርታ', pronunciation: 'yikirta', english: 'Excuse me/Sorry', audio: null },
        { amharic: 'ደህና ሁን', pronunciation: 'dehna hun', english: 'Goodbye (to male)', audio: null },
        { amharic: 'ደህና ሁኚ', pronunciation: 'dehna huni', english: 'Goodbye (to female)', audio: null }
      ]
    },
    numbers: {
      name: 'Numbers',
      icon: Award,
      phrases: [
        { amharic: 'አንድ', pronunciation: 'and', english: 'One', audio: null },
        { amharic: 'ሁለት', pronunciation: 'hulet', english: 'Two', audio: null },
        { amharic: 'ሶስት', pronunciation: 'sost', english: 'Three', audio: null },
        { amharic: 'አራት', pronunciation: 'arat', english: 'Four', audio: null },
        { amharic: 'አምስት', pronunciation: 'amist', english: 'Five', audio: null },
        { amharic: 'ስድስት', pronunciation: 'sidist', english: 'Six', audio: null },
        { amharic: 'ሰባት', pronunciation: 'sebat', english: 'Seven', audio: null },
        { amharic: 'ስምንት', pronunciation: 'simint', english: 'Eight', audio: null },
        { amharic: 'ዘጠኝ', pronunciation: 'zetegn', english: 'Nine', audio: null },
        { amharic: 'አስር', pronunciation: 'aser', english: 'Ten', audio: null }
      ]
    },
    family: {
      name: 'Family',
      icon: Heart,
      phrases: [
        { amharic: 'እናት', pronunciation: 'enat', english: 'Mother', audio: null },
        { amharic: 'አባት', pronunciation: 'abat', english: 'Father', audio: null },
        { amharic: 'ወንድም', pronunciation: 'wendim', english: 'Brother', audio: null },
        { amharic: 'እህት', pronunciation: 'ehit', english: 'Sister', audio: null },
        { amharic: 'ልጅ', pronunciation: 'lij', english: 'Child', audio: null },
        { amharic: 'ጓደኛ', pronunciation: 'guadegna', english: 'Friend', audio: null },
        { amharic: 'ቤተሰብ', pronunciation: 'beteseb', english: 'Family', audio: null }
      ]
    },
    food: {
      name: 'Food & Drink',
      icon: Clock,
      phrases: [
        { amharic: 'ኢንጀራ', pronunciation: 'injera', english: 'Injera (traditional bread)', audio: null },
        { amharic: 'ዶሮ ወጥ', pronunciation: 'doro wet', english: 'Chicken stew', audio: null },
        { amharic: 'ቡና', pronunciation: 'buna', english: 'Coffee', audio: null },
        { amharic: 'ወተት', pronunciation: 'wetet', english: 'Milk', audio: null },
        { amharic: 'ዳቦ', pronunciation: 'dabo', english: 'Bread', audio: null },
        { amharic: 'ውሃ', pronunciation: 'wuha', english: 'Water', audio: null },
        { amharic: 'ምግብ', pronunciation: 'migib', english: 'Food', audio: null },
        { amharic: 'ጣፋጭ', pronunciation: 'tafach', english: 'Sweet/Delicious', audio: null }
      ]
    },
    directions: {
      name: 'Directions',
      icon: Globe,
      phrases: [
        { amharic: 'የት?', pronunciation: 'yet?', english: 'Where?', audio: null },
        { amharic: 'እዚህ', pronunciation: 'ezih', english: 'Here', audio: null },
        { amharic: 'እዚያ', pronunciation: 'eziya', english: 'There', audio: null },
        { amharic: 'ቀኝ', pronunciation: 'kegn', english: 'Right', audio: null },
        { amharic: 'ግራ', pronunciation: 'gira', english: 'Left', audio: null },
        { amharic: 'ቀጥ ብሎ', pronunciation: 'ket bilo', english: 'Straight', audio: null },
        { amharic: 'ቅርብ', pronunciation: 'kirib', english: 'Near', audio: null },
        { amharic: 'ሩቅ', pronunciation: 'ruk', english: 'Far', audio: null }
      ]
    },
    time: {
      name: 'Time & Calendar',
      icon: Clock,
      phrases: [
        { amharic: 'ዛሬ', pronunciation: 'zare', english: 'Today', audio: null },
        { amharic: 'ትናንት', pronunciation: 'tinant', english: 'Yesterday', audio: null },
        { amharic: 'ነገ', pronunciation: 'nege', english: 'Tomorrow', audio: null },
        { amharic: 'ሳምንት', pronunciation: 'samint', english: 'Week', audio: null },
        { amharic: 'ወር', pronunciation: 'wer', english: 'Month', audio: null },
        { amharic: 'አመት', pronunciation: 'amet', english: 'Year', audio: null },
        { amharic: 'ሰዓት', pronunciation: 'seat', english: 'Hour/Time', audio: null },
        { amharic: 'ደቂቃ', pronunciation: 'dekika', english: 'Minute', audio: null }
      ]
    }
  };

  const handlePlayAudio = (phrase) => {
    // Placeholder for audio functionality
    toast.success(`Playing pronunciation for: ${phrase.english}`);
  };

  const toggleFavorite = (phrase) => {
    const newFavorites = new Set(favorites);
    const phraseKey = `${phrase.amharic}-${phrase.english}`;
    
    if (newFavorites.has(phraseKey)) {
      newFavorites.delete(phraseKey);
      toast.success('Removed from favorites');
    } else {
      newFavorites.add(phraseKey);
      toast.success('Added to favorites');
    }
    
    setFavorites(newFavorites);
  };

  const filteredPhrases = languageCategories[selectedCategory]?.phrases.filter(phrase =>
    phrase.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
    phrase.amharic.includes(searchQuery) ||
    phrase.pronunciation.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const CategoryIcon = languageCategories[selectedCategory]?.icon || Globe;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Amharic Language Guide</h1>
                <p className="text-gray-600 mt-1">Learn essential Amharic phrases and pronunciation</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Phrases</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {Object.values(languageCategories).reduce((sum, cat) => sum + cat.phrases.length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Categories</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {Object.keys(languageCategories).length}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-600">Favorites</span>
                </div>
                <p className="text-2xl font-bold text-red-600 mt-1">{favorites.size}</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Audio Available</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search phrases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download Guide
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Categories Sidebar */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {Object.entries(languageCategories).map(([key, category]) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedCategory === key
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <span className="block font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">{category.phrases.length} phrases</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-span-9">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <CategoryIcon className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {languageCategories[selectedCategory]?.name}
                    </h2>
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                      {filteredPhrases.length} phrases
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4">
                    {filteredPhrases.map((phrase, index) => {
                      const phraseKey = `${phrase.amharic}-${phrase.english}`;
                      const isFavorite = favorites.has(phraseKey);
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <div className="text-2xl font-bold text-green-800" style={{ fontFamily: 'Nyala, serif' }}>
                                  {phrase.amharic}
                                </div>
                                <div className="text-lg text-blue-600 font-medium">
                                  [{phrase.pronunciation}]
                                </div>
                              </div>
                              <div className="text-gray-700 font-medium">
                                {phrase.english}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePlayAudio(phrase)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Play pronunciation"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleFavorite(phrase)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isFavorite 
                                    ? 'text-red-600 bg-red-50' 
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`${phrase.amharic} [${phrase.pronunciation}] - ${phrase.english}`);
                                  toast.success('Phrase copied to clipboard');
                                }}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Copy phrase"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredPhrases.length === 0 && (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No phrases found</h3>
                      <p className="text-gray-600">Try adjusting your search or select a different category.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Tips */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Learning Tips
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Practice pronunciation by listening to native speakers</li>
                  <li>• Start with basic greetings and common phrases</li>
                  <li>• Amharic is written from left to right using the Ge'ez script</li>
                  <li>• Use favorites to create your personal study list</li>
                  <li>• Practice regularly - even 5 minutes daily helps!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageGuide;
