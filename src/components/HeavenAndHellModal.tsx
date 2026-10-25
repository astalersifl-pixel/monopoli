import React, { useState } from 'react';
import { Player, Tile } from '../types/game';
import { Dice } from './Dice';
import { sounds } from '../utils/audio';
import { Scale, Eye, EyeOff, Sparkles, Flame, Skull, Trophy } from 'lucide-react';

interface HeavenAndHellModalProps {
  player: Player;
  players: Player[];
  tiles: Tile[];
  isMyTurn: boolean;
  onFinish: (result: {
    roll: number;
    moneyDelta?: number;
    uncontractedTileIds?: number[];
    targetOpponentId?: string;
  }) => void;
}

export const HeavenAndHellModal: React.FC<HeavenAndHellModalProps> = ({
  player,
  players,
  tiles,
  isMyTurn,
  onFinish,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [resultDetails, setResultDetails] = useState<{
    text: string;
    type: 'heaven' | 'hell';
    moneyDelta?: number;
    uncontractedTileIds?: number[];
    targetOpponentId?: string;
  } | null>(null);

  const handleRoll = () => {
    if (isRolling || rolledNumber !== null) return;
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setRolledNumber(roll);
      setIsRolling(false);

      if (roll === 1 || roll === 2) {
        // 天国: +200マニー
        sounds.playWin();
        setResultDetails({
          text: '✨【天国】大幸運！200マニーを獲得しました！',
          type: 'heaven',
          moneyDelta: 200,
        });
      } else if (roll === 3 || roll === 4) {
        // 地獄: -200マニー
        sounds.playBuzzer();
        setResultDetails({
          text: '💀【地獄】痛恨の厄災！200マニーを没収されます…',
          type: 'hell',
          moneyDelta: -200,
        });
      } else if (roll === 5) {
        // 地獄: 自身の土地3つ未契約化
        sounds.playBuzzer();
        const myLands = tiles.filter((t) => t.type === 'land' && t.ownerId === player.id);
        const shuffled = [...myLands].sort(() => Math.random() - 0.5);
        const lost = shuffled.slice(0, 3);
        const lostIds = lost.map((t) => t.id);

        if (lost.length > 0) {
          const names = lost.map((t) => `No.${t.landNumber}「${t.name}」`).join('、');
          setResultDetails({
            text: `💥【地獄】バブル大崩壊！自身の所有地 ${lost.length}件（${names}）が未契約に戻ってしまいました！`,
            type: 'hell',
            uncontractedTileIds: lostIds,
          });
        } else {
          setResultDetails({
            text: '💥【地獄】自身の土地を3つ未契約化！…しかし土地を1つも所有していなかったため無傷で済みました！',
            type: 'hell',
            uncontractedTileIds: [],
          });
        }
      } else if (roll === 6) {
        // 天国: 自身以外のランダムプレイヤーの土地3つ未契約化
        sounds.playWin();
        const opponents = players.filter((p) => p.id !== player.id);
        const opponentsWithLands = opponents.filter((p) =>
          tiles.some((t) => t.type === 'land' && t.ownerId === p.id)
        );

        if (opponentsWithLands.length > 0) {
          const targetOpp =
            opponentsWithLands[Math.floor(Math.random() * opponentsWithLands.length)];
          const oppLands = tiles.filter(
            (t) => t.type === 'land' && t.ownerId === targetOpp.id
          );
          const shuffled = [...oppLands].sort(() => Math.random() - 0.5);
          const lost = shuffled.slice(0, 3);
          const lostIds = lost.map((t) => t.id);
          const names = lost.map((t) => `No.${t.landNumber}「${t.name}」`).join('、');

          setResultDetails({
            text: `⚡【天国】ライバル失脚！ ${targetOpp.name} が選ばれ、所有地 ${lost.length}件（${names}）が未契約に戻りました！`,
            type: 'heaven',
            targetOpponentId: targetOpp.id,
            uncontractedTileIds: lostIds,
          });
        } else {
          setResultDetails({
            text: '⚡【天国】ライバルの土地を3つ未契約化！…しかし相手は誰も土地を所有していませんでした。',
            type: 'heaven',
            uncontractedTileIds: [],
          });
        }
      }
    }, 1000);
  };

  const handleConfirm = () => {
    if (!rolledNumber || !resultDetails) return;
    onFinish({
      roll: rolledNumber,
      moneyDelta: resultDetails.moneyDelta,
      uncontractedTileIds: resultDetails.uncontractedTileIds,
      targetOpponentId: resultDetails.targetOpponentId,
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-900/95 text-white border-2 border-amber-400 px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs font-black backdrop-blur-md animate-bounce-subtle">
        <span className="text-amber-400 flex items-center gap-1">
          <Scale className="w-4 h-4" />
          ⚖️ 天国と地獄マス進行中
        </span>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer shadow-md"
        >
          マス画面に戻る
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl shadow-2xl border-2 border-amber-500/50 p-5 sm:p-6 flex flex-col overflow-hidden text-center">
        {/* Peek / Minimize Button */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-bold text-amber-200/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>盤面を見る</span>
        </button>

        {/* Title & Badge */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl animate-pulse">⚖️</span>
          <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-rose-400 bg-clip-text text-transparent">
            天国と地獄
          </h2>
          <span className="text-2xl animate-pulse">🔥</span>
        </div>
        <p className="text-[11px] text-amber-200/80 font-bold mb-3">
          バブル期限定！カジノが閉店し、運命を二分する審判のマスへと変貌！
        </p>

        {/* Outlines of 4 Possibilities */}
        <div className="grid grid-cols-2 gap-2 text-left text-[11px] mb-4">
          <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-black text-emerald-300 flex items-center gap-1">
              <span>😇 出目 【1・2】:</span>
            </span>
            <span className="text-white font-bold">200マニー獲得！</span>
          </div>
          <div className="bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-black text-rose-300 flex items-center gap-1">
              <span>😈 出目 【3・4】:</span>
            </span>
            <span className="text-white font-bold">200マニー没収！</span>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/40 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-black text-purple-300 flex items-center gap-1">
              <span>💀 出目 【5】:</span>
            </span>
            <span className="text-purple-100 font-bold">自身の土地を3つ未契約化</span>
          </div>
          <div className="bg-amber-950/40 border border-amber-500/40 p-2.5 rounded-xl flex flex-col gap-0.5">
            <span className="font-black text-amber-300 flex items-center gap-1">
              <span>⚡ 出目 【6】:</span>
            </span>
            <span className="text-amber-100 font-bold">相手1名の土地を3つ未契約化</span>
          </div>
        </div>

        {/* Stage / Dice */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 my-1">
          <Dice
            value={rolledNumber || 1}
            isRolling={isRolling}
            onRoll={isMyTurn && !rolledNumber ? handleRoll : undefined}
            disabled={!isMyTurn || isRolling || rolledNumber !== null}
            size="lg"
            label={
              isRolling
                ? '運命のダイス回転中…'
                : rolledNumber
                ? `🎲 出目 【 ${rolledNumber} 】！`
                : 'サイコロを振ってください'
            }
          />

          {!rolledNumber ? (
            isMyTurn ? (
              <button
                type="button"
                onClick={handleRoll}
                disabled={isRolling}
                className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg cursor-pointer transition-all disabled:opacity-50"
              >
                {isRolling ? '審判中…' : 'サイコロを振って運命を決める！'}
              </button>
            ) : (
              <div className="text-xs text-amber-200 font-bold bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-500/30 animate-pulse">
                {player.name} の運命のダイスを待機中…
              </div>
            )
          ) : (
            <div
              className={`w-full p-3 rounded-xl border text-xs sm:text-sm font-black animate-scale-up ${
                resultDetails?.type === 'heaven'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                  : 'bg-rose-950/80 border-rose-400 text-rose-200'
              }`}
            >
              <p>{resultDetails?.text}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {rolledNumber && isMyTurn && (
          <button
            type="button"
            onClick={handleConfirm}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            効果を適用してターンを進める
          </button>
        )}
      </div>
    </div>
  );
};
