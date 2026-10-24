import React from 'react';
import { X, Trophy, Flag, Briefcase, Sparkles, Dices, Shield, AlertTriangle } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border-2 border-slate-700 text-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-amber-400 mb-4 flex items-center gap-2">
          <span>📖</span> ルールブック (ものぽりぃ)
        </h2>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* 1. 基本概要 */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              勝利条件と基本進行
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>外周が<strong>7×7マス（全24マス）</strong>のマップを周回します。</li>
              <li>右下の<strong>「スタート地点」</strong>から開始し、<strong>反時計回り</strong>に進みます。</li>
              <li>サイコロ1個（出目1〜6）を振り、出た目だけ進みます。</li>
              <li>スタート地点を通過または停止すると、給料として<strong>200マニー</strong>を獲得！</li>
              <li>初期所持金は<strong>1000マニー</strong>。指定の目標金額（<strong>5000マニー</strong>または<strong>10000マニー</strong>）に最初に到達したプレイヤーの勝利！</li>
            </ul>
          </section>

          {/* 2. 土地システム */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <span className="text-emerald-400">🏡</span>
              土地の契約とランクアップ
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>未契約の土地：</strong>指定の契約金を支払うことで自分の土地にできます。</li>
              <li><strong>自分の土地に止まる：</strong>契約金の倍額を支払うことで、<strong>一度だけランクアップ（★Lv.2）</strong>可能！支払額（家賃）が2倍になります。</li>
              <li><strong>相手の土地に止まる：</strong>指定された支払額をその土地の持ち主に渡します。</li>
              <li><strong>隣接ボーナス：</strong>隣り合う土地を契約すると、支払額が<strong>1.5倍</strong>に跳ね上がります！</li>
            </ul>
          </section>

          {/* 3. 破産とハローワーク */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              破産とハローワーク
            </h3>
            <p>
              支払いができなくなった場合、所有地を<strong>契約金の半額</strong>で売り払ってお金を工面します。
              土地をすべて売っても返済できなくなった場合、<strong>ハローワークマス（右上）に強制移動</strong>します。
              ハローワークでのターンはサイコロを振り、<strong>【出目 × 100マニー】</strong>を獲得してターン終了。次のターンから行動を再開できます！
            </p>
          </section>

          {/* 4. 四隅のマス */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <Flag className="w-4 h-4 text-indigo-400" />
              四隅のマスの効果
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-emerald-500/30">
                <span className="font-black text-emerald-400">右下：スタート地点</span>
                <p className="text-[11px] text-slate-400">旅の拠点。通過・停止で200マニー支給！</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/30">
                <span className="font-black text-amber-400">右上：ハローワーク</span>
                <p className="text-[11px] text-slate-400">破産時の再起マス。通常時もアルバイト可能！</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-purple-500/30">
                <span className="font-black text-purple-400">左上：イベント会場</span>
                <p className="text-[11px] text-slate-400">止まると無料、通過時は50マニーでカード1枚取得！</p>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-rose-500/30">
                <span className="font-black text-rose-400">左下：カジノ</span>
                <p className="text-[11px] text-slate-400">ダイス勝負！大・小で2倍、1ピンポイントで5倍配当！</p>
              </div>
            </div>
          </section>

          {/* 5. イベントカード一覧 */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              全8種類のイベントカード
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-amber-300">💰 臨時収入：</strong> 即座に200マニー取得。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-rose-400">💸 急な出費：</strong> 即座に100マニー没収。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-indigo-300">📈 価格変動：</strong> サイコロを振る。奇数：次の自分のターンまで全土地支払2倍！偶数：半分！
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-emerald-300">🛡️ 支払い免除：</strong> 次に相手の土地で支払いをするとき全額免除。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-yellow-300">🎲 私は豪運！：</strong> 次に契約する時サイコロを振る。1以外ならタダ！1なら倍額で契約。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-orange-300">⚠️ 大損害！：</strong> 自分の土地がランダムに1か所選ばれ、200マニー払わなければ未契約に戻る。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-cyan-300">🎫 宝くじに挑戦：</strong> サイコロを振る。1：500マニー、2〜5：50マニー、6：0マニー。
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg">
                <strong className="text-red-400">⚡ 災害発生！：</strong> 所持する土地1つにつき100マニーを支払う。
              </div>
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer"
        >
          閉じてゲームを続ける
        </button>
      </div>
    </div>
  );
};
