import React from 'react';
import { Tile, Player, ActivePriceFluctuation } from '../types/game';
import { calculateLandRent } from '../utils/boardData';
import { Building2, X, Sparkles, MapPin, Award } from 'lucide-react';

interface TileDetailModalProps {
  tile: Tile | null;
  players: Player[];
  allTiles: Tile[];
  activePriceFluctuation: ActivePriceFluctuation | null;
  onClose: () => void;
}

export const TileDetailModal: React.FC<TileDetailModalProps> = ({
  tile,
  players,
  allTiles,
  activePriceFluctuation,
  onClose,
}) => {
  if (!tile) return null;

  const owner = players.find((p) => p.id === tile.ownerId);
  const rentInfo =
    tile.type === 'land'
      ? calculateLandRent(
          tile,
          allTiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 animate-scale-up text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          {tile.landNumber ? (
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center">
              {tile.landNumber}
            </span>
          ) : (
            <MapPin className="w-6 h-6 text-indigo-600" />
          )}
          <h3 className="text-xl font-black text-slate-900">{tile.name}</h3>
        </div>

        <p className="text-xs text-slate-600 font-medium mb-4">{tile.description}</p>

        {/* Land specific details */}
        {tile.type === 'land' && rentInfo && (
          <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Owner info */}
            <div className="flex justify-between items-center text-sm font-bold pb-2 border-b border-slate-200">
              <span className="text-slate-500">所有者:</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-black text-slate-900">
                  <span>{owner.avatar}</span>
                  <span>{owner.name}</span>
                  {tile.rank ? (
                    <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                      ★Lv.2
                    </span>
                  ) : null}
                </div>
              ) : (
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-xs">
                  未契約 (購入可能)
                </span>
              )}
            </div>

            {/* Financials */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">契約金 (購入価格):</span>
              <span className="font-black text-slate-900">{tile.cost} マニー</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">基本支払額 (家賃):</span>
              <span className="font-black text-slate-900">{tile.baseRent} マニー</span>
            </div>

            {/* Multiplier breakdown */}
            <div className="pt-2 border-t border-slate-200 text-xs flex flex-col gap-1">
              <div className="flex justify-between text-slate-600">
                <span>ランク補正:</span>
                <span className="font-bold">{tile.rank ? '×2.0 (ランクアップ済)' : '×1.0'}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>隣接ボーナス:</span>
                <span className="font-bold">
                  {rentInfo.isAdjacentBonus ? '×1.5 (隣接保有中！)' : '×1.0'}
                </span>
              </div>
              {activePriceFluctuation && (
                <div className="flex justify-between text-indigo-600 font-bold">
                  <span>市場価格変動:</span>
                  <span>×{activePriceFluctuation.multiplier}</span>
                </div>
              )}
            </div>

            {/* Final Rent */}
            <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900">現在の支払額:</span>
              <span className="text-xl font-black text-emerald-700">
                {rentInfo.rent} マニー
              </span>
            </div>
          </div>
        )}

        {/* Special Corner Tiles info */}
        {tile.type === 'start' && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold leading-relaxed">
            🏁 スタート地点。盤面を周回して通過または停止するたびに、給与として【200マニー】を獲得できます！
          </div>
        )}

        {tile.type === 'hellowork' && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold leading-relaxed">
            💼 ハローワーク。破産してお金が返せなくなったプレイヤーがここに移動します。自分のターンにサイコロを振って【出目×100マニー】を獲得し、次のターンから再出発できます！
          </div>
        )}

        {tile.type === 'venue' && (
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-purple-900 text-xs font-bold leading-relaxed">
            🎪 イベント会場。このマスに止まるとイベントカードを無料で1枚取得！通過した場合は【50マニー】を支払って1枚取得するか選べます！
          </div>
        )}

        {tile.type === 'casino' && (
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-rose-900 text-xs font-bold leading-relaxed">
            🎰 カジノ。止まるとダイス勝負に挑戦できます！大(4,5,6)や小(1,2,3)で2倍、1ピンポイントで5倍の配当が狙えます！
          </div>
        )}

        {tile.type === 'event' && (
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-indigo-900 text-xs font-bold leading-relaxed">
            🎲 イベントマス。止まると8種類の多彩なイベントカード（臨時収入、価格変動、私は豪運！、宝くじなど）から1枚を引いて即座に発動します！
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm cursor-pointer hover:bg-slate-800"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
