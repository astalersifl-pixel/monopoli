import React from 'react';
import { GameLog, Player } from '../types/game';
import { X, ScrollText, Dices, DollarSign, Building, Sparkles, AlertTriangle, Trophy, Star } from 'lucide-react';

interface GameLogModalProps {
  logs: GameLog[];
  players: Player[];
  onClose: () => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({ logs, players, onClose }) => {
  const getLogIcon = (type?: GameLog['type']) => {
    switch (type) {
      case 'roll':
        return <Dices className="w-4 h-4 text-indigo-500" />;
      case 'money':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      case 'land':
        return <Building className="w-4 h-4 text-emerald-500" />;
      case 'rankup':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'event':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'bankrupt':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'win':
        return <Trophy className="w-4 h-4 text-amber-500" />;
      default:
        return <ScrollText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLogBg = (type?: GameLog['type']) => {
    switch (type) {
      case 'win':
        return 'bg-amber-50 border-amber-300 text-amber-950';
      case 'bankrupt':
        return 'bg-rose-50 border-rose-200 text-rose-950';
      case 'rankup':
        return 'bg-yellow-50 border-yellow-200 text-yellow-950';
      case 'land':
        return 'bg-emerald-50/70 border-emerald-200 text-emerald-950';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  // Show newest on top or bottom? In game history logs, showing newest on top makes it easy to read recent events!
  const reversedLogs = [...logs].reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-3xl shadow-2xl border-4 border-indigo-400 p-4 sm:p-6 text-slate-800 flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-xs">
              📜
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                対戦履歴ログ
              </h2>
              <span className="text-[11px] text-slate-500 font-bold">
                全 {logs.length} 件の行動記録（最新順）
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Logs List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {reversedLogs.map((log) => {
            const player = players.find((p) => p.id === log.playerId);
            const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm font-medium leading-relaxed transition-all ${getLogBg(
                  log.type
                )}`}
              >
                <div className="mt-0.5 p-1 rounded-lg bg-white shadow-2xs shrink-0">
                  {getLogIcon(log.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    {player ? (
                      <span className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                        <span>{player.avatar}</span>
                        <span>{player.name}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400">システム</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {timeStr}
                    </span>
                  </div>

                  <p className="text-slate-800 break-words">{log.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Close Button */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm rounded-xl cursor-pointer transition-all shadow-md"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
