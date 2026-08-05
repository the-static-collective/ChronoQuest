import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Maximize2,
  RefreshCw,
  Mic,
  MicOff,
  Flame,
  Shield,
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
  Layers,
} from 'lucide-react';
import { Choice, StoryTurn } from '../types';
import { soundEngine } from '../utils/audio';

interface GameCanvasProps {
  turns: StoryTurn[];
  isGenerating: boolean;
  onSelectChoice: (choiceText: string) => void;
  onRegenerateImage: (turnIndex: number, imageSize: '1K' | '2K' | '4K', aspectRatio: string) => void;
  artStyleAnchor: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  turns,
  isGenerating,
  onSelectChoice,
  onRegenerateImage,
  artStyleAnchor,
}) => {
  const [customAction, setCustomAction] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const endOfStoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfStoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isGenerating]);

  const latestTurn = turns[turns.length - 1];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isGenerating) return;
    soundEngine.playClick();
    onSelectChoice(customAction.trim());
    setCustomAction('');
  };

  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    if (!isListening) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCustomAction(transcript);
      };

      recognition.start();
    } else {
      setIsListening(false);
    }
  };

  const getRiskStyle = (risk?: string) => {
    switch (risk) {
      case 'perilous':
        return 'border-rose-500/50 bg-rose-950/30 text-rose-200 hover:bg-rose-900/40 hover:border-rose-400';
      case 'bold':
        return 'border-amber-500/50 bg-amber-950/30 text-amber-200 hover:bg-amber-900/40 hover:border-amber-400';
      default:
        return 'border-indigo-500/40 bg-indigo-950/30 text-indigo-200 hover:bg-indigo-900/40 hover:border-indigo-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Scrollable Story History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {turns.map((turn, index) => {
          const isLatest = index === turns.length - 1;

          return (
            <article
              key={turn.id}
              className={`max-w-4xl mx-auto space-y-6 transition-all ${
                isLatest ? 'opacity-100' : 'opacity-85 hover:opacity-100'
              }`}
            >
              {/* Turn Chapter Header */}
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-2 font-mono text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-800">
                  Chapter {turn.turnNumber}
                </span>
                <span className="text-slate-500">•</span>
                <span>{turn.timestamp}</span>
              </div>

              {/* Generated Scene Image Block */}
              {turn.imageUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                  <img
                    src={turn.imageUrl}
                    alt={turn.imagePrompt}
                    referrerPolicy="no-referrer"
                    className="w-full max-h-[480px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                  {/* Image Controls Overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => setFullscreenImage(turn.imageUrl || null)}
                      className="p-2 rounded-lg bg-slate-900/80 backdrop-blur text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
                      title="Fullscreen Image View"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Image Resolution & Art Style Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur text-[10px] font-mono text-amber-300 border border-amber-500/30">
                      Resolution: {turn.imageSize || imageSize}
                    </span>
                  </div>
                </div>
              ) : (
                /* Procedural Art Style Card when Image is generating or fallback */
                <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-400 max-w-lg font-serif italic">
                    "{turn.imagePrompt}"
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Style Anchor: {artStyleAnchor}</span>
                  </div>
                </div>
              )}

              {/* Story Text Paragraphs */}
              <div className="prose prose-invert max-w-none text-slate-200 text-base sm:text-lg leading-relaxed font-serif space-y-4">
                {turn.storyText.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-indigo-400">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Real World Impact Banner */}
              {turn.realWorldImpactSummary && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 font-mono">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Real-World Catalyst: {turn.realWorldImpactSummary}</span>
                </div>
              )}
            </article>
          );
        })}

        {/* Thinking / Generating Indicator */}
        {isGenerating && (
          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/30 flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
            <span className="text-sm font-serif text-indigo-300">
              The AI Game Master is weaving your next chapter and rendering the canvas...
            </span>
          </div>
        )}

        <div ref={endOfStoryRef} />
      </div>

      {/* Control Bar & Choices Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 space-y-4 z-20">
        {/* Quality Controls Toolbar (Image size 1K, 2K, 4K & aspect ratio) */}
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gen-AI Image Resolution:</span>
            <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`px-2.5 py-0.5 rounded text-[10px] transition-colors ${
                    imageSize === size ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Aspect Ratio:</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded px-2 py-0.5 text-[10px] focus:outline-none"
            >
              <option value="1:1">1:1 Square</option>
              <option value="16:9">16:9 Banner</option>
              <option value="4:3">4:3 Landscape</option>
              <option value="9:16">9:16 Mobile</option>
            </select>

            {latestTurn && (
              <button
                onClick={() => onRegenerateImage(turns.length - 1, imageSize, aspectRatio)}
                disabled={isGenerating}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px]"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Render Artwork</span>
              </button>
            )}
          </div>
        </div>

        {/* Choice Buttons */}
        {latestTurn && !isGenerating && (
          <div className="max-w-4xl mx-auto space-y-2">
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Choose Your Action:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {latestTurn.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectChoice(choice.text);
                  }}
                  className={`p-3 rounded-xl border text-left text-sm font-serif transition-all duration-200 flex items-start gap-2.5 shadow-md ${getRiskStyle(
                    choice.riskLevel
                  )}`}
                >
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5 opacity-80" />
                  <span className="flex-1">{choice.text}</span>
                  {choice.realWorldCategory && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                      {choice.realWorldCategory}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Freeform Custom Action Input + Speech Dictation */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Or command your hero freely (e.g., 'Draw my sword and cast a shield ward')..."
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                disabled={isGenerating}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pr-10 font-serif"
              />
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isListening ? 'text-red-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!customAction.trim() || isGenerating}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-mono shrink-0"
            >
              <span>Action</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div
          onClick={() => setFullscreenImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen Realm Visual"
            className="max-w-full max-h-full rounded-2xl border border-slate-800 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
