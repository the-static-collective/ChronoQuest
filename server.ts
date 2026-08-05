import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory community help requests for the shared D&D system
let communityHelpRequests = [
  {
    id: 'comm-1',
    authorName: 'Paladin Kaelen',
    authorArchetype: 'Dawnbringer Paladin',
    title: 'The Midterm Examination Drake',
    description: 'Paladin Kaelen faces a grueling real-world exam today and seeks a ward of mental clarity.',
    storyContext: 'Kaelen is besieged at the Tower of Wisdom. They need encouragement to hold the citadel gate.',
    realTaskHint: 'Complete a study sprint or send an encouraging chant.',
    supportCount: 7,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comm-2',
    authorName: 'Scout Lyra',
    authorArchetype: 'Sylvan Scout',
    title: 'The Morning Hydration Ritual',
    description: 'Scout Lyra is traversing the Desolate Salt Flats and needs water rations (real-world hydration goal).',
    storyContext: 'Lyra is searching for hidden springs in the Wasteland. Remind them of the Oasis.',
    realTaskHint: 'Drink a glass of water to send a restorative wave across the leylines.',
    supportCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comm-3',
    authorName: 'Tech-Alchemist Jax',
    authorArchetype: 'Neural Netrunner',
    title: 'The Digital Workspace Cleansing',
    description: 'Jax is overburdened by 100 open browser tabs and physical clutter in their sanctum.',
    storyContext: 'Jax is trapped in a maze of rogue data spirits. A clean sanctum spell will purge the glitch.',
    realTaskHint: 'Clean your desk or close 10 idle tabs to cast a Purifying Surge.',
    supportCount: 4,
    createdAt: new Date().toISOString(),
  },
];

// API Routes

// 1. Start Game Session
app.post('/api/game/start', async (req, res) => {
  try {
    const { world, characterName, archetype, customPrompt, realWorldHabits } = req.body;
    const ai = getGenAIClient();

    const worldName = world?.name || 'Sanctuary of Aethelgard';
    const artStyle = world?.artStyleAnchor || 'Luminous fantasy digital painting, vibrant watercolors';
    const location = world?.initialLocation || 'The Grand Citadel';

    const systemInstruction = `You are the Game Master of an infinite choose-your-own-adventure engine called ChronoQuest.
You craft immersive, highly evocative RPG narratives where every choice dynamically alters the world.
THE TWIST: Real-world habits and daily tasks are secretly woven into the story as magical rituals and quests that directly affect story outcomes and character survival!

Produce a structured JSON output for the opening turn of the adventure.
Character Name: ${characterName || 'Valen'}
Archetype: ${archetype || 'Runeweaver Mage'}
Setting: ${worldName} (${location})
Art Style Anchor: ${artStyle}
User Customization: ${customPrompt || 'None'}
Selected Real-World Habits to track: ${JSON.stringify(realWorldHabits || [])}

Instructions:
- Write 2-3 immersive, atmospheric story paragraphs introducing the hero in ${location}.
- Include 3-4 distinct story choices, plus weave 1 choice directly linked to performing a real-world habit (e.g. drinking water, taking a breather, doing focus work).
- Detail an initial inventory item that fits the archetype.
- Define a primary story quest AND 1 real-world task quest mapped into lore.
- Provide a visual image prompt incorporating the character's key visual appearance features and current environment, adhering strictly to the Art Style Anchor.`;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not set
      return res.json({
        storyText: `Welcome, ${characterName || 'Adventurer'}, to ${worldName}. You stand at the threshold of ${location}. The air vibrates with latent arcane energy. Before you lies a mysterious glowing threshold, while to your left an ancient ledger awaits your real-world daily covenants.`,
        choices: [
          { id: 'c1', text: 'Step through the glowing threshold into the unknown.', riskLevel: 'bold' },
          { id: 'c2', text: 'Examine the Arcane Ledger and complete a real-world ritual (Drink Water).', riskLevel: 'safe', realWorldCategory: 'Hydration' },
          { id: 'c3', text: 'Inspect your starting equipment and survey the surroundings.', riskLevel: 'safe' },
        ],
        imagePrompt: `A heroic ${archetype || 'adventurer'} named ${characterName || 'Valen'} standing at ${location}, ${artStyle}`,
        inventoryUpdates: [
          {
            id: 'item-start-1',
            name: `${archetype || 'Hero'} Relic`,
            type: 'artifact',
            description: 'A glowing heirloom that resonates with your real-world daily accomplishments.',
            iconName: 'Sparkles',
            rarity: 'rare',
            realWorldBonus: '+10 Mana when completing daily habits',
          },
        ],
        questUpdates: [
          {
            id: 'q-main-1',
            title: 'Awakening in the Realm',
            description: `Explore the secrets of ${location} and discover the connection between real-world actions and cosmic leylines.`,
            category: 'story',
            status: 'active',
            difficulty: 'easy',
            reward: { xp: 100, gold: 50, itemName: 'Crystal Shard' },
          },
          {
            id: 'q-habit-1',
            title: 'The Covenant of Hydration',
            description: 'Drink a glass of water in real life to bestow the Elixir of Pure Clarity upon your character.',
            category: 'real_world',
            status: 'active',
            difficulty: 'easy',
            realWorldTask: 'Drink a full glass of water',
            reward: { xp: 50, gold: 25 },
          },
        ],
        characterState: {
          name: characterName || 'Valen',
          archetype: archetype || 'Runeweaver Mage',
          bio: `A brave ${archetype} navigating the mysterious paths of ${worldName}.`,
          level: 1,
          xp: 0,
          maxXp: 100,
          hp: 100,
          maxHp: 100,
          energy: 50,
          maxEnergy: 50,
          gold: 25,
          alignment: 'Radiant Guardian',
          artStyleAnchor: artStyle,
          appearancePrompt: `A striking ${archetype} with glowing eyes, ornate tunic, holding a shimmering focus orb`,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Generate the opening chapter of the adventure.',
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storyText: { type: Type.STRING, description: '2-3 immersive narrative paragraphs' },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  realWorldCategory: { type: Type.STRING },
                },
                required: ['id', 'text'],
              },
            },
            imagePrompt: { type: Type.STRING, description: 'Detailed visual prompt for image generation' },
            inventoryItem: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                iconName: { type: Type.STRING },
                rarity: { type: Type.STRING },
                realWorldBonus: { type: Type.STRING },
              },
            },
            primaryQuest: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty: { type: Type.STRING },
              },
            },
            appearancePrompt: { type: Type.STRING, description: 'Consistent physical description of the character' },
          },
          required: ['storyText', 'choices', 'imagePrompt', 'inventoryItem', 'primaryQuest', 'appearancePrompt'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    res.json({
      storyText: parsed.storyText,
      choices: parsed.choices || [],
      imagePrompt: `${parsed.imagePrompt}, ${artStyle}`,
      inventoryUpdates: parsed.inventoryItem ? [parsed.inventoryItem] : [],
      questUpdates: [
        {
          id: 'q-main-1',
          title: parsed.primaryQuest?.title || 'Awakening in the Realm',
          description: parsed.primaryQuest?.description || 'Begin your quest.',
          category: 'story',
          status: 'active',
          difficulty: parsed.primaryQuest?.difficulty || 'medium',
          reward: { xp: 100, gold: 50 },
        },
        {
          id: 'q-habit-1',
          title: 'The Covenant of Hydration',
          description: 'Drink a glass of water in real life to channel the Pure Spring Leyline.',
          category: 'real_world',
          status: 'active',
          difficulty: 'easy',
          realWorldTask: 'Drink a full glass of water',
          reward: { xp: 50, gold: 20 },
        },
      ],
      characterState: {
        name: characterName || 'Valen',
        archetype: archetype || 'Runeweaver Mage',
        bio: `A heroic ${archetype} venturing into ${worldName}.`,
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        energy: 50,
        maxEnergy: 50,
        gold: 30,
        alignment: 'Luminous',
        artStyleAnchor: artStyle,
        appearancePrompt: parsed.appearancePrompt || `A heroic ${archetype} with distinct robes and glowing medallion`,
      },
    });
  } catch (err: any) {
    console.error('Error starting game:', err);
    res.status(500).json({ error: err.message || 'Failed to start story' });
  }
});

// 2. Next Game Action / Turn
app.post('/api/game/action', async (req, res) => {
  try {
    const {
      chosenAction,
      character,
      inventory,
      quests,
      recentStory,
      completedHabits,
      communityAction,
    } = req.body;

    const ai = getGenAIClient();

    const systemInstruction = `You are the AI Game Master of ChronoQuest.
The player has taken an action or completed a real-world task/habit.
Character: ${character.name} (${character.archetype}, Level ${character.level})
Current HP: ${character.hp}/${character.maxHp}, Energy: ${character.energy}/${character.maxEnergy}, Gold: ${character.gold}
Art Style Anchor: ${character.artStyleAnchor}
Character Visual Traits: ${character.appearancePrompt}
Current Inventory: ${JSON.stringify(inventory.map((i: any) => i.name))}
Active Quests: ${JSON.stringify(quests.map((q: any) => q.title))}

PLAYER'S ACTION / INPUT: "${chosenAction}"
${completedHabits && completedHabits.length > 0 ? `REAL-WORLD TASKS COMPLETED IN REAL LIFE: ${JSON.stringify(completedHabits)}. Explicitly weave the real-world achievement into the story narrative as a powerful magical empowerment or breakthrough!` : ''}
${communityAction ? `COMMUNITY ASSIST ACTION: ${JSON.stringify(communityAction)}. Acknowledge how helping another traveler in the community realm invoked divine favor!` : ''}

INSTRUCTIONS:
1. Advance the story dramatically by 2-3 paragraphs.
2. Provide 3-4 new meaningful options.
3. Generate a detailed image prompt that MUST include the character's visual traits ("${character.appearancePrompt}") in the current scene, styled as "${character.artStyleAnchor}".
4. Optionally grant a new inventory item or update quest status if appropriate.
5. Provide stat adjustments (HP, Energy, XP, Gold gained or lost).`;

    if (!ai) {
      // Fallback without API key
      const isHabit = chosenAction.toLowerCase().includes('water') || chosenAction.toLowerCase().includes('task') || (completedHabits && completedHabits.length > 0);
      return res.json({
        storyText: isHabit
          ? `As you complete your real-world covenant, a brilliant surge of golden energy radiates from your palms! The surrounding ambient leyline pulses in harmony. Your vitality is restored (+25 HP, +15 Mana), and a shimmering chest materializes at your feet containing rare alchemical ingredients!`
          : `You decide to "${chosenAction}". Navigating through the shimmering corridors, your footsteps echo softly against ancient stone. Shadows twist in response to your resolve, revealing a hidden archway adorned with glowing runes. A mystery deepens as a voice whispers from the ether.`,
        choices: [
          { id: 'c-next-1', text: 'Step through the runic archway and inspect the glowing altar.', riskLevel: 'bold' },
          { id: 'c-next-2', text: 'Use your equipped relic to channel protective wards.', riskLevel: 'safe' },
          { id: 'c-next-3', text: 'Perform a 5-minute posture reset in real life to fortify your defenses.', riskLevel: 'safe', realWorldCategory: 'Posture' },
        ],
        imagePrompt: `Heroic ${character.appearancePrompt} in an ancient chamber with glowing runic archways, ${character.artStyleAnchor}`,
        statChanges: {
          hpChange: isHabit ? 25 : -5,
          energyChange: isHabit ? 15 : -10,
          xpGained: isHabit ? 45 : 25,
          goldGained: 15,
        },
        newInventoryItem: isHabit ? {
          id: `item-${Date.now()}`,
          name: 'Phial of Astral Dew',
          type: 'consumable',
          description: 'Restores 50 HP and cleanses negative status effects.',
          iconName: 'FlaskConical',
          rarity: 'rare',
        } : null,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Player chooses: ${chosenAction}. Recent story context: ${recentStory || 'Exploring the realm'}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storyText: { type: Type.STRING, description: 'Narrative response paragraphs' },
            choices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  realWorldCategory: { type: Type.STRING },
                },
                required: ['id', 'text'],
              },
            },
            imagePrompt: { type: Type.STRING, description: 'Detailed image prompt keeping consistent character appearance' },
            hpChange: { type: Type.INTEGER },
            energyChange: { type: Type.INTEGER },
            xpGained: { type: Type.INTEGER },
            goldGained: { type: Type.INTEGER },
            newInventoryItem: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                iconName: { type: Type.STRING },
                rarity: { type: Type.STRING },
              },
            },
            questCompletedId: { type: Type.STRING },
            newQuest: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                realWorldTask: { type: Type.STRING },
              },
            },
          },
          required: ['storyText', 'choices', 'imagePrompt', 'xpGained', 'goldGained'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    res.json({
      storyText: parsed.storyText,
      choices: parsed.choices || [],
      imagePrompt: `${parsed.imagePrompt}, ${character.artStyleAnchor}`,
      statChanges: {
        hpChange: parsed.hpChange || 0,
        energyChange: parsed.energyChange || 0,
        xpGained: parsed.xpGained || 20,
        goldGained: parsed.goldGained || 10,
      },
      newInventoryItem: parsed.newInventoryItem ? {
        id: `item-${Date.now()}`,
        name: parsed.newInventoryItem.name,
        type: parsed.newInventoryItem.type || 'artifact',
        description: parsed.newInventoryItem.description,
        iconName: parsed.newInventoryItem.iconName || 'Sparkles',
        rarity: parsed.newInventoryItem.rarity || 'common',
      } : null,
      questCompletedId: parsed.questCompletedId || null,
      newQuest: parsed.newQuest ? {
        id: `q-${Date.now()}`,
        title: parsed.newQuest.title,
        description: parsed.newQuest.description,
        category: parsed.newQuest.category || 'story',
        status: 'active',
        difficulty: 'medium',
        realWorldTask: parsed.newQuest.realWorldTask,
        reward: { xp: 60, gold: 30 },
      } : null,
    });
  } catch (err: any) {
    console.error('Error generating turn:', err);
    res.status(500).json({ error: err.message || 'Failed to generate narrative turn' });
  }
});

// 3. Real-time Image Generation Endpoint (supports 1K, 2K, 4K resolution)
app.post('/api/game/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', imageSize = '1K', artStyleAnchor = '' } = req.body;
    const ai = getGenAIClient();

    const fullPrompt = `${prompt}. Visual Style: ${artStyleAnchor}. Highly detailed, consistent character design, vibrant lighting, clean composition.`;

    if (!ai) {
      // Return SVG placeholder or stylized generated asset fallback if no API key
      return res.json({
        imageUrl: null,
        message: 'No API key configured for live image model. Showing procedural illustration.',
      });
    }

    // Call Gemini Image model
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: (aspectRatio as any) || '1:1',
          imageSize: (imageSize as any) || '1K',
        },
      },
    });

    let imageDataUri = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageDataUri = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    res.json({ imageUrl: imageDataUri });
  } catch (err: any) {
    console.error('Error generating image:', err);
    // Return gracefully so UI can show procedural theme artwork
    res.json({ imageUrl: null, error: err.message });
  }
});

// 4. Community Board Endpoints
app.get('/api/community/quests', (req, res) => {
  res.json({ requests: communityHelpRequests });
});

app.post('/api/community/support', (req, res) => {
  const { requestId, supporterName, message, spellType } = req.body;
  const target = communityHelpRequests.find((r) => r.id === requestId);
  if (target) {
    target.supportCount += 1;
  }
  res.json({
    success: true,
    message: `You cast "${spellType || 'Ward of Encouragement'}" for ${target?.authorName || 'a fellow traveler'}! Both of your realms gain +25 Fate XP.`,
    updatedRequest: target,
  });
});

app.post('/api/community/create-request', (req, res) => {
  const { authorName, authorArchetype, title, description, storyContext, realTaskHint } = req.body;
  const newReq = {
    id: `comm-${Date.now()}`,
    authorName: authorName || 'Anonymous Traveler',
    authorArchetype: authorArchetype || 'Adventurer',
    title: title || 'Real-World Task Challenge',
    description: description || 'Seeking moral support from the tavern network.',
    storyContext: storyContext || 'Facing a difficult trial in the outer wilderness.',
    realTaskHint: realTaskHint || 'Completing a daily habit together.',
    supportCount: 1,
    createdAt: new Date().toISOString(),
  };
  communityHelpRequests.unshift(newReq);
  res.json({ success: true, newRequest: newReq });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChronoQuest server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
