import React, { useState } from 'react';
import { EventCard, Player, Tile } from '../types/game';
import { Dice } from './Dice';
import { getLotteryResult } from '../utils/eventCards';
import { sounds } from '../utils/audio';
import {
  Sparkles,
  AlertTriangle,
  Users,
  Eye,
  EyeOff,
  Layers,
  ChevronUp,
  MapPin,
} from 'lucide-react';

interface EventCardModalProps {
  card: EventCard;
  player: Player;
  playerOwnedLands: Tile[];
  allPlayers?: Player[];
  allTiles?: Tile[];
  onConfirm: (resultPayload?: {
    diceRoll?: number;
    fluctuationMultiplier?: 0.5 | 2.0;
    lotteryMoney?: number;
    majorDamageChoice?: 'pay' | 'relinquish';
    majorDamageTileId?: number;
    majorDamageTargetPlayerId?: string;
    transferRightsTileId?: number;
  }) => void;
}

export const EventCardModal: React.FC<EventCardModalProps> = ({
  card,
  player,
  playerOwnedLands,
  allPlayers = [],
  allTiles = [],
  onConfirm,
}) => {
  // Minimize / Peek mode for checking board
  const [isMinimized, setIsMinimized] = useState(false);
  // Translucent peek (hold to view board through modal)
  const [isPeekTranslucent, setIsPeekTranslucent] = useState(false);

  // Dice rolling state for cards that require a roll
  const [isRolling, setIsRolling] = useState(false);
  const [diceVal, setDiceVal] = useState(1);
  const [hasRolled, setHasRolled] = useState(false);

  // Opponents for Major Damage & Transfer Rights
  const opponents = allPlayers.filter((p) => p.id !== player.id);
  const opponentsWithLands = opponents.filter((p) =>
    allTiles.some((t) => t.ownerId === p.id)
  );

  // All opponent-owned lands (for Transfer Rights)
  const allOpponentLands = allTiles.filter(
    (t) => t.type === 'land' && t.ownerId && t.ownerId !== player.id
  );

  const [selectedTransferTileId, setSelectedTransferTileId] = useState<number | null>(() => {
    return allOpponentLands.length > 0 ? allOpponentLands[0].id : null;
  });

  const [selectedOpponentId, setSelectedOpponentId] = useState<string>(() => {
    if (opponentsWithLands.length > 0) return opponentsWithLands[0].id;
    if (opponents.length > 0) return opponents[0].id;
    return '';
  });

  const selectedOpponent = opponents.find((p) => p.id === selectedOpponentId) || null;
  const opponentOwnedLands = selectedOpponent
    ? allTiles.filter((t) => t.ownerId === selectedOpponent.id)
    : [];

  const [targetDamageTileId, setTargetDamageTileId] = useState<number | null>(() => {
    if (opponentOwnedLands.length > 0) {
      return opponentOwnedLands[0].id;
    }
    return null;
  });

  // When selected opponent changes, pick their first land
  const handleSelectOpponent = (oppId: string) => {
    setSelectedOpponentId(oppId);
    const lands = allTiles.filter((t) => t.ownerId === oppId);
    if (lands.length > 0) {
      setTargetDamageTileId(lands[0].id);
    } else {
      setTargetDamageTileId(null);
    }
  };

  const currentDamageTile = allTiles.find((t) => t.id === targetDamageTileId) || null;
  const selectedTransferTile = allOpponentLands.find((t) => t.id === selectedTransferTileId) || null;

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

  // Major Damage resolution on other player
  const handleApplyMajorDamage = () => {
    if (!selectedOpponent || !currentDamageTile) {
      onConfirm();
      return;
    }
    // If opponent has >= 200M, they pay 200M to save it. If not, they relinquish the land!
    const choice = selectedOpponent.money >= 200 ? 'pay' : 'relinquish';
    onConfirm({
      majorDamageChoice: choice,
      majorDamageTileId: currentDamageTile.id,
      majorDamageTargetPlayerId: selectedOpponent.id,
    });
  };

  // If minimized to allow full board inspection:
  if (isMinimized) {
    return (
      <>
        {/* Top Floating Notification Badge */}
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-900/95 text-white border-2 border-indigo-400 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md animate-bounce-subtle">
          <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>盤面確認中（マスをタップして詳細確認できます）</span>
        </div>

        {/* Bottom Floating Dock with Card summary & Restore button */}
        <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg z-50 pointer-events-auto animate-slide-up">
          <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3 sm:p-4 border-2 border-indigo-400 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <span className="text-2xl sm:text-3xl shrink-0 p-1.5 bg-indigo-500/20 border border-indigo-400/40 rounded-xl">
                {card.icon}
              </span>
              <div className="text-left overflow-hidden min-w-0">
                <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider truncate">
                  {card.subtitle}
                </div>
                <div className="text-xs sm:text-sm font-black text-white truncate">
                  {card.title}
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {card.type === 'transfer_rights' && selectedTransferTile
                    ? `買収選択中: No.${selectedTransferTile.landNumber} ${selectedTransferTile.name} (${selectedTransferTile.cost}M)`
                    : card.type === 'major_damage' && currentDamageTile && selectedOpponent
                    ? `直撃対象: ${selectedOpponent.name} の No.${currentDamageTile.landNumber} ${currentDamageTile.name}`
                    : card.description}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all border border-indigo-300/40 animate-pulse"
            >
              <EyeOff className="w-4 h-4" />
              <span>カードに戻る</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 transition-all duration-200 ${
        isPeekTranslucent
          ? 'bg-transparent pointer-events-none'
          : 'bg-black/60 backdrop-blur-xs'
      }`}
    >
      <div
        className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-indigo-400 overflow-hidden flex flex-col items-center text-center p-5 sm:p-7 max-h-[92vh] overflow-y-auto transition-all duration-200 ${
          isPeekTranslucent
            ? 'opacity-15 scale-95 pointer-events-none'
            : 'opacity-100 scale-100 animate-scale-up'
        }`}
      >
        {/* Card Header Sparkle Background */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-indigo-500 to-purple-600 -z-0" />

        {/* Top Controls: Subtitle and Peek Board Toggle Buttons */}
        <div className="relative z-10 w-full flex items-center justify-between mb-2">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-indigo-100 uppercase bg-black/30 px-2.5 py-0.5 rounded-full">
            {card.subtitle}
          </span>

          {/* Board Peek / Transparency Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={() => setIsPeekTranslucent(true)}
              onMouseUp={() => setIsPeekTranslucent(false)}
              onMouseLeave={() => setIsPeekTranslucent(false)}
              onTouchStart={() => setIsPeekTranslucent(true)}
              onTouchEnd={() => setIsPeekTranslucent(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 hover:bg-black/60 text-indigo-100 hover:text-white text-[11px] font-bold border border-white/20 transition-all cursor-pointer active:scale-95 select-none"
              title="押している間、カードが透けて盤面が見えます"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>長押し透過</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black shadow-md border border-indigo-300/40 transition-all cursor-pointer active:scale-95"
              title="カードを最小化して盤面を自由に操作・確認します"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>盤面を確認</span>
            </button>
          </div>
        </div>

        {/* Card Icon Token */}
        <div className="relative z-10 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-3xl sm:text-4xl border-4 border-amber-300 mb-2">
          {card.icon}
        </div>

        {/* Title */}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {card.title}
          </h2>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 w-full">
          {card.description}
        </p>

        {/* Special Card Interactive Panels */}

        {/* 1. Price Fluctuation (価格変動) */}
        {card.type === 'price_fluctuation' && (
          <div className="mt-4 w-full flex flex-col items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
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
                  className={`text-base sm:text-lg font-black px-4 py-1.5 rounded-full ${
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
          <div className="mt-4 w-full flex flex-col items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-200">
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
                      className={`text-sm sm:text-base font-black px-4 py-2 rounded-2xl ${
                        res.money > 0
                          ? 'bg-amber-400 text-amber-950 border border-amber-500 shadow-md'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      出目: {diceVal}【{res.rank}】
                      <div className="text-xs sm:text-sm font-bold mt-1">{res.message}</div>
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

        {/* 3. Major Damage (大損害！ - 対象は自分以外のプレイヤー1名) */}
        {card.type === 'major_damage' && (
          <div className="mt-4 w-full flex flex-col items-center gap-3">
            {opponentsWithLands.length > 0 && selectedOpponent && currentDamageTile ? (
              <div className="w-full bg-rose-50 p-3.5 sm:p-4 rounded-2xl border border-rose-200 text-left">
                {/* Opponent Selector if multiple have lands */}
                {opponentsWithLands.length > 1 && (
                  <div className="mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-600">
                        対象の相手プレイヤーを選択:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsMinimized(true)}
                        className="text-[10px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        盤面を確認
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {opponentsWithLands.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => handleSelectOpponent(opp.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
                            opp.id === selectedOpponentId
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <span>{opp.avatar}</span>
                          <span>{opp.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-rose-700 font-black text-xs sm:text-sm mb-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      直撃対象: {selectedOpponent.name} の No.{currentDamageTile.landNumber}「{currentDamageTile.name}」
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="shrink-0 text-[10px] bg-rose-100 hover:bg-rose-200 text-rose-800 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 cursor-pointer"
                    title="この土地の盤面での位置を確認"
                  >
                    <MapPin className="w-3 h-3" />
                    位置確認
                  </button>
                </div>

                <div className="text-xs text-slate-700 mb-3 bg-white/80 p-2.5 rounded-xl border border-rose-100 flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">相手の所持金:</span>
                    <span className="font-bold">{selectedOpponent.money} マニー</span>
                  </div>
                  <div className="flex justify-between font-black text-rose-600">
                    <span>必要修繕費:</span>
                    <span>200 マニー</span>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    {selectedOpponent.money >= 200 ? (
                      <span className="text-emerald-700 font-bold">
                        ※相手は200マニーを支払って土地を維持します（-200M）
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold">
                        ※相手は200マニーを支払えないため、この土地は【未契約】に戻ります！
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyMajorDamage}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer"
                >
                  大損害を発動する！
                </button>
              </div>
            ) : (
              <div className="w-full bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold">
                自分以外のプレイヤーは誰も土地を所有していないため、被害は発生しませんでした！
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

        {/* 4. Disaster (災害発生！ - 対象は全プレイヤー、1件につき50M) */}
        {card.type === 'disaster' && (
          <div className="mt-4 w-full bg-amber-50 p-3.5 sm:p-4 rounded-2xl border border-amber-200 text-slate-800 text-left flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-amber-900 font-black text-xs">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>全プレイヤーの被害状況（所有地1箇所につき 50M）:</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-[10px] text-amber-800 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                盤面確認
              </button>
            </div>

            <div className="flex flex-col gap-1.5 bg-white/90 p-2.5 sm:p-3 rounded-xl border border-amber-100 max-h-36 overflow-y-auto">
              {allPlayers.map((p) => {
                const count = allTiles.filter((t) => t.ownerId === p.id).length;
                const cost = count * 50;
                return (
                  <div key={p.id} className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <span>{p.avatar}</span>
                      <span>{p.name}</span>
                      <span className="text-slate-500 text-[10px] font-normal">
                        ({count}件所有)
                      </span>
                    </span>
                    <span
                      className={`font-black ${
                        cost > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {cost > 0 ? `-${cost} マニー` : '被害なし (0M)'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onConfirm()}
              className="mt-1 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md"
            >
              全プレイヤーが修繕費（50M/件）を支払う
            </button>
          </div>
        )}

        {/* 5. Transfer Rights (権利の譲渡: 他のプレイヤーの土地を契約金を支払えば購入できる) */}
        {card.type === 'transfer_rights' && (
          <div className="mt-3.5 w-full flex flex-col gap-2.5 text-left">
            {allOpponentLands.length > 0 ? (
              <div className="w-full bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    買収する相手の土地を選択（契約金を支払います）:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      所持金: {player.money}M
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMinimized(true)}
                      className="text-[10px] text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 cursor-pointer"
                      title="盤面を直接見て土地を確認"
                    >
                      <Eye className="w-3 h-3" />
                      盤面を確認
                    </button>
                  </div>
                </div>

                <div className="max-h-36 overflow-y-auto flex flex-col gap-1.5 pr-1">
                  {allOpponentLands.map((land) => {
                    const owner = allPlayers.find((p) => p.id === land.ownerId);
                    const canAfford = player.money >= (land.cost || 0);
                    const isSelected = selectedTransferTileId === land.id;

                    return (
                      <button
                        key={land.id}
                        type="button"
                        onClick={() => setSelectedTransferTileId(land.id)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        } ${!canAfford ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{owner?.avatar || '👤'}</span>
                          <div>
                            <div className="text-xs font-black text-slate-800 flex items-center gap-1">
                              <span>No.{land.landNumber} {land.name}</span>
                              {land.rank ? (
                                <span className="text-[10px] text-amber-600 font-bold">
                                  (★Lv.2→初期化)
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              持ち主: {owner?.name || '相手'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-xs font-black ${
                              canAfford ? 'text-indigo-600' : 'text-rose-500'
                            }`}
                          >
                            {land.cost} マニー
                          </span>
                          {!canAfford && (
                            <span className="block text-[9px] text-rose-500 font-bold">
                              資金不足
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500">
                  ※買収後、ランクアップ状態は初期化（Lv.1）されます。
                </p>

                {(() => {
                  const targetLand = allOpponentLands.find((t) => t.id === selectedTransferTileId);
                  const canAfford = targetLand && player.money >= (targetLand.cost || 0);

                  return (
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (targetLand && canAfford) {
                            onConfirm({ transferRightsTileId: targetLand.id });
                          }
                        }}
                        disabled={!canAfford}
                        className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                      >
                        {targetLand
                          ? `買収する (${targetLand.cost}M支払)`
                          : '土地を選択してください'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onConfirm()}
                        className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        見送る
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="w-full bg-slate-100 p-4 rounded-2xl border border-slate-200 text-slate-600 text-center text-xs font-bold">
                相手が所有している土地がないため、買収は行えませんでした。
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

        {/* 6. Info Manipulation (情報操作) */}
        {card.type === 'info_manipulation' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-xs font-bold text-indigo-900">
              🎯 次の自分の番で【1〜6】の出目を自由に指定できるようになります！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              情報操作カードを取得する
            </button>
          </div>
        )}

        {/* 7. Surge Rent (支払額上昇) */}
        {card.type === 'surge_rent' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-rose-50 p-3 rounded-2xl border border-rose-200 text-xs font-bold text-rose-900">
              💥 一度だけ、誰かが自分の土地に止まったときの支払額が【2倍】に跳ね上がります！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              支払額上昇カードを取得する
            </button>
          </div>
        )}

        {/* 8. Real Estate Sale (不動産セール) */}
        {card.type === 'real_estate_sale' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900">
              🏷️ 全土地の契約金がすべて【半額】に！全員で合計【3回】の契約が行われるまで持続します！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              不動産セールを開始する！
            </button>
          </div>
        )}

        {/* 9. Feel Good Roll (なんだか気分がいい！) */}
        {card.type === 'feel_good_roll' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
              ✨ 気分爽快！即座にもう一度サイコロを振って進むことができます！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              もう一度サイコロを振る！
            </button>
          </div>
        )}

        {/* 10. Slacking Off (次から頑張る) */}
        {card.type === 'slacking_off' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs font-bold text-purple-900">
              💤 即座に【+100マニー】を獲得しますが、次の自分のターンは【1回休み】になります！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              100マニーを受け取って休む
            </button>
          </div>
        )}

        {/* 11. Drinking Party (飲み会をしよう！) */}
        {card.type === 'drinking_party' && (
          <div className="mt-4 w-full flex flex-col items-center gap-2.5">
            <div className="w-full bg-orange-50 p-3 rounded-2xl border border-orange-200 text-xs font-bold text-orange-900">
              🍻 全プレイヤーが【占いの館】にワープ集合！その後、全員が【50マニー】を消費します！
            </div>
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl shadow-md cursor-pointer active:scale-98"
            >
              全員で集まって乾杯する（-50M）
            </button>
          </div>
        )}

        {/* 12. Standard Confirm for remaining standard cards */}
        {['windfall', 'sudden_expense', 'rent_exemption', 'super_lucky'].includes(card.type) && (
          <div className="mt-5 w-full">
            <button
              type="button"
              onClick={() => onConfirm()}
              className="w-full py-3 bg-slate-900 text-white font-black text-base rounded-2xl shadow-lg hover:bg-slate-800 cursor-pointer active:scale-98 transition-all"
            >
              カードの効果を適用する
            </button>
          </div>
        )}

        {/* Quick Board Peek footer trigger */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>盤面のマスやプレイヤーの状況を確認する</span>
        </button>
      </div>
    </div>
  );
};
