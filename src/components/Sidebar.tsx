import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Zap,
  Coins,
  Backpack,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Flame,
  Award,
  Users,
  ChevronRight,
  Info,
  Clock,
  Droplet,
  Dumbbell,
  BookOpen,
  Footprints,
} from 'lucide-react';
import { CharacterState, InventoryItem, Quest, RealWorldHabit, Rarity } from '../types';
import { soundEngine } from '../utils/audio';

interface SidebarProps {
  character: CharacterState;
  inventory: InventoryItem[];
  quests: Quest[];
  realWorldHabits: RealWorldHabit[];
  onCompleteHabit: (habit: RealWorldHabit) => void;
  onAddCustomHabit: (taskName: string, mapping: string) => void;
  onUseItem: (item: InventoryItem) => void;
  onOpenCommunity: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  character,
  inventory,
  quests,
  realWorldHabits,
  onCompleteHabit,
  onAddCustomHabit,
  onUseItem,
  onOpenCommunity,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'quests' | 'character'>('quests');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleHabitCheck = (habit: RealWorldHabit) => {
    soundEngine.playSpellCast();
    onCompleteHabit(habit);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskName.trim()) return;
    const mapping = `Completing "${customTaskName}" channels the Leyline of Mastery, restoring 20 Mana and granting 30 Gold!`;
    onAddCustomHabit(customTaskName.trim(), mapping);
    setCustomTaskName('');
    setShowAddHabit(false);
  };

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/60 text-amber-300 bg-amber-500/10 shadow-amber-500/20';
      case 'epic':
        return 'border-purple-500/60 text-purple-300 bg-purple-500/10 shadow-purple-500/20';
      case 'rare':
        return 'border-blue-500/60 text-blue-300 bg-blue-500/10 shadow-blue-500/20';
      default:
        return 'border-slate-700 text-slate-300 bg-slate-800/60';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'health':
        return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case 'productivity':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'mindfulness':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-slate-900 border-l border-slate-800/80 flex flex-col h-full text-slate-200">
      {/* Hero Stats Card */}
      <div className="p-4 border-b border-slate-800 bg-gradient-to-b from-slate-950/80 to-slate-900">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-base text-white font-serif">{character.name}</h2>
            <p className="text-xs text-indigo-400 font-mono">{character.archetype}</p>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
            Lvl {character.level}
          </div>
        </div>

        {/* HP & Energy Bars */}
        <div className="space-y-2 text-xs font-mono">
          <div>
            <div className="flex justify-between mb-0.5 text-slate-400">
              <span className="flex items-center gap-1 text-rose-400">
                <Heart className="w-3 h-3 fill-rose-500/20" /> Health
              </span>
              <span>{character.hp}/{character.maxHp}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, (character.hp / character.maxHp) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-0.5 text-slate-400">
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3 h-3 fill-cyan-500/20" /> Mana / Energy
              </span>
              <span>{character.energy}/{character.maxEnergy}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-600 to-blue-400 h-full transition-all duration-300"
                style={{ width: `${Math.max(0, (character.energy / character.maxEnergy) * 100)}%` }}
              />
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-3.5 h-3.5" />
              <span className="font-bold">{character.gold} Gold</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Alignment: <span className="text-indigo-300">{character.alignment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 font-mono text-xs">
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'quests'
              ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Quests ({quests.length + realWorldHabits.filter((h) => !h.completed).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Backpack className="w-3.5 h-3.5 text-cyan-400" />
          <span>Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('character')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 font-medium transition-colors ${
            activeTab === 'character'
              ? 'border-indigo-500 text-indigo-300 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>Hero</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* QUESTS & REAL WORLD HABITS TAB */}
        {activeTab === 'quests' && (
          <div className="space-y-4">
            {/* Real World Tasks Twist Banner */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>The Daily Covenant</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Completing tasks in your real world channels ancient leylines into your game story!
              </p>
            </div>

            {/* Real World Habits Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Real-World Daily Habits
                </h3>
                <button
                  onClick={() => setShowAddHabit(!showAddHabit)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> Add Task
                </button>
              </div>

              {showAddHabit && (
                <form onSubmit={handleAddSubmit} className="mb-3 p-2.5 rounded-lg bg-slate-950 border border-indigo-500/40 space-y-2">
                  <input
                    type="text"
                    placeholder="E.g., Drink water, Walk 2000 steps, Read..."
                    value={customTaskName}
                    onChange={(e) => setCustomTaskName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddHabit(false)}
                      className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded"
                    >
                      Add Covenant
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {realWorldHabits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      habit.completed
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-800/40 border-slate-700/60 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => handleHabitCheck(habit)}
                        disabled={habit.completed}
                        className="mt-0.5 text-indigo-400 hover:text-indigo-300 transition-colors disabled:cursor-not-allowed"
                      >
                        {habit.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 hover:text-indigo-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-xs ${habit.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {habit.taskName}
                          </span>
                          {getCategoryIcon(habit.category)}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">
                          {habit.storyMapping}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In-Game Story Quests */}
            <div>
              <h3 className="font-mono text-slate-400 uppercase tracking-wider text-[10px] font-bold mb-2">
                Current Story Quests
              </h3>
              <div className="space-y-2">
                {quests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-200">{quest.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          quest.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {quest.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{quest.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-mono">
                      <span>Reward: +{quest.reward.xp} XP, +{quest.reward.gold} Gold</span>
                      {quest.reward.itemName && <span className="text-indigo-300">Item: {quest.reward.itemName}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community D&D Prompt Button */}
            <button
              onClick={onOpenCommunity}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 hover:border-purple-400 text-purple-200 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="font-semibold text-xs">Community D&D Tavern</span>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
              <span>Equipment & Relics</span>
              <span>{inventory.length} Items</span>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 italic">
                Your satchel is empty. Venture into the realm to discover ancient relics!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${getRarityBadge(
                      item.rarity
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-slate-200">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{item.type} • {item.rarity}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUseItem(item);
                        }}
                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded font-mono font-medium transition-colors"
                      >
                        Use
                      </button>
                    </div>

                    {selectedItem?.id === item.id && (
                      <div className="mt-2 pt-2 border-t border-slate-700/50 text-[11px] text-slate-300 space-y-1">
                        <p>{item.description}</p>
                        {item.realWorldBonus && (
                          <p className="text-amber-300 font-mono text-[10px]">
                            ★ {item.realWorldBonus}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHARACTER SHEET TAB */}
        {activeTab === 'character' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
              <h3 className="font-bold text-slate-100 font-serif text-sm">{character.name}</h3>
              <p className="text-slate-300 leading-relaxed">{character.bio}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 font-mono">
              <h4 className="text-slate-400 text-[10px] uppercase font-bold">Visual Style & Consistency</h4>
              <p className="text-[11px] text-indigo-300">{character.artStyleAnchor}</p>
              <div className="pt-2 border-t border-slate-700/50">
                <span className="text-slate-400 text-[10px]">Appearance Descriptor:</span>
                <p className="text-slate-200 text-[11px] italic mt-0.5">{character.appearancePrompt}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
