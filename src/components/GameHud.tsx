import React from 'react';
import { PlayerStats, CombatStats, SkillDefinition, BossCategory } from '../types/game';
import { Volume2, VolumeX, Pause, Play, Compass, Flame, ShieldAlert, Sparkles, Zap, Lock, Swords, Wand2, ArrowUpCircle, Wind } from 'lucide-react';
import { DpsTrendChart } from './DpsTrendChart';

export interface UpgradeToastInfo {
  level: number;
  traitTitle: string;
  attrTitle: string;
  count?: number;
}

interface GameHudProps {
  player: PlayerStats;
  combatStats: CombatStats;
  activeSkills: SkillDefinition[];
  heroName: string;
  heroColor: string;
  boss: { name: string; hp: number; maxHp: number; category?: BossCategory; shield?: number; physResist?: number; magicResist?: number; mirroredRelicsCount?: number } | null;
  autoPilot: boolean;
  autoCastSkills: boolean;
  autoUpgrade: boolean;
  isMuted: boolean;
  pendingUpgradesCount?: number;
  upgradeToast?: UpgradeToastInfo | null;
  onToggleAutoPilot: () => void;
  onToggleAutoCast: () => void;
  onToggleAutoUpgrade: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onTriggerSkill: (index: number) => void;
  onOpenPendingUpgrades?: () => void;
  onAutoPickPendingUpgrades?: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  player,
  combatStats,
  activeSkills,
  heroName,
  heroColor,
  boss,
  autoPilot,
  autoCastSkills,
  autoUpgrade,
  isMuted,
  pendingUpgradesCount = 0,
  upgradeToast,
  onToggleAutoPilot,
  onToggleAutoCast,
  onToggleAutoUpgrade,
  onToggleMute,
  onPause,
  onTriggerSkill,
  onOpenPendingUpgrades,
  onAutoPickPendingUpgrades
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (player.exp / player.maxExp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-5 z-20">
      {/* Top HUD Cluster */}
      <div className="flex flex-col gap-2 w-full max-w-6xl mx-auto">
        {/* Boss Health Bar (if active) */}
        {boss && (() => {
          const catStyles: Record<BossCategory, { badge: string; label: string }> = {
            Tank: { badge: 'bg-emerald-700 text-emerald-100 border-emerald-400/50', label: '🛡️ TANK' },
            Warrior: { badge: 'bg-orange-700 text-orange-100 border-orange-400/50', label: '⚔️ WARRIOR' },
            Assassin: { badge: 'bg-cyan-700 text-cyan-100 border-cyan-400/50', label: '🗡️ ASSASSIN' },
            Manipulation: { badge: 'bg-purple-700 text-purple-100 border-purple-400/50', label: '🌀 MANIPULATION' }
          };
          const catInfo = boss.category ? catStyles[boss.category] : null;
          return (
            <div className={`pointer-events-auto bg-slate-950/95 border-2 ${boss.name.includes('CORRUPTED') ? 'border-purple-500 shadow-[0_0_28px_rgba(168,85,247,0.5)]' : 'border-red-500/70 shadow-[0_0_20px_rgba(239,68,68,0.4)]'} p-2.5 rounded-xl max-w-xl mx-auto w-full`}>
              <div className="flex justify-between items-center text-xs font-title font-bold text-red-400 mb-1 gap-2">
                <span className={`flex items-center gap-1.5 flex-wrap ${boss.name.includes('CORRUPTED') ? 'text-purple-300 font-black' : 'text-red-400'}`}>
                  {boss.name.includes('CORRUPTED') && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-600 text-white font-extrabold uppercase tracking-wider">
                      Rival Boss
                    </span>
                  )}
                  {catInfo && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] border font-extrabold uppercase tracking-wider ${catInfo.badge}`}>
                      {catInfo.label}
                    </span>
                  )}
                  {(boss.physResist ?? 0) > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] border border-amber-500/50 bg-amber-950/70 text-amber-300 font-bold uppercase tracking-wider tabular-nums" title="Ketahanan Serangan Fisik">
                      🛡️ P -{boss.physResist}%
                    </span>
                  )}
                  {(boss.magicResist ?? 0) > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] border border-purple-400/50 bg-purple-950/70 text-purple-200 font-bold uppercase tracking-wider tabular-nums" title="Ketahanan Serangan Sihir">
                      ✦ M -{boss.magicResist}%
                    </span>
                  )}
                  {(boss.mirroredRelicsCount ?? 0) > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] border border-fuchsia-400/60 bg-fuchsia-950/80 text-fuchsia-200 font-extrabold uppercase tracking-wider tabular-nums" title="Meniru semua Relic milik Hero pemain">
                      🪞 {boss.mirroredRelicsCount} Relic
                    </span>
                  )}
                  <span>{boss.name}</span>
                </span>
                <span className="tabular-nums font-mono text-slate-200 shrink-0">
                  {Math.round(boss.hp)} / {Math.round(boss.maxHp)} HP
                  {(boss.shield ?? 0) > 0 && (
                    <span className="text-purple-300 ml-1.5">(+{Math.round(boss.shield!)} 🛡️)</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-red-950">
                <div
                  className={`h-full transition-all duration-150 ${boss.name.includes('CORRUPTED') ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-red-600' : 'bg-gradient-to-r from-red-600 via-amber-500 to-red-500'}`}
                  style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          );
        })()}

        <div className="pointer-events-auto flex flex-col md:flex-row justify-between items-center gap-3 bg-slate-950/85 p-3 rounded-xl border border-slate-800 shadow-xl">
          {/* Player Identity & Vitals */}
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-title font-black text-xl border-2 shadow-md shrink-0"
              style={{
                backgroundColor: `${heroColor}20`,
                borderColor: heroColor,
                color: heroColor
              }}
            >
              {heroName[0]}
            </div>

            <div className="flex-1 min-w-[190px]">
              <div className="flex justify-between items-center mb-1">
                <span className="font-title font-bold text-sm tracking-wide text-white">{heroName}</span>
                <span className="font-title text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  LV. {player.level}
                </span>
              </div>

              {/* Health bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 mb-1 border border-slate-800 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150 bg-gradient-to-r from-red-600 to-emerald-500"
                  style={{ width: `${hpPercent}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono font-bold text-white drop-shadow tabular-nums">
                  {Math.round(player.hp)} / {Math.round(player.maxHp)} HP
                </span>
              </div>

              {/* EXP bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-150"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center / Right Metrics */}
          <div className="flex items-center gap-5 justify-between w-full md:w-auto text-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-5">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Musuh K.O</div>
              <div className="font-title text-xl font-black text-amber-400 tabular-nums">
                {combatStats.kills}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Gelombang</div>
              <div className="font-title text-xl font-black text-cyan-400 tabular-nums leading-tight">
                {combatStats.wave}
              </div>
              <div className="text-[9px] font-mono text-slate-400 tabular-nums">
                {(combatStats.enemiesRemaining ?? 0) > 0 ? `${combatStats.enemiesRemaining} Musuh` : 'Clear!'}
                {(combatStats.waveDr ?? 0) > 0 && (
                  <span className="text-amber-300 ml-1" title="Pengurangan damage musuh per kenaikan wave">
                    · DR {combatStats.waveDr}%
                  </span>
                )}
              </div>
            </div>

            {/* Hero Unique Passive Indicator */}
            <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 min-w-[120px]">
              {heroName.includes('DEMONIS') ? (
                <>
                  <div className="text-[9px] text-purple-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>FCD: {player.demonisFCD ?? 0}/30 ({1 + (player.demonisFCD ?? 0)} Peluru)</span>
                    {(player.demonisFCD ?? 0) >= 30 ? (
                      <span className="text-[8px] text-amber-300 font-black animate-pulse">ASCENDED</span>
                    ) : player.swiftTimer > 0 ? (
                      <span className="text-[8px] text-fuchsia-300 font-black animate-pulse">VEIL {player.swiftTimer.toFixed(1)}s</span>
                    ) : null}
                  </div>
                  <div className="font-title text-xs font-bold text-purple-400 tabular-nums">
                    Stack: {player.demonisStacks}/4 · +{Math.round((player.demonisFCD ?? 0) * 1.5)}% CDMG/ASPD
                  </div>
                </>
              ) : heroName.includes('TRAVELER') ? (
                <>
                  <div className="text-[9px] text-cyan-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>
                      {player.timeStopTimer > 0
                        ? '⏳ TIME STOP BERSERK'
                        : player.travelerStance === 'sword'
                        ? '⚔️ SWORD MODE'
                        : player.travelerStance === 'bow'
                        ? '🏹 BOW MODE'
                        : '🔮 STAFF MODE'}
                    </span>
                    <span className="text-[8px] text-cyan-300 font-black tabular-nums">
                      PARADOX {player.travelerParadoxHits ?? 0}/4
                    </span>
                  </div>
                  <div className={`font-title text-xs font-bold uppercase tabular-nums ${player.timeStopTimer > 0 ? 'text-amber-300 animate-pulse' : (player.travelerOverdriveTimer ?? 0) > 0 || player.travelerFieldTimer > 0 ? 'text-cyan-200 animate-pulse' : 'text-cyan-400'}`}>
                    {player.timeStopTimer > 0
                      ? `⏳ TIME STOP ${player.timeStopTimer.toFixed(1)}s`
                      : (player.travelerOverdriveTimer ?? 0) > 0
                      ? `⚡ OVERDRIVE ${(player.travelerOverdriveTimer ?? 0).toFixed(1)}s`
                      : player.travelerFieldTimer > 0
                      ? '🌀 CHRONO FIELD AKTIF'
                      : `+${Math.min(18, Math.round((player.travelerTimeStacks ?? 0) * 0.6))}% ATK (${combatStats.kills} Kills)`}
                  </div>
                </>
              ) : heroName.includes('MONKEY') ? (
                <>
                  <div className="text-[9px] text-amber-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>{player.rageTimer > 0 ? 'Mode Overdrive' : `Jingu ${player.monkeyComboHits ?? 0}/4 · ${Math.round(player.critChance * 100)}% CC`}</span>
                    {(player.monkeyDuelStacks ?? 0) > 0 ? (
                      <span className="text-[8px] text-rose-400 font-black animate-pulse">
                        DUEL x{player.monkeyDuelStacks} (+{(player.monkeyDuelStacks ?? 0) * 4}%)
                      </span>
                    ) : (player.monkeySubCd ?? 0) <= 0 ? (
                      <span className="text-[8px] text-emerald-400 font-black">72-FORM READY</span>
                    ) : (
                      <span className="text-[8px] text-amber-400/80 font-bold tabular-nums">72-FORM {Math.ceil(player.monkeySubCd!)}s</span>
                    )}
                  </div>
                  <div className="font-title text-xs font-bold text-amber-400 tabular-nums">
                    {player.rageTimer > 0
                      ? `${player.rageTimer.toFixed(1)}s (+40% ATK · +${Math.min(80, Math.round(player.critChance * 100) * 4)} TD)`
                      : `+${Math.round(Math.max(0, Math.round((player.critDmg - 1.0) * 100)) * 1.4)} ATK · +${Math.min(80, Math.round(player.critChance * 100) * 4)} TD`}
                  </div>
                </>
              ) : heroName.includes('JUDG') ? (
                (player.judgeMeleeFormTimer ?? 0) > 0 ? (
                  <>
                    <div className="text-[9px] text-amber-300 font-bold uppercase flex items-center justify-between gap-2">
                      <span>⚔️ VOID ARBITER</span>
                      <span className="text-[8px] text-amber-200 font-black tabular-nums animate-pulse">
                        {(player.judgeMeleeFormTimer ?? 0).toFixed(1)}s
                      </span>
                    </div>
                    <div className="font-title text-xs font-bold text-violet-300 tabular-nums">
                      Blade Mastery · -15% DMG · X-Slash
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[9px] text-indigo-300 font-bold uppercase flex items-center justify-between gap-2">
                      <span>{player.judgeDomainTimer > 0 ? 'Domain Ruang' : 'Distorsi Spasial'}</span>
                      <span className="text-[8px] text-amber-300 font-bold tabular-nums">
                        ⚡ {Math.min(100, Math.round(player.judgeResonance ?? 0))}%
                      </span>
                    </div>
                    <div className={`font-title text-xs font-bold ${player.judgeDomainTimer > 0 ? 'text-indigo-300 animate-pulse' : 'text-indigo-400'}`}>
                      {player.judgeDomainTimer > 0 ? `${player.judgeDomainTimer.toFixed(1)}s (+65% ATK)` : 'AURA 180px · 🔒 ARBITER'}
                    </div>
                  </>
                )
              ) : heroName.includes('RIFT') ? (
                player.anomalyCloneActive ? (
                  <>
                    <div className="text-[9px] text-fuchsia-300 font-bold uppercase flex items-center justify-between gap-2">
                      <span>🧬 CLONE ANOMALI</span>
                      <span className="text-[8px] text-cyan-300 font-bold tabular-nums">
                        Poseidon {Math.round(player.poseidonArmorHp ?? 0)}
                      </span>
                    </div>
                    <div className="font-title text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300">
                      ALL HERO PASSIVES AKTIF
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[9px] text-cyan-300 font-bold uppercase flex items-center justify-between gap-2">
                      <span>Quantum Blink</span>
                      <span className="text-[8px] text-cyan-400 font-bold tabular-nums">{player.riftBlinkCombo ?? 0}/5 Hit</span>
                    </div>
                    <div className={`font-title text-xs font-bold tabular-nums ${(player.riftStormTimer ?? 0) > 0 ? 'text-amber-300 animate-pulse' : (player.riftWarpBuffTimer ?? 0) > 0 ? 'text-cyan-200 animate-pulse' : 'text-cyan-400'}`}>
                      {(player.riftStormTimer ?? 0) > 0
                        ? '🌀 VOID STORM AKTIF'
                        : (player.riftWarpBuffTimer ?? 0) > 0
                        ? `⚡ WARP ${(player.riftWarpBuffTimer ?? 0).toFixed(1)}s (-18% DMG)`
                        : `Phase Evasion ${Math.round(player.evasion * 100)}%`}
                    </div>
                  </>
                )
              ) : heroName.includes('VALKYRIE') ? (
                <>
                  <div className="text-[9px] text-sky-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>🪞 Mirrors: {player.valkyrieMirrorsCount ?? 0}</span>
                    <span className="text-[8px] text-sky-400 font-bold tabular-nums">{player.frostChillHits ?? 0}/3 Hit</span>
                  </div>
                  <div className={`font-title text-xs font-bold tabular-nums ${(player.valkyrieEpochTimer ?? 0) > 0 || (player.valkyrieStasisTimer ?? 0) > 0 || (player.valkyrieFortressTimer ?? 0) > 0 || (player.valkyrieWardTimer ?? 0) > 0 ? 'text-sky-300 animate-pulse' : 'text-sky-400'}`}>
                    {(player.valkyrieStasisTimer ?? 0) > 0
                      ? `🧊 STASIS ${(player.valkyrieStasisTimer ?? 0).toFixed(1)}s`
                      : (player.valkyrieEpochTimer ?? 0) > 0
                      ? `❄️ EPOCH ${(player.valkyrieEpochTimer ?? 0).toFixed(1)}s`
                      : (player.valkyrieFortressTimer ?? 0) > 0
                      ? `❄️ FORTRESS ${(player.valkyrieFortressTimer ?? 0).toFixed(1)}s`
                      : (player.valkyrieWardTimer ?? 0) > 0
                      ? `❄️ WARD ${(player.valkyrieWardTimer ?? 0).toFixed(1)}s`
                      : '❄️ FROST ARMOR (-18% DMG)'}
                  </div>
                </>
              ) : heroName.includes('PUPPET') ? (
                <>
                  <div className="text-[9px] text-fuchsia-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>Souls: {player.souls ?? 0}/30</span>
                    <span className="text-[8px] text-purple-300 font-bold">
                      🪆{player.puppetCount ?? 0} · 💀{player.undeadCount ?? 0}
                    </span>
                  </div>
                  <div className={`font-title text-xs font-bold tabular-nums ${(player.lichTransformTimer ?? 0) > 0 ? 'text-amber-300 animate-pulse' : (player.puppetPossessTimer ?? 0) > 0 ? 'text-cyan-300 animate-pulse' : 'text-fuchsia-400'}`}>
                    {(player.lichTransformTimer ?? 0) > 0
                      ? `👑 LICH FORM ${(player.lichTransformTimer ?? 0).toFixed(1)}s`
                      : (player.puppetPossessTimer ?? 0) > 0
                      ? `👻 POSSESSED ${(player.puppetPossessTimer ?? 0).toFixed(1)}s`
                      : `Soul Forge (+${Math.round((player.souls ?? 0) * 0.8)}% ATK)`}
                  </div>
                </>
              ) : heroName.includes('SOLARIS') ? (
                <>
                  <div className="text-[9px] text-orange-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>Solar Heat</span>
                    <span className="text-[8px] text-amber-300 font-bold tabular-nums">
                      🔥 {player.solarHeat ?? 0} Stack
                    </span>
                  </div>
                  <div className={`font-title text-xs font-bold tabular-nums ${(player.solarAvatarTimer ?? 0) > 0 ? 'text-amber-300 animate-pulse' : 'text-orange-400'}`}>
                    {(player.solarAvatarTimer ?? 0) > 0
                      ? `☀️ AVATAR ${(player.solarAvatarTimer ?? 0).toFixed(1)}s · +Crit/Ward`
                      : `Ignition (+${Math.round((player.solarHeat ?? 0) * 2)}% ATK)`}
                  </div>
                </>
              ) : heroName.includes('FALLEN') ? (
                <>
                  <div className="text-[9px] text-purple-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>Feathers: {player.angelFeathers ?? 0}</span>
                    <span className="text-[8px] text-rose-300 font-bold">
                      Eva {Math.round(player.evasion * 100)}%
                    </span>
                  </div>
                  <div className={`font-title text-xs font-bold tabular-nums ${(player.trueFallenAngelTimer ?? 0) > 0 ? 'text-fuchsia-300 animate-pulse' : (player.angelEclipseTimer ?? 0) > 0 ? 'text-rose-300 animate-pulse' : 'text-purple-400'}`}>
                    {(player.trueFallenAngelTimer ?? 0) > 0
                      ? `🪽 TRUE FALLEN ${(player.trueFallenAngelTimer ?? 0).toFixed(1)}s`
                      : (player.angelEclipseTimer ?? 0) > 0
                      ? `🪽 ECLIPSE ${(player.angelEclipseTimer ?? 0).toFixed(1)}s`
                      : `Seraph (+${Math.round((player.angelFeathers ?? 0) * 0.8)}% ATK)`}
                  </div>
                </>
              ) : heroName.includes('DEMON RAISED') ? (
                (player.angelDemonTimer ?? 0) > 0 ? (
                  <>
                    <div className="text-[9px] font-bold uppercase flex items-center justify-between gap-2">
                      <span className="text-amber-200">👼 {player.angelCount ?? 0} Angel</span>
                      <span className="text-rose-300">👹 {player.demonCount ?? 0} Demon</span>
                    </div>
                    <div className="font-title text-xs font-bold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-rose-400 animate-pulse">
                      ⚖️ ANGEL &amp; DEMON {(player.angelDemonTimer ?? 0).toFixed(1)}s
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[9px] text-rose-300 font-bold uppercase flex items-center justify-between gap-2">
                      <span>Essence: {player.demonEssence ?? 0}</span>
                      {(player.demonRebirthCd ?? 0) <= 0 ? (
                        <span className="text-[8px] text-emerald-400 font-black">REBIRTH READY</span>
                      ) : (
                        <span className="text-[8px] text-amber-400 font-bold tabular-nums">REBIRTH {Math.ceil(player.demonRebirthCd!)}s</span>
                      )}
                    </div>
                    <div className={`font-title text-xs font-bold tabular-nums ${(player.demonAwakenTimer ?? 0) > 0 ? 'text-amber-300 animate-pulse' : 'text-rose-400'}`}>
                      {(player.demonAwakenTimer ?? 0) > 0
                        ? `👹 ARCHFIEND ${(player.demonAwakenTimer ?? 0).toFixed(1)}s`
                        : `Hellfire (+${Math.round((player.demonEssence ?? 0) * 1.5)}% ATK)`}
                    </div>
                  </>
                )
              ) : heroName.includes('ELEMENTALIS') ? (
                <>
                  <div className="text-[9px] text-teal-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>
                      {(player.poseidonArmorCd ?? 0) > 0
                        ? `🌊 POSEIDON CD ${Math.ceil(player.poseidonArmorCd!)}s`
                        : `🛡️ POSEIDON ${Math.round(player.poseidonArmorHp ?? 1000)}/${player.poseidonArmorMaxHp ?? 1000}`}
                    </span>
                    <span className="text-[8px] text-emerald-300 font-bold tabular-nums">
                      🌪️ {player.elementalisWindStacks ?? 0}/10
                    </span>
                  </div>
                  <div className="font-title text-xs font-bold text-teal-400 tabular-nums">
                    🪨 Earth {player.elementalisEarthHits ?? 0}/10 · 🔥 Flaming
                  </div>
                </>
              ) : heroName.includes('ARCANA') ? (
                (() => {
                  const suitMap = {
                    spade: { icon: '♠', cls: 'text-sky-300 border-sky-400/60 bg-sky-950/80' },
                    heart: { icon: '♥', cls: 'text-rose-300 border-rose-400/60 bg-rose-950/80' },
                    diamond: { icon: '♦', cls: 'text-amber-300 border-amber-400/60 bg-amber-950/80' },
                    club: { icon: '♣', cls: 'text-purple-300 border-purple-400/60 bg-purple-950/80' }
                  };
                  const hand = player.arcanaHand ?? [];
                  return (
                    <>
                      <div className="text-[9px] text-pink-300 font-bold uppercase flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1">
                          {[0, 1, 2].map((slot) => {
                            const s = hand[slot];
                            const info = s ? suitMap[s] : null;
                            return (
                              <span
                                key={slot}
                                className={`inline-flex items-center justify-center w-4 h-4 rounded border text-[10px] leading-none font-black ${
                                  info ? info.cls : 'border-slate-700 bg-slate-950 text-slate-600'
                                }`}
                              >
                                {info ? info.icon : '·'}
                              </span>
                            );
                          })}
                        </span>
                        <span className="text-[8px] text-amber-300 font-black tabular-nums">
                          🎲 {player.arcanaDiceRoll ?? 6}
                        </span>
                      </div>
                      <div
                        className={`font-title text-xs font-bold tabular-nums mt-0.5 ${
                          (player.arcanaVanishTimer ?? 0) > 0
                            ? 'text-cyan-200 animate-pulse'
                            : (player.arcanaRouletteTimer ?? 0) > 0
                            ? 'text-amber-300 animate-pulse'
                            : (player.arcanaFlushTimer ?? 0) > 0
                            ? 'text-fuchsia-300 animate-pulse'
                            : (player.arcanaMiracleTimer ?? 0) > 0
                            ? 'text-cyan-300'
                            : 'text-pink-400'
                        }`}
                      >
                        {(player.arcanaVanishTimer ?? 0) > 0
                          ? `👻 MIRAGE ${(player.arcanaVanishTimer ?? 0).toFixed(1)}s`
                          : (player.arcanaRouletteTimer ?? 0) > 0
                          ? `🎡 ROULETTE ${(player.arcanaRouletteTimer ?? 0).toFixed(1)}s`
                          : (player.arcanaFlushTimer ?? 0) > 0
                          ? `🌈 FLUSH ${(player.arcanaFlushTimer ?? 0).toFixed(1)}s`
                          : (player.arcanaMiracleTimer ?? 0) > 0
                          ? `✨ MIRACLE 6 (${(player.arcanaMiracleTimer ?? 0).toFixed(1)}s)`
                          : (player.arcanaDashBuffTimer ?? 0) > 0
                          ? `💨 PHANTOM DASH (${(player.arcanaDashBuffTimer ?? 0).toFixed(1)}s)`
                          : `Deck ${hand.length}/3 · Hit ${player.arcanaHitCount ?? 0}/5${(player.arcanaVanishCd ?? 0) > 0 ? ` · 👻${Math.ceil(player.arcanaVanishCd ?? 0)}s` : ' · 👻OK'}`}
                      </div>
                    </>
                  );
                })()
              ) : heroName.includes('MORPHOS') ? (
                <>
                  <div className="text-[9px] text-emerald-300 font-bold uppercase flex items-center justify-between gap-2">
                    <span>🧬 Evo: {player.morphosEvoStacks ?? 0}</span>
                    {(player.morphosEvoTimer ?? 0) > 0 && (
                      <span className="text-[8px] text-amber-300 font-bold tabular-nums">
                        {(player.morphosEvoTimer ?? 0).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-title text-xs font-bold tabular-nums ${
                      player.morphosForm === 'chimera'
                        ? 'text-amber-300 animate-pulse'
                        : player.morphosForm === 'behemoth'
                        ? 'text-orange-300'
                        : player.morphosForm === 'wyvern'
                        ? 'text-sky-300'
                        : 'text-emerald-400'
                    }`}
                  >
                    {player.morphosForm === 'chimera'
                      ? `🐉 CHIMERA ${(player.morphosChimeraTimer ?? 0).toFixed(1)}s`
                      : player.morphosForm === 'behemoth'
                      ? '🐻 BEHEMOTH (-25% DMG)'
                      : player.morphosForm === 'wyvern'
                      ? '🦅 WYVERN (RANGED)'
                      : '🐺 RAZOR WOLF'}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[9px] text-slate-400 font-bold uppercase">Status Pasif</div>
                  <div className="font-title text-xs font-bold text-emerald-400">Normal</div>
                </>
              )}
            </div>

            {player.warArmorActive && (
              <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-center min-w-[100px]">
                <div className="text-[9px] text-blue-300 font-bold uppercase">War Armor Def</div>
                <div className="font-title text-xs font-bold text-blue-400 tabular-nums">
                  +{player.warArmorBonusDef || 0} / 80
                </div>
              </div>
            )}

            {(player.heroDrWardTimer ?? 0) > 0 && (player.heroDrWardPct ?? 0) > 0 && (
              <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-center min-w-[100px] shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <div className="text-[9px] text-emerald-300 font-bold uppercase">DMG Reduction</div>
                <div className="font-title text-xs font-bold text-emerald-400 tabular-nums">
                  🛡️ -{Math.round((player.heroDrWardPct ?? 0) * 100)}% ({(player.heroDrWardTimer ?? 0).toFixed(1)}s)
                </div>
              </div>
            )}

            {(player.demonisShadowArmorTimer ?? 0) > 0 && (
              <div
                className={`bg-slate-900/90 px-3 py-1.5 rounded-lg border text-center min-w-[140px] ${
                  (player.demonisNebulasArmorTimer ?? 0) > 0
                    ? 'border-cyan-400/75 shadow-[0_0_16px_rgba(56,189,248,0.4)]'
                    : (player.demonisBlackholeArmorTimer ?? 0) > 0
                    ? 'border-fuchsia-400/70 shadow-[0_0_15px_rgba(192,132,252,0.38)]'
                    : player.demonisUltimateShadowArmor
                    ? 'border-amber-400/60 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
                    : 'border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                }`}
              >
                <div
                  className={`text-[9px] font-bold uppercase ${
                    (player.demonisNebulasArmorTimer ?? 0) > 0
                      ? 'text-cyan-300'
                      : (player.demonisBlackholeArmorTimer ?? 0) > 0
                      ? 'text-fuchsia-300'
                      : player.demonisUltimateShadowArmor
                      ? 'text-amber-300'
                      : 'text-purple-300'
                  }`}
                >
                  {(player.demonisNebulasArmorTimer ?? 0) > 0
                    ? 'Ultimate + Nebulas Armor'
                    : (player.demonisBlackholeArmorTimer ?? 0) > 0
                    ? 'Zirah + Blackhole Armor'
                    : player.demonisUltimateShadowArmor
                    ? 'Ultimate Shadow Armor'
                    : 'Zirah Bayangan'}
                </div>
                <div
                  className={`font-title text-xs font-bold tabular-nums ${
                    (player.demonisNebulasArmorTimer ?? 0) > 0
                      ? 'text-cyan-200'
                      : (player.demonisBlackholeArmorTimer ?? 0) > 0
                      ? 'text-amber-300'
                      : player.demonisUltimateShadowArmor
                      ? 'text-amber-400'
                      : 'text-purple-400'
                  }`}
                >
                  {(player.demonisNebulasArmorTimer ?? 0) > 0
                    ? `🌌 -62% · NEBULAS (${(player.demonisNebulasArmorTimer ?? 0).toFixed(1)}s)`
                    : (player.demonisBlackholeArmorTimer ?? 0) > 0
                    ? `🕳️ -52% · BLACKHOLE (${(player.demonisBlackholeArmorTimer ?? 0).toFixed(1)}s)`
                    : player.demonisUltimateShadowArmor
                    ? `🕳️ -40% · BLACKHOLE (${(player.demonisShadowArmorTimer ?? 0).toFixed(1)}s)`
                    : `🛡️ -40% DMG (${(player.demonisShadowArmorTimer ?? 0).toFixed(1)}s)`}
                </div>
              </div>
            )}

            {(player.aegisShield ?? 0) > 0 && (
              <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-center min-w-[100px] shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <div className="text-[9px] text-cyan-300 font-bold uppercase">Titan Aegis</div>
                <div className="font-title text-xs font-bold text-cyan-400 tabular-nums">
                  🛡️ {Math.round(player.aegisShield!)} HP
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Non-blocking Pending Upgrade Pill & Auto-Upgrade Toast */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {pendingUpgradesCount > 0 && (
            <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/90 border border-amber-400/60 px-3 py-1.5 rounded-xl shadow-[0_0_18px_rgba(245,158,11,0.28)] animate-in fade-in duration-150">
              <ArrowUpCircle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="font-title text-xs font-bold text-amber-200 tabular-nums">
                {pendingUpgradesCount} Upgrade Menunggu
              </span>
              {onOpenPendingUpgrades && (
                <button
                  type="button"
                  onClick={onOpenPendingUpgrades}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-title text-[11px] font-black transition-colors cursor-pointer"
                  title="Buka menu pemilihan upgrade sekarang [U]"
                >
                  Pilih [U]
                </button>
              )}
              {onAutoPickPendingUpgrades && (
                <button
                  type="button"
                  onClick={onAutoPickPendingUpgrades}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-title text-[11px] font-bold transition-colors cursor-pointer"
                  title="Langsung pilih otomatis semua upgrade yang menunggu tanpa pause"
                >
                  ⚡ Auto Semua
                </button>
              )}
            </div>
          )}

          {upgradeToast && (
            <div className="pointer-events-none flex items-center gap-2 bg-slate-950/85 border border-emerald-400/50 px-3.5 py-1.5 rounded-xl shadow-[0_0_16px_rgba(16,185,129,0.25)] animate-in fade-in duration-150">
              <Wand2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="font-title text-[11px] font-bold text-emerald-200 tabular-nums">
                LV. {upgradeToast.level} AUTO-UPGRADE{(upgradeToast.count ?? 1) > 1 ? ` (x${upgradeToast.count})` : ''}:
              </span>
              <span className="text-[11px] text-cyan-300 font-semibold">{upgradeToast.traitTitle}</span>
              <span className="text-slate-500 text-[10px]">+</span>
              <span className="text-[11px] text-amber-300 font-semibold">{upgradeToast.attrTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom HUD Cluster: Live DPS Trend, Skills & Controls */}
      <div className="flex flex-col gap-2 w-full max-w-6xl mx-auto">
        <div className="flex justify-start">
          <DpsTrendChart
            samples={combatStats.dpsHistory ?? []}
            currentDps={combatStats.dps ?? 0}
            accentColor={heroColor}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        {/* Skills Dock */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-950/85 p-2 rounded-xl border border-slate-800 shadow-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block px-1">
            SKILL:
          </span>

          {activeSkills.map((sk, idx) => {
            if (sk.lockedUnique) {
              const isMeleeActive = (player.judgeMeleeFormTimer ?? 0) > 0;
              const resonancePct = Math.max(0, Math.min(100, Math.round(player.judgeResonance ?? 0)));
              return (
                <button
                  key={sk.id}
                  disabled
                  title={`${sk.name} [TERSEGEL - TIDAK BISA DIPAKAI MANUAL]: ${sk.desc}`}
                  className={`relative group w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden cursor-not-allowed ${
                    isMeleeActive
                      ? 'border-amber-400 bg-indigo-950/90 shadow-[0_0_16px_rgba(251,191,36,0.45)]'
                      : 'border-indigo-500/50 bg-slate-950/95 opacity-90'
                  }`}
                >
                  {/* Fill bar from bottom representing Dimensional Resonance */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 transition-all duration-150 ${
                      isMeleeActive ? 'bg-amber-400/25' : 'bg-indigo-500/25'
                    }`}
                    style={{ height: `${isMeleeActive ? 100 : resonancePct}%` }}
                  />
                  {isMeleeActive ? (
                    <Swords className="w-4 h-4 text-amber-300 relative z-10 animate-pulse" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-300/90 relative z-10" />
                  )}
                  <span className="relative z-10 text-[9px] font-mono font-black text-amber-200 tabular-nums mt-0.5">
                    {isMeleeActive ? `${(player.judgeMeleeFormTimer ?? 0).toFixed(0)}s` : `${resonancePct}%`}
                  </span>
                  <span className="absolute top-0.5 right-0.5 text-[7px] font-mono text-indigo-300 font-bold">
                    AUTO
                  </span>
                </button>
              );
            }

            if (sk.id === 'rw_s5' && player.anomalyCloneActive) {
              return (
                <button
                  key={sk.id}
                  disabled
                  title={`${sk.name} [SUDAH TERSERAP]: Rift Walker dan Hero Anomali telah pergi; Clone Anomali mewarisi semua pasif hero!`}
                  className="relative group w-12 h-12 rounded-xl border-2 border-fuchsia-400/70 bg-gradient-to-br from-cyan-950 via-purple-950 to-amber-950 flex flex-col items-center justify-center overflow-hidden cursor-default opacity-90 shadow-[0_0_12px_rgba(232,121,249,0.3)]"
                >
                  <Sparkles className="w-4 h-4 text-fuchsia-300 animate-pulse" />
                  <span className="text-[8px] font-mono font-black text-cyan-200 mt-0.5">ANOMALI</span>
                </button>
              );
            }

            const cd = player.skillCDs[idx] || 0;
            const maxCd = player.skillMaxCDs[idx] || sk.cd;
            const isReady = cd <= 0;
            const isJudgeMelee = (player.judgeMeleeFormTimer ?? 0) > 0;
            const isTrueFallen = (player.trueFallenAngelTimer ?? 0) > 0;
            const isAngelDemon = (player.angelDemonTimer ?? 0) > 0;
            const isAnomalyClone = Boolean(player.anomalyCloneActive);

            const isUniqueSkill = Boolean(sk.isUnique);
            const isNebulasSkill = sk.id === 'd_s3_nebulas';
            const isBlackholeSkill = sk.id === 'd_s3_blackhole';

            return (
              <button
                key={sk.id}
                onClick={() => isReady && onTriggerSkill(idx)}
                disabled={!isReady}
                title={`${isUniqueSkill ? '[SKILL UNIK] ' : ''}${sk.name} (Key [${idx + 1}]): ${sk.desc}`}
                className={`relative group w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden transition-transform cursor-pointer ${
                  isReady
                    ? isNebulasSkill
                      ? 'border-cyan-300 bg-gradient-to-br from-indigo-950 via-fuchsia-950/90 to-cyan-950 hover:scale-105 active:scale-95 shadow-[0_0_16px_rgba(56,189,248,0.5)]'
                      : isBlackholeSkill
                      ? 'border-amber-400 bg-gradient-to-br from-slate-950 via-purple-950 to-amber-950/70 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.45)]'
                      : isJudgeMelee
                      ? 'border-amber-400 bg-indigo-950 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                      : isTrueFallen
                      ? 'border-fuchsia-400 bg-purple-950 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(232,121,249,0.4)]'
                      : isAngelDemon
                      ? 'border-amber-300 bg-gradient-to-br from-amber-950/90 via-slate-900 to-rose-950/90 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(251,191,36,0.42)]'
                      : isAnomalyClone
                      ? 'border-fuchsia-400 bg-slate-900 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(34,211,238,0.4)]'
                      : isUniqueSkill
                      ? 'border-amber-400 bg-gradient-to-br from-amber-950/70 via-slate-900 to-cyan-950/80 hover:scale-105 active:scale-95 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                      : 'border-cyan-400 bg-slate-900 hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'border-slate-800 bg-slate-950 opacity-70'
                }`}
              >
                {isUniqueSkill && (
                  <span className="absolute top-0.5 right-1 text-[7px] font-mono font-black text-amber-300 leading-none">
                    UNIK
                  </span>
                )}
                {isNebulasSkill ? (
                  <Sparkles className={`w-5 h-5 ${isReady ? 'text-cyan-300 animate-pulse' : 'text-slate-600'}`} />
                ) : isBlackholeSkill ? (
                  <Sparkles className={`w-5 h-5 ${isReady ? 'text-amber-300 animate-pulse' : 'text-slate-600'}`} />
                ) : isJudgeMelee ? (
                  <Swords className={`w-5 h-5 ${isReady ? 'text-amber-300' : 'text-slate-600'}`} />
                ) : isAngelDemon ? (
                  <Sparkles className={`w-5 h-5 ${isReady ? 'text-amber-300' : 'text-slate-600'}`} />
                ) : isTrueFallen || isAnomalyClone ? (
                  <Sparkles className={`w-5 h-5 ${isReady ? 'text-fuchsia-300' : 'text-slate-600'}`} />
                ) : isUniqueSkill ? (
                  <Sparkles className={`w-5 h-5 ${isReady ? 'text-amber-300' : 'text-slate-600'}`} />
                ) : sk.id === 'ar_s5' ? (
                  <Wind className={`w-5 h-5 ${isReady ? 'text-pink-400' : 'text-slate-600'}`} />
                ) : (
                  <Zap className={`w-5 h-5 ${isReady ? 'text-cyan-400' : 'text-slate-600'}`} />
                )}

                {/* Cooldown sweep overlay */}
                {!isReady && (
                  <div
                    className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center font-mono text-[11px] font-bold text-cyan-300 tabular-nums"
                  >
                    <span>{cd.toFixed(1)}s</span>
                  </div>
                )}

                {/* Hotkey badge */}
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-slate-400 font-bold">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tactical Controls & Mode Toggles */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 p-2 rounded-xl border border-slate-800 shadow-xl">
          {/* Auto-Pilot Toggle */}
          <button
            onClick={onToggleAutoPilot}
            className={`px-3 py-1.5 rounded-lg text-xs font-title font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoPilot
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle antara auto-pilot pergerakan otomatis dan kendali manual WASD / sentuh"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{autoPilot ? 'AUTO PILOT' : 'MANUAL WASD'}</span>
          </button>

          {/* Auto-Skills Toggle */}
          <button
            onClick={onToggleAutoCast}
            className={`px-3 py-1.5 rounded-lg text-xs font-title font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoCastSkills
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle otomatis melancarkan skill saat cooldown selesai"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{autoCastSkills ? 'AUTO SKILL' : 'MANUAL SKILL'}</span>
          </button>

          {/* Auto-Upgrade Toggle */}
          <button
            onClick={onToggleAutoUpgrade}
            className={`px-3 py-1.5 rounded-lg text-xs font-title font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              autoUpgrade
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Otomatis memilih upgrade skill & relic saat naik level tanpa menghentikan pertandingan"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{autoUpgrade ? 'AUTO UPGRADE' : 'MANUAL UPGRADE'}</span>
          </button>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Suara [M]"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Jeda Game [Esc]"
          >
            <Pause className="w-4 h-4 text-amber-400" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
