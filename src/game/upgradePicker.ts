import { AttributeDefinition, HeroKey } from '../types/game';
import { ATTRIBUTE_POOL, SKILL_UPGRADE_TRAITS } from './constants';

export interface AutoUpgradeChoice {
  traitId: string;
  traitTitle: string;
  attr: AttributeDefinition;
}

const RARITY_SCORE: Record<AttributeDefinition['rarity'], number> = {
  common: 6,
  rare: 16,
  epic: 28,
  legendary: 40
};

export function pickAutoUpgrade(params: {
  heroKey: HeroKey;
  level: number;
  activeSkillIds: string[];
  unlockedTraits: Set<string>;
  acquiredAttributes: Set<string>;
}): AutoUpgradeChoice {
  const { heroKey, level, activeSkillIds, unlockedTraits, acquiredAttributes } = params;

  // 1. Pick first/best available skill trait from active skills
  const availableTraits: { id: string; title: string }[] = [];
  for (const skId of activeSkillIds) {
    const traits = SKILL_UPGRADE_TRAITS[skId] || [];
    for (const t of traits) {
      if (!unlockedTraits.has(t.id)) {
        availableTraits.push({ id: t.id, title: t.title });
      }
    }
  }

  const chosenTrait = availableTraits.length > 0
    ? availableTraits[Math.floor(Math.random() * Math.min(3, availableTraits.length))]
    : { id: 'default_mastery', title: 'Combat Overload' };

  // 2. Pick highest-synergy / highest-tier eligible relic attribute
  const eligible = ATTRIBUTE_POOL.filter(attr => attr.stackable || !acquiredAttributes.has(attr.id));
  const pool = eligible.length > 0 ? eligible : ATTRIBUTE_POOL.filter(attr => attr.stackable);

  const highTierPool = pool.filter(a =>
    level >= 2 ? (a.rarity === 'epic' || a.rarity === 'legendary') : a.rarity !== 'common'
  );
  const candidatePool = highTierPool.length > 0 ? highTierPool : pool;

  let bestAttr = candidatePool[0] || ATTRIBUTE_POOL[0];
  let bestScore = -Infinity;

  for (const attr of candidatePool) {
    const synergyBonus = attr.recommendedHeroes?.includes(heroKey) ? 45 : 0;
    const rarityScore = RARITY_SCORE[attr.rarity] ?? 10;
    const score = synergyBonus + rarityScore + Math.random() * 14;
    if (score > bestScore) {
      bestScore = score;
      bestAttr = attr;
    }
  }

  return {
    traitId: chosenTrait.id,
    traitTitle: chosenTrait.title,
    attr: bestAttr
  };
}
