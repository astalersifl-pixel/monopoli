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
              <li>外周が<strong>9×9マス（全32マス・土地24マス）</strong>の広大なマップを周回します。</li>
              <li>右下の<strong>「スタート地点（0番）」</strong>から開始し、<strong>反時計回り</strong>に進みます。</li>
              <li>サイコロ1個（出目1〜6）を振り、出た目だけ進みます。</li>
              <li>スタート地点を通過または停止すると、給料として<strong>200マニー</strong>を獲得！さらに所持している犯罪計画書を<strong>1枚100マニーで清算</strong>可能！</li>
              <li>初期所持金は<strong>1000マニー</strong>。指定の目標金額（<strong>2000マニー</strong>または<strong>4000マニー</strong>）に最初に到達したプレイヤーの勝利！</li>
            </ul>
          </section>

          {/* 2. 土地システム */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <span className="text-emerald-400">🏡</span>
              土地の契約とランクアップ・各種ボーナス
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>未契約の土地：</strong>指定の契約金を支払うことで自分の土地にできます。</li>
              <li><strong>自分の土地に止まる：</strong>契約金の倍額を支払うことで、<strong>一度だけランクアップ（★Lv.2）</strong>可能！支払額（家賃）が2倍になります。</li>
              <li><strong>相手の土地に止まる：</strong>指定された支払額をその土地の持ち主に渡します。</li>
              <li><strong>隣接ボーナス：</strong>隣り合う土地同士で発生！同じ区画で<strong>2つ並べば1.5倍</strong>、<strong>3つ並べば1.8倍</strong>に支払額がアップ！（※斜めやイベントマスをまたぐ並びは対象外）</li>
              <li><strong>エリア独占ボーナス（支払額2倍）：</strong>各エリアの全6マス（住宅街1〜6、港湾街7〜12、商業街13〜18、高級街19〜24）を独占すると支払額が<strong>2倍</strong>！</li>
            </ul>
          </section>

          {/* 3. イベントマスと通過イベント */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <span className="text-indigo-400">⚡</span>
              イベントマスと通過時イベント引き
            </h3>
            <p>
              イベントマス（4, 12, 20, 28マス）は、止まった時はもちろん、<strong>移動中に通過する場合でも【50マニー】を支払ってカードを引く</strong>ことができます！引いた後はダイス移動の残りの歩数を続けて進みます。
            </p>
          </section>

          {/* 4. 牢屋・脱獄・犯罪計画書 */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 mb-2">
              <span className="text-zinc-300">⛓️</span>
              牢屋・脱獄・犯罪計画書
            </h3>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong>犯罪計画書：</strong>最大<strong>5枚まで所持可能</strong>。スタート地点に止まると1枚100マニーで清算できます。</li>
              <li><strong>現行犯逮捕：</strong>計画書を持った状態で左下の牢屋（24番）に止まると現行犯逮捕され収監！</li>
              <li><strong>収監中の選択肢：</strong>
                <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-300">
                  <li><strong>脱獄：</strong>通常通り移動可能！ただし所持バフが消滅し<strong>【指名手配】</strong>されます（他者と同マスで再逮捕＆相手に200M報奨金）。牢屋通過・停止で解除。</li>
                  <li><strong>釈放チャンス：</strong>サイコロを2回振り、合計7以上または1のゾロ目で無罪放免釈放！</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* 5. バブル期・天国と地獄・救済返済 */}
          <section className="bg-gradient-to-br from-amber-950/70 via-slate-800/80 to-rose-950/70 p-4 rounded-2xl border-2 border-amber-500/50 shadow-lg">
            <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5 mb-2">
              <span>🍾✨</span>
              バブル期突入・「天国と地獄」・借金救済プログラム
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                盤面にある<strong>すべての土地（全24マス）が契約される</strong>と<strong>【バブル期】</strong>へ突入します！
              </p>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-400/30 space-y-1">
                <div className="font-black text-yellow-300">📈 好景気インフレボーナス（すべて +100マニー）：</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px] sm:text-xs">
                  <li>土地の支払額（通行料・家賃）：全土地+100マニー加算（マスに加算後の額を表示）！</li>
                  <li>イベントの収入：臨時収入、宝くじ、次から頑張るなど+100マニー！</li>
                  <li>周回給与（スタート通過・停止）：200M → <strong>300M（+100M）</strong>！</li>
                </ul>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-400/30 space-y-1">
                <div className="font-black text-amber-300">⚖️ 「天国と地獄マス」へ変貌（バブル期はハローワークが消滅）：</div>
                <p className="text-[11px] text-slate-300">
                  バブル期になるとハローワークが消滅し<strong>「天国と地獄マス」</strong>に変化！止まったプレイヤーは運命のサイコロを振ります：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-bold">
                  <div className="bg-emerald-950/60 border border-emerald-400/40 p-1.5 rounded-lg text-emerald-300">
                    🎲 1・2：【天国】200マニー獲得！
                  </div>
                  <div className="bg-rose-950/60 border border-rose-400/40 p-1.5 rounded-lg text-rose-300">
                    🎲 3・4：【地獄】200マニー没収！
                  </div>
                  <div className="bg-amber-950/60 border border-amber-400/40 p-1.5 rounded-lg text-amber-300">
                    🎲 5：自身の土地を3つ未契約に戻す
                  </div>
                  <div className="bg-purple-950/60 border border-purple-400/40 p-1.5 rounded-lg text-purple-300">
                    🎲 6：他プレイヤー1名の土地3つを未契約に戻す
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/40 space-y-1">
                <div className="font-black text-rose-300">🚨 バブル期借金救済＆通行料収入ルール：</div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
                  <li><strong>通行料不足時の借金化：</strong>通行料が足りない場合、止まったプレイヤーは不足分を借金しスタート地点へ戻されます。<strong>通行料はその土地のプレイヤーに全額支給</strong>されます！</li>
                  <li><strong>借金中の通行料収入：</strong>借金中でも所有地からの通行料収入は満額受け取れます！受け取った収入で借金を返済できれば、次の自分の番で<strong>サイコロを振って移動を再開</strong>できます！</li>
                  <li><strong>支援金＆差額受取：</strong>ターンの始めに<strong>200マニーの返済支援金</strong>が支給されます。借金返済時の差額は<strong>自分のお金</strong>になります！</li>
                </ul>
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
