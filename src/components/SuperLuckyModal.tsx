import React, { useState } from 'react';
import { Player, Tile } from '../types/game';
import { Dice } from './Dice';
import { sounds } from '../utils/audio';
import {
  Sparkles,
  Trophy,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  ChevronUp,
  MapPin,
  CheckCircle,
} from 'lucide-react';

interface SuperLuckyModalProps {
  player: Player;
  tile: Tile;
  effectiveCost: number;
  isMyTurn: boolean;
  onFinish: (roll: number) => void;
}

export const SuperLuckyModal: React.FC<SuperLuckyModalProps> = ({
  player,
  tile,
  effectiveCost,
  isMyTurn,
  onFinish,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPeekTranslucent, setIsPeekTranslucent] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);

  const doubleCost = effectiveCost * 2;
  const canAffordDouble = player.money >= doubleCost;

  const handleRoll = () => {
    if (isRolling || rolledNumber !== null) return;
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setRolledNumber(roll);
      setIsRolling(false);

      if (roll === 1) {
        sounds.playBuzzer();
      } else {
        sounds.playWin();
      }
    }, 1500);
  };

  // Minimized Dock for board inspection
  if (isMinimized) {
    return (
      <>
        {/* Floating Instruction Banner at Top */}
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 text-amber-200 border border-amber-400/60 px-4 py-1.5 rounded-full text-xs font-black shadow-xl backdrop-blur-md animate-bounce-subtle pointer-events-none">
          <span>盤面確認中（マスをタップして詳細確認できます）</span>
        </div>

        {/* Bottom Floating Dock */}
        <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[95vw] max-w-md z-50 pointer-events-auto animate-slide-up">
          <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 border-2 border-amber-400 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <span className="text-2xl sm:text-3xl shrink-0 p-1.5 bg-amber-500/20 border border-amber-400/40 rounded-xl">
                🎲
              </span>
              <div className="text-left overflow-hidden min-w-0">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider truncate">
                  【私は豪運！】発動中
                </div>
                <div className="text-xs sm:text-sm font-black text-white truncate">
                  No.{tile.landNumber}「{tile.name}」
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {rolledNumber !== null
                    ? rolledNumber === 1
                      ? `出目【1】痛恨の倍額(${doubleCost}M)`
                      : `出目【${rolledNumber}】大豪運！タダ(0M)`
                    : `1以外なら無料(0M) / 1なら倍額(${doubleCost}M)`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all border border-amber-300/60 animate-pulse"
            >
              <EyeOff className="w-4 h-4" />
              <span>ダイスに戻る</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  const isSuccess = rolledNumber !== null && rolledNumber !== 1;
  const isFailure = rolledNumber === 1;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
        isPeekTranslucent
          ? 'bg-transparent pointer-events-none'
          : 'bg-black/75 backdrop-blur-xs'
      }`}
    >
      <div
        className={`relative w-full max-w-md bg-slate-950 rounded-3xl shadow-2xl border-4 ${
          isSuccess
            ? 'border-yellow-400 shadow-amber-500/30'
            : isFailure
            ? 'border-rose-500 shadow-rose-500/30'
            : 'border-amber-400 shadow-amber-500/20'
        } overflow-hidden flex flex-col items-center text-center p-5 sm:p-7 max-h-[92vh] overflow-y-auto transition-all duration-200 ${
          isPeekTranslucent
            ? 'opacity-15 scale-95 pointer-events-none'
            : 'opacity-100 scale-100 animate-scale-up'
        }`}
      >
        {/* Dynamic Background Glow */}
        <div
          className={`absolute top-0 inset-x-0 h-36 -z-0 transition-all duration-500 ${
            isSuccess
              ? 'bg-gradient-to-b from-amber-500 via-yellow-600 to-transparent'
              : isFailure
              ? 'bg-gradient-to-b from-rose-700 via-rose-900 to-transparent'
              : 'bg-gradient-to-b from-amber-500 via-yellow-700 to-transparent'
          }`}
        />

        {/* Ambient Radial Lights */}
        {isSuccess && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        )}
        {isFailure && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        )}

        {/* Top Controls: Tag and Board Peek Toggle */}
        <div className="relative z-10 w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[10px] sm:text-xs font-black tracking-widest text-amber-200 uppercase">
              カード発動: 私は豪運！
            </span>
          </div>

          {/* Peek Board Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={() => setIsPeekTranslucent(true)}
              onMouseUp={() => setIsPeekTranslucent(false)}
              onMouseLeave={() => setIsPeekTranslucent(false)}
              onTouchStart={() => setIsPeekTranslucent(true)}
              onTouchEnd={() => setIsPeekTranslucent(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 text-amber-100 text-[11px] font-bold border border-white/20 cursor-pointer active:scale-95 select-none transition-all"
              title="押している間、カードが透けて盤面が見えます"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>透過</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black shadow-md border border-amber-300/60 cursor-pointer active:scale-95 transition-all"
              title="盤面を自由に確認します"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>盤面確認</span>
            </button>
          </div>
        </div>

        {/* Staging Title */}
        <div className="relative z-10 flex flex-col items-center my-1">
          <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide flex items-center gap-2 drop-shadow-md">
            <span>🎲</span>
            <span>運命の豪運ダイス！</span>
            <span>✨</span>
          </div>
          <p className="text-xs text-amber-100/90 font-medium mt-0.5">
            {player.name} の運命を賭けたサイコロチャレンジ！
          </p>
        </div>

        {/* Target Land Card Box */}
        <div className="relative z-10 w-full bg-slate-900/90 border-2 border-amber-400/50 rounded-2xl p-3 my-2 shadow-lg text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-white text-sm">
              <span className="w-5 h-5 rounded bg-amber-400 text-slate-950 text-xs font-mono flex items-center justify-center">
                #{tile.landNumber}
              </span>
              <span>{tile.name}</span>
            </div>
            <div className="text-xs text-slate-300">
              通常契約金: <strong className="text-amber-300">{effectiveCost}M</strong>
            </div>
          </div>

          {/* Odds Visual Breakdown */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-700/80 text-[11px]">
            <div
              className={`p-2 rounded-xl border transition-all ${
                isSuccess
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                  : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="font-black text-emerald-400 flex items-center gap-1">
                <span>🌟 出目 2〜6 (確率 83%)</span>
              </div>
              <div className="font-black text-sm text-emerald-300 mt-0.5">
                無料 (0マニー) で契約！
              </div>
            </div>

            <div
              className={`p-2 rounded-xl border transition-all ${
                isFailure
                  ? 'bg-rose-950/80 border-rose-400 text-rose-200 ring-2 ring-rose-400 animate-pulse'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="font-black text-rose-400 flex items-center gap-1">
                <span>💥 出目 1 (確率 17%)</span>
              </div>
              <div className="font-black text-sm text-rose-300 mt-0.5">
                倍額 ({doubleCost}マニー) で契約…
              </div>
            </div>
          </div>
        </div>

        {/* Center Dice Rolling Stage */}
        <div className="relative z-10 w-full py-4 flex flex-col items-center justify-center min-h-[170px]">
          {/* Animated 3D Dice */}
          <div
            className={`transition-all duration-300 ${
              isSuccess
                ? 'scale-110 drop-shadow-[0_0_25px_rgba(250,204,21,0.8)]'
                : isFailure
                ? 'scale-105 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-shake'
                : isRolling
                ? 'animate-bounce-subtle'
                : ''
            }`}
          >
            <Dice
              value={rolledNumber || 1}
              isRolling={isRolling}
              onRoll={handleRoll}
              disabled={!isMyTurn || isRolling || rolledNumber !== null}
              size="lg"
            />
          </div>

          {/* Staging Result Banner */}
          {rolledNumber !== null ? (
            <div className="mt-4 flex flex-col items-center gap-1.5 animate-scale-up">
              {isSuccess ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xl sm:text-2xl font-black text-yellow-300 drop-shadow-lg flex items-center gap-1.5 animate-bounce-subtle">
                    <span>✨</span>
                    <span>大 豪 運 達 成 ！！</span>
                    <span>🎉</span>
                  </div>
                  <div className="bg-emerald-950/80 border-2 border-emerald-400 text-emerald-200 px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg">
                    出目 【 {rolledNumber} 】！ タダ（0マニー）で契約成立！
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xl sm:text-2xl font-black text-rose-400 drop-shadow-lg flex items-center gap-1.5">
                    <span>💀</span>
                    <span>痛 恨 の 出 目 【 1 】 …</span>
                    <span>💥</span>
                  </div>
                  <div className="bg-rose-950/80 border-2 border-rose-400 text-rose-200 px-4 py-1.5 rounded-2xl text-xs sm:text-sm font-black shadow-lg">
                    倍額の契約金（{doubleCost}マニー）での契約となります！
                    {!canAffordDouble && (
                      <span className="block text-[11px] text-rose-300 mt-0.5">
                        ※所持金（{player.money}M）が足りないため契約できませんでした…
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 text-xs sm:text-sm font-bold text-amber-200">
              {isRolling
                ? 'サイコロ回転中… 運命の瞬間！'
                : isMyTurn
                ? '下のボタンを押してサイコロを振ってください！'
                : `${player.name} がサイコロを振るのを待機しています…`}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 w-full mt-2 flex flex-col gap-2">
          {rolledNumber === null ? (
            isMyTurn ? (
              <button
                type="button"
                onClick={handleRoll}
                disabled={isRolling}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer border-2 border-amber-300/80 animate-pulse disabled:opacity-50"
              >
                {isRolling ? '運命のダイス回転中…！' : '豪運のサイコロを振る！'}
              </button>
            ) : (
              <div className="text-xs text-amber-300 font-bold bg-amber-950/60 p-2.5 rounded-xl border border-amber-400/40 animate-pulse">
                相手の手番操作を待機中…
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={() => onFinish(rolledNumber)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl cursor-pointer active:scale-95 transition-all border border-emerald-300/60 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>契約を確定して進む</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
