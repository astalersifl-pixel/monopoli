import React from 'react';
import { Tile, Player, ActivePriceFluctuation } from '../types/game';
import { calculateLandRent, getMonopolyProgress } from '../utils/boardData';
import { X, MapPin, Tag } from 'lucide-react';

interface TileDetailModalProps {
  tile: Tile | null;
  players: Player[];
  allTiles: Tile[];
  activePriceFluctuation: ActivePriceFluctuation | null;
  isRealEstateSaleActive?: boolean;
  isBubbleEra?: boolean;
  onClose: () => void;
}

function getDistrictName(tileId: number): string | null {
  if ([1, 2, 3, 5, 6, 7].includes(tileId)) return '住宅街 (ひよこ〜さくら通り)';
  if ([9, 10, 11, 13, 14, 15].includes(tileId)) return '港湾街 (ベイサイド〜白銀テラス)';
  if ([17, 18, 19, 21, 22, 23].includes(tileId)) return '商業街 (学園前〜クラウンヒルズ)';
  if ([25, 26, 27, 29, 30, 31].includes(tileId)) return '高級街 (クリスタル〜エンペラー)';
  return null;
}

export const TileDetailModal: React.FC<TileDetailModalProps> = ({
  tile,
  players,
  allTiles,
  activePriceFluctuation,
  isRealEstateSaleActive = false,
  isBubbleEra = false,
  onClose,
}) => {
  if (!tile) return null;

  const owner = players.find((p) => p.id === tile.ownerId);
  const districtName = getDistrictName(tile.id);
  const monopolyProgress = getMonopolyProgress(tile, allTiles);
  const rentInfo =
    tile.type === 'land'
      ? calculateLandRent(
          tile,
          allTiles,
          activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0,
          isBubbleEra
        )
      : null;

  const isTransformedHeavenAndHell = tile.type === 'hellowork' && isBubbleEra;
  const displayName = isTransformedHeavenAndHell ? '天国と地獄' : tile.name;
  const displayDescription = isTransformedHeavenAndHell
    ? 'すべての土地契約により運命を分かつ「天国と地獄マス」へと変化しました（バブル期はハローワークは存在しません）。止まると審判のサイコロを振ります。'
    : tile.type === 'jail'
    ? '通常は何の効果もないマス。犯罪計画書を持っていると現行犯逮捕されて収監されてしまいます！'
    : tile.description;

  const baseCost = tile.cost || 0;
  const effectiveCost =
    isRealEstateSaleActive && !owner ? Math.floor(baseCost / 2) : baseCost;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
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
        <div className="flex items-center gap-2 mb-1">
          {tile.landNumber ? (
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
              #{tile.landNumber}
            </span>
          ) : isTransformedHeavenAndHell ? (
            <span className="text-2xl shrink-0">⚖️</span>
          ) : (
            <MapPin className="w-6 h-6 text-indigo-600 shrink-0" />
          )}
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{displayName}</span>
              {isTransformedHeavenAndHell && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                  バブル期限定
                </span>
              )}
            </h3>
            {districtName && (
              <span className="text-[11px] font-bold text-slate-500">
                エリア: {districtName}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium my-3">{displayDescription}</p>

        {/* Land specific details */}
        {tile.type === 'land' && rentInfo && (
          <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Owner info */}
            <div className="flex justify-between items-center text-sm font-bold pb-2 border-b border-slate-200">
              <span className="text-slate-500">所有者:</span>
              {owner ? (
                <div className="flex items-center gap-1.5 font-black text-slate-900">
                  <span className="text-base">{owner.avatar}</span>
                  <span>{owner.name}</span>
                  {tile.rank ? (
                    <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                      ★Lv.2 (2倍)
                    </span>
                  ) : (
                    <span className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      Lv.1
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-emerald-700 bg-emerald-100 font-black px-2 py-0.5 rounded-full text-xs">
                  空地 (契約可能)
                </span>
              )}
            </div>

            {/* Financials */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">契約金 (購入価格):</span>
              <div className="flex items-center gap-1.5">
                {isRealEstateSaleActive && !owner && (
                  <span className="text-xs text-slate-400 line-through">
                    {baseCost} マニー
                  </span>
                )}
                <span className="font-black text-slate-900">
                  {effectiveCost} マニー
                </span>
                {isRealEstateSaleActive && !owner && (
                  <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
                    半額セール
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-bold">基本支払額 (基本家賃):</span>
              <span className="font-black text-slate-900">{tile.baseRent} マニー</span>
            </div>

            {/* Multiplier breakdown */}
            <div className="pt-2 border-t border-slate-200 text-xs flex flex-col gap-1.5">
              <div className="flex justify-between text-slate-600">
                <span>ランク補正 (★Lv.2で2倍):</span>
                <span className="font-bold">{tile.rank ? '×2.0 (ランクアップ済)' : '×1.0'}</span>
              </div>
              {rentInfo.isMonopolyBonus ? (
                <div className="flex justify-between items-center text-amber-900 font-bold bg-amber-100/80 px-2 py-1 rounded-lg border border-amber-300">
                  <span className="flex items-center gap-1">
                    <span>👑</span>
                    <span>独占ボーナス (全4マス独占):</span>
                  </span>
                  <span className="font-black text-amber-950 font-mono">×2.0 (独占中！)</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>隣接ボーナス (区画内隣接):</span>
                  <span className="font-bold">
                    {rentInfo.isAdjacentBonus ? (
                      <span className="text-rose-600 font-black">
                        ×{rentInfo.adjacentMultiplier} ({rentInfo.adjacentMultiplier === 1.8 ? '3マス連続所有！' : '2マス隣接所有！'})
                      </span>
                    ) : (
                      '×1.0'
                    )}
                  </span>
                </div>
              )}
              {monopolyProgress && (
                <div className="flex justify-between items-center text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  <span>
                    {monopolyProgress.groupName} (No.{monopolyProgress.landNumbers.join('・')}):
                  </span>
                  <span
                    className={`font-black ${
                      monopolyProgress.isMonopoly ? 'text-amber-700' : 'text-slate-700'
                    }`}
                  >
                    {monopolyProgress.isMonopoly
                      ? '👑 独占達成 (4/4)'
                      : owner
                      ? `${monopolyProgress.ownedCount}/4 所有`
                      : '未独占'}
                  </span>
                </div>
              )}
              {activePriceFluctuation && (
                <div className="flex justify-between text-indigo-600 font-bold">
                  <span>市場価格変動:</span>
                  <span>×{activePriceFluctuation.multiplier}</span>
                </div>
              )}
              {owner?.hasSurgeRent && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>支払額上昇カード:</span>
                  <span>×2.0</span>
                </div>
              )}
              {rentInfo.isBubbleEra && (
                <div className="flex justify-between items-center text-amber-900 font-bold bg-amber-100/90 px-2 py-1 rounded-lg border border-amber-300">
                  <span className="flex items-center gap-1">
                    <span>🍾</span>
                    <span>バブル期加算:</span>
                  </span>
                  <span className="font-black text-amber-950 font-mono">+100 マニー</span>
                </div>
              )}
            </div>

            {/* Final Rent */}
            <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900">現在の通行料 (支払額):</span>
              <span className="text-xl font-black text-rose-700">
                {rentInfo.rent} マニー
              </span>
            </div>
          </div>
        )}

        {/* Special Corner Tiles info */}
        {tile.type === 'start' && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-emerald-900 text-xs font-bold leading-relaxed">
            🏁 <strong>スタート地点</strong><br />
            盤面を1周して通過または停止するたびに、給与として【{isBubbleEra ? '300マニー（通常200M + バブル100M）' : '200マニー'}】を獲得できます！
          </div>
        )}

        {tile.type === 'hellowork' && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs font-bold leading-relaxed">
            💼 <strong>ハローワーク</strong><br />
            破産してお金が返せなくなったプレイヤーがここに移動します。自分のターンにサイコロを振って【{isBubbleEra ? '出目×100 + バブル加算100マニー' : '出目×100マニー'}】の給与を獲得し、次のターンから再出発できます！
          </div>
        )}

        {tile.type === 'venue' && (
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-purple-900 text-xs font-bold leading-relaxed">
            🔮 <strong>占いの館</strong><br />
            このマスに止まった時に【100マニー】を支払って波乱の占いカード（価格変動、大損害！、災害発生！、不動産セール、権利の譲渡、なんだか気分がいい！、次から頑張る、飲み会をしよう！）から1枚を取得できます（引かないことも可能）。通過時は何も起きません。
          </div>
        )}

        {tile.type === 'casino' && (
          isBubbleEra ? (
            <div className="bg-gradient-to-br from-amber-50 to-rose-50 p-4 rounded-2xl border-2 border-amber-400 text-slate-900 text-xs font-bold leading-relaxed shadow-sm">
              ⚖️ <strong>天国と地獄 (バブル期限定マス)</strong><br />
              すべての土地が契約されたため、カジノは閉店し「天国と地獄マス」に変化しました！<br />
              止まったプレイヤーは運命のサイコロを振ります：<br />
              <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-slate-700">
                <li><strong className="text-emerald-700">1・2</strong>：200マニー獲得</li>
                <li><strong className="text-rose-700">3・4</strong>：200マニー没収（不足時は破産）</li>
                <li><strong className="text-amber-800">5</strong>：自身の土地を3つ未契約状態にする</li>
                <li><strong className="text-purple-800">6</strong>：自分以外のプレイヤーがランダムに選ばれ、その土地を3つ未契約状態にする</li>
              </ul>
            </div>
          ) : (
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-rose-900 text-xs font-bold leading-relaxed">
              🎰 <strong>カジノ</strong><br />
              止まるとダイス勝負に挑戦できます！大(4,5,6)や小(1,2,3)で2倍、1ピンポイントで5倍の配当が狙えます！
            </div>
          )
        )}

        {tile.type === 'event' && (
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-indigo-900 text-xs font-bold leading-relaxed">
            🎲 <strong>イベントマス</strong><br />
            止まるとイベントカード（臨時収入、急な出費、支払い免除、私は豪運！、宝くじ、情報操作、支払額上昇）から1枚を引いて即座に発動します！
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm cursor-pointer hover:bg-slate-800 transition-colors"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
