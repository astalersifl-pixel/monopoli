import React, { useState } from 'react';
import { Player, GameSettings, Tile } from '../types/game';
import { Volume2, VolumeX, Zap, RefreshCw, Trophy, Shield, Sparkles, HelpCircle, Globe, Copy, Check } from 'lucide-react';

interface GameHeaderProps {
  players: Player[];
  currentPlayerId: string;
  settings: GameSettings;
  tiles: Tile[];
  onlineRoomCode?: string;
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
  onlineRoomCode,
  onToggleSound,
  onToggleSpeed,
  onNewGame,
  onOpenRules,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!onlineRoomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${onlineRoomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <header className="w-full max-w-[min(98vw,calc(100dvh-5.5rem))] mx-auto flex flex-col gap-1 shrink-0 mb-1 select-none">
      {/* Top Bar: Title, Target, Utilities (Ultra Compact 32px height) */}
      <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 text-white shadow-xs">
        {/* Logo */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs">
            も
          </div>
          <span className="text-xs sm:text-sm font-black tracking-tight leading-none text-white">
            ものぽりぃ
          </span>
        </div>

        {/* Center: Target & Online Room indicator */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/15 border border-amber-400/40 rounded-lg text-amber-300 text-[10px] sm:text-xs font-black">
            <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
            <span>目標: {settings.targetMoney.toLocaleString()}M</span>
          </div>

          {onlineRoomCode && (
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 rounded-lg text-indigo-300 text-[10px] sm:text-xs font-black cursor-pointer transition-all"
              title="部屋リンクをコピー"
            >
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>部屋: {onlineRoomCode}</span>
              {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSpeed}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 flex items-center gap-0.5 cursor-pointer"
            title="速度切替"
          >
            <Zap className={`w-3 h-3 ${settings.gameSpeed === 'fast' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{settings.gameSpeed === 'fast' ? '倍速' : '通常'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="音量 ON/OFF"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3 h-3 text-emerald-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRules}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="ルール説明"
          >
            <HelpCircle className="w-3 h-3 text-indigo-400" />
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="p-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 cursor-pointer"
            title="最初からやり直す"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Players Strip (Ultra-compact single horizontal line) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1">
        {players.map((p) => {
          const isCurrent = p.id === currentPlayerId;
          const ownedCount = tiles.filter((t) => t.ownerId === p.id).length;
          const progressPercent = Math.min(100, Math.round((p.money / settings.targetMoney) * 100));

          return (
            <div
              key={p.id}
              className={`px-2 py-1 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900 border-amber-400 shadow-xs ring-2 ring-amber-400/40 scale-[1.01]'
                  : 'bg-slate-900/70 border-slate-800/80 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-sm shrink-0 leading-none">{p.avatar}</span>
                  <span className="text-[10px] sm:text-[11px] font-black text-white truncate leading-tight">
                    {p.name}
                  </span>
                </div>

                {/* Money */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="text-xs font-black text-amber-300 leading-none">
                    {p.money}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">M</span>
                </div>
              </div>

              {/* Bottom: Mini status indicators & progress bar */}
              <div className="mt-0.5 flex items-center justify-between gap-1">
                <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                  <span>{ownedCount}件</span>
                  {p.hasRentExemption && <Shield className="w-2.5 h-2.5 text-emerald-400 inline" />}
                  {p.hasSuperLucky && <Sparkles className="w-2.5 h-2.5 text-amber-400 inline" />}
                  {p.inHelloWork && (
                    <span className="text-[8px] px-1 rounded bg-amber-500/20 text-amber-300">
                      ハロワ
                    </span>
                  )}
                </div>

                <div className="flex-1 max-w-[45px] bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      progressPercent >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
};
