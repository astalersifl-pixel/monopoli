import React from 'react';
import { Tile, Player, ActivePriceFluctuation } from '../types/game';
import { calculateLandRent } from '../utils/boardData';
import { Flag, Briefcase, Dices } from 'lucide-react';

interface TileCellProps {
  tile: Tile;
  players: Player[];
  allTiles: Tile[];
  activePriceFluctuation: ActivePriceFluctuation | null;
  isRealEstateSaleActive?: boolean;
  isBubbleEra?: boolean;
  onSelectTile: (tile: Tile) => void;
  isCurrentPlayerHere?: boolean;
}

// 4 Districts on the board for land grouping
interface DistrictInfo {
  name: string;
  theme: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
}

function getDistrictInfo(tileId: number): DistrictInfo | null {
  // Right side (No.1..6): 住宅街 (Residential)
  if ([1, 2, 3, 5, 6, 7].includes(tileId)) {
    return {
      name: '住宅街',
      theme: 'emerald',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      icon: '🏡',
    };
  }
  // Top side (No.7..12): 港湾街 (Port/Waterfront)
  if ([9, 10, 11, 13, 14, 15].includes(tileId)) {
    return {
      name: '港湾街',
      theme: 'sky',
      badgeBg: 'bg-sky-100',
      badgeText: 'text-sky-800',
      icon: '⚓',
    };
  }
  // Left side (No.13..18): 商業街 (Commercial)
  if ([17, 18, 19, 21, 22, 23].includes(tileId)) {
    return {
      name: '商業街',
      theme: 'amber',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      icon: '🛍️',
    };
  }
  // Bottom side (No.19..24): 高級街 (Luxury)
  if ([25, 26, 27, 29, 30, 31].includes(tileId)) {
    return {
      name: '高級街',
      theme: 'purple',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      icon: '👑',
    };
  }
  return null;
}

export const TileCell: React.FC<TileCellProps> = ({
  tile,
  players,
  allTiles,
  activePriceFluctuation,
  isRealEstateSaleActive = false,
  isBubbleEra = false,
  onSelectTile,
  isCurrentPlayerHere,
}) => {
  const playersOnTile = players.filter((p) => p.position === tile.id);
  const owner = players.find((p) => p.id === tile.ownerId);
  const district = getDistrictInfo(tile.id);

  // Calculate rent if it's a land
  const rentInfo =
    tile.type === 'land'
      ? calculateLandRent(
          tile,
          allTiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0,
          isBubbleEra
        )
      : null;

  // Effective contract cost considering Real Estate Sale
  const baseCost = tile.cost || 0;
  const effectiveCost =
    isRealEstateSaleActive && !owner ? Math.floor(baseCost / 2) : baseCost;

  // Owner color styles
  const getOwnerHeaderStyle = () => {
    if (!owner) return '';
    switch (owner.color) {
      case 'red':
        return 'bg-gradient-to-r from-rose-500 to-rose-600 text-white';
      case 'blue':
        return 'bg-gradient-to-r from-sky-500 to-sky-600 text-white';
      case 'emerald':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
      case 'amber':
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black';
      case 'purple':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getOwnerCardBorder = () => {
    if (!owner) return 'border-slate-300/80 hover:border-slate-400';
    switch (owner.color) {
      case 'red':
        return 'border-rose-400 bg-rose-50/70 shadow-rose-100';
      case 'blue':
        return 'border-sky-400 bg-sky-50/70 shadow-sky-100';
      case 'emerald':
        return 'border-emerald-400 bg-emerald-50/70 shadow-emerald-100';
      case 'amber':
        return 'border-amber-400 bg-amber-50/70 shadow-amber-100';
      case 'purple':
        return 'border-purple-400 bg-purple-50/70 shadow-purple-100';
      default:
        return 'border-slate-400 bg-slate-50';
    }
  };

  const isCorner = ['start', 'hellowork', 'venue', 'jail'].includes(tile.type);

  return (
    <div
      onClick={() => onSelectTile(tile)}
      className={`relative w-full h-full flex flex-col justify-between cursor-pointer select-none overflow-hidden rounded-xl sm:rounded-2xl border-2 transition-all duration-150 ${
        isCurrentPlayerHere
          ? 'ring-4 ring-amber-400 ring-offset-1 sm:ring-offset-2 z-20 shadow-xl scale-[1.03]'
          : 'hover:scale-[1.01] hover:shadow-md'
      } ${
        tile.type === 'land'
          ? owner
            ? getOwnerCardBorder()
            : 'bg-white border-slate-300 shadow-xs'
          : tile.type === 'start'
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white border-emerald-300 shadow-md'
          : tile.type === 'hellowork'
          ? isBubbleEra
            ? 'bg-gradient-to-br from-amber-700 via-rose-900 to-indigo-950 text-white border-amber-400 shadow-md ring-2 ring-amber-300/60'
            : 'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white border-amber-300 shadow-md'
          : tile.type === 'venue'
          ? 'bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 text-white border-purple-300 shadow-md'
          : tile.type === 'jail'
          ? 'bg-gradient-to-br from-slate-800 via-zinc-800 to-neutral-900 text-white border-slate-500 shadow-md'
          : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-300 text-indigo-950 shadow-xs'
      }`}
      title={`${tile.type === 'hellowork' && isBubbleEra ? '天国と地獄' : tile.name} (タップで詳細確認)`}
    >
      {/* 1. TOP HEADER STRIP */}
      {tile.type === 'land' ? (
        owner ? (
          // Owned Header Strip: Owner's color + Avatar + Name + Level
          <div
            className={`w-full flex items-center justify-between px-1.5 py-0.5 sm:py-1 ${getOwnerHeaderStyle()} shadow-2xs`}
          >
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[9px] sm:text-[11px] font-black tracking-tight shrink-0">
                #{tile.landNumber}
              </span>
              {owner.isPhantomThief && (
                <span className="text-[8px] sm:text-[9px] font-black bg-purple-900 text-amber-300 px-1 py-0.2 rounded shadow-2xs shrink-0 animate-pulse border border-amber-400">
                  🎩怪盗
                </span>
              )}
              {tile.rank ? (
                <span className="text-[8px] sm:text-[9px] font-black bg-amber-300 text-slate-950 px-1 py-0.2 rounded shadow-2xs shrink-0 animate-pulse">
                  ★Lv.2
                </span>
              ) : null}
              {rentInfo?.isMonopolyBonus && (
                <span
                  className="text-[8px] sm:text-[9px] font-black bg-yellow-300 text-amber-950 px-1 py-0.2 rounded shadow-2xs shrink-0"
                  title="エリア独占ボーナス発動中 (支払額2倍)"
                >
                  👑独占
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 truncate text-[9px] sm:text-[10px] font-bold">
              <span className="shrink-0">{owner.avatar}</span>
              <span className="truncate max-w-[48px] sm:max-w-[64px]">{owner.name}</span>
            </div>
          </div>
        ) : (
          // Unowned Header Strip: District theme + Land Number + Unowned tag
          <div className="w-full flex items-center justify-between px-1.5 py-0.5 sm:py-1 bg-slate-100/90 border-b border-slate-200">
            <div className="flex items-center gap-1 min-w-0">
              <span className="inline-flex items-center justify-center text-[9px] sm:text-[10px] font-black px-1 rounded bg-slate-800 text-white shrink-0">
                #{tile.landNumber}
              </span>
              {district && (
                <span
                  className={`text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded hidden xs:inline shrink-0 ${district.badgeBg} ${district.badgeText}`}
                >
                  {district.name}
                </span>
              )}
            </div>
            {isRealEstateSaleActive ? (
              <span className="text-[8px] sm:text-[9px] font-black bg-emerald-500 text-white px-1 py-0.2 rounded shrink-0 animate-pulse">
                50%引
              </span>
            ) : (
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 shrink-0">
                空地
              </span>
            )}
          </div>
        )
      ) : isCorner ? (
        // Corner Header Strip
        <div className="w-full flex items-center justify-between px-1.5 py-0.5 sm:py-1 bg-black/25 text-white/90 border-b border-white/20">
          <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase">
            {tile.type === 'start' && '🏁 START'}
            {tile.type === 'hellowork' && (isBubbleEra ? '⚖️ 審判' : '💼 再起')}
            {tile.type === 'venue' && '🔮 占いの館'}
            {tile.type === 'jail' && '⛓️ 牢屋'}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold opacity-80">
            {tile.type === 'start' && '給与'}
            {tile.type === 'hellowork' && (isBubbleEra ? '天国と地獄' : 'ハローワーク')}
            {tile.type === 'venue' && '波乱'}
            {tile.type === 'jail' && '通常効果無'}
          </span>
        </div>
      ) : (
        // Event Header Strip
        <div className="w-full flex items-center justify-between px-1.5 py-0.5 sm:py-1 bg-indigo-600 text-white shadow-2xs">
          <span className="text-[9px] sm:text-[10px] font-black">
            #{tile.landNumber}
          </span>
          <span className="text-[8px] sm:text-[9px] font-bold tracking-wide">
            🎲 イベント
          </span>
        </div>
      )}

      {/* 2. MIDDLE ZONE: NAME & ICON / PLAYER PAWNS */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-1 py-0.5 text-center min-h-0">
        {/* Visual Icons for Special Tiles */}
        {tile.type === 'start' && (
          <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 drop-shadow-sm mb-0.5" />
        )}
        {tile.type === 'hellowork' && (
          isBubbleEra ? (
            <span className="text-base sm:text-xl drop-shadow-sm mb-0.5 animate-pulse">⚖️</span>
          ) : (
            <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 drop-shadow-sm mb-0.5" />
          )
        )}
        {tile.type === 'venue' && (
          <span className="text-base sm:text-xl drop-shadow-sm mb-0.5">🔮</span>
        )}
        {tile.type === 'jail' && (
          <span className="text-base sm:text-xl drop-shadow-sm mb-0.5">⛓️</span>
        )}
        {tile.type === 'event' && (
          <span className="text-base sm:text-xl drop-shadow-sm mb-0.5">⚡</span>
        )}

        {/* Tile Name */}
        <div
          className={`text-[10px] sm:text-xs font-black leading-tight tracking-tight px-0.5 line-clamp-1 ${
            isCorner
              ? 'text-white drop-shadow-xs'
              : tile.type === 'event'
              ? 'text-indigo-950'
              : 'text-slate-900'
          }`}
        >
          {tile.type === 'hellowork' && isBubbleEra ? '天国と地獄' : tile.name}
        </div>

        {/* Active Multiplier Badges (Floating quietly under name) */}
        {rentInfo && owner && (
          <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center pointer-events-none">
            {rentInfo.isMonopolyBonus ? (
              <span
                className="text-[7px] sm:text-[8px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-1 py-0.2 rounded shadow-2xs border border-amber-300 font-mono tracking-tighter animate-pulse"
                title="エリア独占ボーナス: 支払額2倍"
              >
                👑独占2x
              </span>
            ) : rentInfo.isAdjacentBonus ? (
              <span
                className={`text-[7px] sm:text-[8px] font-black text-white px-1 py-0.2 rounded shadow-2xs tracking-tighter ${
                  rentInfo.adjacentMultiplier === 1.8
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 ring-1 ring-amber-300'
                    : 'bg-rose-500'
                }`}
                title={`隣接保有ボーナス: 支払額${rentInfo.adjacentMultiplier}倍`}
              >
                🤝隣接{rentInfo.adjacentMultiplier}x
              </span>
            ) : null}
            {activePriceFluctuation && (
              <span
                className={`text-[7px] sm:text-[8px] font-black px-1 py-0.2 rounded shadow-2xs ${
                  activePriceFluctuation.multiplier === 2.0
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
                title={`市場変動: 家賃${activePriceFluctuation.multiplier}倍`}
              >
                変動{activePriceFluctuation.multiplier}x
              </span>
            )}
            {owner.hasSurgeRent && (
              <span
                className="text-[7px] sm:text-[8px] font-black bg-orange-500 text-white px-1 py-0.2 rounded shadow-2xs"
                title="支払額上昇カード適用中: 家賃2倍"
              >
                支払2倍
              </span>
            )}
          </div>
        )}

        {/* Player Pawns Standing in Middle */}
        {playersOnTile.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center -space-x-1 sm:-space-x-1.5 z-30 pointer-events-none bg-white/75 sm:bg-white/80 backdrop-blur-[1px] rounded-lg p-0.5 transition-all">
            {playersOnTile.map((p) => (
              <div
                key={p.id}
                className={`relative flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm shadow-md border-2 border-white ring-1 sm:ring-2 ${
                  p.color === 'red'
                    ? 'bg-rose-500 ring-rose-400'
                    : p.color === 'blue'
                    ? 'bg-sky-500 ring-sky-400'
                    : p.color === 'emerald'
                    ? 'bg-emerald-500 ring-emerald-400'
                    : p.color === 'amber'
                    ? 'bg-amber-500 ring-amber-400'
                    : 'bg-purple-500 ring-purple-400'
                } animate-bounce-subtle`}
                title={`${p.name} (所持金: ${p.money}M)${p.inJail ? '【牢屋収監中】' : ''}${p.isWanted ? '【指名手配中】' : ''}${p.isPhantomThief ? '【大怪盗モード】' : ''}`}
              >
                <span>{p.avatar}</span>
                {p.inJail && (
                  <span className="absolute -top-1 -right-1 text-[9px] bg-black/80 rounded-full px-0.5" title="収監中">
                    ⛓️
                  </span>
                )}
                {p.isPhantomThief ? (
                  <span className="absolute -bottom-1 -right-1 text-[9px] bg-purple-900 border border-amber-300 rounded-full px-0.5 animate-bounce" title="大怪盗">
                    🎩
                  </span>
                ) : p.isWanted && !p.inJail && (
                  <span className="absolute -bottom-1 -right-1 text-[9px] bg-amber-500 rounded-full px-0.5 animate-pulse" title="指名手配">
                    🚨
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. BOTTOM STATS / ACTION STRIP */}
      <div className="w-full shrink-0">
        {tile.type === 'land' ? (
          owner ? (
            // Owned Land: RENT is the primary prominent figure
            <div className="bg-black/8 border-t border-black/10 px-1 py-0.5 sm:py-1 flex items-center justify-between text-[9px] sm:text-[10px]">
              <span className="text-slate-600 font-bold shrink-0">通行料</span>
              <span className="font-black text-rose-700 sm:text-xs font-mono tabular-nums tracking-tight">
                {rentInfo ? rentInfo.rent : tile.baseRent}
                <span className="text-[8px] sm:text-[9px] ml-0.5 font-bold">M</span>
              </span>
            </div>
          ) : (
            // Unowned Land: CONTRACT COST is the primary figure, plus Base Rent
            <div className="bg-slate-100/90 border-t border-slate-200 px-1 py-0.5 sm:py-1 flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[9px] sm:text-[10px] leading-tight">
                <span className="text-slate-600 font-bold shrink-0">契約金</span>
                <div className="flex items-center gap-1 font-mono tabular-nums">
                  {isRealEstateSaleActive && (
                    <span className="text-[8px] text-slate-400 line-through">
                      {baseCost}M
                    </span>
                  )}
                  <span
                    className={`font-black ${
                      isRealEstateSaleActive
                        ? 'text-emerald-700 font-black'
                        : 'text-slate-900'
                    }`}
                  >
                    {effectiveCost}
                    <span className="text-[8px] sm:text-[9px] font-bold ml-0.5">M</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-500 leading-tight">
                <span>家賃</span>
                <span className="font-mono tabular-nums font-semibold">
                  {(tile.baseRent || 0) + (isBubbleEra ? 100 : 0)}M
                </span>
              </div>
            </div>
          )
        ) : tile.type === 'start' ? (
          <div className="bg-black/30 border-t border-white/20 px-1 py-0.5 sm:py-1 text-center text-[9px] sm:text-[11px] font-black text-amber-200">
            {isBubbleEra ? '給与 +300M (バブル)' : '給与 +200M'}
          </div>
        ) : tile.type === 'hellowork' ? (
          <div
            className={`border-t border-white/20 px-1 py-0.5 sm:py-1 text-center text-[8px] sm:text-[10px] font-black ${
              isBubbleEra
                ? 'bg-amber-500/30 text-amber-200 animate-pulse'
                : 'bg-black/30 text-amber-100'
            }`}
          >
            {isBubbleEra ? '⚖️ 審判のダイス' : '出目×100M 給与'}
          </div>
        ) : tile.type === 'venue' ? (
          <div className="bg-black/30 border-t border-white/20 px-1 py-0.5 sm:py-1 text-center text-[8px] sm:text-[10px] font-black text-purple-100">
            100Mで占い
          </div>
        ) : tile.type === 'jail' ? (
          <div className="bg-black/40 border-t border-white/20 px-1 py-0.5 sm:py-1 text-center text-[8px] sm:text-[10px] font-black text-slate-300">
            通常効果なし
          </div>
        ) : (
          <div className="bg-indigo-100/90 border-t border-indigo-200 px-1 py-0.5 sm:py-1 text-center text-[8px] sm:text-[10px] font-black text-indigo-700">
            カードを引く
          </div>
        )}
      </div>
    </div>
  );
};
