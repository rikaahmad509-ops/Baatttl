/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BossCategory,
  CombatStats,
  GameMode,
  GameState,
  HeroKey,
  PlayerStats,
  SkillDefinition
} from './types/game';
import { HERO_DATABASE } from './game/constants';
import { GameEngine } from './game/GameEngine';
import { pickAutoUpgrade } from './game/upgradePicker';
import { sounds } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { SkillSelectModal } from './components/SkillSelectModal';
import { GameHud, UpgradeToastInfo } from './components/GameHud';
import { PracticeLabPanel } from './components/PracticeLabPanel';
import { LevelUpModal } from './components/LevelUpModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { AnomalyCutsceneModal } from './components/AnomalyCutsceneModal';
import { ApexChimera3DCutscene } from './components/ApexChimera3DCutscene';

interface BossHudState {
  name: string;
  hp: number;
  maxHp: number;
  category?: BossCategory;
  shield?: number;
  physResist?: number;
  magicResist?: number;
  mirroredRelicsCount?: number;
}

const createFallbackPlayerStats = (heroKey: HeroKey): PlayerStats => {
  const cfg = HERO_DATABASE[heroKey];
  return {
    hp: cfg.hp,
    maxHp: cfg.hp,
    atk: cfg.atk,
    atkSpeed: cfg.atkSpeed,
    critChance: cfg.critChance,
    critDmg: cfg.critDmg,
    speed: cfg.speed,
    range: cfg.range,
    defense: cfg.defense,
    cdr: 0,
    evasion: 0,
    lifesteal: 0,
    level: 1,
    exp: 0,
    maxExp: 100,
    demonisStacks: 0,
    demonisFCD: 0,
    travelerStance: 'sword',
    travelerTimeStacks: 0,
    travelerParadoxHits: 0,
    travelerRewindReady: false,
    travelerKillsRecharge: 0,
    isTimeStopActive: false,
    timeStopTimer: 0,
    rageTimer: 0,
    swiftTimer: 0,
    monkeyWeaponActive: false,
    varpScytheStacks: 0,
    burstCritActive: false,
    fallenWingsActive: false,
    magicDestroActive: false,
    warArmorActive: false,
    warArmorBonusDef: 0,
    judgeDomainTimer: 0,
    travelerFieldTimer: 0,
    soulMagnetRange: 140,
    judgeResonance: 0,
    judgeMeleeFormTimer: 0,
    judgeCutsceneTimer: 0,
    judgeBladeSpinTimer: 0,
    trueFallenAngelTimer: 0,
    angelCutsceneTimer: 0,
    angelDemonTimer: 0,
    angelDemonCutsceneTimer: 0,
    angelCount: 0,
    demonCount: 0,
    anomalyCloneActive: false,
    demonisShadowArmorTimer: 0,
    demonisUltimateShadowArmor: false,
    demonisBlackholeArmorTimer: 0,
    demonisNebulasArmorTimer: 0,
    arcanaHand: [],
    arcanaDiceRoll: 6,
    arcanaDiceTimer: 0,
    arcanaMiracleTimer: 0,
    arcanaRouletteTimer: 0,
    arcanaFlushTimer: 0,
    arcanaHitCount: 0,
    arcanaVanishTimer: 0,
    arcanaVanishCd: 0,
    arcanaDashBuffTimer: 0,
    arcanaCutsceneTimer: 0,
    valkyrieMirrorsCount: 0,
    valkyrieStasisTimer: 0,
    valkyrieEpochTimer: 0,
    valkyrieCutsceneTimer: 0,
    morphosForm: 'wolf',
    morphosEvoStacks: 0,
    morphosEvoTimer: 0,
    morphosChimeraTimer: 0,
    morphosCutsceneTimer: 0,
    isCutsceneActive: false,
    skillCDs: cfg.skills.map((s) => (s.id === 'rw_s5' ? s.cd : 0)),
    skillMaxCDs: cfg.skills.map((s) => s.cd)
  };
};

const INITIAL_COMBAT_STATS: CombatStats = {
  kills: 0,
  wave: 1,
  waveDr: 0,
  enemiesRemaining: 0,
  timeSurvived: 0,
  damageDealt: 0,
  highestCrit: 0,
  damageTaken: 0,
  level: 1,
  dps: 0,
  dpsHistory: []
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('arena');
  const [selectedHero, setSelectedHero] = useState<HeroKey>('monkey');
  const [activeSkills, setActiveSkills] = useState<SkillDefinition[]>(() => [...HERO_DATABASE.monkey.skills]);

  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => createFallbackPlayerStats('monkey'));
  const [combatStats, setCombatStats] = useState<CombatStats>(INITIAL_COMBAT_STATS);
  const [bossState, setBossState] = useState<BossHudState | null>(null);
  const [finalStats, setFinalStats] = useState<CombatStats>(INITIAL_COMBAT_STATS);
  const [levelUpLevel, setLevelUpLevel] = useState<number>(2);

  const [autoPilot, setAutoPilot] = useState<boolean>(true);
  const [autoCastSkills, setAutoCastSkills] = useState<boolean>(true);
  const [autoUpgrade, setAutoUpgrade] = useState<boolean>(false);
  const autoUpgradeRef = useRef<boolean>(false);
  const [pendingLevelUps, setPendingLevelUps] = useState<number[]>([]);
  const pendingLevelUpsRef = useRef<number[]>([]);
  const upgradesMinimizedRef = useRef<boolean>(false);
  const [upgradeToast, setUpgradeToast] = useState<UpgradeToastInfo | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Practice Lab reactive snapshots
  const [practiceAttributeCounts, setPracticeAttributeCounts] = useState<Map<string, number>>(() => new Map());
  const [practiceUnlockedTraits, setPracticeUnlockedTraits] = useState<Set<string>>(() => new Set());
  const [practiceWave, setPracticeWave] = useState<number>(1);
  const [practiceGodMode, setPracticeGodMode] = useState<boolean>(true);
  const [practiceAutoHealDummy, setPracticeAutoHealDummy] = useState<boolean>(true);
  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);
  const [showAnomalyCutscene, setShowAnomalyCutscene] = useState<boolean>(false);
  const [morphos3DFallback, setMorphos3DFallback] = useState<boolean>(false);

  const syncEngineSnapshots = useCallback((engine: GameEngine) => {
    setSelectedHero(engine.heroKey);
    setActiveSkills([...engine.activeSkills]);
    setPlayerStats({ ...engine.player, skillCDs: [...engine.player.skillCDs], skillMaxCDs: [...engine.player.skillMaxCDs] });
    setPracticeAttributeCounts(new Map(engine.attributeCounts));
    setPracticeUnlockedTraits(new Set(engine.unlockedTraits));
    setPracticeWave(engine.practiceWaveLevel);
    setPracticeGodMode(engine.practiceGodMode);
    setPracticeAutoHealDummy(engine.practiceAutoHealDummy);
    setIsSimPaused(engine.isPaused);
  }, []);

  const resetUpgradeQueue = useCallback(() => {
    pendingLevelUpsRef.current = [];
    setPendingLevelUps([]);
    upgradesMinimizedRef.current = false;
    setUpgradeToast(null);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showAutoUpgradeToast = useCallback((info: UpgradeToastInfo) => {
    setUpgradeToast(info);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setUpgradeToast(null);
      toastTimerRef.current = null;
    }, 3400);
  }, []);

  const applyAutoUpgradesForLevels = useCallback(
    (levels: number[], keepPaused: boolean = false) => {
      const engine = engineRef.current;
      if (!engine || levels.length === 0) return;

      let lastChoice: ReturnType<typeof pickAutoUpgrade> | null = null;
      let lastLevel = levels[levels.length - 1];

      for (const lvl of levels) {
        const choice = pickAutoUpgrade({
          heroKey: engine.heroKey,
          level: lvl,
          activeSkillIds: engine.activeSkills.map((s) => s.id),
          unlockedTraits: engine.unlockedTraits,
          acquiredAttributes: engine.acquiredAttributes
        });
        engine.applySkillUpgrade(choice.traitId);
        engine.applyAttribute(choice.attr.id);
        lastChoice = choice;
        lastLevel = lvl;
      }

      engine.isPaused = keepPaused;
      pendingLevelUpsRef.current = [];
      setPendingLevelUps([]);
      upgradesMinimizedRef.current = false;
      syncEngineSnapshots(engine);

      if (lastChoice) {
        showAutoUpgradeToast({
          level: lastLevel,
          traitTitle: lastChoice.traitTitle,
          attrTitle: lastChoice.attr.title,
          count: levels.length
        });
      }
    },
    [showAutoUpgradeToast, syncEngineSnapshots]
  );

  const destroyEngine = useCallback(() => {
    setShowAnomalyCutscene(false);
    setMorphos3DFallback(false);
    resetUpgradeQueue();
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
  }, [resetUpgradeQueue]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleCompleteAnomalyCutscene = useCallback(() => {
    setShowAnomalyCutscene(false);
    if (engineRef.current && gameState === 'PLAYING') {
      engineRef.current.isPaused = false;
      setIsSimPaused(false);
    }
  }, [gameState]);

  const handleSkipMorphosCutscene = useCallback(() => {
    engineRef.current?.skipMorphosCutscene();
  }, []);

  useEffect(() => {
    if ((playerStats.morphosCutsceneTimer ?? 0) <= 0 && morphos3DFallback) {
      setMorphos3DFallback(false);
    }
  }, [playerStats.morphosCutsceneTimer, morphos3DFallback]);

  const handleOpenPendingUpgrades = useCallback(() => {
    const engine = engineRef.current;
    const queue = pendingLevelUpsRef.current;
    if (!engine || queue.length === 0 || showAnomalyCutscene) return;
    upgradesMinimizedRef.current = false;
    engine.isPaused = true;
    setIsSimPaused(true);
    setLevelUpLevel(queue[0]);
    setGameState('LEVEL_UP');
  }, [showAnomalyCutscene]);

  const handleToggleAutoUpgrade = useCallback(() => {
    const next = !autoUpgradeRef.current;
    autoUpgradeRef.current = next;
    setAutoUpgrade(next);
    if (next && pendingLevelUpsRef.current.length > 0 && engineRef.current) {
      applyAutoUpgradesForLevels([...pendingLevelUpsRef.current], false);
      setGameState('PLAYING');
    }
  }, [applyAutoUpgradesForLevels]);

  const startBattle = useCallback(
    (heroKey: HeroKey, skills: SkillDefinition[], mode: GameMode) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      destroyEngine();

      const engine = new GameEngine(canvas, heroKey);
      engine.setPracticeMode(mode === 'practice');
      engine.setHero(heroKey, skills);
      engine.autoPilot = autoPilot;
      engine.autoCastSkills = autoCastSkills;

      engine.onStatsUpdate = (stats, player, boss) => {
        setCombatStats(stats);
        setPlayerStats({
          ...player,
          skillCDs: [...player.skillCDs],
          skillMaxCDs: [...player.skillMaxCDs]
        });
        setBossState(boss);
      };

      engine.onSkillsChange = (nextSkills) => {
        setActiveSkills([...nextSkills]);
      };

      engine.onLevelUpTrigger = (level) => {
        if (autoUpgradeRef.current) {
          applyAutoUpgradesForLevels([level], false);
          return;
        }
        const nextQueue = [...pendingLevelUpsRef.current, level];
        pendingLevelUpsRef.current = nextQueue;
        setPendingLevelUps(nextQueue);

        if (upgradesMinimizedRef.current) {
          engine.isPaused = false;
          setIsSimPaused(false);
          return;
        }

        setLevelUpLevel(nextQueue[0]);
        setGameState('LEVEL_UP');
      };

      engine.onGameOverTrigger = (stats) => {
        setFinalStats(stats);
        setGameState('GAME_OVER');
      };

      engine.onVictoryTrigger = (stats) => {
        setFinalStats(stats);
        setGameState('VICTORY');
      };

      engine.onAnomalyCutsceneTrigger = () => {
        setIsSimPaused(true);
        setShowAnomalyCutscene(true);
      };

      engineRef.current = engine;
      engine.handleResize();
      engine.start();
      syncEngineSnapshots(engine);
      setCombatStats(INITIAL_COMBAT_STATS);
      setBossState(null);
      setShowAnomalyCutscene(false);
      setGameState('PLAYING');
    },
    [applyAutoUpgradesForLevels, autoCastSkills, autoPilot, destroyEngine, syncEngineSnapshots]
  );

  // Keep canvas sized properly to viewport
  useEffect(() => {
    const handleResize = () => {
      engineRef.current?.handleResize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard shortcuts (Escape pause, M mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

      if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'u' || e.key === 'U') {
        if (!showAnomalyCutscene && gameState === 'PLAYING' && pendingLevelUpsRef.current.length > 0) {
          handleOpenPendingUpgrades();
        }
      } else if (e.key === 'Escape') {
        if (showAnomalyCutscene || (playerStats.morphosCutsceneTimer ?? 0) > 0) return;
        if (gameState === 'PLAYING' && engineRef.current) {
          engineRef.current.isPaused = true;
          setIsSimPaused(true);
          setGameState('PAUSED');
        } else if (gameState === 'PAUSED' && engineRef.current) {
          engineRef.current.isPaused = false;
          setIsSimPaused(false);
          setGameState('PLAYING');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleOpenPendingUpgrades, handleToggleMute, playerStats.morphosCutsceneTimer, showAnomalyCutscene]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      destroyEngine();
    };
  }, [destroyEngine]);

  const activeHeroConfig = HERO_DATABASE[selectedHero];
  const isInArenaView =
    gameState === 'PLAYING' ||
    gameState === 'LEVEL_UP' ||
    gameState === 'PAUSED' ||
    gameState === 'GAME_OVER' ||
    gameState === 'VICTORY';
  const isMorphosCutsceneActive =
    isInArenaView &&
    gameState === 'PLAYING' &&
    (playerStats.morphosCutsceneTimer ?? 0) > 0;
  const isCutsceneActive =
    showAnomalyCutscene ||
    Boolean(
      playerStats.isCutsceneActive ||
      (playerStats.judgeCutsceneTimer ?? 0) > 0 ||
      (playerStats.angelCutsceneTimer ?? 0) > 0 ||
      (playerStats.angelDemonCutsceneTimer ?? 0) > 0 ||
      (playerStats.arcanaCutsceneTimer ?? 0) > 0 ||
      (playerStats.valkyrieCutsceneTimer ?? 0) > 0 ||
      (playerStats.morphosCutsceneTimer ?? 0) > 0
    );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* Main Arena Canvas */}
      <canvas
        ref={canvasRef}
        className={`block w-full h-full touch-none ${isInArenaView ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Title Screen */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={() => {
            setGameMode('arena');
            setGameState('CHARACTER_SELECT');
          }}
          onStartPractice={() => {
            setGameMode('practice');
            setGameState('CHARACTER_SELECT');
          }}
          onSelectHeroDirect={(hero) => {
            setSelectedHero(hero);
            setActiveSkills([...HERO_DATABASE[hero].skills]);
            setGameState('SKILL_SELECT');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Character Select */}
      {gameState === 'CHARACTER_SELECT' && (
        <CharacterSelectModal
          gameMode={gameMode}
          onChangeGameMode={setGameMode}
          onConfirmCharacter={(hero) => {
            setSelectedHero(hero);
            setActiveSkills([...HERO_DATABASE[hero].skills]);
            setGameState('SKILL_SELECT');
          }}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* Skill Select */}
      {gameState === 'SKILL_SELECT' && (
        <SkillSelectModal
          heroKey={selectedHero}
          gameMode={gameMode}
          onConfirmSkills={(skills) => {
            setActiveSkills(skills);
            startBattle(selectedHero, skills, gameMode);
          }}
          onBack={() => setGameState('CHARACTER_SELECT')}
        />
      )}

      {/* Active Combat HUD (temporarily hidden during any cutscene) */}
      {isInArenaView && !isCutsceneActive && (
        <GameHud
          player={playerStats}
          combatStats={combatStats}
          activeSkills={activeSkills}
          heroName={activeHeroConfig.name}
          heroColor={activeHeroConfig.color}
          boss={bossState}
          autoPilot={autoPilot}
          autoCastSkills={autoCastSkills}
          autoUpgrade={autoUpgrade}
          isMuted={isMuted}
          pendingUpgradesCount={gameState === 'PLAYING' ? pendingLevelUps.length : 0}
          upgradeToast={upgradeToast}
          onToggleAutoPilot={() => {
            const next = !autoPilot;
            setAutoPilot(next);
            if (engineRef.current) engineRef.current.autoPilot = next;
          }}
          onToggleAutoCast={() => {
            const next = !autoCastSkills;
            setAutoCastSkills(next);
            if (engineRef.current) engineRef.current.autoCastSkills = next;
          }}
          onToggleAutoUpgrade={handleToggleAutoUpgrade}
          onToggleMute={handleToggleMute}
          onOpenPendingUpgrades={handleOpenPendingUpgrades}
          onAutoPickPendingUpgrades={() => {
            if (pendingLevelUpsRef.current.length > 0) {
              applyAutoUpgradesForLevels([...pendingLevelUpsRef.current], false);
            }
          }}
          onPause={() => {
            if (engineRef.current) {
              engineRef.current.isPaused = true;
              setIsSimPaused(true);
            }
            setGameState('PAUSED');
          }}
          onTriggerSkill={(idx) => {
            const engine = engineRef.current;
            if (!engine || engine.isPaused || engine.isGameOver) return;
            if (idx >= 0 && idx < engine.activeSkills.length && !engine.activeSkills[idx]?.lockedUnique && engine.player.skillCDs[idx] <= 0) {
              const target = engine.getClosestEnemy(engine.playerPos.x, engine.playerPos.y);
              engine.useSkill(idx, target);
            }
          }}
        />
      )}

      {/* Practice Lab Controls (temporarily hidden during any cutscene) */}
      {gameState === 'PLAYING' && gameMode === 'practice' && engineRef.current && !isCutsceneActive && (
        <PracticeLabPanel
          heroKey={selectedHero}
          player={playerStats}
          combatStats={combatStats}
          activeSkills={activeSkills}
          attributeCounts={practiceAttributeCounts}
          unlockedTraits={practiceUnlockedTraits}
          practiceWave={practiceWave}
          godMode={practiceGodMode}
          autoHealDummy={practiceAutoHealDummy}
          isSimPaused={isSimPaused}
          onToggleSimPause={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.isPaused = !engine.isPaused;
            setIsSimPaused(engine.isPaused);
          }}
          onToggleRelic={(attrId) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.togglePracticeRelic(attrId);
            syncEngineSnapshots(engine);
          }}
          onSetRelicCount={(attrId, count) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.setPracticeRelicCount(attrId, count);
            syncEngineSnapshots(engine);
          }}
          onClearRelics={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.clearPracticeRelics();
            syncEngineSnapshots(engine);
          }}
          onToggleTrait={(traitId) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.togglePracticeTrait(traitId);
            syncEngineSnapshots(engine);
          }}
          onSwitchHero={(newHeroKey) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.switchHeroInPractice(newHeroKey);
            syncEngineSnapshots(engine);
          }}
          onSetWave={(wave) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.setPracticeWaveLevel(wave);
            syncEngineSnapshots(engine);
          }}
          onSpawnDummy={(kind, resistPreset) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.spawnPracticeDummy(kind, undefined, undefined, resistPreset);
            syncEngineSnapshots(engine);
          }}
          onSpawnSwarm={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.spawnPracticeSwarm(5);
            syncEngineSnapshots(engine);
          }}
          onSpawnSkilledMobs={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.spawnPracticeSkilledMobs();
            syncEngineSnapshots(engine);
          }}
          onSpawnBoss={(type, corruptedHeroKey) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.spawnPracticeBoss(type, corruptedHeroKey);
            syncEngineSnapshots(engine);
          }}
          onClearEnemies={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.clearPracticeEnemies();
            syncEngineSnapshots(engine);
          }}
          onResetMetrics={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.resetPracticeMetrics();
            syncEngineSnapshots(engine);
          }}
          onResetCooldowns={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.resetPracticeCooldowns();
            syncEngineSnapshots(engine);
          }}
          onFullHeal={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.fullHealPractice();
            syncEngineSnapshots(engine);
          }}
          onGrantLevel={(levels) => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.grantPracticeLevel(levels);
            syncEngineSnapshots(engine);
          }}
          onToggleGodMode={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.practiceGodMode = !engine.practiceGodMode;
            setPracticeGodMode(engine.practiceGodMode);
          }}
          onToggleAutoHealDummy={() => {
            const engine = engineRef.current;
            if (!engine) return;
            engine.practiceAutoHealDummy = !engine.practiceAutoHealDummy;
            setPracticeAutoHealDummy(engine.practiceAutoHealDummy);
          }}
        />
      )}

      {/* Level Up Modal */}
      {gameState === 'LEVEL_UP' && engineRef.current && (
        <LevelUpModal
          key={`${levelUpLevel}-${pendingLevelUps.length}`}
          level={levelUpLevel}
          heroKey={selectedHero}
          activeSkillIds={activeSkills.map((s) => s.id)}
          unlockedTraits={new Set(engineRef.current.unlockedTraits)}
          acquiredAttributes={new Set(engineRef.current.acquiredAttributes)}
          pendingCount={Math.max(1, pendingLevelUps.length)}
          onConfirmUpgrade={(selectedTraitId, selectedAttrId) => {
            const engine = engineRef.current;
            if (!engine) return;
            if (selectedTraitId) {
              engine.applySkillUpgrade(selectedTraitId);
            }
            engine.applyAttribute(selectedAttrId);

            const remaining = pendingLevelUpsRef.current.slice(1);
            pendingLevelUpsRef.current = remaining;
            setPendingLevelUps(remaining);

            if (remaining.length > 0) {
              engine.isPaused = true;
              setIsSimPaused(true);
              setLevelUpLevel(remaining[0]);
              syncEngineSnapshots(engine);
            } else {
              engine.isPaused = false;
              setIsSimPaused(false);
              upgradesMinimizedRef.current = false;
              syncEngineSnapshots(engine);
              setGameState('PLAYING');
            }
          }}
          onDeferUpgrade={() => {
            const engine = engineRef.current;
            if (!engine) return;
            upgradesMinimizedRef.current = true;
            engine.isPaused = false;
            setIsSimPaused(false);
            setGameState('PLAYING');
          }}
          onEnableAutoUpgrade={(selectedTraitId, selectedAttrId) => {
            const engine = engineRef.current;
            if (!engine) return;
            autoUpgradeRef.current = true;
            setAutoUpgrade(true);

            if (selectedTraitId) {
              engine.applySkillUpgrade(selectedTraitId);
            }
            engine.applyAttribute(selectedAttrId);

            const remaining = pendingLevelUpsRef.current.slice(1);
            if (remaining.length > 0) {
              applyAutoUpgradesForLevels(remaining, false);
            } else {
              pendingLevelUpsRef.current = [];
              setPendingLevelUps([]);
              upgradesMinimizedRef.current = false;
              engine.isPaused = false;
              setIsSimPaused(false);
              syncEngineSnapshots(engine);
            }
            setGameState('PLAYING');
          }}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => {
            if (engineRef.current) {
              engineRef.current.isPaused = false;
              setIsSimPaused(false);
            }
            setGameState('PLAYING');
          }}
          onRestart={() => {
            resetUpgradeQueue();
            if (engineRef.current) {
              engineRef.current.restart();
              syncEngineSnapshots(engineRef.current);
              setBossState(null);
            }
            setGameState('PLAYING');
          }}
          onQuitToTitle={() => {
            destroyEngine();
            setBossState(null);
            setGameState('TITLE');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isPracticeMode={gameMode === 'practice'}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={finalStats}
          heroName={activeHeroConfig.name}
          onRestart={() => {
            resetUpgradeQueue();
            if (engineRef.current) {
              engineRef.current.restart();
              syncEngineSnapshots(engineRef.current);
              setBossState(null);
            }
            setGameState('PLAYING');
          }}
          onSelectHero={() => {
            destroyEngine();
            setBossState(null);
            setGameState('CHARACTER_SELECT');
          }}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          stats={finalStats}
          heroName={activeHeroConfig.name}
          onContinueEndless={() => {
            if (engineRef.current) {
              engineRef.current.isPaused = false;
              setIsSimPaused(false);
            }
            setGameState('PLAYING');
          }}
          onRestart={() => {
            resetUpgradeQueue();
            if (engineRef.current) {
              engineRef.current.restart();
              syncEngineSnapshots(engineRef.current);
              setBossState(null);
            }
            setGameState('PLAYING');
          }}
          onSelectHero={() => {
            destroyEngine();
            setBossState(null);
            setGameState('CHARACTER_SELECT');
          }}
        />
      )}

      {/* Anomaly Fusion Portal Video Cutscene */}
      {showAnomalyCutscene && (
        <AnomalyCutsceneModal
          isMuted={isMuted}
          onComplete={handleCompleteAnomalyCutscene}
        />
      )}

      {/* Morphos: Apex Chimera 3D Three.js Cutscene */}
      {isMorphosCutsceneActive && !morphos3DFallback && (
        <ApexChimera3DCutscene
          remainingTime={playerStats.morphosCutsceneTimer ?? 0}
          totalDuration={3.6}
          onSkip={handleSkipMorphosCutscene}
          onWebGLUnavailable={() => setMorphos3DFallback(true)}
        />
      )}
    </div>
  );
}
