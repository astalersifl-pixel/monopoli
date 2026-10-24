import React, { useState, useEffect } from 'react';
import { Player, PlayerColor, GameSettings } from '../types/game';
import { Trophy, Users, Play, Sparkles, Dices, Globe, LogIn } from 'lucide-react';

interface StartGameModalProps {
  onStartLocalGame: (players: Player[], settings: GameSettings) => void;
  onCreateOnlineRoom: (hostPlayer: { name: string; avatar: string }, targetMoney: number, roomCode: string) => void;
  onJoinOnlineRoom: (guestPlayer: { name: string; avatar: string }, roomCode: string) => void;
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

export const StartGameModal: React.FC<StartGameModalProps> = ({
  onStartLocalGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
}) => {
  const [tab, setTab] = useState<'local' | 'online_create' | 'online_join'>('local');

  // Local game state
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

  // Online game state
  const [onlineName, setOnlineName] = useState<string>('あなた');
  const [onlineAvatar, setOnlineAvatar] = useState<string>('🚗');
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  const [joinRoomCode, setJoinRoomCode] = useState<string>('');

  useEffect(() => {
    // Check if URL has ?room=XXXX
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setJoinRoomCode(roomParam.trim());
        setTab('online_join');
      }
    }
  }, []);

  const handleUpdatePlayer = (
    index: number,
    field: 'name' | 'isAi' | 'avatar',
    value: string | boolean
  ) => {
    const updated = [...playersConfig];
    updated[index] = { ...updated[index], [field]: value };
    setPlayersConfig(updated);
  };

  const handleStartLocal = () => {
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

    onStartLocalGame(activePlayers, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in overflow-hidden">
      {/* Bright, Compact Single-Screen Dialog */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-white to-sky-50 rounded-3xl shadow-2xl border-4 border-amber-400 p-4 sm:p-5 text-slate-800 flex flex-col gap-3 animate-scale-up max-h-[96vh] justify-between">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 text-[10px] sm:text-[11px] font-black border border-amber-400/40 mb-1">
            <Dices className="w-3 h-3 text-amber-600" />
            7×7マス 本格すごろくゲーム
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-base sm:text-lg shadow-sm">
              も
            </span>
            ものぽりぃ
          </h1>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-black">
          <button
            type="button"
            onClick={() => setTab('local')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'local'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            ローカル対戦
          </button>
          <button
            type="button"
            onClick={() => setTab('online_create')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'online_create'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            部屋を作る
          </button>
          <button
            type="button"
            onClick={() => setTab('online_join')}
            className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
              tab === 'online_join'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-500" />
            部屋に入る
          </button>
        </div>

        {/* Tab 1: Local / Hotseat Mode */}
        {tab === 'local' && (
          <div className="flex flex-col gap-2.5">
            {/* Target Money & Players Row */}
            <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-[11px] font-black text-slate-600 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" />
                  目標金額
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTargetMoney(amt)}
                      className={`py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 text-center ${
                        targetMoney === amt
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {amt.toLocaleString()}M
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] sm:text-[11px] font-black text-slate-600 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-500" />
                  人数 (最大5人)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPlayerCount(num)}
                      className={`py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 text-center ${
                        playerCount === num
                          ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Players Config Grid */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] sm:text-[11px] font-black text-slate-600">プレイヤー設定:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                {Array.from({ length: playerCount }).map((_, idx) => {
                  const colorInfo = COLOR_CLASSES[COLORS[idx]];
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 p-1 rounded-xl border-2 ${colorInfo.bg} ${colorInfo.border} shadow-2xs`}
                    >
                      <select
                        value={playersConfig[idx].avatar}
                        onChange={(e) => handleUpdatePlayer(idx, 'avatar', e.target.value)}
                        className="bg-white border border-slate-300 text-sm rounded-lg px-1 py-0.5 cursor-pointer"
                      >
                        {DEFAULT_AVATARS.map((av) => (
                          <option key={av} value={av}>
                            {av}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={playersConfig[idx].name}
                        onChange={(e) => handleUpdatePlayer(idx, 'name', e.target.value)}
                        className="flex-1 min-w-0 bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2 py-0.5 focus:outline-hidden"
                        placeholder={`プレイヤー${idx + 1}`}
                      />

                      <button
                        type="button"
                        onClick={() => handleUpdatePlayer(idx, 'isAi', !playersConfig[idx].isAi)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black cursor-pointer border shrink-0 ${
                          playersConfig[idx].isAi
                            ? 'bg-purple-100 text-purple-700 border-purple-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {playersConfig[idx].isAi ? 'CPU' : '人間'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartLocal}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-amber-300"
            >
              <Play className="w-4 h-4 fill-current" />
              ローカルで対戦開始！
            </button>
          </div>
        )}

        {/* Tab 2: Online Create Room */}
        {tab === 'online_create' && (
          <div className="flex flex-col gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col gap-2.5">
              {/* Host Player Profile */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-slate-600 shrink-0">あなた:</label>
                <select
                  value={onlineAvatar}
                  onChange={(e) => setOnlineAvatar(e.target.value)}
                  className="bg-white border border-slate-300 text-base rounded-lg px-1.5 py-1 cursor-pointer"
                >
                  {DEFAULT_AVATARS.map((av) => (
                    <option key={av} value={av}>
                      {av}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={onlineName}
                  onChange={(e) => setOnlineName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5"
                  placeholder="あなたの名前"
                />
              </div>

              {/* Target Money Selection */}
              <div className="flex justify-between items-center text-xs font-black text-slate-600 border-t border-slate-100 pt-2">
                <span>目標金額:</span>
                <div className="flex gap-1.5">
                  {[5000, 10000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTargetMoney(amt)}
                      className={`px-3 py-1 rounded-xl text-xs font-black border-2 cursor-pointer ${
                        targetMoney === amt
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {amt.toLocaleString()}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Code */}
              <div className="flex justify-between items-center text-xs font-black text-slate-600 border-t border-slate-100 pt-2">
                <span>部屋コード:</span>
                <input
                  type="text"
                  value={onlineRoomCode}
                  onChange={(e) => setOnlineRoomCode(e.target.value.toUpperCase())}
                  className="w-28 text-center font-mono font-black text-base bg-indigo-50 text-indigo-900 border border-indigo-300 rounded-lg py-0.5 tracking-wider"
                  maxLength={6}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center font-bold">
              ※部屋を作成すると招待URLが発行され、友達に送って最大5人まで同時に遊べます！
            </p>

            <button
              type="button"
              onClick={() =>
                onCreateOnlineRoom(
                  { name: onlineName || 'ホスト', avatar: onlineAvatar },
                  targetMoney,
                  onlineRoomCode
                )
              }
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:brightness-110 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-indigo-400"
            >
              <Globe className="w-4 h-4" />
              部屋を作成して待機ロビーへ！
            </button>
          </div>
        )}

        {/* Tab 3: Online Join Room */}
        {tab === 'online_join' && (
          <div className="flex flex-col gap-2.5">
            <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col gap-2.5">
              {/* Guest Profile */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-black text-slate-600 shrink-0">あなた:</label>
                <select
                  value={onlineAvatar}
                  onChange={(e) => setOnlineAvatar(e.target.value)}
                  className="bg-white border border-slate-300 text-base rounded-lg px-1.5 py-1 cursor-pointer"
                >
                  {DEFAULT_AVATARS.map((av) => (
                    <option key={av} value={av}>
                      {av}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={onlineName}
                  onChange={(e) => setOnlineName(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1.5"
                  placeholder="あなたの名前"
                />
              </div>

              {/* Room Code to Join */}
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-2">
                <label className="text-xs font-black text-slate-600">合言葉（部屋コード）を入力:</label>
                <input
                  type="text"
                  value={joinRoomCode}
                  onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                  placeholder="例: 7421"
                  className="w-full text-center font-mono font-black text-xl bg-emerald-50 text-emerald-950 border-2 border-emerald-300 rounded-xl py-1.5 tracking-widest placeholder:text-slate-400"
                  maxLength={8}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (joinRoomCode.trim()) {
                  onJoinOnlineRoom(
                    { name: onlineName || 'ゲスト', avatar: onlineAvatar },
                    joinRoomCode.trim()
                  );
                }
              }}
              disabled={!joinRoomCode.trim()}
              className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:brightness-110 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all border-2 border-emerald-400"
            >
              <LogIn className="w-4 h-4" />
              部屋に参加する！
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
