import React, { useState } from 'react';
import { EventCard, Player, Tile } from '../types/game';
import { Dice } from './Dice';
import { getLotteryResult } from '../utils/eventCards';
import { sounds } from '../utils/audio';
import { Sparkles, AlertTriangle, ShieldCheck, DollarSign, Dices, Flame } from 'lucide-react';

interface EventCardModalProps {
  card: EventCard;
  player: Player;
  playerOwnedLands: Tile[];
  onConfirm: (resultPayload?: {
    diceRoll?: number;
    fluctuationMultiplier?: 0.5 | 2.0;
    lotteryMoney?: number;
    majorDamageChoice?: 'pay' | 'relinquish';
    majorDamageTileId?: number;
  }) => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({
  card,
  player,
  playerOwnedLands,
  onConfirm,
}) => {
  // Dice rolling state for cards that require a roll
  const [isRolling, setIsRolling] = useState(false);
  const [diceVal, setDiceVal] = useState(1);
  const [hasRolled, setHasRolled] = useState(false);
  const [selectedDamageTile, setSelectedDamageTile] = useState<Tile | null>(() => {
    if (card.type === 'major_damage' && playerOwnedLands.length > 0) {
      const idx = Math.floor(Math.random() * playerOwnedLands.length);
      return playerOwnedLands[idx];
    }
    return null;
  });

  const handleRollDice = () => {
    if (isRolling || hasRolled) return;
    setIsRolling(true);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(roll);
      setIsRolling(false);
      setHasRolled(true);
      if (roll === 1 && card.type === 'lottery') {
        sounds.playWin();
      } else {
        sounds.playCoin();
      }
    }, 900);
  };

  const handleFinish = () => {
    if (card.type === 'price_fluctuation') {
      const isOdd = diceVal % 2 !== 0;
      const multiplier = isOdd ? 2.0 : 0.5;
      onConfirm({ diceRoll: diceVal, fluctuationMultiplier: multiplier });
    } else if (card.type === 'lottery') {
      const res = getLotteryResult(diceVal);
      onConfirm({ diceRoll: diceVal, lotteryMoney: res.money });
    } else {
      onConfirm();
    }
  };

  // Major Damage Handlers
  const handlePayDamage = () => {
    if (!selectedDamageTile) return;
    onConfirm({
      majorDamageChoice: 'pay',
      majorDamageTileId: selectedDamageTile.id,
    });
  };

  const handleRelinquishDamage = () => {
    if (!selectedDamageTile) return;
    onConfirm({
      majorDamageChoice: 'relinquish',
      majorDamageTileId: selectedDamageTile.id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-indigo-400 overflow-hidden flex flex-col items-center text-center p-6 sm:p-8 animate-scale-up">
        {/* Card Header Sparkle Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500 to-purple-600 -z-0" />

        {/* Card Icon Token */}
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-amber-300 mb-3">
          {card.icon}
        </div>

        {/* Title */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs font-black tracking-widest text-indigo-100 uppercase bg-black/30 px-3 py-0.5 rounded-full mb-1">
            {card.subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {card.title}
          </h2>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 w-full">
          {card.description}
        </p>

        {/* Special Card Interactive Panels */}

        {/* 1. Price Fluctuation (価格変動) */}
        {card.type === 'price_fluctuation' && (
          <div className="mt-5 w-full flex flex-col items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <Dice value={diceVal} isRolling={isRolling} onRoll={handleRollDice} disabled={hasRolled} />

            {!hasRolled ? (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-base rounded-xl shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isRolling ? 'サイコロを振っています…' : 'サイコロを振る！'}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`text-lg font-black px-4 py-1.5 rounded-full ${
                    diceVal % 2 !== 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  }`}
                >
                  出目: {diceVal} → {diceVal % 2 !== 0 ? '奇数【支払額2倍！】' : '偶数【支払額半分！】'}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  ※次の自分のターンまで盤面全体の家賃が変動します
                </p>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="mt-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 cursor-pointer"
                >
                  決定して進む
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. Lottery (宝くじに挑戦) */}
        {card.type === 'lottery' && (
          <div className="mt-5 w-full flex flex-col items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <Dice value={diceVal} isRolling={isRolling} onRoll={handleRollDice} disabled={hasRolled} />

            {!hasRolled ? (
              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base rounded-xl shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isRolling ? '宝くじ抽選中…' : 'くじのサイコロを振る！'}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {(() => {
                  const res = getLotteryResult(diceVal);
                  return (
                    <div
                      className={`text-base font-black px-4 py-2 rounded-2xl ${
                        res.money > 0
                          ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-md'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      出目: {diceVal}【{res.rank}】
                      <div className="text-sm font-bold mt-1">{res.message}</div>
                    </div>
                  );
                })()}
                <button
                  type="button"
                  onClick={handleFinish}
                  className="mt-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 cursor-pointer"
                >
                  賞金を受け取って進む
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. Major Damage (大損害！) */}
        {card.type === 'major_damage' && (
          <div className="mt-5 w-full flex flex-col items-center gap-3">
            {selectedDamageTile ? (
              <div className="w-full bg-rose-50 p-4 rounded-2xl border border-rose-200 text-left">
                <div className="flex items-center gap-2 text-rose-700 font-black text-sm mb-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  対象の土地: No.{selectedDamageTile.landNumber}「{selectedDamageTile.name}」
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  この土地を守るには【200マニー】の修繕費が必要です。支払えない、または支払わない場合は未契約（手放す）となります。
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handlePayDamage}
                    disabled={player.money < 200}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 text-white font-black text-sm rounded-xl hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >
                    200M払って維持する
                    {player.money < 200 && ' (残高不足)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRelinquishDamage}
                    className="flex-1 py-2.5 px-3 bg-slate-700 text-white font-black text-sm rounded-xl hover:bg-slate-600 shadow-sm cursor-pointer"
                  >
                    手放す (未契約にする)
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold">
                所有している土地がないため、被害は発生しませんでした！
                <button
                  type="button"
                  onClick={() => onConfirm()}
                  className="mt-3 w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. Disaster (災害発生！) */}
        {card.type === 'disaster' && (
          <div className="mt-5 w-full bg-amber-50 p-4 rounded-2xl border border-amber-200 text-slate-800 text-sm font-bold flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span>所有地数:</span>
              <span className="font-black text-slate-900">{playerOwnedLands.length} 箇所</span>
            </div>
            <div className="flex justify-between items-center text-rose-600 text-base border-t border-amber-200 pt-2 font-black">
              <span>必要修繕費 (100M/箇所):</span>
              <span>-{playerOwnedLands.length * 100} マニー</span>
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="mt-2 w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl cursor-pointer hover:bg-slate-800"
            >
              修繕費を支払う
            </button>
          </div>
        )}

        {/* 5. Regular Confirmation for windfall, sudden_expense, rent_exemption, super_lucky */}
        {['windfall', 'sudden_expense', 'rent_exemption', 'super_lucky'].includes(card.type) && (
          <div className="mt-6 w-full">
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-slate-900 text-white font-black text-base rounded-2xl shadow-lg hover:bg-slate-800 cursor-pointer active:scale-98 transition-all"
            >
              カードの効果を適用する
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
