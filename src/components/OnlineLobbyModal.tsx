import React, { useState } from 'react';
import { Player, PlayerColor, GameSettings } from '../types/game';
import { onlineManager } from '../utils/online';
import { Copy, Check, Users, Play, ArrowLeft, Loader2, Globe, Shield } from 'lucide-react';

interface OnlineLobbyModalProps {
  isHost: boolean;
  roomCode: string;
  players: Player[];
  myPlayerId: string;
  settings: GameSettings;
  onStartGame: () => void;
  onLeaveLobby: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  isHost,
  roomCode,
  players,
  myPlayerId,
  settings,
  onStartGame,
  onLeaveLobby,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-indigo-500 p-5 text-slate-800 flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black">
              🌐
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                オンライン待機ロビー
              </h2>
              <span className="text-[11px] text-slate-500 font-bold">
                {isHost ? 'ホスト（あなたが主催者）' : 'ゲスト（参加中）'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onLeaveLobby}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            退出
          </button>
        </div>

        {/* Room Code & Share Banner */}
        <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-black text-indigo-700">部屋の合言葉（ルームコード）</span>
          <div className="text-3xl font-black text-indigo-950 tracking-widest font-mono">
            {roomCode}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '招待リンクをコピーしました！' : '友達に招待リンクを送る'}
          </button>
        </div>

        {/* Game Rules Info */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 px-2 py-1 bg-slate-50 rounded-xl">
          <span>目標金額: <strong className="text-slate-900 font-black">{settings.targetMoney}M</strong></span>
          <span>最大参加人数: <strong className="text-slate-900 font-black">最大5人</strong></span>
        </div>

        {/* Connected Players List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-600">
            <span>参加メンバー ({players.length}人):</span>
            {players.length < 2 && (
              <span className="text-amber-600 flex items-center gap-1 font-bold text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                対戦相手の参加を待っています…
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold ${
                  p.id === myPlayerId
                    ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.avatar}</span>
                  <span>{p.name}</span>
                  {p.id === myPlayerId && (
                    <span className="text-[10px] bg-amber-400/30 text-amber-900 px-1.5 py-0.2 rounded font-black">
                      あなた
                    </span>
                  )}
                  {idx === 0 && (
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-black">
                      ホスト
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-emerald-600 font-black">接続完了</span>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Action */}
        {isHost ? (
          <button
            type="button"
            onClick={onStartGame}
            disabled={players.length < 2}
            className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-400/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            {players.length < 2 ? '参加者を待っています (2人以上で開始)' : 'オンライン対戦を開始する！'}
          </button>
        ) : (
          <div className="p-3 bg-slate-100 rounded-2xl text-center text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ホストがゲームを開始するのを待っています…
          </div>
        )}
      </div>
    </div>
  );
};
