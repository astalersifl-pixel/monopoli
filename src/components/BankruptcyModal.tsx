import React from 'react';
import { Player, Tile } from '../types/game';
import { sounds } from '../utils/audio';
import { AlertOctagon, Briefcase, DollarSign, Building } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-rose-500 overflow-hidden flex flex-col p-6 sm:p-8 animate-scale-up">
        {/* Header Warning */}
        <div className="flex items-center gap-3 text-rose-600 mb-2">
          <AlertOctagon className="w-8 h-8 shrink-0 animate-bounce-subtle" />
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">破産の危機！</h2>
            <p className="text-xs text-rose-600 font-bold">
              支払い金額が所持金を上回っています。土地を売却して資金を用立ててください。
            </p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-3 bg-rose-50 border border-rose-200 rounded-2xl p-4 my-4">
          <div>
            <span className="text-xs text-slate-500 font-bold block">必要支払い額</span>
            <span className="text-lg font-black text-rose-700">{debtAmount} マニー</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-bold block">現在の所持金</span>
            <span className="text-lg font-black text-slate-900">{currentMoney} マニー</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-rose-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">不足金額:</span>
            <span className="text-xl font-black text-rose-600">
              {canPayNow ? '完済可能！' : `あと ${remainingDebt} マニー`}
            </span>
          </div>
        </div>

        {/* Owned Lands Liquidation List */}
        <div className="flex-1 max-h-60 overflow-y-auto pr-1 my-2">
          <div className="text-xs font-black text-slate-700 mb-2 flex items-center justify-between">
            <span>売却可能な所有地 (契約金の半額で売却):</span>
            <span className="text-slate-500 font-normal">{ownedTiles.length}件所有</span>
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
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                        {tile.landNumber}
                      </span>
                      <div>
                        <div className="text-sm font-black text-slate-900">{tile.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
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
        <div className="mt-4 flex flex-col gap-2">
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-base rounded-xl shadow-lg cursor-pointer active:scale-98"
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
        </div>
      </div>
    </div>
  );
};
