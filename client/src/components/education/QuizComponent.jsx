import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  RefreshCw, 
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const QuizComponent = ({ courseId, quizData, onQuizComplete }) => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quizData?.timeLimit || 300); // 5 minutes default
  const [quizStarted, setQuizStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Default quiz data if none provided
  const defaultQuizData = {
    title: "Ethiopian Heritage Knowledge Quiz",
    description: "Test your knowledge about Ethiopian culture, history, and heritage",
    timeLimit: 300,
    questions: [
      {
        id: 1,
        question: "Which ancient kingdom is considered the predecessor of modern Ethiopia?",
        options: [
          "Kingdom of Aksum",
          "Kingdom of Kush",
          "Kingdom of Nubia",
          "Kingdom of Sheba"
        ],
        correctAnswer: 0,
        explanation: "The Kingdom of Aksum was a major ancient trading empire centered in what is now northern Ethiopia and Eritrea."
      },
      {
        id: 2,
        question: "What is the most famous rock-hewn church complex in Ethiopia?",
        options: [
          "Debre Damo",
          "Lalibela",
          "Gheralta",
          "Abuna Yemata Guh"
        ],
        correctAnswer: 1,
        explanation: "Lalibela is famous for its eleven rock-hewn churches carved directly into volcanic rock in the 12th century."
      },
      {
        id: 3,
        question: "Lucy, one of the most famous early human fossils, was discovered in which region of Ethiopia?",
        options: [
          "Omo Valley",
          "Danakil Depression",
          "Afar Region",
          "Simien Mountains"
        ],
        correctAnswer: 2,
        explanation: "Lucy was discovered in 1974 in the Afar Region by paleoanthropologist Donald Johanson."
      },
      {
        id: 4,
        question: "Which script is traditionally used to write Amharic and other Ethiopian languages?",
        options: [
          "Latin script",
          "Arabic script",
          "Ge'ez script",
          "Coptic script"
        ],
        correctAnswer: 2,
        explanation: "Ge'ez script, also known as Ethiopic script, is an ancient South Semitic script used in Ethiopia and Eritrea."
      },
      {
        id: 5,
        question: "The Ethiopian Orthodox Church is part of which larger Christian tradition?",
        options: [
          "Eastern Orthodox",
          "Roman Catholic",
          "Oriental Orthodox",
          "Protestant"
        ],
        correctAnswer: 2,
        explanation: "The Ethiopian Orthodox Church is part of the Oriental Orthodox communion, which separated from other Christian churches in the 5th century."
      }
    ]
  };

  const quiz = quizData || defaultQuizData;

  // Timer effect
  useEffect(() => {
    let timer;
    if (quizStarted && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleQuizSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, quizCompleted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setShowResults(false);
    setScore(0);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    return Math.round((correctAnswers / quiz.questions.length) * 100);
  };

  const handleQuizSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setQuizCompleted(true);
    setShowResults(true);
    
    // Save quiz result
    const quizResult = {
      courseId: courseId,
      quizTitle: quiz.title,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      correctAnswers: Object.keys(selectedAnswers).filter(
        key => selectedAnswers[key] === quiz.questions[key].correctAnswer
      ).length,
      timeSpent: quiz.timeLimit - timeLeft,
      completedAt: new Date().toISOString()
    };

    // Call completion callback if provided
    if (onQuizComplete) {
      onQuizComplete(quizResult);
    }

    // Show success message
    if (finalScore >= 70) {
      toast.success(`Congratulations! You scored ${finalScore}%`);
    } else {
      toast.info(`Quiz completed with ${finalScore}%. Consider reviewing the material.`);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setShowResults(false);
    setScore(0);
    setTimeLeft(quiz.timeLimit);
  };

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {quiz.description}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{quiz.questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.ceil(quiz.timeLimit / 60)}</div>
              <div className="text-sm text-gray-600">Minutes</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">70%</div>
              <div className="text-sm text-gray-600">Pass Score</div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center mx-auto"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = Object.keys(selectedAnswers).filter(
      key => selectedAnswers[key] === quiz.questions[key].correctAnswer
    ).length;

    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            score >= 70 ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {score >= 70 ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {score >= 70 ? 'Congratulations!' : 'Quiz Completed'}
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            {score >= 70 
              ? 'You passed the quiz! Great knowledge of Ethiopian heritage.'
              : 'Consider reviewing the material and trying again.'
            }
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{score}%</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{correctCount}/{quiz.questions.length}</div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600">{formatTime(quiz.timeLimit - timeLeft)}</div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
          </div>
        </div>

        {/* Review Answers */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900">Review Your Answers</h3>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Question {index + 1}: {question.question}
              </h4>
              
              <div className="space-y-2 mb-4">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg border ${
                      optionIndex === question.correctAnswer
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {optionIndex === question.correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      )}
                      {selectedAnswers[index] === optionIndex && optionIndex !== question.correctAnswer && (
                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                      )}
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleRetakeQuiz}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Quiz
          </button>
          
          {score >= 70 && (
            <button
              onClick={() => window.history.back()}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Continue Learning
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <p className="text-gray-600">Question {currentQuestion + 1} of {quiz.questions.length}</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">{formatTime(timeLeft)}</div>
          <div className="text-sm text-gray-600">Time remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQ.question}
        </h3>
        
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuestion, index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                selectedAnswers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === index && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswers[currentQuestion] === undefined}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
        >
          {currentQuestion === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default QuizComponent;
