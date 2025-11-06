import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizAPI, progressAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quiz() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [result, setResult] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [topicCompleted, setTopicCompleted] = useState(false);
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: quizAPI.getSubjects
  });

  const { data: subjectDetail } = useQuery({
    queryKey: ['subject', selectedSubject],
    queryFn: () => quizAPI.getSubject(selectedSubject),
    enabled: !!selectedSubject
  });

  const submitAnswerMutation = useMutation({
    mutationFn: progressAPI.submitAnswer,
    onSuccess: (data) => {
      setResult(data.data);
      setShowFeedback(true);

      // Add current question to answered list
      if (currentQuestion) {
        setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
      }

      queryClient.invalidateQueries(['user-stats']);
      queryClient.invalidateQueries(['progress']);

      if (data.data.isCorrect) {
        toast.success('Correct! 🎉');
      } else {
        toast.error(`Incorrect. Answer: ${data.data.correctAnswer}`);
      }
    }
  });

  const loadQuestion = async (topicId, answered = []) => {
    try {
      const question = await quizAPI.getRandomQuestion(topicId, answered);

      // Check if topic is completed
      if (question.completed) {
        setTopicCompleted(true);
        setCurrentQuestion(null);
        toast.success(question.message);
        return;
      }

      setCurrentQuestion(question.question);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setResult(null);
      setTopicCompleted(false);
    } catch (error) {
      toast.error('Failed to load question');
      console.error(error);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
    setAnsweredQuestions([]);
    setTopicCompleted(false);
    loadQuestion(topicId, []);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !currentQuestion) return;

    submitAnswerMutation.mutate({
      topicId: currentQuestion.topicId,
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
      timeTaken: 0
    });
  };

  const handleNext = () => {
    loadQuestion(selectedTopic, answeredQuestions);
  };

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-4xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          Quiz
        </h1>

        {!selectedSubject && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Select a Subject</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjects?.subjects.map((subject) => (
                <motion.div
                  key={subject.slug}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedSubject(subject.slug)}
                  className="glass-card p-6 cursor-pointer"
                >
                  <BookOpen className="w-8 h-8 text-cosmic-400 mb-2" />
                  <h3 className="font-bold">{subject.subjectName}</h3>
                  <p className="text-sm text-gray-400">{subject.topicCount} topics</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedSubject && !selectedTopic && (
          <div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="mb-4 text-cosmic-400 hover:text-cosmic-300"
            >
              ← Back to subjects
            </button>
            <h2 className="text-2xl font-bold mb-4">Select a Topic</h2>
            <div className="grid grid-cols-1 gap-3">
              {subjectDetail?.subject.topics.map((topic) => (
                <motion.div
                  key={topic.topicId}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleTopicSelect(topic.topicId)}
                  className="glass-card p-4 cursor-pointer"
                >
                  <h3 className="font-semibold">{topic.title}</h3>
                  <p className="text-sm text-gray-400">{topic.questionCount} questions</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {selectedTopic && topicCompleted && (
          <div className="glass-card p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mb-6"
            >
              <CheckCircle className="w-20 h-20 text-neon-green mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2 text-neon-green font-orbitron">
                TOPIC COMPLETED!
              </h2>
              <p className="text-gray-400 font-rajdhani">
                You've answered all questions in this topic.
              </p>
            </motion.div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setTopicCompleted(false);
                  setAnsweredQuestions([]);
                }}
                className="btn-primary"
              >
                [ SELECT ANOTHER TOPIC ]
              </button>
              <button
                onClick={() => {
                  setAnsweredQuestions([]);
                  setTopicCompleted(false);
                  loadQuestion(selectedTopic, []);
                }}
                className="glass-card px-6 py-3 rounded-lg border border-neon-cyan/30 hover:border-neon-cyan/50 transition-all font-rajdhani tracking-wider"
              >
                [ RESTART TOPIC ]
              </button>
            </div>
          </div>
        )}

        {selectedTopic && currentQuestion && !topicCompleted && (
          <div className="glass-card p-8">
            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedTopic(null);
                  setCurrentQuestion(null);
                }}
                className="text-cosmic-400 hover:text-cosmic-300"
              >
                ← Back to topics
              </button>
            </div>

            <h2 className="text-xl font-bold mb-2">{currentQuestion.topicTitle}</h2>
            <p className="text-sm text-gray-400 mb-6">{currentQuestion.subjectName}</p>

            <div className="bg-gradient-to-r from-cosmic-900/50 to-cosmic-800/50 p-6 rounded-xl mb-6">
              <p className="text-lg">{currentQuestion.question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => !showFeedback && setSelectedAnswer(option[0])}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedAnswer === option[0]
                      ? 'bg-cosmic-600 border-2 border-cosmic-400'
                      : 'glass-card hover:bg-white/10'
                  } ${
                    showFeedback && result?.correctAnswer === option[0]
                      ? 'border-2 border-green-500'
                      : showFeedback && selectedAnswer === option[0] && !result?.isCorrect
                      ? 'border-2 border-red-500'
                      : ''
                  }`}
                >
                  {option}
                </motion.button>
              ))}
            </div>

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-6 flex items-center ${
                  result?.isCorrect ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
                }`}
              >
                {result?.isCorrect ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-green-400 font-semibold">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-400 mr-2" />
                    <span className="text-red-400 font-semibold">
                      Incorrect. Correct answer: {result?.correctAnswer}
                    </span>
                  </>
                )}
              </motion.div>
            )}

            <div className="flex gap-4">
              {!showFeedback ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer || submitAnswerMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {submitAnswerMutation.isPending ? 'Submitting...' : 'Submit Answer'}
                </button>
              ) : (
                <button onClick={handleNext} className="btn-primary flex-1">
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
