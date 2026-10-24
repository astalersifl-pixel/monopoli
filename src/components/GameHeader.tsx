import React from 'react';
import { Player, GameSettings, Tile } from '../types/game';
import { Volume2, VolumeX, Zap, RefreshCw, Trophy, Shield, Sparkles, HelpCircle } from 'lucide-react';

interface GameHeaderProps {
  players: Player[];
  currentPlayerId: string;
  settings: GameSettings;
  tiles: Tile[];
  onToggleSound: () => void;
  onToggleSpeed: () => void;
  onNewGame: () => void;
  onOpenRules: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  players,
  currentPlayerId,
  settings,
  tiles,
  onToggleSound,
  onToggleSpeed,
  onNewGame,
  onOpenRules,
}) => {
  return (
    <header className="w-full max-w-[860px] mx-auto flex flex-col gap-2 mb-2">
      {/* Top Bar: Title, Target, Utilities */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 text-white shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-base shadow-sm">
            も
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">
              ものぽりぃ
            </h1>
            <span className="text-[10px] text-slate-400 font-bold">7×7ボードすごろく</span>
          </div>
        </div>

        {/* Goal Banner */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-xl text-amber-300">
          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-xs font-black">
            目標: <span className="text-sm font-black text-white">{settings.targetMoney}</span> マニー
          </div>
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSpeed}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            title="演出速度切り替え"
          >
            <Zap className={`w-3.5 h-3.5 ${settings.gameSpeed === 'fast' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{settings.gameSpeed === 'fast' ? '倍速' : '通常'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            title="効果音 ON/OFF"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            title="ルール説明"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">ルール</span>
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-xs font-bold text-rose-200 border border-rose-800/60 flex items-center gap-1 cursor-pointer transition-colors"
            title="新しくゲームを始める"
          >
            <RefreshCw className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">最初から</span>
          </button>
        </div>
      </div>

      {/* Players Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {players.map((p) => {
          const isCurrent = p.id === currentPlayerId;
          const ownedCount = tiles.filter((t) => t.ownerId === p.id).length;
          const progressPercent = Math.min(100, Math.round((p.money / settings.targetMoney) * 100));

          return (
            <div
              key={p.id}
              className={`p-2.5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-400/10 ring-2 ring-amber-400/30'
                  : 'bg-slate-900/70 border-slate-800 text-slate-300'
              }`}
            >
              {/* Top of player card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">{p.avatar}</span>
                  <div>
                    <div className="text-xs font-black text-white leading-tight flex items-center gap-1">
                      <span>{p.name}</span>
                      <span className="text-[9px] text-slate-400">
                        ({p.isAi ? 'CPU' : 'P'})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      土地: {ownedCount}件
                    </span>
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                    TURN
                  </span>
                )}
              </div>

              {/* Money and buffs */}
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-sm sm:text-base font-black text-amber-300 leading-none">
                  {p.money} <span className="text-[10px] font-bold text-slate-400">M</span>
                </span>

                {/* Held Buffs */}
                <div className="flex items-center gap-0.5">
                  {p.hasRentExemption && (
                    <span title="支払い免除保持">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  )}
                  {p.hasSuperLucky && (
                    <span title="私は豪運！保持">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </span>
                  )}
                  {p.inHelloWork && (
                    <span className="text-[9px] font-black px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      ハロワ
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar towards target */}
              <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPercent >= 80
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
