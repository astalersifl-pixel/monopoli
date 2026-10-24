import React, { useEffect } from 'react';
import { Player, Tile, GameSettings } from '../types/game';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { Trophy, RefreshCw, Award } from 'lucide-react';

interface VictoryModalProps {
  winner: Player;
  players: Player[];
  tiles: Tile[];
  settings: GameSettings;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  players,
  tiles,
  settings,
  onPlayAgain,
}) => {
  useEffect(() => {
    sounds.playWin();
    // Confetti effect
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Sort players by money descending
  const sortedPlayers = [...players].sort((a, b) => b.money - a.money);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border-4 border-amber-400 text-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center animate-scale-up">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-radial from-amber-400/20 to-transparent pointer-events-none" />

        <div className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-4xl shadow-xl shadow-amber-400/30 mb-3 animate-bounce">
          <Trophy className="w-12 h-12" />
        </div>

        <span className="text-xs font-black tracking-widest text-amber-300 uppercase bg-amber-500/20 px-3 py-1 rounded-full mb-1 border border-amber-400/30">
          目標金額 {settings.targetMoney}マニー 達成！
        </span>

        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          🎉 勝者決定！ 🎉
        </h2>

        {/* Winner Highlight Card */}
        <div className="mt-4 w-full bg-white/10 p-4 rounded-2xl border border-amber-400/40 flex items-center justify-center gap-3">
          <span className="text-4xl">{winner.avatar}</span>
          <div className="text-left">
            <div className="text-lg sm:text-xl font-black text-amber-300">
              {winner.name} の勝利！
            </div>
            <div className="text-xs text-slate-300 font-bold">
              最終所持金: <strong className="text-white text-sm">{winner.money}</strong> マニー
            </div>
          </div>
        </div>

        {/* Final Standings Table */}
        <div className="mt-4 w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-left">
          <div className="text-xs font-black text-slate-400 mb-2 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            最終順位:
          </div>
          <div className="flex flex-col gap-1.5">
            {sortedPlayers.map((p, idx) => {
              const ownedCount = tiles.filter((t) => t.ownerId === p.id).length;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold ${
                    p.id === winner.id
                      ? 'bg-amber-400/20 border border-amber-400/40 text-amber-200'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-black">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}位`}
                    </span>
                    <span>{p.avatar}</span>
                    <span className="truncate max-w-[100px]">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{ownedCount}件</span>
                    <span className="font-black text-sm text-white">{p.money}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-6 w-full py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:brightness-110 active:scale-98 text-slate-950 font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          もう一度遊ぶ！
        </button>
      </div>
    </div>
  );
};
