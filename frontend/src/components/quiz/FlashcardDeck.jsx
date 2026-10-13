import React, { useState } from 'react';
import { Layers, RotateCcw, ChevronLeft, ChevronRight, CheckCircle, RefreshCw, Sparkles, Shuffle, AlertCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { generateFlashcards } from '../../services/api';

export const FlashcardDeck = () => {
  const { activeDocument } = useStudy();
  const [cardCount, setCardCount] = useState(6);
  const [focusTopic, setFocusTopic] = useState('');
  const [flashcards, setFlashcards] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateCards = async () => {
    if (!activeDocument) {
      setError('Please upload or select a document first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCards(new Set());

    try {
      const res = await generateFlashcards({
        documentId: activeDocument.id,
        count: cardCount,
        focusTopic: focusTopic.trim()
      });

      if (res?.data?.flashcards && res.data.flashcards.length > 0) {
        setFlashcards(res.data.flashcards);
      } else {
        throw new Error('No flashcards could be generated. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (!flashcards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (!flashcards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    if (!flashcards) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMastered = (cardId) => {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const currentCard = flashcards ? flashcards[currentIndex] : null;
  const isCurrentMastered = currentCard ? masteredCards.has(currentCard.id) : false;

  return (
    <div className="space-y-6">
      {/* Controls & Options */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Active Recall Flashcards</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Master definitions, theorems, and formulas with interactive 3D flip cards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Cards</label>
            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white"
            >
              <option value={4}>4 Cards (Quick Review)</option>
              <option value={6}>6 Cards (Standard Deck)</option>
              <option value={10}>10 Cards (Deep Study)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Filter (Optional)</label>
            <input
              type="text"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              placeholder="e.g., Definitions, Formulas..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerateCards}
            disabled={isLoading || !activeDocument}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-sm shadow-purple-600/20"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Crafting Cards with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{flashcards ? 'Regenerate Flashcards' : 'Generate Flashcards'}</span>
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

      {/* Flashcard Player Area */}
      {flashcards && currentCard && (
        <div className="space-y-4 max-w-xl mx-auto">
          {/* Top Deck Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-medium">
            <span className="font-bold text-purple-700">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-700 font-semibold">
                Mastered: {masteredCards.size} / {flashcards.length}
              </span>
              <button
                onClick={handleShuffle}
                className="hover:text-slate-900 transition flex items-center space-x-1"
                title="Shuffle card deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {/* Interactive Flip Card (3D) */}
          <div
            onClick={handleToggleFlip}
            className="cursor-pointer h-72 rounded-2xl p-4 perspective-1000 transition-transform duration-200 hover:scale-[1.01]"
          >
            <div
              className={`w-full h-full relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between border shadow-sm transition-all duration-500 transform-style-3d ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/80 border-purple-300'
                  : 'bg-white border-indigo-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {currentCard.tag || (isFlipped ? 'Definition' : 'Prompt / Term')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono font-medium">
                  {isFlipped ? 'BACK (Answer)' : 'FRONT (Click to flip)'}
                </span>
              </div>

              {/* Card Core Content */}
              <div className="py-4 text-center my-auto">
                <p className={`font-bold transition-all ${isFlipped ? 'text-sm text-slate-800 leading-relaxed text-left sm:text-center' : 'text-lg sm:text-xl text-slate-900'}`}>
                  {isFlipped ? currentCard.back : currentCard.front}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/80 pt-3">
                <span className="text-slate-400 flex items-center space-x-1">
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Click to flip</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMastered(currentCard.id);
                  }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md font-semibold transition ${
                    isCurrentMastered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isCurrentMastered ? 'Mastered' : 'Mark Mastered'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToggleFlip}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4 text-purple-600" />
              <span>{isFlipped ? 'Show Front' : 'Flip to Answer'}</span>
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs transition"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Initial Empty State */}
      {!flashcards && !isLoading && (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 bg-white shadow-2xs">
          <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-700">No active flashcard deck</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Click "Generate Flashcards" above to transform your document into 3D spaced-repetition study cards.
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
