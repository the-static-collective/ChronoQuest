import React, { useState } from 'react';
import { Sparkles, Shield, Wand2, Cpu, Leaf, Cog, ArrowRight, Check } from 'lucide-react';
import { WORLD_PRESETS, DEFAULT_REAL_WORLD_HABITS } from '../data/initialWorlds';
import { GameWorldPreset, RealWorldHabit } from '../types';

interface CharacterSetupProps {
  onStartGame: (
    world: GameWorldPreset,
    characterName: string,
    archetype: string,
    customPrompt: string,
    selectedHabits: RealWorldHabit[]
  ) => void;
  isLoading: boolean;
}

export const CharacterSetup: React.FC<CharacterSetupProps> = ({ onStartGame, isLoading }) => {
  const [selectedWorld, setSelectedWorld] = useState<GameWorldPreset>(WORLD_PRESETS[0]);
  const [characterName, setCharacterName] = useState('Valen');
  const [archetype, setArchetype] = useState(WORLD_PRESETS[0].defaultArchetypes[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<RealWorldHabit[]>(DEFAULT_REAL_WORLD_HABITS);

  const handleWorldSelect = (world: GameWorldPreset) => {
    setSelectedWorld(world);
    setArchetype(world.defaultArchetypes[0]);
  };

  const toggleHabit = (habitId: string) => {
    setSelectedHabits((prev) => {
      const exists = prev.some((h) => h.id === habitId);
      if (exists) {
        return prev.filter((h) => h.id !== habitId);
      } else {
        const found = DEFAULT_REAL_WORLD_HABITS.find((h) => h.id === habitId);
        return found ? [...prev, found] : prev;
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(selectedWorld, characterName, archetype, customPrompt, selectedHabits);
  };

  const getWorldIcon = (icon: string) => {
    switch (icon) {
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-emerald-400" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-amber-400" />;
      default:
        return <Wand2 className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Infinite AI Choose-Your-Own-Adventure Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
            ChronoQuest
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Choose your setting, forge your hero, and bind real-world daily habits to your story's magical fate.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* Step 1: Select Realm */}
          <div className="space-y-3">
            <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Step 1: Choose Your Realm & Art Style
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WORLD_PRESETS.map((world) => (
                <div
                  key={world.id}
                  onClick={() => handleWorldSelect(world)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedWorld.id === world.id
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        {getWorldIcon(world.icon)}
                      </div>
                      <h3 className="font-bold text-sm text-white font-serif">{world.name}</h3>
                    </div>
                    {selectedWorld.id === world.id && (
                      <Check className="w-4 h-4 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-xs text-indigo-300 font-mono mb-1">{world.tagline}</p>
                  <p className="text-xs text-slate-400 leading-normal line-clamp-2">{world.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Hero Identity */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              Step 2: Forge Your Character
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Hero Class / Archetype
                </label>
                <select
                  value={archetype}
                  onChange={(e) => setArchetype(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {selectedWorld.defaultArchetypes.map((arch) => (
                    <option key={arch} value={arch}>
                      {arch}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Visual Traits / Appearance Anchor (for image consistency)
              </label>
              <input
                type="text"
                placeholder="E.g., Silver hair, glowing blue eyes, obsidian shoulder armor..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
            </div>
          </div>

          {/* Step 3: Select Real-World Daily Habits ("The Twist") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                Step 3: Bind Real-World Daily Habits ("The Daily Covenant")
              </h2>
              <span className="text-[11px] text-amber-400 font-mono">
                {selectedHabits.length} Habits Bound
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Select daily habits to track. Completing these in real life bestows story spells, health restoration, and rare items!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEFAULT_REAL_WORLD_HABITS.map((habit) => {
                const isSelected = selectedHabits.some((h) => h.id === habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-950/30 text-slate-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-white">{habit.taskName}</p>
                      <p className="text-[11px] text-slate-400 italic mt-0.5">{habit.storyMapping}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-bold text-base transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 font-mono disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Weaving Realm & Initializing Leylines...</span>
              </>
            ) : (
              <>
                <span>Begin ChronoQuest Adventure</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
