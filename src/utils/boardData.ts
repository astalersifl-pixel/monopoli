import { Tile } from '../types/game';

export const INITIAL_TILES: Tile[] = [
  // 0: 右下 (Bottom-Right corner)
  {
    id: 0,
    type: 'start',
    name: 'スタート地点',
    description: 'ここから旅が始まる。通過・停止で200マニー獲得！',
    row: 6,
    col: 6,
  },
  // 1: 右側 (Right side going UP)
  {
    id: 1,
    type: 'land',
    landNumber: 1,
    name: 'ひよこ横丁',
    description: '安価で手軽な商店街の一角。',
    cost: 10,
    baseRent: 5,
    ownerId: null,
    rank: 0,
    row: 5,
    col: 6,
  },
  {
    id: 2,
    type: 'land',
    landNumber: 2,
    name: 'すずめ通り',
    description: '小鳥のさえずる静かな住宅街。',
    cost: 15,
    baseRent: 10,
    ownerId: null,
    rank: 0,
    row: 4,
    col: 6,
  },
  {
    id: 3,
    type: 'event',
    landNumber: 3,
    name: 'イベントマス',
    description: '何かが起こる！？イベントカードを引く。',
    row: 3,
    col: 6,
  },
  {
    id: 4,
    type: 'land',
    landNumber: 4,
    name: '若葉ヒルズ',
    description: '新緑豊かな新興ニュータウン。',
    cost: 30,
    baseRent: 15,
    ownerId: null,
    rank: 0,
    row: 2,
    col: 6,
  },
  {
    id: 5,
    type: 'land',
    landNumber: 5,
    name: 'みどり坂',
    description: '緩やかな坂道沿いの人気エリア。',
    cost: 50,
    baseRent: 25,
    ownerId: null,
    rank: 0,
    row: 1,
    col: 6,
  },

  // 6: 右上 (Top-Right corner)
  {
    id: 6,
    type: 'hellowork',
    name: 'ハローワーク',
    description: '破産時の再起拠点。サイコロ出目×100マニー獲得！',
    row: 0,
    col: 6,
  },

  // 7-11: 上側 (Top side going LEFT)
  {
    id: 7,
    type: 'land',
    landNumber: 6,
    name: '川沿いプロムナード',
    description: '心地よい風が吹くリバーサイド。',
    cost: 70,
    baseRent: 30,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 5,
  },
  {
    id: 8,
    type: 'land',
    landNumber: 7,
    name: '港町スクエア',
    description: '交易で栄える活気あふれる港湾街。',
    cost: 90,
    baseRent: 40,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 4,
  },
  {
    id: 9,
    type: 'event',
    landNumber: 8,
    name: 'イベントマス',
    description: '波乱の予感！？イベントカードを引く。',
    row: 0,
    col: 3,
  },
  {
    id: 10,
    type: 'land',
    landNumber: 9,
    name: 'ベイサイドタワー',
    description: '海を一望できる近代ビル街。',
    cost: 100,
    baseRent: 50,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 2,
  },
  {
    id: 11,
    type: 'land',
    landNumber: 10,
    name: '白銀テラス',
    description: '小規模ながら高利回りの注目スポット。',
    cost: 20,
    baseRent: 20,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 1,
  },

  // 12: 左上 (Top-Left corner)
  {
    id: 12,
    type: 'venue',
    name: '占いの館',
    description: '止まった時に100マニーで占いのカードを取得可能！（引かないことも可能）通過時は何も起きません。',
    row: 0,
    col: 0,
  },

  // 13-17: 左側 (Left side going DOWN)
  {
    id: 13,
    type: 'land',
    landNumber: 11,
    name: '学園前パーク',
    description: '学生街に隣接する若者の集う街。',
    cost: 40,
    baseRent: 40,
    ownerId: null,
    rank: 0,
    row: 1,
    col: 0,
  },
  {
    id: 14,
    type: 'land',
    landNumber: 12,
    name: '紅葉ストリート',
    description: '秋には美しい紅葉が並ぶ並木道。',
    cost: 60,
    baseRent: 60,
    ownerId: null,
    rank: 0,
    row: 2,
    col: 0,
  },
  {
    id: 15,
    type: 'event',
    landNumber: 13,
    name: 'イベントマス',
    description: '運命の分かれ道！？イベントカードを引く。',
    row: 3,
    col: 0,
  },
  {
    id: 16,
    type: 'land',
    landNumber: 14,
    name: 'サクラモール',
    description: '春になると花見客で賑わう商業区。',
    cost: 80,
    baseRent: 80,
    ownerId: null,
    rank: 0,
    row: 4,
    col: 0,
  },
  {
    id: 17,
    type: 'land',
    landNumber: 15,
    name: 'クラウンアベニュー',
    description: '格式高い店舗が立ち並ぶメイン通り。',
    cost: 100,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 5,
    col: 0,
  },

  // 18: 左下 (Bottom-Left corner)
  {
    id: 18,
    type: 'casino',
    name: 'カジノ',
    description: '一攫千金の夢の宮殿！サイコロ勝負でマニーを増やせ！',
    row: 6,
    col: 0,
  },

  // 19-23: 下側 (Bottom side going RIGHT)
  {
    id: 19,
    type: 'land',
    landNumber: 16,
    name: 'クリスタルガーデン',
    description: 'きらびやかな夜景が広がる高級住宅地。',
    cost: 100,
    baseRent: 50,
    ownerId: null,
    rank: 0,
    row: 6,
    col: 1,
  },
  {
    id: 20,
    type: 'land',
    landNumber: 17,
    name: 'ゴールデンブールバール',
    description: '富豪たちが集う黄金のブールバール。',
    cost: 200,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 6,
    col: 2,
  },
  {
    id: 21,
    type: 'event',
    landNumber: 18,
    name: 'イベントマス',
    description: '最後の直線！？イベントカードを引く。',
    row: 6,
    col: 3,
  },
  {
    id: 22,
    type: 'land',
    landNumber: 19,
    name: 'プラチナプラザ',
    description: '最高級のステータスを誇る特等地。',
    cost: 300,
    baseRent: 150,
    ownerId: null,
    rank: 0,
    row: 6,
    col: 4,
  },
  {
    id: 23,
    type: 'land',
    landNumber: 20,
    name: 'ロイヤルキャッスル',
    description: 'この盤面最高峰のプレステージ地！',
    cost: 500,
    baseRent: 200,
    ownerId: null,
    rank: 0,
    row: 6,
    col: 5,
  },
];

/**
 * 隣接ボーナス（支払額1.5倍）が発生する指定ペア（landNumberベース）
 * 1・2、4・5、6・7、9・10、11・12、14・15、16・17、19・20
 */
export const ADJACENT_PAIRS: readonly [number, number][] = [
  [1, 2],
  [4, 5],
  [6, 7],
  [9, 10],
  [11, 12],
  [14, 15],
  [16, 17],
  [19, 20],
] as const;

export interface MonopolyGroup {
  name: string;
  landNumbers: number[];
  theme: string;
}

export const MONOPOLY_GROUPS: MonopolyGroup[] = [
  {
    name: '住宅街',
    landNumbers: [1, 2, 4, 5],
    theme: 'emerald',
  },
  {
    name: '港湾街',
    landNumbers: [6, 7, 9, 10],
    theme: 'sky',
  },
  {
    name: '商業街',
    landNumbers: [11, 12, 14, 15],
    theme: 'amber',
  },
  {
    name: '高級街',
    landNumbers: [16, 17, 19, 20],
    theme: 'purple',
  },
];

/**
 * 指定の土地について、エリア独占ボーナス（全4マス同一所有者）が成立しているか判定
 */
export function isAreaMonopoly(tileIdOrTile: number | Tile, tiles: Tile[]): boolean {
  const currentTile = typeof tileIdOrTile === 'number' ? tiles[tileIdOrTile] : tileIdOrTile;
  if (!currentTile || currentTile.type !== 'land' || !currentTile.ownerId || !currentTile.landNumber) {
    return false;
  }
  const landNum = currentTile.landNumber;
  const ownerId = currentTile.ownerId;

  const group = MONOPOLY_GROUPS.find((g) => g.landNumbers.includes(landNum));
  if (!group) return false;

  return group.landNumbers.every((num) => {
    const tile = tiles.find((t) => t.type === 'land' && t.landNumber === num);
    return tile && tile.ownerId === ownerId;
  });
}

/**
 * 指定の土地について、隣接ペアボーナス（指定ペア両方同一所有者）が成立しているか判定
 * 1・2、4・5、6・7、9・10、11・12、14・15、16・17、19・20
 */
export function isAdjacentLandOwned(tileIdOrTile: number | Tile, tiles: Tile[]): boolean {
  const currentTile = typeof tileIdOrTile === 'number' ? tiles[tileIdOrTile] : tileIdOrTile;
  if (!currentTile || currentTile.type !== 'land' || !currentTile.ownerId || !currentTile.landNumber) {
    return false;
  }
  const landNum = currentTile.landNumber;
  const ownerId = currentTile.ownerId;

  const pair = ADJACENT_PAIRS.find(([a, b]) => a === landNum || b === landNum);
  if (!pair) return false;

  const partnerLandNum = pair[0] === landNum ? pair[1] : pair[0];
  const partnerTile = tiles.find((t) => t.type === 'land' && t.landNumber === partnerLandNum);
  return !!partnerTile && partnerTile.ownerId === ownerId;
}

/**
 * グループ内の所有進捗を取得（例: 3/4マス保有）
 */
export function getMonopolyProgress(
  tileIdOrTile: number | Tile,
  tiles: Tile[]
): {
  groupName: string;
  ownedCount: number;
  totalCount: number;
  isMonopoly: boolean;
  landNumbers: number[];
} | null {
  const currentTile = typeof tileIdOrTile === 'number' ? tiles[tileIdOrTile] : tileIdOrTile;
  if (!currentTile || currentTile.type !== 'land' || !currentTile.landNumber) {
    return null;
  }
  const landNum = currentTile.landNumber;
  const group = MONOPOLY_GROUPS.find((g) => g.landNumbers.includes(landNum));
  if (!group) return null;

  const ownerId = currentTile.ownerId;
  const ownedCount = ownerId
    ? group.landNumbers.filter((num) => {
        const t = tiles.find((tile) => tile.type === 'land' && tile.landNumber === num);
        return t && t.ownerId === ownerId;
      }).length
    : 0;

  return {
    groupName: group.name,
    ownedCount,
    totalCount: group.landNumbers.length,
    isMonopoly: ownerId ? ownedCount === group.landNumbers.length : false,
    landNumbers: [...group.landNumbers],
  };
}

/**
 * 全ての土地（16マス）が契約済みかどうか判定（バブル期突入判定）
 */
export function areAllLandsContracted(tiles: Tile[]): boolean {
  const landTiles = tiles.filter((t) => t.type === 'land');
  return (
    landTiles.length > 0 &&
    landTiles.every((t) => t.ownerId !== null && t.ownerId !== undefined)
  );
}

/**
 * Calculates current rent for a tile, considering:
 * - Base rent
 * - Rank up (2x base rent)
 * - Area Monopoly bonus (2.0x, 1・2・4・5, 6・7・9・10, 11・12・14・15, 16・17・19・20)
 * - Adjacent pair bonus (1.5x, 1・2, 4・5, 6・7, 9・10, 11・12, 14・15, 16・17, 19・20)
 * - Global price fluctuation multiplier (0.5x or 2.0x, default 1.0)
 * - Bubble era bonus (+100 money)
 */
export function calculateLandRent(
  tile: Tile,
  tiles: Tile[],
  fluctuationMultiplier: number = 1.0,
  isBubbleEra: boolean = false
): {
  rent: number;
  baseRent: number;
  isRankedUp: boolean;
  isAdjacentBonus: boolean;
  isMonopolyBonus: boolean;
  isBubbleEra: boolean;
  fluctuationMultiplier: number;
} {
  const baseRent = tile.baseRent || 0;
  const isRankedUp = (tile.rank || 0) > 0;
  // Rankup doubles the rent
  let rent = isRankedUp ? baseRent * 2 : baseRent;

  const isMonopoly = isAreaMonopoly(tile, tiles);
  const isAdjacent = isAdjacentLandOwned(tile, tiles);

  // 独占ボーナス（支払額2倍）または隣接ボーナス（支払額1.5倍）
  if (isMonopoly) {
    rent = Math.round(rent * 2.0);
  } else if (isAdjacent) {
    rent = Math.round(rent * 1.5);
  }

  // Price fluctuation
  if (fluctuationMultiplier !== 1.0) {
    rent = Math.round(rent * fluctuationMultiplier);
  }

  // バブル期ボーナス：支払額 +100マニー
  if (isBubbleEra) {
    rent += 100;
  }

  return {
    rent: Math.max(1, rent),
    baseRent,
    isRankedUp,
    isAdjacentBonus: isAdjacent,
    isMonopolyBonus: isMonopoly,
    isBubbleEra,
    fluctuationMultiplier,
  };
}
