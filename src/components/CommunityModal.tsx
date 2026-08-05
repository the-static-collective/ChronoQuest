import React, { useState, useEffect } from 'react';
import { X, Users, Sparkles, Heart, Send, Shield, MessageSquare, Plus } from 'lucide-react';
import { CommunityHelpRequest } from '../types';
import { soundEngine } from '../utils/audio';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  archetype: string;
  onCommunityAssist: (request: CommunityHelpRequest, spellName: string) => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  isOpen,
  onClose,
  characterName,
  archetype,
  onCommunityAssist,
}) => {
  const [requests, setRequests] = useState<CommunityHelpRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [realTaskHint, setRealTaskHint] = useState('');

  const fetchCommunityQuests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/quests');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch community quests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCommunityQuests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSupportClick = async (reqItem: CommunityHelpRequest) => {
    soundEngine.playSpellCast();
    try {
      const spellName = 'Aegis of Encouragement';
      const res = await fetch('/api/community/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqItem.id,
          supporterName: characterName,
          spellType: spellName,
        }),
      });
      const data = await res.json();
      onCommunityAssist(reqItem, spellName);
      fetchCommunityQuests();
    } catch (err) {
      console.error('Support error:', err);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      await fetch('/api/community/create-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: characterName,
          authorArchetype: archetype,
          title,
          description,
          storyContext: `Traveler ${characterName} is battling real-world challenges and seeks the tavern's blessing.`,
          realTaskHint: realTaskHint || 'Complete a daily task to empower this beacon!',
        }),
      });
      setTitle('');
      setDescription('');
      setRealTaskHint('');
      setShowCreateForm(false);
      fetchCommunityQuests();
    } catch (err) {
      console.error('Create request error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white font-serif">Tethered Souls Tavern</h2>
              <p className="text-xs text-purple-300">
                Quietly aid fellow heroes with real-world tasks and story support.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Active Community Beacons ({requests.length})
          </span>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Beacon</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {showCreateForm && (
            <form onSubmit={handleCreateSubmit} className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
              <h3 className="font-bold text-sm text-purple-300 font-serif">Post a Community Moral Beacon</h3>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Challenge / Real-World Goal Title</label>
                <input
                  type="text"
                  placeholder="E.g., Conquering the Project Presentation Drake"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Story & Task Context</label>
                <textarea
                  placeholder="Describe your real-world challenge or task where you need moral encouragement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Real-World Task Encouragement Hint</label>
                <input
                  type="text"
                  placeholder="E.g., 'Drink a glass of water to cast a ward of focus for me!'"
                  value={realTaskHint}
                  onChange={(e) => setRealTaskHint(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded text-xs"
                >
                  Broadcast to Realm
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-slate-400 font-mono">
              Fetching community tavern signals...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">
              No active community distress beacons found. Be the first to post!
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/40 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-serif">{item.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {item.authorArchetype}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">By {item.authorName}</p>
                    </div>

                    <button
                      onClick={() => handleSupportClick(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-mono text-[11px] shadow-sm transition-all shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cast Ward (+1 Support)</span>
                    </button>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{item.description}</p>

                  <div className="p-2.5 rounded-lg bg-slate-950/80 border border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between font-mono">
                    <span>Task Hint: {item.realTaskHint}</span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Heart className="w-3.5 h-3.5 fill-amber-400/20" />
                      {item.supportCount} Wards
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
