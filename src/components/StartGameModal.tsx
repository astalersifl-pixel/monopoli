import React, { useState } from 'react';
import { Player, PlayerColor, GameSettings } from '../types/game';
import { Trophy, Users, Play, Sparkles } from 'lucide-react';

interface StartGameModalProps {
  onStartGame: (players: Player[], settings: GameSettings) => void;
}

const DEFAULT_AVATARS = ['🚗', '🚀', '🎩', '💎', '🐱', '🦊', '🤖', '👑'];
const COLORS: PlayerColor[] = ['red', 'blue', 'emerald', 'amber'];

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
      money: 1000, // Initial 1000 money from prompt
      position: 0, // Starts at Start (Tile 0, Bottom-Right)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 text-white rounded-3xl shadow-2xl p-6 sm:p-8 my-auto flex flex-col gap-6">
        {/* Title Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            7×7マス 本格すごろくボードゲーム
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ものぽりぃ
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            サイコロを振って土地を契約・ランクアップ！目標金額を目指そう！
          </p>
        </div>

        {/* 1. Target Money (5000 or 10000) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            勝利目標金額を選択:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTargetMoney(amt)}
                className={`py-3 px-4 rounded-2xl border-2 font-black transition-all cursor-pointer flex flex-col items-center justify-center ${
                  targetMoney === amt
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-lg sm:text-xl">{amt} マニー</span>
                <span className="text-[11px] opacity-80 font-bold">
                  {amt === 5000 ? 'スタンダード (約10〜15分)' : 'じっくり長期戦 (約20分〜)'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Number of Players */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            参加人数を選択:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPlayerCount(num)}
                className={`py-2.5 rounded-xl border-2 font-black text-sm transition-all cursor-pointer ${
                  playerCount === num
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {num}人対戦
              </button>
            ))}
          </div>
        </div>

        {/* 3. Player Settings list */}
        <div className="flex flex-col gap-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <div className="text-xs font-black text-slate-400">参加プレイヤー設定:</div>
          {Array.from({ length: playerCount }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 p-2.5 bg-slate-800/70 rounded-xl border border-slate-700"
            >
              {/* Avatar Selector */}
              <select
                value={playersConfig[idx].avatar}
                onChange={(e) => handleUpdatePlayer(idx, 'avatar', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-lg rounded-lg p-1 cursor-pointer"
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
                className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-400"
                placeholder={`プレイヤー${idx + 1}`}
              />

              {/* Human or CPU Toggle */}
              <button
                type="button"
                onClick={() => handleUpdatePlayer(idx, 'isAi', !playersConfig[idx].isAi)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer border ${
                  playersConfig[idx].isAi
                    ? 'bg-purple-900/60 text-purple-300 border-purple-500/50'
                    : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {playersConfig[idx].isAi ? 'CPU' : '人間'}
              </button>
            </div>
          ))}
        </div>

        {/* Start Game Button */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          ゲームを開始する！
        </button>
      </div>
    </div>
  );
};
