import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FaPlay, FaPause, FaForward, FaBackward, FaRandom, FaEye, FaEyeSlash, FaCheck, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';

const Flashcards = () => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [studyMode, setStudyMode] = useState('sequential');
  const [selectedDeck, setSelectedDeck] = useState('all');
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });

  useEffect(() => {
    fetchFlashcards();
    fetchDecks();
  }, [selectedDeck]);

  const fetchFlashcards = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDeck !== 'all') params.append('category', selectedDeck);
      
      const response = await fetch(`/api/flashcards/published?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }

      const data = await response.json();
      setFlashcards(data || []);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast.error('Failed to load flashcards');
      
      // Mock data fallback
      setFlashcards([
        {
          _id: '1',
          question: 'What is the ancient name of Ethiopia?',
          answer: 'Abyssinia. The name Ethiopia comes from the Greek word "Aithiopia," meaning "land of the burnt faces."',
          category: 'History',
          difficulty: 'easy',
          lastReviewed: null,
          nextReview: new Date(),
          correctCount: 0,
          incorrectCount: 0
        },
        {
          _id: '2',
          question: 'Which kingdom is known for building the rock churches of Lalibela?',
          answer: 'The Zagwe dynasty, particularly under King Lalibela in the 12th-13th centuries, constructed these remarkable monolithic churches.',
          category: 'Architecture',
          difficulty: 'medium',
          lastReviewed: null,
          nextReview: new Date(),
          correctCount: 0,
          incorrectCount: 0
        },
        {
          _id: '3',
          question: 'What is the significance of Lucy (Australopithecus afarensis)?',
          answer: 'Lucy is a 3.2 million-year-old fossil discovered in Ethiopia in 1974, representing one of the most complete early human ancestors and providing crucial evidence for human evolution.',
          category: 'Paleontology',
          difficulty: 'hard',
          lastReviewed: null,
          nextReview: new Date(),
          correctCount: 0,
          incorrectCount: 0
        },
        {
          _id: '4',
          question: 'What are the main steps in the Ethiopian coffee ceremony?',
          answer: 'The ceremony involves washing the green coffee beans, roasting them in a pan while walking around to share the aroma, grinding by hand, brewing in a jebena, and serving in three rounds: Abol, Tona, and Baraka.',
          category: 'Culture',
          difficulty: 'medium',
          lastReviewed: null,
          nextReview: new Date(),
          correctCount: 0,
          incorrectCount: 0
        },
        {
          _id: '5',
          question: 'Which Ethiopian emperor is known for defeating the Italian invasion at the Battle of Adwa?',
          answer: 'Emperor Menelik II led Ethiopia to victory against Italian forces at the Battle of Adwa on March 1, 1896, maintaining Ethiopian independence.',
          category: 'History',
          difficulty: 'medium',
          lastReviewed: null,
          nextReview: new Date(),
          correctCount: 0,
          incorrectCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/flashcards/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDecks(data.map(category => ({
          _id: category.name.toLowerCase(),
          name: category.name,
          cardCount: category.count
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
      // Mock decks
      setDecks([
        { _id: 'history', name: 'History', cardCount: 15 },
        { _id: 'culture', name: 'Culture', cardCount: 12 },
        { _id: 'architecture', name: 'Architecture', cardCount: 8 },
        { _id: 'paleontology', name: 'Paleontology', cardCount: 5 }
      ]);
    }
  };

  const startStudySession = () => {
    setIsStudying(true);
    setCurrentCard(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0, total: 0 });
    
    if (studyMode === 'random') {
      shuffleCards();
    }
  };

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentCard(0);
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(prev => prev + 1);
      setShowAnswer(false);
    } else if (isStudying) {
      endStudySession();
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  const markAnswer = async (isCorrect) => {
    const card = flashcards[currentCard];
    
    try {
      await fetch(`/api/flashcards/${card._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ correct: isCorrect })
      });
    } catch (error) {
      console.error('Error marking answer:', error);
    }

    // Update local stats
    setSessionStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1,
      total: prev.total + 1
    }));

    // Auto-advance after marking
    setTimeout(() => {
      nextCard();
    }, 1000);
  };

  const endStudySession = () => {
    setIsStudying(false);
    toast.success(`Study session completed! ${sessionStats.correct}/${sessionStats.total + 1} correct`);
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Flashcards Yet</h3>
            <p className="text-gray-500 mb-8">
              No flashcards are currently available for study. Check back later!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                📚 Flashcards
              </h1>
              <p className="text-gray-600 mt-2">Learn Ethiopian heritage with spaced repetition</p>
            </div>
          </div>
        </div>

        {!isStudying ? (
          // Study Setup
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Study Setup</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deck
                </label>
                <select
                  value={selectedDeck}
                  onChange={(e) => setSelectedDeck(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Cards ({flashcards.length})</option>
                  {decks.map(deck => (
                    <option key={deck._id} value={deck._id}>
                      {deck.name} ({deck.cardCount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Mode
                </label>
                <select
                  value={studyMode}
                  onChange={(e) => setStudyMode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="sequential">Sequential</option>
                  <option value="random">Random</option>
                  <option value="review">Due for Review</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={startStudySession}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlay />
                  Start Studying
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{flashcards.length}</div>
                <div className="text-sm text-blue-700">Total Cards</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {flashcards.filter(card => card.correctCount > card.incorrectCount).length}
                </div>
                <div className="text-sm text-green-700">Mastered</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {flashcards.filter(card => !card.lastReviewed).length}
                </div>
                <div className="text-sm text-yellow-700">New Cards</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {flashcards.filter(card => new Date(card.nextReview) <= new Date()).length}
                </div>
                <div className="text-sm text-red-700">Due Now</div>
              </div>
            </div>
          </div>
        ) : (
          // Study Session
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Card {currentCard + 1} of {flashcards.length}
                </span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">✓ {sessionStats.correct}</span>
                  <span className="text-red-600">✗ {sessionStats.incorrect}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentCard + 1) / flashcards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Flashcard */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-8 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(flashcards[currentCard].difficulty)}`}>
                    {flashcards[currentCard].difficulty}
                  </span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                    {flashcards[currentCard].category}
                  </span>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-2xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      {flashcards[currentCard].question}
                    </h3>
                    
                    {showAnswer && (
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {flashcards[currentCard].answer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FaEye />
                      Show Answer
                    </button>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => markAnswer(false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaTimes />
                        Incorrect
                      </button>
                      <button
                        onClick={() => markAnswer(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <FaCheck />
                        Correct
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousCard}
                  disabled={currentCard === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaBackward />
                  Previous
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    {showAnswer ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <button
                    onClick={shuffleCards}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <FaRandom />
                  </button>
                </div>

                <button
                  onClick={nextCard}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Next
                  <FaForward />
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={endStudySession}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                <FaPause className="inline mr-2" />
                End Session
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Flashcards;
