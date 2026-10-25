import React, { useState } from 'react';
import { Player, Tile } from '../types/game';
import { sounds } from '../utils/audio';
import {
  AlertOctagon,
  Briefcase,
  DollarSign,
  Building,
  Eye,
  EyeOff,
  Layers,
  ChevronUp,
} from 'lucide-react';

interface BankruptcyModalProps {
  player: Player;
  debtAmount: number;
  ownedTiles: Tile[];
  onSellTile: (tileId: number) => void;
  onSellAllAndGoToHelloWork: () => void;
  onPayDebtAndResume: () => void;
}

export const BankruptcyModal: React.FC<BankruptcyModalProps> = ({
  player,
  debtAmount,
  ownedTiles,
  onSellTile,
  onSellAllAndGoToHelloWork,
  onPayDebtAndResume,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPeekTranslucent, setIsPeekTranslucent] = useState(false);

  const currentMoney = player.money;
  const remainingDebt = Math.max(0, debtAmount - currentMoney);
  const canPayNow = currentMoney >= debtAmount;

  // Total liquidation value of all remaining owned lands
  const totalLandValue = ownedTiles.reduce(
    (acc, t) => acc + Math.floor((t.cost || 0) / 2),
    0
  );
  const totalPossibleMoney = currentMoney + totalLandValue;
  const willStillBeBankruptAfterAllSales = totalPossibleMoney < debtAmount;

  if (isMinimized) {
    return (
      <>
        {/* Top Notification */}
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-slate-900/95 text-white border-2 border-rose-400 px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold backdrop-blur-md animate-bounce-subtle">
          <Eye className="w-4 h-4 text-rose-400 shrink-0" />
          <span>盤面確認中（所有地や相手の位置を確認できます）</span>
        </div>

        {/* Bottom Floating Bar */}
        <div className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 w-[95vw] max-w-lg z-50 pointer-events-auto animate-slide-up">
          <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 border-2 border-rose-500 shadow-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
              <span className="text-2xl shrink-0 p-1.5 bg-rose-500/20 border border-rose-400/40 rounded-xl">
                ⚠️
              </span>
              <div className="text-left overflow-hidden min-w-0">
                <div className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">
                  破産の危機 — 資金精算中
                </div>
                <div className="text-xs sm:text-sm font-black text-white truncate">
                  所持金: {currentMoney}M / 必要額: {debtAmount}M
                </div>
                <div className="text-[11px] text-rose-300 font-bold truncate">
                  {canPayNow ? '完済可能！' : `不足: ${remainingDebt} マニー (所有地 ${ownedTiles.length}件)`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg cursor-pointer active:scale-95 transition-all border border-rose-300/40 animate-pulse"
            >
              <EyeOff className="w-4 h-4" />
              <span>売却手続きに戻る</span>
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
          : 'bg-black/80 backdrop-blur-xs'
      }`}
    >
      <div
        className={`relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden flex flex-col p-5 sm:p-7 max-h-[92vh] overflow-y-auto transition-all duration-200 ${
          isPeekTranslucent
            ? 'opacity-15 scale-95 pointer-events-none'
            : 'opacity-100 scale-100 animate-scale-up'
        }`}
      >
        {/* Header Top Controls: Warning & Peek Buttons */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertOctagon className="w-7 h-7 shrink-0 animate-bounce-subtle" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              破産の危機！
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={() => setIsPeekTranslucent(true)}
              onMouseUp={() => setIsPeekTranslucent(false)}
              onMouseLeave={() => setIsPeekTranslucent(false)}
              onTouchStart={() => setIsPeekTranslucent(true)}
              onTouchEnd={() => setIsPeekTranslucent(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-all cursor-pointer active:scale-95 select-none"
              title="押している間、画面が透けて盤面が見えます"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>長押し透過</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black shadow-md border border-rose-400 transition-all cursor-pointer active:scale-95"
              title="最小化して盤面を自由に確認します"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>盤面を確認</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-rose-600 font-bold mb-3">
          支払い金額が所持金を上回っています。手放す土地を盤面で確認しながら売却し、資金を用立ててください。
        </p>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 sm:p-4 my-2">
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">必要支払い額</span>
            <span className="text-base sm:text-lg font-black text-rose-700">{debtAmount} マニー</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold block">現在の所持金</span>
            <span className="text-base sm:text-lg font-black text-slate-900">{currentMoney} マニー</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-rose-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">不足金額:</span>
            <span className="text-lg sm:text-xl font-black text-rose-600">
              {canPayNow ? '完済可能！' : `あと ${remainingDebt} マニー`}
            </span>
          </div>
        </div>

        {/* Owned Lands Liquidation List */}
        <div className="flex-1 max-h-56 overflow-y-auto pr-1 my-2">
          <div className="text-xs font-black text-slate-700 mb-2 flex items-center justify-between">
            <span>売却可能な所有地 (契約金の半額で売却):</span>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-[10px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              盤面で配置を確認
            </button>
          </div>

          {ownedTiles.length === 0 ? (
            <div className="text-center py-6 bg-slate-100 rounded-2xl text-slate-500 text-sm font-bold">
              売却できる土地がありません。
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {ownedTiles.map((tile) => {
                const sellPrice = Math.floor((tile.cost || 0) / 2);
                return (
                  <div
                    key={tile.id}
                    className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                        {tile.landNumber}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1">
                          <span>{tile.name}</span>
                          {tile.rank ? (
                            <span className="text-[10px] text-amber-600 font-bold">★Lv.2</span>
                          ) : null}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          契約金: {tile.cost}M
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playCoin();
                        onSellTile(tile.id);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      +{sellPrice}Mで売却
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex flex-col gap-2">
          {canPayNow ? (
            <button
              type="button"
              onClick={onPayDebtAndResume}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-lg cursor-pointer active:scale-98"
            >
              支払いを完了して復帰する
            </button>
          ) : willStillBeBankruptAfterAllSales ? (
            <div className="flex flex-col gap-2 bg-amber-50 p-3 rounded-2xl border border-amber-200">
              <p className="text-xs text-amber-900 font-bold text-center">
                全土地を売却しても返済不能です。ハローワークへ移動し、次ターンからサイコロ出目×100マニーで再起を図ります！
              </p>
              <button
                type="button"
                onClick={onSellAllAndGoToHelloWork}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm sm:text-base rounded-xl shadow-lg cursor-pointer active:scale-98"
              >
                <Briefcase className="w-5 h-5" />
                ハローワークへ移動して再起する
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center font-bold">
              不足分を補うために、上記の土地を売却してください。
            </p>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center justify-center gap-1 cursor-pointer pt-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>盤面全体の土地と所持金状況を確認する</span>
          </button>
        </div>
      </div>
    </div>
  );
};
