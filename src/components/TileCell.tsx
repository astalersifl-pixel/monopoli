import React from 'react';
import { Tile, Player, ActivePriceFluctuation } from '../types/game';
import { calculateLandRent } from '../utils/boardData';
import { Flag, Building2, Sparkles, Briefcase, Dices, Award } from 'lucide-react';

interface TileCellProps {
  tile: Tile;
  players: Player[];
  allTiles: Tile[];
  activePriceFluctuation: ActivePriceFluctuation | null;
  onSelectTile: (tile: Tile) => void;
  isCurrentPlayerHere?: boolean;
}

export const TileCell: React.FC<TileCellProps> = ({
  tile,
  players,
  allTiles,
  activePriceFluctuation,
  onSelectTile,
  isCurrentPlayerHere,
}) => {
  const playersOnTile = players.filter((p) => p.position === tile.id);
  const owner = players.find((p) => p.id === tile.ownerId);

  // Calculate rent if it's a land
  const rentInfo =
    tile.type === 'land'
      ? calculateLandRent(
          tile,
          allTiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0
        )
      : null;

  // Background and border styles depending on tile type and owner
  const getOwnerBgStyle = () => {
    if (!owner) return '';
    switch (owner.color) {
      case 'red':
        return 'bg-rose-50 border-rose-400 text-rose-900';
      case 'blue':
        return 'bg-sky-50 border-sky-400 text-sky-900';
      case 'emerald':
        return 'bg-emerald-50 border-emerald-400 text-emerald-900';
      case 'amber':
        return 'bg-amber-50 border-amber-400 text-amber-900';
      default:
        return '';
    }
  };

  const getOwnerBadgeColor = () => {
    if (!owner) return '';
    switch (owner.color) {
      case 'red':
        return 'bg-rose-500 text-white';
      case 'blue':
        return 'bg-sky-500 text-white';
      case 'emerald':
        return 'bg-emerald-500 text-white';
      case 'amber':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const isCorner = ['start', 'hellowork', 'venue', 'casino'].includes(tile.type);

  return (
    <div
      onClick={() => onSelectTile(tile)}
      className={`relative w-full h-full flex flex-col justify-between p-1.5 sm:p-2 cursor-pointer transition-all duration-200 select-none overflow-hidden rounded-xl border-2 ${
        isCurrentPlayerHere
          ? 'ring-4 ring-amber-400/80 shadow-lg scale-[1.02] z-20'
          : 'hover:scale-[1.01] hover:shadow-md'
      } ${
        owner
          ? getOwnerBgStyle()
          : isCorner
          ? tile.type === 'start'
            ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-400 shadow-sm'
            : tile.type === 'hellowork'
            ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-300 shadow-sm'
            : tile.type === 'venue'
            ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-300 shadow-sm'
            : 'bg-gradient-to-br from-rose-600 to-pink-700 text-white border-rose-300 shadow-sm'
          : tile.type === 'event'
          ? 'bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-300 text-indigo-950'
          : 'bg-white/95 border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Header Row of Tile */}
      <div className="flex items-center justify-between w-full">
        {tile.type === 'land' && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-slate-900 text-white shadow-xs">
              {tile.landNumber}
            </span>
            {tile.rank ? (
              <span className="inline-flex items-center text-[10px] sm:text-xs font-black px-1 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs animate-pulse">
                ★Lv.2
              </span>
            ) : null}
          </div>
        )}

        {tile.type === 'event' && (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md bg-indigo-600 text-white shadow-xs">
              {tile.landNumber}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-200/80 px-1 rounded">
              EVENT
            </span>
          </div>
        )}

        {isCorner && (
          <span className="text-[9px] sm:text-[11px] font-black tracking-wider uppercase opacity-90">
            {tile.type === 'start' && 'START'}
            {tile.type === 'hellowork' && 'RESTART'}
            {tile.type === 'venue' && 'SPECIAL'}
            {tile.type === 'casino' && 'JACKPOT'}
          </span>
        )}

        {/* Owner Avatar / Badge */}
        {owner && (
          <div
            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-xs ${getOwnerBadgeColor()}`}
            title={`所有者: ${owner.name}`}
          >
            <span>{owner.avatar}</span>
            <span className="hidden sm:inline truncate max-w-[42px]">{owner.name}</span>
          </div>
        )}

        {/* Multiplier Tag (1.5x adjacent or 2x/0.5x fluctuation) */}
        {rentInfo && rentInfo.isAdjacentBonus && (
          <span
            className="text-[9px] font-black bg-rose-500 text-white px-1 py-0.2 rounded shadow-xs"
            title="隣接土地ボーナス 1.5倍"
          >
            1.5x
          </span>
        )}
      </div>

      {/* Middle: Name & Icon */}
      <div className="my-auto py-0.5 flex flex-col items-center justify-center text-center">
        {tile.type === 'start' && <Flag className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 text-amber-200" />}
        {tile.type === 'hellowork' && (
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 text-amber-200" />
        )}
        {tile.type === 'venue' && (
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 text-amber-200 animate-spin-slow" />
        )}
        {tile.type === 'casino' && <Dices className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5 text-yellow-300" />}

        <div className="text-[11px] sm:text-xs font-black leading-tight line-clamp-1">
          {tile.name}
        </div>
      </div>

      {/* Bottom: Cost & Rent Info */}
      <div className="w-full text-[10px] sm:text-[11px] font-bold leading-tight">
        {tile.type === 'land' ? (
          <div className="flex flex-col gap-0.5 bg-black/5 p-1 rounded-md">
            <div className="flex justify-between items-center text-slate-500 text-[9px] sm:text-[10px]">
              <span>契約</span>
              <span className="font-black text-slate-800">{tile.cost}M</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700">
              <span>支払</span>
              <span className="font-black text-emerald-800 sm:text-xs">
                {rentInfo ? rentInfo.rent : tile.baseRent}M
              </span>
            </div>
          </div>
        ) : tile.type === 'start' ? (
          <div className="text-center text-[10px] sm:text-xs text-amber-200 font-black">
            +200マニー
          </div>
        ) : tile.type === 'hellowork' ? (
          <div className="text-center text-[9px] sm:text-[10px] text-amber-100 font-bold">
            出目×100マニー
          </div>
        ) : tile.type === 'venue' ? (
          <div className="text-center text-[9px] sm:text-[10px] text-purple-100 font-bold">
            カードGET
          </div>
        ) : tile.type === 'casino' ? (
          <div className="text-center text-[9px] sm:text-[10px] text-rose-100 font-bold">
            一攫千金
          </div>
        ) : (
          <div className="text-center text-[9px] sm:text-[10px] text-indigo-600 font-bold">
            カードを引く
          </div>
        )}
      </div>

      {/* Players Standing on this Tile (Pawns) */}
      {playersOnTile.length > 0 && (
        <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1 z-30 pointer-events-none">
          {playersOnTile.map((p) => (
            <div
              key={p.id}
              className={`relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-sm sm:text-base shadow-md border-2 border-white ring-2 ${
                p.color === 'red'
                  ? 'bg-rose-500 ring-rose-400'
                  : p.color === 'blue'
                  ? 'bg-sky-500 ring-sky-400'
                  : p.color === 'emerald'
                  ? 'bg-emerald-500 ring-emerald-400'
                  : 'bg-amber-500 ring-amber-400'
              } animate-bounce-subtle`}
              title={`${p.name} (所持金: ${p.money}マニー)`}
            >
              <span>{p.avatar}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
