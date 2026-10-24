import React, { useState } from 'react';
import { Player } from '../types/game';
import { Dice } from './Dice';
import { sounds } from '../utils/audio';
import { Dices, Sparkles, Trophy, LogOut } from 'lucide-react';

interface CasinoModalProps {
  player: Player;
  onFinish: (netProfit: number) => void;
}

export const CasinoModal: React.FC<CasinoModalProps> = ({ player, onFinish }) => {
  const [betAmount, setBetAmount] = useState<number>(Math.min(100, Math.max(50, Math.floor(player.money * 0.1))));
  const [betType, setBetType] = useState<'high' | 'low' | 'one'>('high');
  const [isRolling, setIsRolling] = useState(false);
  const [diceRoll, setDiceRoll] = useState(1);
  const [result, setResult] = useState<{
    won: boolean;
    profit: number;
    message: string;
  } | null>(null);

  const canPlay = player.money >= 50;

  const handleRoll = () => {
    if (isRolling || result !== null || player.money < betAmount) return;
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceRoll(roll);
      setIsRolling(false);

      let won = false;
      let multiplier = 0;

      if (betType === 'high' && roll >= 4) {
        won = true;
        multiplier = 2;
      } else if (betType === 'low' && roll <= 3) {
        won = true;
        multiplier = 2;
      } else if (betType === 'one' && roll === 1) {
        won = true;
        multiplier = 5;
      }

      if (won) {
        const winProfit = betAmount * (multiplier - 1); // Net gain
        setResult({
          won: true,
          profit: winProfit,
          message: `大当たり！出目【${roll}】で ${multiplier}倍配当！+${winProfit}マニー獲得！`,
        });
        sounds.playWin();
      } else {
        setResult({
          won: false,
          profit: -betAmount,
          message: `残念…出目は【${roll}】でした。-${betAmount}マニー。`,
        });
        sounds.playBuzzer();
      }
    }, 1000);
  };

  const handleClose = () => {
    onFinish(result ? result.profit : 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border-4 border-amber-500 overflow-hidden flex flex-col items-center text-center p-6 sm:p-8">
        {/* Glow header */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2 text-amber-400 font-black text-xl mb-1">
          <Dices className="w-7 h-7 animate-bounce-subtle" />
          <span>GOLDEN CASINO</span>
        </div>
        <p className="text-xs text-amber-200/80 mb-4 font-bold">
          一攫千金のダイス勝負！出目を予測してマニーを増やせ！
        </p>

        {/* Player Cash Indicator */}
        <div className="flex items-center justify-between w-full bg-white/5 border border-amber-500/30 px-4 py-2 rounded-xl mb-4 text-sm font-bold">
          <span className="text-slate-300">現在の所持金:</span>
          <span className="text-amber-400 font-black text-base">{player.money} マニー</span>
        </div>

        {/* Dice Area */}
        <div className="my-2">
          <Dice value={diceRoll} isRolling={isRolling} size="lg" />
        </div>

        {result === null ? (
          <div className="w-full flex flex-col gap-4 mt-2">
            {/* Bet Type Selection */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-slate-300">掛け方を選択 (オッズ):</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBetType('low')}
                  disabled={isRolling}
                  className={`py-2 px-2 rounded-xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    betType === 'low'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  小 (1, 2, 3)
                  <span className="block text-[10px] opacity-80">2倍配当</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBetType('high')}
                  disabled={isRolling}
                  className={`py-2 px-2 rounded-xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    betType === 'high'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  大 (4, 5, 6)
                  <span className="block text-[10px] opacity-80">2倍配当</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBetType('one')}
                  disabled={isRolling}
                  className={`py-2 px-2 rounded-xl border text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    betType === 'one'
                      ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-102'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
                >
                  1の目ピンポイント
                  <span className="block text-[10px] text-amber-300 font-black">5倍配当！</span>
                </button>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="flex flex-col gap-1.5 text-left">
              <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                <span>賭け金:</span>
                <span className="text-amber-400 font-black text-sm">{betAmount} マニー</span>
              </div>
              <div className="flex gap-2">
                {[50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBetAmount(Math.min(player.money, amt))}
                    disabled={player.money < amt || isRolling}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                      betAmount === amt
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-30'
                    }`}
                  >
                    {amt}M
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBetAmount(player.money)}
                  disabled={player.money <= 0 || isRolling}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-rose-500/50 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer disabled:opacity-30"
                >
                  ALL-IN
                </button>
              </div>
            </div>

            {/* Roll and Skip Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={handleRoll}
                disabled={!canPlay || isRolling || betAmount <= 0}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-base rounded-2xl shadow-xl hover:brightness-110 active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRolling ? 'ダイス勝負中…' : 'サイコロを振って勝負！'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isRolling}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                勝負せずに立ち去る
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 mt-3">
            <div
              className={`w-full p-4 rounded-2xl border ${
                result.won
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
              }`}
            >
              <div className="text-xl font-black mb-1">
                {result.won ? '🎉 VICTORY! 大勝利！' : '💸 DEFEAT... 敗北'}
              </div>
              <p className="text-sm font-bold">{result.message}</p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base rounded-2xl shadow-lg cursor-pointer"
            >
              カジノを出てゲームに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
