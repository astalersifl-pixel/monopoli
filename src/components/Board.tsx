import React from 'react';
import {
  Tile,
  Player,
  ActivePriceFluctuation,
  GamePhase,
  GameLog,
} from '../types/game';
import { TileCell } from './TileCell';
import { Dice } from './Dice';
import {
  calculateLandRent,
  isAreaMonopoly,
  isAdjacentLandOwned,
} from '../utils/boardData';
import {
  Sparkles,
  Shield,
  TrendingUp,
  TrendingDown,
  Building,
  CheckCircle,
  XCircle,
  ArrowRight,
  HelpCircle,
  ScrollText,
} from 'lucide-react';

interface BoardProps {
  tiles: Tile[];
  players: Player[];
  currentPlayer: Player;
  currentDice: number;
  isRolling: boolean;
  gamePhase: GamePhase;
  activePriceFluctuation: ActivePriceFluctuation | null;
  realEstateSalePurchasesRemaining?: number;
  isBubbleEra?: boolean;
  logs: GameLog[];
  myPlayerId?: string;
  isOnline?: boolean;
  onRollDice: (chosenRoll?: number) => void;
  onSelectTile: (tile: Tile) => void;
  onBuyLand: () => void;
  onSkipBuyLand: () => void;
  onRankUpLand: () => void;
  onSkipRankUp: () => void;
  onFortuneHallChoice: (draw: boolean) => void;
  onPassingEventChoice?: (draw: boolean) => void;
  onStartClearanceChoice?: (clear: boolean) => void;
  onRollForSuperLucky: () => void;
  onHelloWorkRoll: () => void;
  onJailEscape?: () => void;
  onJailReleaseRoll?: () => void;
  jailReleaseDice?: [number, number];
  isJailRolling?: boolean;
  onConfirmJailRelease?: () => void;
  isDebugActive?: boolean;
  onDebugRewind?: () => void;
  onEndTurn: () => void;
  onOpenRules: () => void;
  onOpenLogs: () => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  players,
  currentPlayer,
  currentDice,
  isRolling,
  gamePhase,
  activePriceFluctuation,
  realEstateSalePurchasesRemaining = 0,
  isBubbleEra = false,
  logs,
  myPlayerId,
  isOnline,
  onRollDice,
  onSelectTile,
  onBuyLand,
  onSkipBuyLand,
  onRankUpLand,
  onSkipRankUp,
  onFortuneHallChoice,
  onPassingEventChoice,
  onStartClearanceChoice,
  onRollForSuperLucky,
  onHelloWorkRoll,
  onJailEscape,
  onJailReleaseRoll,
  jailReleaseDice,
  isJailRolling,
  onConfirmJailRelease,
  isDebugActive = false,
  onDebugRewind,
  onEndTurn,
  onOpenRules,
  onOpenLogs,
}) => {
  const currentTile = tiles[currentPlayer.position];
  const isMyTurn = !isOnline || currentPlayer.id === myPlayerId;
  const isHumanTurn = !currentPlayer.isAi && isMyTurn;
  const latestLog = logs && logs.length > 0 ? logs[logs.length - 1] : null;

  // Rent info for current tile if it's a land
  const currentLandRentInfo =
    currentTile && currentTile.type === 'land'
      ? calculateLandRent(
          currentTile,
          tiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0,
          isBubbleEra
        )
      : null;

  return (
    <div
      style={{
        width: 'min(98vw, calc(100dvh - 5.2rem))',
        height: 'min(98vw, calc(100dvh - 5.2rem))',
      }}
      className="aspect-square mx-auto p-1 sm:p-2 bg-slate-900/90 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-slate-700/80 backdrop-blur-md flex flex-col shrink-0"
    >
      {/* 9x9 CSS Grid layout */}
      <div className="w-full h-full grid grid-cols-9 grid-rows-9 gap-0.5 sm:gap-1 relative">
        {/* Render 32 outer perimeter tiles */}
        {tiles.map((tile) => {
          const rowStyle = {
            gridRow: `${tile.row + 1} / ${tile.row + 2}`,
            gridColumn: `${tile.col + 1} / ${tile.col + 2}`,
          };

          const isCurrentPlayerHere = currentPlayer.position === tile.id;

          return (
            <div key={tile.id} style={rowStyle} className="w-full h-full">
              <TileCell
                tile={tile}
                players={players}
                allTiles={tiles}
                activePriceFluctuation={activePriceFluctuation}
                isRealEstateSaleActive={realEstateSalePurchasesRemaining > 0}
                isBubbleEra={isBubbleEra}
                onSelectTile={onSelectTile}
                isCurrentPlayerHere={isCurrentPlayerHere}
              />
            </div>
          );
        })}

        {/* Center Dashboard (spans rows 2..8, cols 2..8: 7x7 inner area) */}
        <div
          style={{
            gridRow: '2 / 9',
            gridColumn: '2 / 9',
          }}
          className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border-2 border-indigo-500/30 p-2 sm:p-3 shadow-inner flex flex-col justify-between overflow-hidden relative z-10"
        >
          {/* Subtle Ambient Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top of Center: Current Player Banner & Active Fluctuations */}
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl animate-bounce-subtle">
                  {currentPlayer.avatar}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-white">
                      {currentPlayer.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        currentPlayer.isAi
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                          : 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                      }`}
                    >
                      {currentPlayer.isAi ? 'CPU' : 'YOU'}
                    </span>
                    {currentPlayer.name.includes('デバッグモード') && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950 border border-amber-300 shadow-2xs">
                        🛠️ デバッグモード
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-300 font-bold">
                    所持金: {currentPlayer.money} マニー
                  </div>
                </div>
              </div>

              {/* Player Buffs */}
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {currentPlayer.hasRentExemption && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black"
                    title="支払い免除カード保持中"
                  >
                    <Shield className="w-3 h-3" />
                    免除
                  </span>
                )}
                {currentPlayer.hasSuperLucky && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black animate-pulse"
                    title="私は豪運！カード保持中"
                  >
                    <Sparkles className="w-3 h-3" />
                    豪運
                  </span>
                )}
                {currentPlayer.hasInfoManipulation && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/50 text-[10px] font-black animate-pulse"
                    title="情報操作保持中：次の番で一度だけ出目を自由に指定可能"
                  >
                    🎯 出目指定(1回)
                  </span>
                )}
                {currentPlayer.hasSurgeRent && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/50 text-[10px] font-black"
                    title="支払額上昇保持中：一度だけ自分の土地の家賃2倍"
                  >
                    💥 家賃2倍
                  </span>
                )}
                {currentPlayer.skipNextTurn && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-500/30 text-slate-300 border border-slate-400/50 text-[10px] font-black"
                    title="次から頑張る：次のターン1回休み"
                  >
                    💤 休み
                  </span>
                )}
                {currentPlayer.crimeBlueprintCount > 0 && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-400/70 text-[10px] font-black animate-pulse"
                    title={`犯罪計画書所持中: ${currentPlayer.crimeBlueprintCount}/5枚 (牢屋マスで逮捕)`}
                  >
                    📑 計画書 {currentPlayer.crimeBlueprintCount}/5
                  </span>
                )}
                {currentPlayer.isPhantomThief && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-950 text-amber-300 border border-amber-400 text-[10px] font-black animate-bounce"
                    title="大怪盗モード発動中！全土地支配中"
                  >
                    🎩 大怪盗
                  </span>
                )}
                {Boolean(currentPlayer.bubbleDebt && currentPlayer.bubbleDebt > 0) && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-950/90 text-yellow-300 border border-red-500 text-[10px] font-black animate-pulse"
                    title={`バブル借金返済中: 残り${currentPlayer.bubbleDebt}M`}
                  >
                    ⚠️ 借金 {currentPlayer.bubbleDebt}M
                  </span>
                )}
                {currentPlayer.inJail && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-500 text-[10px] font-black"
                    title="牢屋収監中：脱獄か釈放チャンスが必要"
                  >
                    ⛓️ 収監中
                  </span>
                )}
                {currentPlayer.isWanted && !currentPlayer.isPhantomThief && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 border border-amber-300 text-[10px] font-black animate-bounce-subtle"
                    title="指名手配中：他プレイヤーと同マスで逮捕＆相手に報奨金200M"
                  >
                    🚨 指名手配
                  </span>
                )}
                <button
                  type="button"
                  onClick={onOpenRules}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer ml-1"
                  title="ルール確認"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Events & Recent Log Space (プレイヤー名の下の空間に表示) */}
            <div className="flex flex-col gap-1 max-h-24 sm:max-h-28 overflow-y-auto pr-0.5">
              {/* Latest Game Log Ticker */}
              {latestLog && (
                <div
                  onClick={onOpenLogs}
                  className="flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 text-[10px] sm:text-xs text-slate-200 cursor-pointer transition-all shadow-xs group"
                  title="タップして対戦ログ履歴を開く"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-amber-400 font-bold shrink-0 flex items-center gap-1">
                      <ScrollText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">最新ログ:</span>
                    </span>
                    <span className="truncate font-medium text-slate-100 group-hover:text-amber-200">
                      {latestLog.text}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 group-hover:text-white shrink-0 ml-1">
                    履歴 ▸
                  </span>
                </div>
              )}

              {/* Bubble Era Alert */}
              {isBubbleEra && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-gradient-to-r from-amber-950/80 via-yellow-900/80 to-amber-950/80 text-amber-200 border-amber-400/70 shadow-xs animate-pulse">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">🍾✨</span>
                    <span className="truncate">
                      【バブル期】 支払額・給与・イベント収入
                      <strong className="text-yellow-300 ml-1">+100M</strong>
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-500/30 text-amber-100 border border-amber-400/50 px-1.5 py-0.5 rounded font-black shrink-0">
                    ⚖️天国と地獄
                  </span>
                </div>
              )}

              {/* Master Phantom Thief Mode Alert */}
              {currentPlayer.isPhantomThief && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-amber-200 border-amber-400/80 shadow-md animate-pulse">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">🎩💎</span>
                    <span className="truncate">
                      【大怪盗モード】全土掌握中！牢屋通過・停止または他者との同マスで解除
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black shrink-0">
                    全土支配中
                  </span>
                </div>
              )}

              {/* Bubble Debt Bailout Alert */}
              {Boolean(currentPlayer.bubbleDebt && currentPlayer.bubbleDebt > 0) && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-rose-950/90 text-rose-200 border-rose-500/80 shadow-md">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>⚠️</span>
                    <span className="truncate">
                      【バブル借金返済中】スタート地点待機：残り借金
                      <strong className="text-yellow-300 ml-1">{currentPlayer.bubbleDebt}M</strong>
                      （毎ターン+200M返済）
                    </span>
                  </div>
                  <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                    返済中
                  </span>
                </div>
              )}

              {/* Global Market Price Fluctuation Alert */}
              {activePriceFluctuation && (
                <div
                  className={`flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border ${
                    activePriceFluctuation.multiplier === 2.0
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center gap-1 truncate">
                    {activePriceFluctuation.multiplier === 2.0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">
                      市場価格変動中: 全土地支払額が
                      <strong className="text-white ml-1">
                        {activePriceFluctuation.multiplier}倍
                      </strong>
                    </span>
                  </div>
                  <span className="text-[9px] opacity-75 shrink-0">発動中</span>
                </div>
              )}

              {/* Global Real Estate Sale Alert */}
              {realEstateSalePurchasesRemaining > 0 && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-emerald-950/70 text-emerald-300 border-emerald-400/60 shadow-xs animate-pulse">
                  <div className="flex items-center gap-1 truncate">
                    <span>🏷️</span>
                    <span className="truncate">
                      不動産セール中！ 契約金がすべて
                      <strong className="text-white ml-1">半額 (50% OFF)</strong>
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                    残り{realEstateSalePurchasesRemaining}回
                  </span>
                </div>
              )}

              {/* Player Active Effect Alerts */}
              {currentPlayer.hasInfoManipulation && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-indigo-950/80 text-indigo-200 border-indigo-400/60 shadow-xs animate-pulse">
                  <div className="flex items-center gap-1 truncate">
                    <span>🎯</span>
                    <span className="truncate">
                      【情報操作】次のサイコロの出目を1〜6から自由に選べます（1回限り）
                    </span>
                  </div>
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-100 border border-indigo-400/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                    出目指定
                  </span>
                </div>
              )}

              {currentPlayer.hasRentExemption && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-emerald-950/70 text-emerald-300 border-emerald-400/60 shadow-xs">
                  <div className="flex items-center gap-1 truncate">
                    <span>🛡️</span>
                    <span className="truncate">
                      【支払い免除】相手の土地で支払う家賃が一度だけ免除されます
                    </span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                    免除待機
                  </span>
                </div>
              )}

              {currentPlayer.hasSuperLucky && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-amber-950/70 text-amber-300 border-amber-400/60 shadow-xs animate-pulse">
                  <div className="flex items-center gap-1 truncate">
                    <span>🎲</span>
                    <span className="truncate">
                      【私は豪運！】未契約の土地購入時にサイコロ判定（1以外ならタダ契約！）
                    </span>
                  </div>
                  <span className="text-[9px] bg-amber-500/30 text-amber-100 border border-amber-400/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                    豪運待機
                  </span>
                </div>
              )}

              {currentPlayer.hasSurgeRent && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-rose-950/70 text-rose-300 border-rose-500/50 shadow-xs animate-pulse">
                  <div className="flex items-center gap-1 truncate">
                    <span>💥</span>
                    <span className="truncate">
                      【支払額上昇中】自分の土地に止まった相手の支払額が2倍になります
                    </span>
                  </div>
                  <span className="text-[9px] bg-rose-500/30 text-rose-100 border border-rose-400/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                    家賃2倍
                  </span>
                </div>
              )}

              {currentPlayer.skipNextTurn && (
                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black border bg-slate-900/80 text-slate-300 border-slate-600/60 shadow-xs">
                  <div className="flex items-center gap-1 truncate">
                    <span>💤</span>
                    <span className="truncate">
                      【次から頑張る】発動中：次のターンは1回休みとなります
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-700 text-slate-200 px-1.5 py-0.2 rounded font-bold shrink-0">
                    休み
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Center Main Action Stage (Spacious, Clean, Never Overflows) */}
          <div className="my-auto py-1 sm:py-2 flex-1 flex flex-col items-center justify-center text-center relative z-10 min-h-0 overflow-y-auto">
            {/* Debug Mode Rewind Button */}
            {isDebugActive && onDebugRewind && (
              <div className="w-full flex justify-center mb-2 z-20 shrink-0">
                <button
                  type="button"
                  onClick={onDebugRewind}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl border-2 border-amber-300 cursor-pointer animate-pulse transition-all"
                  title="デバッグ機能: サイコロを振る前の状態に戻す"
                >
                  <span className="text-base">⏪</span>
                  <span>【デバッグ】サイコロを振る前に戻る</span>
                </button>
              </div>
            )}

            {/* 1. Waiting for Roll & Rolling Result Pause */}
            {(gamePhase === 'waiting_roll' || gamePhase === 'rolling') && (
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                <Dice
                  value={currentDice}
                  isRolling={isRolling}
                  onRoll={() => onRollDice()}
                  disabled={!isHumanTurn || isRolling || gamePhase === 'rolling'}
                  size="md"
                  label={
                    isRolling
                      ? 'サイコロ回転中…'
                      : gamePhase === 'rolling'
                        ? `🎉 出目 【 ${currentDice} 】 確定！`
                        : `🎲 出目 【 ${currentDice} 】`
                  }
                />

                {gamePhase === 'rolling' && !isRolling ? (
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl border-2 border-white/80 animate-scale-up">
                    <span className="text-base sm:text-lg">🎲</span>
                    <span>出目 <strong className="text-base sm:text-lg underline decoration-amber-600">【 {currentDice} 】</strong> 確定！ 移動を開始します…</span>
                  </div>
                ) : isHumanTurn ? (
                  currentPlayer.hasInfoManipulation ? (
                    <div className="flex flex-col items-center gap-1 w-full max-w-[220px] animate-scale-up">
                      <div className="text-[11px] font-black text-indigo-300 mb-0.5">
                        出目を選択してください:
                      </div>
                      <div className="grid grid-cols-6 gap-1 w-full">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => onRollDice(num)}
                            disabled={isRolling}
                            className="py-1.5 sm:py-2 bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-black text-xs sm:text-sm rounded-lg shadow-md cursor-pointer active:scale-95 transition-all border border-indigo-300/40 disabled:opacity-50"
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRollDice()}
                        disabled={isRolling}
                        className="text-[10px] text-indigo-300/80 hover:text-white underline cursor-pointer mt-0.5"
                      >
                        🎲 ランダムに振る
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onRollDice()}
                      disabled={isRolling}
                      className="px-6 py-2 sm:px-7 sm:py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isRolling ? '振っています…' : 'サイコロを振る！'}
                    </button>
                  )
                ) : (
                  <div className="text-xs sm:text-sm text-purple-200 font-bold bg-purple-900/40 px-4 py-2 rounded-xl border border-purple-400/30 animate-pulse">
                    {currentPlayer.isAi
                      ? currentPlayer.hasInfoManipulation
                        ? 'CPU【情報操作】で出目を選定中…'
                        : 'CPU思考中… サイコロを振ります'
                      : `${currentPlayer.name} の手番です（操作を待機中…）`}
                  </div>
                )}
              </div>
            )}

            {/* 2. Moving Piece with Emphasized Roll Result */}
            {gamePhase === 'moving' && (
              <div className="flex flex-col items-center gap-2 animate-scale-up">
                {/* Big Golden Roll Result Badge */}
                <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 px-5 py-2 rounded-2xl shadow-xl border-2 border-white/70 animate-bounce-subtle">
                  <span className="text-2xl sm:text-3xl">🎲</span>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-black text-amber-950/70 tracking-wider leading-none">
                      DICE RESULT
                    </span>
                    <span className="text-xl sm:text-2xl font-black leading-tight tracking-wide">
                      出目 【 {currentDice} 】！
                    </span>
                  </div>
                </div>

                {/* Moving indicator */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300 bg-black/40 px-3.5 py-1 rounded-full border border-amber-400/30">
                  <span className="animate-bounce">🚶</span>
                  <span>{currentDice} マス前進中…</span>
                </div>
              </div>
            )}

            {/* 3. Hello Work Recovery Turn */}
            {gamePhase === 'hellowork_turn' && (
              <div className="flex flex-col items-center gap-2 bg-amber-950/50 p-3 rounded-2xl border border-amber-400/50 max-w-xs">
                <span className="text-xs font-black text-amber-300">
                  💼 ハローワークで再起バイト中！
                </span>
                <p className="text-[11px] text-amber-100/90 font-medium">
                  サイコロを振り【出目 × 100マニー】を獲得してターンを終えます。
                </p>
                <Dice
                  value={currentDice}
                  isRolling={isRolling}
                  onRoll={onHelloWorkRoll}
                  disabled={!isHumanTurn || isRolling}
                  size="md"
                />
                {isHumanTurn && (
                  <button
                    type="button"
                    onClick={onHelloWorkRoll}
                    disabled={isRolling}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
                  >
                    サイコロを振って給与獲得
                  </button>
                )}
              </div>
            )}

            {/* 3.5 Jail Turn (脱獄 vs 釈放チャンス) */}
            {(gamePhase === 'jail_turn' || gamePhase === 'jail_release_roll') && (
              <div className="flex flex-col items-center gap-2.5 bg-gradient-to-b from-slate-900/95 via-zinc-900/90 to-slate-950/95 p-3 sm:p-4 rounded-3xl border-2 border-slate-600 shadow-2xl max-w-sm w-full animate-scale-up text-center">
                <div className="flex items-center gap-2 text-zinc-200">
                  <span className="text-xl sm:text-2xl animate-pulse">⛓️</span>
                  <div className="text-xs sm:text-sm font-black tracking-wide text-zinc-100">
                    牢屋に収監中！
                  </div>
                </div>

                {gamePhase === 'jail_turn' && (
                  <>
                    <p className="text-[11px] text-slate-300 font-medium px-1">
                      【脱獄】するか【釈放チャンス】に挑戦するか選択してください。
                    </p>

                    {isHumanTurn ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full mt-1">
                        {/* 脱獄 Button */}
                        <button
                          type="button"
                          onClick={onJailEscape}
                          className="flex flex-col items-center justify-center p-2.5 bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl shadow-md border border-amber-400/40 cursor-pointer active:scale-95 transition-all text-center"
                        >
                          <span className="font-black text-xs sm:text-sm flex items-center gap-1">
                            <span>⛓️💨</span>
                            <span>脱獄する</span>
                          </span>
                          <span className="text-[9px] text-amber-100/90 leading-tight mt-1">
                            通常通り移動。全効果消滅＆指名手配
                          </span>
                        </button>

                        {/* 釈放チャンス Button */}
                        <button
                          type="button"
                          onClick={onJailReleaseRoll}
                          className="flex flex-col items-center justify-center p-2.5 bg-gradient-to-b from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-2xl shadow-md border border-indigo-400/40 cursor-pointer active:scale-95 transition-all text-center"
                        >
                          <span className="font-black text-xs sm:text-sm flex items-center gap-1">
                            <span>🎲🎲</span>
                            <span>釈放チャンス</span>
                          </span>
                          <span className="text-[9px] text-indigo-100/90 leading-tight mt-1">
                            サイコロ2回！合計7以上 or 1のゾロ目で釈放
                          </span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-purple-200 font-bold bg-purple-900/40 px-4 py-2 rounded-xl border border-purple-400/30 animate-pulse">
                        {currentPlayer.isAi
                          ? 'CPU思考中… 脱獄か釈放チャンスを選択します'
                          : `${currentPlayer.name} の選択を待機中…`}
                      </div>
                    )}
                  </>
                )}

                {gamePhase === 'jail_release_roll' && jailReleaseDice && (
                  <div className="flex flex-col items-center gap-2.5 w-full">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <span>🎲🎲</span>
                      <span>釈放判定ダイス（条件: 合計7以上 または 1のゾロ目）</span>
                    </div>

                    <div className="flex items-center justify-center gap-4 my-1">
                      <div className="flex flex-col items-center">
                        <Dice
                          value={jailReleaseDice[0]}
                          isRolling={isJailRolling ?? false}
                          size="md"
                          label={`1個目: ${jailReleaseDice[0]}`}
                        />
                      </div>
                      <span className="text-xl font-black text-white/60">＋</span>
                      <div className="flex flex-col items-center">
                        <Dice
                          value={jailReleaseDice[1]}
                          isRolling={isJailRolling ?? false}
                          size="md"
                          label={`2個目: ${jailReleaseDice[1]}`}
                        />
                      </div>
                    </div>

                    {!isJailRolling && (
                      <div className="w-full flex flex-col items-center gap-2 animate-scale-up">
                        {jailReleaseDice[0] + jailReleaseDice[1] >= 7 ||
                        (jailReleaseDice[0] === 1 && jailReleaseDice[1] === 1) ? (
                          <div className="w-full bg-emerald-950/80 border-2 border-emerald-400 p-3 rounded-2xl text-emerald-200 shadow-xl">
                            <div className="text-base sm:text-lg font-black text-yellow-300 flex items-center justify-center gap-1.5">
                              <span>🎉</span>
                              <span>釈放成功！！</span>
                            </div>
                            <div className="text-xs sm:text-sm font-black text-white mt-1">
                              出目【{jailReleaseDice[0]}】＋【{jailReleaseDice[1]}】＝ 合計【{jailReleaseDice[0] + jailReleaseDice[1]}】
                              {jailReleaseDice[0] === 1 && jailReleaseDice[1] === 1 && '（奇跡の1のゾロ目！）'}
                            </div>
                            <div className="text-[11px] text-emerald-300 mt-0.5">
                              無罪放免！牢屋から釈放され、次のターンから通常通り移動できます！
                            </div>
                          </div>
                        ) : (
                          <div className="w-full bg-rose-950/80 border-2 border-rose-500 p-3 rounded-2xl text-rose-200 shadow-xl">
                            <div className="text-base sm:text-lg font-black text-rose-300 flex items-center justify-center gap-1.5">
                              <span>🔒</span>
                              <span>釈放ならず… 収監継続</span>
                            </div>
                            <div className="text-xs sm:text-sm font-black text-white mt-1">
                              出目【{jailReleaseDice[0]}】＋【{jailReleaseDice[1]}】＝ 合計【{jailReleaseDice[0] + jailReleaseDice[1]}】
                            </div>
                            <div className="text-[11px] text-rose-300 mt-0.5">
                              釈放条件（合計7以上または1のゾロ目）を満たせませんでした。
                            </div>
                          </div>
                        )}

                        {isHumanTurn ? (
                          <button
                            type="button"
                            onClick={onConfirmJailRelease}
                            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl cursor-pointer border border-amber-300 transition-all mt-1"
                          >
                            結果を確認してターン終了
                          </button>
                        ) : (
                          <div className="text-xs text-slate-400 font-bold animate-pulse mt-1">
                            結果確認中… (自動で次のターンへ進みます)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Land Contract Action */}
            {gamePhase === 'land_action' && currentTile && (
              <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 max-w-sm w-full">
                <div className="text-xs font-black text-indigo-200 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  No.{currentTile.landNumber}「{currentTile.name}」
                </div>

                {/* If unowned land */}
                {currentTile.ownerId === null && (() => {
                  const isSaleActive = realEstateSalePurchasesRemaining > 0;
                  const effectiveCost = isSaleActive
                    ? Math.floor((currentTile.cost || 0) / 2)
                    : (currentTile.cost || 0);

                  const simTiles = tiles.map((t) =>
                    t.id === currentTile.id ? { ...t, ownerId: currentPlayer.id } : t
                  );
                  const willMonopoly = isAreaMonopoly(currentTile.id, simTiles);
                  const willAdjacent = !willMonopoly && isAdjacentLandOwned(currentTile.id, simTiles);

                  return (
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs text-slate-300 bg-black/20 p-2 rounded-lg">
                        <span>契約金:</span>
                        <div className="flex items-center gap-1.5">
                          {isSaleActive && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {currentTile.cost}M
                            </span>
                          )}
                          <span className="font-black text-amber-300 text-sm">
                            {effectiveCost} マニー
                          </span>
                          {isSaleActive && (
                            <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                              セール半額
                            </span>
                          )}
                        </div>
                      </div>

                      {willMonopoly && (
                        <div className="bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-400/60 px-2.5 py-1 rounded-xl text-[11px] font-black text-amber-200 flex items-center justify-center gap-1 animate-pulse">
                          <span>👑</span>
                          <span>契約するとエリア独占達成！（支払額2倍）</span>
                        </div>
                      )}
                      {willAdjacent && (
                        <div className="bg-rose-500/20 border border-rose-400/50 px-2.5 py-1 rounded-xl text-[11px] font-black text-rose-200 flex items-center justify-center gap-1">
                          <span>🤝</span>
                          <span>契約すると隣接ボーナス発生！（支払額1.5倍）</span>
                        </div>
                      )}

                      {/* Special Super Lucky Prompt */}
                      {currentPlayer.hasSuperLucky ? (
                        <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/50 text-left">
                          <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            【私は豪運！】カード発動！
                          </div>
                          <p className="text-[10px] text-amber-100 mt-1">
                            サイコロを振る！1以外なら<strong>無料 (0マニー)</strong>、1なら
                            <strong>倍額 ({effectiveCost * 2}マニー)</strong>で契約！
                          </p>
                          {isHumanTurn && (
                            <button
                              type="button"
                              onClick={onRollForSuperLucky}
                              className="mt-2 w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-lg cursor-pointer"
                            >
                              豪運のサイコロを振る！
                            </button>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-[11px] text-slate-200">
                            この土地を契約（購入）しますか？
                          </p>
                          {isHumanTurn && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={onBuyLand}
                                disabled={currentPlayer.money < effectiveCost}
                                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                              >
                                契約する ({effectiveCost}M)
                              </button>
                              <button
                                type="button"
                                onClick={onSkipBuyLand}
                                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                              >
                                見送る
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* If own land & unranked (can rank up once) */}
                {currentTile.ownerId === currentPlayer.id && currentTile.rank === 0 && (
                  <div className="w-full flex flex-col gap-2">
                    <div className="bg-amber-400/20 text-amber-200 p-2 rounded-lg text-[11px] font-bold">
                      所有地です！契約金の倍額を払ってランクアップ（家賃2倍）できます！
                    </div>
                    <div className="flex justify-between items-center text-xs bg-black/20 p-2 rounded-lg">
                      <span className="text-slate-300">ランクアップ費用:</span>
                      <span className="font-black text-amber-400">
                        {(currentTile.cost || 0) * 2} マニー
                      </span>
                    </div>
                    {isHumanTurn && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={onRankUpLand}
                          disabled={currentPlayer.money < (currentTile.cost || 0) * 2}
                          className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                        >
                          ★ランクアップ ({(currentTile.cost || 0) * 2}M)
                        </button>
                        <button
                          type="button"
                          onClick={onSkipRankUp}
                          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          見送る
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. Fortune Hall Choice (占いの館) */}
            {gamePhase === 'fortune_hall_prompt' && (
              <div className="flex flex-col items-center gap-2 bg-purple-950/70 p-3 sm:p-4 rounded-2xl border border-purple-400/50 max-w-xs text-center shadow-xl">
                <span className="text-2xl animate-pulse">🔮</span>
                <div className="text-xs sm:text-sm font-black text-purple-200">
                  占いの館に到着！
                </div>
                <p className="text-[11px] text-purple-100 font-medium">
                  【100マニー】を支払って占いのカード（波乱のカード）を引きますか？
                </p>
                {isHumanTurn ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => onFortuneHallChoice(true)}
                      disabled={currentPlayer.money < 100}
                      className="flex-1 py-2 px-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                    >
                      🔮 100Mで引く
                      {currentPlayer.money < 100 && ' (不足)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onFortuneHallChoice(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      引かない (見送る)
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-purple-200 font-bold bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-400/30 animate-pulse">
                    CPU思考中…
                  </div>
                )}
              </div>
            )}

            {/* 5.5 Passing Event Choice (通過時50Mイベント) */}
            {gamePhase === 'passing_event_prompt' && (
              <div className="flex flex-col items-center gap-2 bg-indigo-950/85 p-3 sm:p-4 rounded-2xl border-2 border-indigo-400 max-w-xs text-center shadow-2xl animate-scale-up">
                <span className="text-2xl animate-bounce">⚡🎲</span>
                <div className="text-xs sm:text-sm font-black text-indigo-100">
                  イベントマスを通過中！
                </div>
                <p className="text-[11px] text-indigo-200 font-medium">
                  【50マニー】を支払ってイベントカードを引きますか？
                </p>
                {isHumanTurn ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => onPassingEventChoice?.(true)}
                      disabled={currentPlayer.money < 50}
                      className="flex-1 py-2 px-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                    >
                      🎲 50Mで引く
                      {currentPlayer.money < 50 && ' (不足)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onPassingEventChoice?.(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      スルーして進む
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-indigo-200 font-bold bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-400/30 animate-pulse">
                    CPU思考中…
                  </div>
                )}
              </div>
            )}

            {/* 5.6 Start Clearance Prompt (スタート地点での計画書清算) */}
            {gamePhase === 'start_clearance_prompt' && (
              <div className="flex flex-col items-center gap-2 bg-emerald-950/85 p-3 sm:p-4 rounded-2xl border-2 border-emerald-400 max-w-xs text-center shadow-2xl animate-scale-up">
                <span className="text-2xl animate-bounce">🏁📑</span>
                <div className="text-xs sm:text-sm font-black text-emerald-100">
                  スタート地点：計画書清算
                </div>
                <p className="text-[11px] text-emerald-200 font-medium">
                  犯罪計画書（{currentPlayer.crimeBlueprintCount}枚）を1つ【100マニー】で清算しますか？
                </p>
                {isHumanTurn ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => onStartClearanceChoice?.(true)}
                      className="flex-1 py-2 px-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      📑 100Mで清算する
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartClearanceChoice?.(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      清算しない
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-200 font-bold bg-emerald-900/40 px-3 py-1.5 rounded-lg border border-emerald-400/30 animate-pulse">
                    CPU思考中…
                  </div>
                )}
              </div>
            )}

            {/* 6. Turn End */}
            {gamePhase === 'turn_end' && (
              <div className="flex flex-col items-center gap-2">
                {isHumanTurn ? (
                  <button
                    type="button"
                    onClick={onEndTurn}
                    className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-100 hover:bg-white text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-lg cursor-pointer active:scale-95"
                  >
                    <span>次のプレイヤーへ</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 font-bold">ターン終了処理中…</div>
                )}
              </div>
            )}
          </div>

          {/* Bottom of Center: Log View Button */}
          <button
            type="button"
            onClick={onOpenLogs}
            className="relative z-10 flex items-center justify-center gap-1.5 py-1 px-3.5 bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white rounded-xl border border-white/15 text-[10px] sm:text-xs font-bold cursor-pointer transition-all mx-auto shadow-2xs"
          >
            <ScrollText className="w-3.5 h-3.5 text-amber-300" />
            <span>📜 対戦ログを見る ({logs.length}件)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
