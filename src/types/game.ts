export type GameState = 
  | 'TITLE' 
  | 'CHARACTER_SELECT' 
  | 'SKILL_SELECT' 
  | 'PLAYING' 
  | 'LEVEL_UP' 
  | 'PAUSED' 
  | 'GAME_OVER' 
  | 'VICTORY';

export type GameMode = 'arena' | 'practice';

export type HeroKey = 'monkey' | 'demonis' | 'traveler' | 'valkyrie' | 'dimension_judge' | 'rift_walker' | 'soul_puppeteer' | 'solaris' | 'fallen_angel' | 'demon_raised' | 'elementalis' | 'arcana' | 'morphos';

export type BossCategory = 'Tank' | 'Warrior' | 'Assassin' | 'Manipulation';

export type TravelerStance = 'sword' | 'bow' | 'staff';

export type ArcanaSuit = 'spade' | 'heart' | 'diamond' | 'club';

export type MorphosForm = 'wolf' | 'behemoth' | 'wyvern' | 'chimera';

export interface SkillDefinition {
  id: string;
  name: string;
  cd: number; // base cooldown in seconds
  desc: string;
  icon: string;
  type: 'attack' | 'aoe' | 'buff' | 'control' | 'ultimate';
  level: number;
  maxLevel: number;
  isUnique?: boolean;
  lockedUnique?: boolean;
}

export interface AttributeDefinition {
  id: string;
  title: string;
  desc: string;
  category: 'offense' | 'defense' | 'utility' | 'unique';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  stackable?: boolean;
  recommendedHeroes?: HeroKey[];
}

export interface HeroConfig {
  key: HeroKey;
  name: string;
  subtitle: string;
  color: string;
  secondaryColor: string;
  hp: number;
  atk: number;
  atkSpeed: number;
  critChance: number;
  critDmg: number;
  range: number;
  speed: number;
  defense: number;
  lore: string;
  passiveName: string;
  passiveDesc: string;
  bossCategory?: BossCategory;
  skills: SkillDefinition[];
}

export type EnemyResistPreset = 'none' | 'physical' | 'magical' | 'both';

export interface DpsSample {
  t: number;
  dps: number;
}

export interface CombatStats {
  kills: number;
  wave: number;
  waveDr?: number;
  enemiesRemaining?: number;
  timeSurvived: number;
  damageDealt: number;
  highestCrit: number;
  damageTaken: number;
  level: number;
  dps?: number;
  dpsHistory?: DpsSample[];
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  atkSpeed: number;
  critChance: number;
  critDmg: number;
  speed: number;
  range: number;
  defense: number;
  cdr: number;
  evasion: number;
  lifesteal: number;
  level: number;
  exp: number;
  maxExp: number;
  demonisStacks: number;
  demonisFCD: number;
  travelerStance: TravelerStance;
  travelerTimeStacks: number;
  travelerParadoxHits?: number;
  travelerRewindReady: boolean;
  travelerKillsRecharge: number;
  isTimeStopActive: boolean;
  timeStopTimer: number;
  rageTimer: number;
  swiftTimer: number;
  monkeyWeaponActive: boolean;
  varpScytheStacks: number;
  burstCritActive: boolean;
  fallenWingsActive: boolean;
  magicDestroActive: boolean;
  warArmorActive: boolean;
  warArmorBonusDef: number;
  judgeDomainTimer: number;
  travelerFieldTimer: number;
  soulMagnetRange: number;
  aegisShield?: number;
  riftBlinkCombo?: number;
  riftWarpBuffTimer?: number;
  anomalyCloneActive?: boolean;
  isInvulnerable?: boolean;
  valkyrieWardTimer?: number;
  valkyrieFortressTimer?: number;
  valkyrieMirrorsCount?: number;
  valkyrieStasisTimer?: number;
  valkyrieEpochTimer?: number;
  valkyrieCutsceneTimer?: number;
  heroDrWardTimer?: number;
  heroDrWardPct?: number;
  frostChillHits?: number;
  monkeyHavocTimer?: number;
  monkeyDuelStacks?: number;
  monkeyComboHits?: number;
  monkeySubCd?: number;
  souls?: number;
  puppetCount?: number;
  undeadCount?: number;
  puppetPossessTimer?: number;
  lichTransformTimer?: number;
  solarHeat?: number;
  solarAvatarTimer?: number;
  travelerOverdriveTimer?: number;
  riftStormTimer?: number;
  angelFeathers?: number;
  angelEclipseTimer?: number;
  trueFallenAngelTimer?: number;
  angelCutsceneTimer?: number;
  demonEssence?: number;
  demonAwakenTimer?: number;
  demonRebirthCd?: number;
  angelDemonTimer?: number;
  angelDemonCutsceneTimer?: number;
  angelCount?: number;
  demonCount?: number;
  demonisShadowArmorTimer?: number;
  demonisUltimateShadowArmor?: boolean;
  demonisBlackholeArmorTimer?: number;
  demonisNebulasArmorTimer?: number;
  poseidonArmorHp?: number;
  poseidonArmorMaxHp?: number;
  poseidonArmorCd?: number;
  elementalisWindStacks?: number;
  elementalisEarthHits?: number;
  judgeResonance?: number;
  judgeMeleeFormTimer?: number;
  judgeCutsceneTimer?: number;
  judgeBladeSpinTimer?: number;
  arcanaHand?: ArcanaSuit[];
  arcanaDiceRoll?: number;
  arcanaDiceTimer?: number;
  arcanaMiracleTimer?: number;
  arcanaRouletteTimer?: number;
  arcanaFlushTimer?: number;
  arcanaHitCount?: number;
  arcanaVanishTimer?: number;
  arcanaVanishCd?: number;
  arcanaDashBuffTimer?: number;
  arcanaCutsceneTimer?: number;
  morphosForm?: MorphosForm;
  morphosEvoStacks?: number;
  morphosEvoTimer?: number;
  morphosChimeraTimer?: number;
  morphosCutsceneTimer?: number;
  isCutsceneActive?: boolean;
  skillCDs: number[];
  skillMaxCDs: number[];
}
