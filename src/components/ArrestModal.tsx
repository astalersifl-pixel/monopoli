import React, { useEffect } from 'react';
import { ArrestInfo } from '../types/game';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface ArrestModalProps {
  arrestInfo: ArrestInfo;
  onDismiss: () => void;
  isHumanInvolved?: boolean;
}

export const ArrestModal: React.FC<ArrestModalProps> = ({
  arrestInfo,
  onDismiss,
  isHumanInvolved = !arrestInfo.arrestedPlayer.isAi || (arrestInfo.capturerPlayer ? !arrestInfo.capturerPlayer.isAi : false),
}) => {
  const { type, arrestedPlayer, capturerPlayer, bounty = 200, confiscatedBlueprints = 0 } = arrestInfo;

  // Auto-dismiss for CPU-only interaction after 3 seconds
  useEffect(() => {
    if (!isHumanInvolved) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [isHumanInvolved, onDismiss]);

  const isRedHanded = type === 'red_handed';
  const isWantedCaught = type === 'wanted_caught';
  const isWantedSelf = type === 'wanted_arrested_self';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Flashing Police Sirens Background Pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-300" />
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-neutral-900 to-slate-950 border-4 border-red-500 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.5)] p-5 sm:p-7 text-white flex flex-col items-center text-center animate-scale-up overflow-hidden">
        {/* Police Caution Tape Header */}
        <div className="w-full bg-yellow-400 text-slate-950 font-black text-[10px] sm:text-xs py-1 tracking-widest uppercase flex justify-around items-center rounded-lg mb-4 shadow-md">
          <span>⚠️ POLICE LINE</span>
          <span>DO NOT CROSS</span>
          <span>POLICE LINE ⚠️</span>
        </div>

        {/* Siren Badge */}
        <div className="relative mb-2">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-blue-600 flex items-center justify-center shadow-2xl border-2 border-white/60 animate-bounce-subtle">
            <span className="text-3xl sm:text-4xl animate-pulse">🚨</span>
          </div>
          <span className="absolute -bottom-2 -right-2 text-2xl">⛓️</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-200 to-rose-400 tracking-tight mb-1">
          {isRedHanded && '現行犯逮捕！！'}
          {isWantedCaught && '指名手配犯を再逮捕！！'}
          {isWantedSelf && '指名手配犯を確保！！'}
        </h2>

        {/* Subtitle */}
        <div className="text-xs sm:text-sm font-bold text-red-200 mb-4 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            {isRedHanded && '犯罪計画書所持により緊急逮捕！'}
            {isWantedCaught && '逃走中に他プレイヤーと接触し身柄拘束！'}
            {isWantedSelf && '潜伏中の指名手配犯を発見・連行！'}
          </span>
        </div>

        {/* Details Card */}
        <div className="w-full bg-slate-800/80 border border-red-500/40 rounded-2xl p-4 flex flex-col gap-3 text-left text-xs sm:text-sm shadow-inner mb-4">
          {/* Arrested Player Strip */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <span className="text-slate-400 font-bold">被疑者:</span>
            <div className="flex items-center gap-1.5 font-black text-white">
              <span className="text-lg">{arrestedPlayer.avatar}</span>
              <span>{arrestedPlayer.name}</span>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black animate-pulse">
                ⛓️ 牢屋へ送還
              </span>
            </div>
          </div>

          {/* Description of Crime / Incident */}
          <div className="text-slate-300 text-xs leading-relaxed">
            {isRedHanded && (
              <p>
                犯罪計画書（{confiscatedBlueprints}枚）を所持した状態で牢屋に立ち入ったため、捜査員に現行犯逮捕されました！<br />
                <span className="text-amber-300 font-bold">※犯罪計画書は証拠品としてすべて没収されます。</span>
              </p>
            )}
            {isWantedCaught && capturerPlayer && (
              <p>
                指名手配中に <strong className="text-white">{capturerPlayer.name}</strong> と同じマスに止まってしまい御用！<br />
                <strong className="text-amber-300">{capturerPlayer.name}</strong> は検挙の報奨金として <strong className="text-yellow-300 font-mono text-sm">+{bounty}マニー</strong> を獲得しました！
              </p>
            )}
            {isWantedSelf && capturerPlayer && (
              <p>
                <strong className="text-white">{capturerPlayer.name}</strong> がマスに潜伏していた指名手配犯 <strong className="text-rose-300">{arrestedPlayer.name}</strong> を発見・捕獲しました！<br />
                <strong className="text-amber-300">{capturerPlayer.name}</strong> に報奨金 <strong className="text-yellow-300 font-mono text-sm">+{bounty}マニー</strong> が支給されます！
              </p>
            )}
          </div>

          {/* Penalty result */}
          <div className="bg-red-950/70 border border-red-500/50 rounded-xl p-2.5 flex items-center gap-2 text-rose-200 text-xs font-bold">
            <span className="text-base shrink-0">🏛️</span>
            <span>
              {arrestedPlayer.name} は牢屋（マス24）へ収監されました。次のターンは【脱獄】か【釈放チャンス】を選択します。
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl border-2 border-red-400 cursor-pointer transition-all"
        >
          {isHumanInvolved ? '逮捕状況を確認（閉じる）' : '処理を継続…'}
        </button>
      </div>
    </div>
  );
};
