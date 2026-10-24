import React, { useState } from 'react';
import { Player, PlayerColor, GameSettings } from '../types/game';
import { Trophy, Users, Play, Sparkles, Dices } from 'lucide-react';

interface StartGameModalProps {
  onStartGame: (players: Player[], settings: GameSettings) => void;
}

const DEFAULT_AVATARS = ['🚗', '🚀', '🎩', '💎', '🐱', '🦊', '🤖', '👑', '🐼', '🦄'];
const COLORS: PlayerColor[] = ['red', 'blue', 'emerald', 'amber', 'purple'];
const COLOR_CLASSES: Record<PlayerColor, { bg: string; border: string; text: string }> = {
  red: { bg: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
  blue: { bg: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
};

export const StartGameModal: React.FC<StartGameModalProps> = ({ onStartGame }) => {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [targetMoney, setTargetMoney] = useState<number>(5000);
  const [playersConfig, setPlayersConfig] = useState<
    Array<{
      name: string;
      isAi: boolean;
      avatar: string;
    }>
  >([
    { name: 'プレイヤー1', isAi: false, avatar: '🚗' },
    { name: 'CPU 太郎', isAi: true, avatar: '🤖' },
    { name: 'CPU 花子', isAi: true, avatar: '🐱' },
    { name: 'CPU 次郎', isAi: true, avatar: '🦊' },
    { name: 'CPU 三郎', isAi: true, avatar: '🐼' },
  ]);

  const handleUpdatePlayer = (
    index: number,
    field: 'name' | 'isAi' | 'avatar',
    value: string | boolean
  ) => {
    const updated = [...playersConfig];
    updated[index] = { ...updated[index], [field]: value };
    setPlayersConfig(updated);
  };

  const handleStart = () => {
    const activePlayers: Player[] = playersConfig.slice(0, playerCount).map((cfg, idx) => ({
      id: `p${idx + 1}` as Player['id'],
      name: cfg.name || `プレイヤー${idx + 1}`,
      isAi: cfg.isAi,
      color: COLORS[idx],
      avatar: cfg.avatar,
      money: 1000,
      position: 0,
      inHelloWork: false,
      hasRentExemption: false,
      hasSuperLucky: false,
      totalLaps: 0,
    }));

    const settings: GameSettings = {
      targetMoney,
      startBonus: 200,
      soundEnabled: true,
      gameSpeed: 'normal',
    };

    onStartGame(activePlayers, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      {/* Bright, Cheerful & Compact Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-sky-50 rounded-3xl shadow-2xl border-4 border-amber-400 p-4 sm:p-6 text-slate-800 flex flex-col gap-3.5 animate-scale-up">
        {/* Glow & Sparkle accents */}
        <div className="absolute top-2 right-3 flex items-center gap-1 text-amber-500 text-xs font-black select-none pointer-events-none">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
        </div>

        {/* Header: Title & Catchphrase */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 text-[11px] font-black border border-amber-400/40 mb-1">
            <Dices className="w-3.5 h-3.5 text-amber-600" />
            7×7マス 本格すごろくゲーム
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-lg shadow-sm">
              も
            </span>
            ものぽりぃ
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5">
            サイコロを振って土地を契約・ランクアップ！目標金額を目指そう！
          </p>
        </div>

        {/* Compact Settings Grid: Target Money & Player Count side-by-side */}
        <div className="grid grid-cols-2 gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          {/* 1. Target Money */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              目標金額
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTargetMoney(amt)}
                  className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 text-center ${
                    targetMoney === amt
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {amt.toLocaleString()}M
                </button>
              ))}
            </div>
          </div>

          {/* 2. Player Count */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-black text-slate-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              参加人数
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlayerCount(num)}
                  className={`py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 text-center ${
                    playerCount === num
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num}人
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Player Settings in 2-column Compact Grid */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-black text-slate-600">プレイヤー設定:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {Array.from({ length: playerCount }).map((_, idx) => {
              const colorInfo = COLOR_CLASSES[COLORS[idx]];
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 p-1.5 rounded-xl border-2 ${colorInfo.bg} ${colorInfo.border} shadow-2xs`}
                >
                  {/* Emoji Avatar Dropdown */}
                  <select
                    value={playersConfig[idx].avatar}
                    onChange={(e) => handleUpdatePlayer(idx, 'avatar', e.target.value)}
                    className="bg-white border border-slate-300 text-base rounded-lg px-1 py-0.5 cursor-pointer shadow-2xs"
                  >
                    {DEFAULT_AVATARS.map((av) => (
                      <option key={av} value={av}>
                        {av}
                      </option>
                    ))}
                  </select>

                  {/* Name Input */}
                  <input
                    type="text"
                    value={playersConfig[idx].name}
                    onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-1 focus:outline-hidden focus:border-amber-500"
                    placeholder={`プレイヤー${idx + 1}`}
                  />

                  {/* Human / CPU Toggle */}
                  <button
                    type="button"
                    onClick={() => handleUpdatePlayer(idx, 'isAi', !playersConfig[idx].isAi)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer border shrink-0 ${
                      playersConfig[idx].isAi
                        ? 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                    }`}
                  >
                    {playersConfig[idx].isAi ? 'CPU' : '人間'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Cheerful High-Visibility Start Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 active:scale-98 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-amber-300"
        >
          <Play className="w-4 h-4 fill-current" />
          ゲームを開始する！
        </button>
      </div>
    </div>
  );
};
