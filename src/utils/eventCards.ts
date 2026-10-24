import { EventCard, EventCardType } from '../types/game';

export const EVENT_CARDS: EventCard[] = [
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
    type: 'price_fluctuation',
    title: '価格変動',
    subtitle: '市場の激変！',
    description: 'サイコロを振る！【奇数】：次の自分のターンまですべての土地の支払額が2倍！【偶数】：半分になる！',
    icon: '📈',
  },
  {
    type: 'rent_exemption',
    title: '支払い免除',
    subtitle: 'お守りカード！',
    description: 'このカードを保持します。次に相手の土地にとまった際、支払額が【全額免除（0マニー）】されます！',
    icon: '🛡️',
  },
  {
    type: 'super_lucky',
    title: '私は豪運！',
    subtitle: '大博打のチャンス！',
    description: 'このカードを保持します。次に土地を契約する時サイコロを振る！【1以外】：タダで契約！【1】：倍額で契約！',
    icon: '🎲',
  },
  {
    type: 'major_damage',
    title: '大損害！',
    subtitle: '所有地に危機！',
    description: '自分の土地がランダムに1か所選ばれます。【200マニー】支払って維持するか、諦めて未契約に戻します。',
    icon: '⚠️',
  },
  {
    type: 'lottery',
    title: '宝くじに挑戦',
    subtitle: '一攫千金くじ！',
    description: 'サイコロを振って運試し！【1】：500マニー！【2〜5】：50マニー！【6】：ハズレ（0マニー）',
    icon: '🎫',
  },
  {
    type: 'disaster',
    title: '災害発生！',
    subtitle: '緊急補修工事！',
    description: '自然災害で全物件に被害！所持する土地1つにつき【100マニー】の修繕費を支払います。',
    icon: '⚡',
  },
];

/**
 * Draws a random event card from the deck
 */
export function drawRandomEventCard(): EventCard {
  const index = Math.floor(Math.random() * EVENT_CARDS.length);
  return EVENT_CARDS[index];
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
