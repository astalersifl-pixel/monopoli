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
              <li>初期所持金は<strong>1000マニー</strong>。指定の目標金額（<strong>2000マニー</strong>または<strong>4000マニー</strong>）に最初に到達したプレイヤーの勝利！</li>
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
              <li><strong>隣接ボーナス（支払額1.5倍）：</strong>指定の2マスペア（<strong>1・2、4・5、6・7、9・10、11・12、14・15、16・17、19・20</strong>）を両方所有すると、支払額が<strong>1.5倍</strong>になります！</li>
              <li><strong>独占ボーナス（支払額2倍）：</strong>各エリアの4マス（<strong>1・2・4・5、6・7・9・10、11・12・14・15、16・17・19・20</strong>）をすべて独占すると、支払額が<strong>2倍</strong>になります！</li>
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
                <span className="font-black text-purple-400">左上：占いの館</span>
                <p className="text-[11px] text-slate-400">止まった時に100マニーで占いカード取得（見送り可）。通過時は何も起きません。</p>
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
              イベントカード一覧
            </h3>

            {/* 占いの館限定（8種） */}
            <div className="mb-3">
              <h4 className="text-xs font-black text-purple-300 mb-1.5 flex items-center gap-1">
                <span>🔮 占いの館限定カード（100マニーで引く波乱のカード）:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-indigo-300">📈 価格変動：</strong> サイコロを振る。奇数：次ターンまで全土地支払2倍！偶数：半分！
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-orange-300">⚠️ 大損害！：</strong> 自分以外のプレイヤー1名が対象！土地1つに200Mの修繕費（払えないと未契約へ）。
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-red-400">⚡ 災害発生！：</strong> 【全プレイヤー】対象！土地1つにつき50マニーを支払う。
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-emerald-300">🏷️ 不動産セール：</strong> 土地の契約金がすべて半額！全員で計3回購入されると終了。
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-blue-300">📜 権利の譲渡：</strong> 相手の土地を契約金で購入可能（★ランクアップは初期化）。
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-amber-300">✨ なんだか気分がいい！：</strong> 即座にもう一度サイコロを振って進む！
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-purple-300">💤 次から頑張る：</strong> 100マニー受取！ただし次のターンは1回休み。
                </div>
                <div className="bg-purple-950/40 border border-purple-500/30 p-2 rounded-lg">
                  <strong className="text-orange-400">🍻 飲み会をしよう！：</strong> 全員が占いの館に強制集合＆参加費50マニー消費！
                </div>
              </div>
            </div>

            {/* 通常イベントマス（7種） */}
            <div>
              <h4 className="text-xs font-black text-emerald-300 mb-1.5 flex items-center gap-1">
                <span>🎲 通常イベントマス（3, 9, 15, 21マス）:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-amber-300">💰 臨時収入：</strong> 即座に200マニー取得。
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-rose-400">💸 急な出費：</strong> 即座に100マニー没収。
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-emerald-300">🛡️ 支払い免除：</strong> 次に相手の土地で支払いをするとき全額免除（発動時に消費）。
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-yellow-300">🎲 私は豪運！：</strong> 次に契約する時サイコロを振る。1以外ならタダ！1なら倍額で契約（発動時に消費）。
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-cyan-300">🎫 宝くじに挑戦：</strong> サイコロを振る。1：500マニー、2〜5：50マニー、6：0マニー。
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg">
                  <strong className="text-indigo-400">🎯 情報操作：</strong> 次の番、一度だけ出るサイコロの目を1〜6から自由に選べる！（ダイスを振ると効果消費・1回のみ）
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg sm:col-span-2">
                  <strong className="text-rose-400">💥 支払額上昇：</strong> 一度だけ自分の土地に止まった相手の支払金が2倍になる！
                </div>
              </div>
            </div>
          </section>

          {/* 6. バブル期と天国と地獄マス */}
          <section className="bg-gradient-to-br from-amber-950/70 via-slate-800/80 to-rose-950/70 p-4 rounded-2xl border-2 border-amber-500/50 shadow-lg">
            <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5 mb-2">
              <span>🍾✨</span>
              バブル期と「天国と地獄」マス
            </h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                盤面にある<strong>すべての土地（全16マス）が契約される</strong>と、経済が過熱し<strong>【バブル期】</strong>へ突入します！
              </p>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-amber-400/30 space-y-1.5">
                <div className="font-black text-yellow-300 flex items-center gap-1">
                  <span>📈</span>
                  <span>好景気インフレボーナス（すべて +100マニー）：</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] sm:text-xs">
                  <li><strong>土地の支払額（家賃）：</strong> すべての土地の支払額に<strong>+100マニー</strong>が加算！</li>
                  <li><strong>イベントの収入：</strong> 臨時収入、宝くじ当選金、次から頑張るの収入が<strong>+100マニー</strong>！</li>
                  <li><strong>周回給与（スタート通過・停止）：</strong> 200マニー → <strong>300マニー（+100M）</strong>に増額！</li>
                  <li><strong>ハローワーク給与（アルバイト・再起）：</strong> 出目×100マニーに<strong>+100マニー</strong>が加算！</li>
                </ul>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-rose-400/30 space-y-1.5">
                <div className="font-black text-rose-300 flex items-center gap-1">
                  <span>⚖️</span>
                  <span>カジノ閉店 → 「天国と地獄マス」へ変貌：</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  左下のカジノマス（18番）は閉店し、<strong>「天国と地獄マス」</strong>に変化します。止まったプレイヤーは運命のサイコロを振ります：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-bold">
                  <div className="bg-emerald-950/60 border border-emerald-400/40 p-2 rounded-lg text-emerald-300">
                    🎲 1・2：【天国】200マニー獲得！
                  </div>
                  <div className="bg-rose-950/60 border border-rose-400/40 p-2 rounded-lg text-rose-300">
                    🎲 3・4：【地獄】200マニー没収！（不足時は破産）
                  </div>
                  <div className="bg-amber-950/60 border border-amber-400/40 p-2 rounded-lg text-amber-300">
                    🎲 5：自身の土地を3つ未契約状態にする
                  </div>
                  <div className="bg-purple-950/60 border border-purple-400/40 p-2 rounded-lg text-purple-300">
                    🎲 6：他プレイヤー1名がランダムに選ばれ、その土地3つを未契約状態にする
                  </div>
                </div>
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
