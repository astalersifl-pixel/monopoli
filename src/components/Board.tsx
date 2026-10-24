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
import { calculateLandRent } from '../utils/boardData';
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
} from 'lucide-react';

interface BoardProps {
  tiles: Tile[];
  players: Player[];
  currentPlayer: Player;
  currentDice: number;
  isRolling: boolean;
  gamePhase: GamePhase;
  activePriceFluctuation: ActivePriceFluctuation | null;
  logs: GameLog[];
  myPlayerId?: string;
  isOnline?: boolean;
  onRollDice: () => void;
  onSelectTile: (tile: Tile) => void;
  onBuyLand: () => void;
  onSkipBuyLand: () => void;
  onRankUpLand: () => void;
  onSkipRankUp: () => void;
  onVenuePassChoice: (draw: boolean) => void;
  onRollForSuperLucky: () => void;
  onHelloWorkRoll: () => void;
  onEndTurn: () => void;
  onOpenRules: () => void;
}

export const Board: React.FC<BoardProps> = ({
  tiles,
  players,
  currentPlayer,
  currentDice,
  isRolling,
  gamePhase,
  activePriceFluctuation,
  logs,
  myPlayerId,
  isOnline,
  onRollDice,
  onSelectTile,
  onBuyLand,
  onSkipBuyLand,
  onRankUpLand,
  onSkipRankUp,
  onVenuePassChoice,
  onRollForSuperLucky,
  onHelloWorkRoll,
  onEndTurn,
  onOpenRules,
}) => {
  const currentTile = tiles[currentPlayer.position];
  const isMyTurn = !isOnline || currentPlayer.id === myPlayerId;
  const isHumanTurn = !currentPlayer.isAi && isMyTurn;

  // Rent info for current tile if it's a land
  const currentLandRentInfo =
    currentTile && currentTile.type === 'land'
      ? calculateLandRent(
          currentTile,
          tiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0
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
      {/* 7x7 CSS Grid layout */}
      <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-0.5 sm:gap-1 relative">
        {/* Render 24 outer perimeter tiles */}
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
                onSelectTile={onSelectTile}
                isCurrentPlayerHere={isCurrentPlayerHere}
              />
            </div>
          );
        })}

        {/* Center Dashboard (spans rows 2..6, cols 2..6: 5x5 inner area) */}
        <div
          style={{
            gridRow: '2 / 7',
            gridColumn: '2 / 7',
          }}
          className="w-full h-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border-2 border-indigo-500/30 p-2 sm:p-4 shadow-inner flex flex-col justify-between overflow-hidden relative z-10"
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
                  </div>
                  <div className="text-[11px] text-amber-300 font-bold">
                    所持金: {currentPlayer.money} マニー
                  </div>
                </div>
              </div>

              {/* Player Buffs */}
              <div className="flex items-center gap-1">
                {currentPlayer.hasRentExemption && (
                  <span
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-black"
                    title="支払い免除カード保持中"
                  >
                    <Shield className="w-3 h-3" />
                    免除
                  </span>
                )}
                {currentPlayer.hasSuperLucky && (
                  <span
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-black animate-pulse"
                    title="私は豪運！カード保持中"
                  >
                    <Sparkles className="w-3 h-3" />
                    豪運
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

            {/* Global Market Price Fluctuation Alert */}
            {activePriceFluctuation && (
              <div
                className={`flex items-center justify-between px-3 py-1 rounded-lg text-[10px] sm:text-xs font-black border ${
                  activePriceFluctuation.multiplier === 2.0
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                }`}
              >
                <div className="flex items-center gap-1">
                  {activePriceFluctuation.multiplier === 2.0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>
                    市場価格変動中: 全土地の支払額が
                    <strong className="text-white ml-1">
                      {activePriceFluctuation.multiplier}倍
                    </strong>
                  </span>
                </div>
                <span className="text-[9px] opacity-75">発動中</span>
              </div>
            )}
          </div>

          {/* Center Main Action Stage */}
          <div className="my-auto py-2 flex flex-col items-center justify-center text-center relative z-10">
            {/* 1. Waiting for Roll */}
            {(gamePhase === 'waiting_roll' || gamePhase === 'rolling') && (
              <div className="flex flex-col items-center gap-3">
                <Dice
                  value={currentDice}
                  isRolling={isRolling}
                  onRoll={onRollDice}
                  disabled={!isHumanTurn || isRolling}
                  size="md"
                  label={isRolling ? 'サイコロ回転中…' : `出目: ${currentDice}`}
                />

                {isHumanTurn ? (
                  <button
                    type="button"
                    onClick={onRollDice}
                    disabled={isRolling}
                    className="px-6 py-2 sm:px-7 sm:py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isRolling ? '振っています…' : 'サイコロを振る！'}
                  </button>
                ) : (
                  <div className="text-xs sm:text-sm text-purple-200 font-bold bg-purple-900/40 px-4 py-2 rounded-xl border border-purple-400/30 animate-pulse">
                    {currentPlayer.isAi
                      ? 'CPU思考中… サイコロを振ります'
                      : `${currentPlayer.name} の手番です（操作を待機中…）`}
                  </div>
                )}
              </div>
            )}

            {/* 2. Moving Piece */}
            {gamePhase === 'moving' && (
              <div className="flex flex-col items-center gap-2">
                <div className="text-2xl animate-bounce">🚶</div>
                <div className="text-xs sm:text-sm font-black text-amber-300">
                  {currentDice} マス移動中…
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

            {/* 4. Land Contract Action */}
            {gamePhase === 'land_action' && currentTile && (
              <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-white/20 max-w-sm w-full">
                <div className="text-xs font-black text-indigo-200 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  No.{currentTile.landNumber}「{currentTile.name}」
                </div>

                {/* If unowned land */}
                {currentTile.ownerId === null && (
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs text-slate-300 bg-black/20 p-2 rounded-lg">
                      <span>契約金:</span>
                      <span className="font-black text-amber-300 text-sm">
                        {currentTile.cost} マニー
                      </span>
                    </div>

                    {/* Special Super Lucky Prompt */}
                    {currentPlayer.hasSuperLucky ? (
                      <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/50 text-left">
                        <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          【私は豪運！】カード発動！
                        </div>
                        <p className="text-[10px] text-amber-100 mt-1">
                          サイコロを振る！1以外なら<strong>無料 (0マニー)</strong>、1なら
                          <strong>倍額 ({currentTile.cost! * 2}マニー)</strong>で契約！
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
                              disabled={currentPlayer.money < (currentTile.cost || 0)}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                            >
                              契約する ({currentTile.cost}M)
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
                )}

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

            {/* 5. Venue Pass Choice */}
            {gamePhase === 'venue_pass_prompt' && (
              <div className="flex flex-col items-center gap-2 bg-purple-950/60 p-3 sm:p-4 rounded-2xl border border-purple-400/50 max-w-xs text-center">
                <Sparkles className="w-6 h-6 text-purple-300 animate-spin-slow" />
                <div className="text-xs font-black text-purple-200">イベント会場を通過！</div>
                <p className="text-[11px] text-purple-100">
                  【50マニー】を支払ってイベントカードを1枚引きますか？
                </p>
                {isHumanTurn ? (
                  <div className="flex gap-2 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => onVenuePassChoice(true)}
                      disabled={currentPlayer.money < 50}
                      className="flex-1 py-2 bg-purple-500 hover:bg-purple-400 text-white font-black text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40"
                    >
                      50Mで引く
                    </button>
                    <button
                      type="button"
                      onClick={() => onVenuePassChoice(false)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      パスする
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-purple-200 font-bold">CPU判断中…</div>
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

          {/* Bottom of Center: Mini Log Ticker */}
          <div className="relative z-10 bg-black/40 rounded-xl px-3 py-1.5 border border-white/10 max-h-16 overflow-y-auto text-left">
            <div className="text-[10px] text-slate-400 font-bold mb-0.5">行動ログ:</div>
            {logs.slice(-2).map((log) => (
              <div
                key={log.id}
                className="text-[10px] sm:text-[11px] text-slate-200 truncate leading-tight"
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
