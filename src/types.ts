export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'consumable' | 'artifact' | 'quest_item' | 'relic';

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  iconName: string;
  rarity: Rarity;
  quantity?: number;
  effect?: string;
  realWorldBonus?: string;
}

export type QuestCategory = 'story' | 'real_world' | 'community';
export type QuestStatus = 'active' | 'completed' | 'failed';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'boss';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  status: QuestStatus;
  difficulty: QuestDifficulty;
  realWorldTask?: string; // The real life habit/task associated
  progress?: number;
  maxProgress?: number;
  reward: {
    xp: number;
    gold: number;
    itemName?: string;
    itemDescription?: string;
  };
  narrativeImpact?: string; // How completing this alters the story
}

export interface CharacterState {
  name: string;
  archetype: string;
  bio: string;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  alignment: string;
  artStyleAnchor: string;
  appearancePrompt: string; // Describes visual traits for consistent image prompt generation
}

export interface CommunityHelpRequest {
  id: string;
  authorName: string;
  authorArchetype: string;
  title: string;
  description: string;
  storyContext: string;
  realTaskHint: string;
  supportCount: number;
  supportedByMe?: boolean;
  createdAt: string;
}

export interface Choice {
  id: string;
  text: string;
  riskLevel?: 'safe' | 'bold' | 'perilous';
  statRequirement?: string;
  realWorldCategory?: string; // e.g., 'Hydration', 'Focus', 'Movement'
}

export interface StoryTurn {
  id: string;
  turnNumber: number;
  storyText: string;
  choices: Choice[];
  imagePrompt: string;
  imageUrl?: string;
  imageSize: '1K' | '2K' | '4K';
  realWorldImpactSummary?: string;
  timestamp: string;
}

export interface GameWorldPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  artStyleAnchor: string;
  defaultArchetypes: string[];
  initialLocation: string;
  icon: string;
}

export interface RealWorldHabit {
  id: string;
  taskName: string;
  category: 'health' | 'productivity' | 'mindfulness' | 'social' | 'custom';
  frequency: 'daily' | 'once';
  completed: boolean;
  storyMapping: string; // How this translates in game lore
}
