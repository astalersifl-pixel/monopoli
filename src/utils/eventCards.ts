import { EventCard, EventCardType } from '../types/game';

export const EVENT_CARDS: EventCard[] = [
  // --- 通常イベントカード ---
  {
    type: 'windfall',
    title: '臨時収入',
    subtitle: 'ボーナス支給！',
    description: '思わぬ臨時収入が発生！即座に【200マニー】を獲得します。',
    icon: '💰',
  },
  {
    type: 'sudden_expense',
    title: '急な出費',
    subtitle: '痛恨の出費…',
    description: '家電が故障して急な修理費用が発生！即座に【100マニー】を没収されます。',
    icon: '💸',
  },
  {
    type: 'rent_exemption',
    title: '支払い免除',
    subtitle: 'お守りカード！',
    description: 'このカードを保持します。次に相手の土地にとまった際、支払額が【全額免除（0マニー）】されます！（発動時に消費）',
    icon: '🛡️',
  },
  {
    type: 'super_lucky',
    title: '私は豪運！',
    subtitle: '大博打のチャンス！',
    description: 'このカードを保持します。次に土地を契約する時サイコロを振る！【1以外】：タダで契約！【1】：倍額で契約！（契約完了時に消費）',
    icon: '🎲',
  },
  {
    type: 'lottery',
    title: '宝くじに挑戦',
    subtitle: '一攫千金くじ！',
    description: 'サイコロを振って運試し！【1】：500マニー！【2〜5】：50マニー！【6】：ハズレ（0マニー）',
    icon: '🎫',
  },
  {
    type: 'info_manipulation',
    title: '情報操作',
    subtitle: '出目を完全掌握！',
    description: '次の自分の番、一度だけ出るサイコロの目を1〜6から自由に決めることができます！（サイコロを振ると1回で効果終了）',
    icon: '🎯',
  },
  {
    type: 'surge_rent',
    title: '支払額上昇',
    subtitle: '強力なトラップ！',
    description: 'この効果を保持します。一度だけ自分の土地に止まったプレイヤーの支払金が【2倍】になります！（発動時に消費）',
    icon: '💥',
  },
  {
    type: 'crime_blueprint',
    title: '犯罪計画書',
    subtitle: '危険な秘密文書！',
    description: 'この計画書を所持したまま【牢屋】に止まると現行犯逮捕されて牢屋に収監されてしまいます！',
    icon: '📑',
  },

  // --- 占いの館限定カード ---
  {
    type: 'price_fluctuation',
    title: '価格変動',
    subtitle: '市場の激変！',
    description: 'サイコロを振る！【奇数】：次の自分のターンまですべての土地の支払額が2倍！【偶数】：半分になる！',
    icon: '📈',
  },
  {
    type: 'major_damage',
    title: '大損害！',
    subtitle: 'ライバルを直撃！',
    description: '自分以外のプレイヤー1名の所有地がランダムに1か所選ばれます！対象プレイヤーは【200マニー】払って維持するか、諦めて未契約に戻します。',
    icon: '⚠️',
  },
  {
    type: 'disaster',
    title: '災害発生！',
    subtitle: '全プレイヤー緊急工事！',
    description: '自然災害が盤面全体を直撃！【全プレイヤー】は所持する土地1つにつき【50マニー】の修繕費を支払います。',
    icon: '⚡',
  },
  {
    type: 'real_estate_sale',
    title: '不動産セール',
    subtitle: '大バーゲン開催！',
    description: '全土地の契約金がすべて【半額】になります！全プレイヤー合わせて【3回】購入が行われると元の価格に戻ります。',
    icon: '🏷️',
  },
  {
    type: 'transfer_rights',
    title: '権利の譲渡',
    subtitle: '買収のチャンス！',
    description: 'ほかのプレイヤーが所有する土地を契約金を支払えば購入できます！（※ランクアップ状態は引き継がれず初期化されます）',
    icon: '📜',
  },
  {
    type: 'feel_good_roll',
    title: 'なんだか気分がいい！',
    subtitle: '連続ターン！',
    description: '調子に乗って即座にもう一度サイコロを振ることができます！',
    icon: '✨',
  },
  {
    type: 'slacking_off',
    title: '次から頑張る',
    subtitle: '給料の前借り？',
    description: '即座に【100マニー】を受け取ります！ただし、次の自分のターンは【1回休み】になります。',
    icon: '💤',
  },
  {
    type: 'drinking_party',
    title: '飲み会をしよう！',
    subtitle: '強制大集合！',
    description: '全員を占いの館に呼び出します！その後、参加費として【全員が50マニーを消費】します。',
    icon: '🍻',
  },
  {
    type: 'turn_evil',
    title: '悪に染まる！',
    subtitle: '闇の誘惑…',
    description: '犯罪の甘い誘惑に負け、犯罪計画書を【2枚】受け取ってしまいます！（最大5枚まで所持可能）',
    icon: '😈',
  },
];

// 通常のイベントマスで引けるカード
export const NORMAL_EVENT_CARDS: EventCard[] = EVENT_CARDS.filter((c) =>
  ['windfall', 'sudden_expense', 'rent_exemption', 'super_lucky', 'crime_blueprint', 'lottery', 'info_manipulation', 'surge_rent'].includes(c.type)
);

// 占いの館（マス16）でのみ引けるカード
export const FORTUNE_HALL_CARDS: EventCard[] = EVENT_CARDS.filter((c) =>
  [
    'price_fluctuation',
    'major_damage',
    'disaster',
    'real_estate_sale',
    'transfer_rights',
    'feel_good_roll',
    'slacking_off',
    'drinking_party',
    'turn_evil',
  ].includes(c.type)
);

/**
 * 通常のイベントマスからカードを1枚引く
 */
export function drawNormalEventCard(): EventCard {
  const index = Math.floor(Math.random() * NORMAL_EVENT_CARDS.length);
  return NORMAL_EVENT_CARDS[index];
}

/**
 * 占いの館から波乱のカードを1枚引く
 */
export function drawFortuneCard(): EventCard {
  const index = Math.floor(Math.random() * FORTUNE_HALL_CARDS.length);
  return FORTUNE_HALL_CARDS[index];
}

/**
 * 互換性のためのデフォルト抽選
 */
export function drawRandomEventCard(): EventCard {
  return drawNormalEventCard();
}

/**
 * Calculates lottery reward from dice roll:
 * 1: 500 money
 * 2, 3, 4, 5: 50 money
 * 6: 0 money
 */
export function getLotteryResult(roll: number): { money: number; message: string; rank: string } {
  if (roll === 1) {
    return {
      money: 500,
      message: '1等大当たり！！500マニーを獲得しました！',
      rank: '1等特賞！',
    };
  } else if (roll >= 2 && roll <= 5) {
    return {
      money: 50,
      message: '2等当選！50マニーを獲得しました！',
      rank: '2等当せん',
    };
  } else {
    return {
      money: 0,
      message: '残念…ハズレです（0マニー）',
      rank: 'ハズレ',
    };
  }
}
