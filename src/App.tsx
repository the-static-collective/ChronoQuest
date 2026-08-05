import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GameCanvas } from './components/GameCanvas';
import { CharacterSetup } from './components/CharacterSetup';
import { CommunityModal } from './components/CommunityModal';
import {
  CharacterState,
  GameWorldPreset,
  InventoryItem,
  Quest,
  RealWorldHabit,
  StoryTurn,
  CommunityHelpRequest,
} from './types';
import { soundEngine } from './utils/audio';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // Game session states
  const [world, setWorld] = useState<GameWorldPreset | null>(null);
  const [character, setCharacter] = useState<CharacterState | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [realWorldHabits, setRealWorldHabits] = useState<RealWorldHabit[]>([]);
  const [turns, setTurns] = useState<StoryTurn[]>([]);

  // Start new game session
  const handleStartGame = async (
    selectedWorld: GameWorldPreset,
    charName: string,
    arch: string,
    customPrompt: string,
    habits: RealWorldHabit[]
  ) => {
    setIsLoading(true);
    setWorld(selectedWorld);
    setRealWorldHabits(habits);

    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: selectedWorld,
          characterName: charName,
          archetype: arch,
          customPrompt,
          realWorldHabits: habits,
        }),
      });

      const data = await res.json();

      const newChar = data.characterState as CharacterState;
      setCharacter(newChar);
      setInventory(data.inventoryUpdates || []);
      setQuests(data.questUpdates || []);

      const firstTurn: StoryTurn = {
        id: `turn-1`,
        turnNumber: 1,
        storyText: data.storyText,
        choices: data.choices || [],
        imagePrompt: data.imagePrompt,
        imageSize: '1K',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTurns([firstTurn]);
      setGameStarted(true);

      // Trigger initial artwork generation in background
      generateTurnImage(0, data.imagePrompt, newChar.artStyleAnchor, '1K', '1:1');
    } catch (err) {
      console.error('Error starting adventure:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to generate image for a turn
  const generateTurnImage = async (
    turnIndex: number,
    prompt: string,
    artStyleAnchor: string,
    imageSize: '1K' | '2K' | '4K' = '1K',
    aspectRatio: string = '1:1'
  ) => {
    try {
      const res = await fetch('/api/game/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          artStyleAnchor,
          imageSize,
          aspectRatio,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setTurns((prev) =>
          prev.map((t, idx) =>
            idx === turnIndex ? { ...t, imageUrl: data.imageUrl, imageSize } : t
          )
        );
      }
    } catch (err) {
      console.error('Image gen error:', err);
    }
  };

  // Handle choice selection or freeform command
  const handleSelectChoice = async (choiceText: string) => {
    if (!character || isGenerating) return;

    setIsGenerating(true);

    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chosenAction: choiceText,
          character,
          inventory,
          quests,
          recentStory: turns[turns.length - 1]?.storyText,
        }),
      });

      const data = await res.json();

      // Apply stat updates
      if (data.statChanges) {
        setCharacter((prev) => {
          if (!prev) return prev;
          const newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + (data.statChanges.hpChange || 0)));
          const newEnergy = Math.min(
            prev.maxEnergy,
            Math.max(0, prev.energy + (data.statChanges.energyChange || 0))
          );
          let newXp = prev.xp + (data.statChanges.xpGained || 0);
          let newLevel = prev.level;
          let newMaxXp = prev.maxXp;

          if (newXp >= prev.maxXp) {
            newLevel += 1;
            newXp -= prev.maxXp;
            newMaxXp = Math.round(prev.maxXp * 1.5);
            soundEngine.playLevelUp();
          }

          return {
            ...prev,
            hp: newHp,
            energy: newEnergy,
            xp: newXp,
            level: newLevel,
            maxXp: newMaxXp,
            gold: prev.gold + (data.statChanges.goldGained || 0),
          };
        });
      }

      // Add new inventory item if granted
      if (data.newInventoryItem) {
        setInventory((prev) => [...prev, data.newInventoryItem]);
      }

      // Add new quest if assigned
      if (data.newQuest) {
        setQuests((prev) => [...prev, data.newQuest]);
      }

      // Update turn history
      const newTurnNumber = turns.length + 1;
      const newTurn: StoryTurn = {
        id: `turn-${newTurnNumber}`,
        turnNumber: newTurnNumber,
        storyText: data.storyText,
        choices: data.choices || [],
        imagePrompt: data.imagePrompt,
        imageSize: '1K',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedTurns = [...turns, newTurn];
      setTurns(updatedTurns);

      // Trigger scene image generation
      generateTurnImage(
        updatedTurns.length - 1,
        data.imagePrompt,
        character.artStyleAnchor,
        '1K',
        '1:1'
      );
    } catch (err) {
      console.error('Error submitting choice:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Complete real-world habit
  const handleCompleteHabit = (habit: RealWorldHabit) => {
    setRealWorldHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? { ...h, completed: true } : h))
    );

    // Trigger narrative intervention for real-world habit completion
    handleSelectChoice(`Completed real-life ritual: "${habit.taskName}". ${habit.storyMapping}`);
  };

  // Add custom real-world habit
  const handleAddCustomHabit = (taskName: string, mapping: string) => {
    const newHabit: RealWorldHabit = {
      id: `habit-${Date.now()}`,
      taskName,
      category: 'custom',
      frequency: 'daily',
      completed: false,
      storyMapping: mapping,
    };
    setRealWorldHabits((prev) => [...prev, newHabit]);
  };

  // Use inventory item
  const handleUseItem = (item: InventoryItem) => {
    soundEngine.playSpellCast();
    // Heal HP or Energy
    setCharacter((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        hp: Math.min(prev.maxHp, prev.hp + 30),
        energy: Math.min(prev.maxEnergy, prev.energy + 20),
      };
    });
    // Remove item
    setInventory((prev) => prev.filter((i) => i.id !== item.id));
    handleSelectChoice(`Used ${item.name} from inventory: ${item.description}`);
  };

  // Community assist action
  const handleCommunityAssist = (request: CommunityHelpRequest, spellName: string) => {
    handleSelectChoice(
      `Casted "${spellName}" in the Community Tavern to aid traveler ${request.authorName} with their real-world task ("${request.title}").`
    );
  };

  // Export Adventure Journal as Markdown
  const handleExportJournal = () => {
    if (!character || turns.length === 0) return;

    let md = `# Chronicles of ${character.name}\n`;
    md += `**Realm:** ${world?.name || 'ChronoQuest Realm'}\n`;
    md += `**Hero Class:** ${character.archetype} (Level ${character.level})\n`;
    md += `**Export Date:** ${new Date().toLocaleDateString()}\n\n`;
    md += `---\n\n`;

    turns.forEach((turn) => {
      md += `## Chapter ${turn.turnNumber}\n\n`;
      md += `${turn.storyText}\n\n`;
      if (turn.imagePrompt) {
        md += `*Scene Artwork Prompt:* ${turn.imagePrompt}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name}-Chronicles.md`;
    a.click();
  };

  // Restart session
  const handleRestartSession = () => {
    if (window.confirm('Start a new adventure and reset current progress?')) {
      setGameStarted(false);
      setTurns([]);
      setCharacter(null);
    }
  };

  if (!gameStarted) {
    return <CharacterSetup onStartGame={handleStartGame} isLoading={isLoading} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Bar */}
      <Header
        realmName={world?.name || 'Arcane Realm'}
        characterName={character?.name || 'Hero'}
        level={character?.level || 1}
        xp={character?.xp || 0}
        maxXp={character?.maxXp || 100}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onRestartSession={handleRestartSession}
        onExportJournal={handleExportJournal}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Game Interface: Canvas + Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <GameCanvas
          turns={turns}
          isGenerating={isGenerating}
          onSelectChoice={handleSelectChoice}
          onRegenerateImage={(turnIdx, size, aspect) => {
            const t = turns[turnIdx];
            if (t && character) {
              generateTurnImage(turnIdx, t.imagePrompt, character.artStyleAnchor, size, aspect);
            }
          }}
          artStyleAnchor={character?.artStyleAnchor || ''}
        />

        <Sidebar
          character={
            character || {
              name: 'Hero',
              archetype: 'Warrior',
              bio: '',
              level: 1,
              xp: 0,
              maxXp: 100,
              hp: 100,
              maxHp: 100,
              energy: 50,
              maxEnergy: 50,
              gold: 0,
              alignment: 'Neutral',
              artStyleAnchor: '',
              appearancePrompt: '',
            }
          }
          inventory={inventory}
          quests={quests}
          realWorldHabits={realWorldHabits}
          onCompleteHabit={handleCompleteHabit}
          onAddCustomHabit={handleAddCustomHabit}
          onUseItem={handleUseItem}
          onOpenCommunity={() => setIsCommunityOpen(true)}
        />
      </div>

      {/* Community D&D Tavern Board Modal */}
      <CommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        characterName={character?.name || 'Traveler'}
        archetype={character?.archetype || 'Hero'}
        onCommunityAssist={handleCommunityAssist}
      />
    </div>
  );
}
