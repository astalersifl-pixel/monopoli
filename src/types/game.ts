export type PlayerId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';

export type PlayerColor = 'red' | 'blue' | 'emerald' | 'amber' | 'purple';

export interface Player {
  id: PlayerId;
  name: string;
  isAi: boolean;
  color: PlayerColor;
  avatar: string; // Emoji token
  money: number;
  position: number; // 0 to 23
  inHelloWork: boolean; // Bankrupt recovery status
  hasRentExemption: boolean; // 支払い免除 card held
  hasSuperLucky: boolean; // 私は豪運！ card held
  hasInfoManipulation?: boolean; // 情報操作: 次の番、出目を決められる
  hasSurgeRent?: boolean; // 支払額上昇: 一度だけ自分の土地への支払額が2倍
  skipNextTurn?: boolean; // 次から頑張る: 次のターン1回休み
  totalLaps: number;
  peerId?: string;
}

export type TileType = 'start' | 'land' | 'event' | 'venue' | 'hellowork' | 'casino';

export interface Tile {
  id: number; // 0 to 23
  type: TileType;
  landNumber?: number; // 1 to 20 for non-corner tiles
  name: string;
  description?: string;
  cost?: number; // 契約金
  baseRent?: number; // 支払額
  ownerId?: PlayerId | null;
  rank?: number; // 0 = unranked/base, 1 = ranked up (once only)
  // Grid position in 7x7 outer perimeter
  row: number; // 0 to 6
  col: number; // 0 to 6
}

export type EventCardType =
  | 'windfall' // 臨時収入: +200
  | 'sudden_expense' // 急な出費: -100
  | 'price_fluctuation' // 価格変動: サイコロ奇数2倍、偶数半分
  | 'rent_exemption' // 支払い免除
  | 'super_lucky' // 私は豪運！: サイコロ1以外で無料、1なら倍
  | 'major_damage' // 大損害！: ランダム土地1つに200払わないと未契約化
  | 'lottery' // 宝くじに挑戦: 1:500, 2-5:50, 6:0
  | 'disaster' // 災害発生！: 所有地×50支払い
  | 'info_manipulation' // 情報操作: 次の番、出るサイコロの目を決めることができる
  | 'surge_rent' // 支払額上昇: 一度だけ自分の土地に止まったプレイヤーの支払金が倍になる
  | 'real_estate_sale' // 不動産セール: 土地の契約金がすべて半額になる。全プレイヤー合わせて3回購入で元に戻る
  | 'transfer_rights' // 権利の譲渡: 他のプレイヤーの土地を契約金を支払えば購入できる（ランクアップは引き継がれない）
  | 'feel_good_roll' // なんだか気分がいい！: もう一度サイコロを振る
  | 'slacking_off' // 次から頑張る: 100マニーを受け取る。次のターン1回休み
  | 'drinking_party'; // 飲み会をしよう！: 全員占いの館に集める。その後全員が50マニー消費

export interface EventCard {
  type: EventCardType;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export interface ActivePriceFluctuation {
  activeByPlayerId: PlayerId;
  multiplier: 0.5 | 2.0;
  expiresOnPlayerTurn: PlayerId;
}

export interface GameLog {
  id: string;
  timestamp: number;
  text: string;
  playerId?: PlayerId;
  type?: 'roll' | 'money' | 'land' | 'event' | 'rankup' | 'bankrupt' | 'win';
}

export type GamePhase =
  | 'setup'
  | 'waiting_roll'
  | 'rolling'
  | 'moving'
  | 'land_action' // Land buy/rankup prompt
  | 'event_card_modal' // Viewing event card
  | 'event_dice_roll' // Rolling for price_fluctuation, lottery, or super_lucky
  | 'fortune_hall_prompt' // 占いの館: Pay 100 to draw or skip
  | 'casino_modal' // Casino game
  | 'heaven_and_hell_modal' // 天国と地獄マス
  | 'bankruptcy_modal' // Selling land to pay debt
  | 'hellowork_turn' // Roll dice at Hello Work
  | 'turn_end'
  | 'game_over';

export interface GameSettings {
  targetMoney: number; // 2000 or 4000
  startBonus: number; // 200
  soundEnabled: boolean;
  gameSpeed: 'normal' | 'fast';
}

export interface GameStateSync {
  players: Player[];
  currentPlayerIndex: number;
  tiles: Tile[];
  gamePhase: GamePhase;
  currentDice: number;
  activePriceFluctuation: ActivePriceFluctuation | null;
  realEstateSalePurchasesRemaining?: number;
  currentEventCard: EventCard | null;
  logs: GameLog[];
  winner: Player | null;
  settings: GameSettings;
  bankruptcyDebt: {
    debtAmount: number;
    creditorPlayerId: string | null;
  } | null;
  isBubbleEra?: boolean;
}

