import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, XCircle, RefreshCw, Sparkles, ChevronRight, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { generateQuiz } from '../../services/api';

export const QuizGenerator = () => {
  const { activeDocument } = useStudy();
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [focusTopic, setFocusTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartQuiz = async () => {
    if (!activeDocument) {
      setError('Please upload or select a document first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuizQuestions(null);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setScore(0);
    setIsCompleted(false);

    try {
      const res = await generateQuiz({
        documentId: activeDocument.id,
        count: questionCount,
        difficulty,
        focusTopic: focusTopic.trim()
      });

      if (res?.data?.questions && res.data.questions.length > 0) {
        setQuizQuestions(res.data.questions);
      } else {
        throw new Error('No quiz questions could be generated. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    if (selectedAnswers[currentIndex] !== undefined) return;

    const currentQuestion = quizQuestions[currentIndex];
    const isCorrect = optionIndex === currentQuestion.correctIndex;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
    setShowExplanation(true);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(selectedAnswers[currentIndex + 1] !== undefined);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setScore(0);
    setIsCompleted(false);
  };

  const currentQ = quizQuestions ? quizQuestions[currentIndex] : null;
  const currentAnswer = selectedAnswers[currentIndex];
  const hasAnsweredCurrent = currentAnswer !== undefined;

  return (
    <div className="space-y-6">
      {/* Quiz Controls & Configuration */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Interactive AI Quiz Generator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Test and reinforce your understanding with dynamically crafted exam-style MCQs from your material.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Question Count */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value={3}>3 Questions (Quick Test)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Comprehensive)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value="easy">Easy (Definitions & Recall)</option>
              <option value="medium">Medium (Conceptual Application)</option>
              <option value="hard">Hard (Deep Analysis & Multi-step)</option>
            </select>
          </div>

          {/* Optional Focus */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Focus (Optional)</label>
            <input
              type="text"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="e.g., Activation functions..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleStartQuiz}
            disabled={isLoading || !activeDocument}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-sm shadow-indigo-600/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating Quiz with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{quizQuestions ? 'Generate New Quiz' : 'Start Quiz'}</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Quiz Play Area */}
      {quizQuestions && !isCompleted && currentQ && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm animate-fade-in">
          {/* Header & Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span className="font-bold text-indigo-700">
                Question {currentIndex + 1} of {quizQuestions.length}
              </span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-slate-700">Score: {score} / {currentIndex + (hasAnsweredCurrent ? 1 : 0)}</span>
                {currentQ.concept && (
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                    {currentQ.concept}
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQ.question}
          </h4>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = currentAnswer === idx;
              const isCorrect = idx === currentQ.correctIndex;
              let btnClass = 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-slate-100 text-slate-800';

              if (hasAnsweredCurrent) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-red-50 border-red-400 text-red-950';
                } else {
                  btnClass = 'bg-slate-50/40 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnsweredCurrent}
                  className={`w-full p-4 rounded-xl border text-left text-sm transition flex items-center justify-between ${btnClass}`}
                >
                  <div className="flex items-center space-x-3.5">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-xs font-bold flex items-center justify-center flex-shrink-0 text-slate-700 shadow-2xs">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {hasAnsweredCurrent && (
                    <div className="flex-shrink-0 ml-2">
                      {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {hasAnsweredCurrent && showExplanation && (
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1 animate-fade-in">
              <p className="font-bold text-indigo-900 flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Answer Explanation:</span>
              </p>
              <p className="leading-relaxed pl-5 text-slate-700">{currentQ.explanation}</p>
            </div>
          )}

          {/* Next Action Button */}
          {hasAnsweredCurrent && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20"
              >
                <span>{currentIndex < quizQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completion Scorecard */}
      {isCompleted && quizQuestions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-6 max-w-lg mx-auto shadow-md animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-white shadow-md shadow-indigo-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">Quiz Completed!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Assessment on: {activeDocument?.filename}
            </p>
          </div>

          {/* Score Badge */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 inline-block w-full">
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {score} / {quizQuestions.length}
            </span>
            <p className="text-xs text-slate-600 mt-1 font-semibold">
              Score: {Math.round((score / quizQuestions.length) * 100)}%
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {score === quizQuestions.length
              ? '🎉 Flawless Score! You have thoroughly mastered this study material.'
              : score >= quizQuestions.length * 0.7
              ? '👏 Great job! You have a solid grasp of the core concepts.'
              : '💡 Good practice! Review the document summary and try again to reinforce key points.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={handleStartQuiz}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold transition flex items-center justify-center space-x-1.5 shadow-sm shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate New Questions</span>
            </button>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!quizQuestions && !isLoading && (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-white shadow-2xs">
          <Award className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No active quiz session</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Choose your difficulty and question count above, then click "Start Quiz" to generate an assessment.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
