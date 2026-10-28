import { Tile } from '../types/game';

export const INITIAL_TILES: Tile[] = [
  // 0: 右下 (Bottom-Right corner)
  {
    id: 0,
    type: 'start',
    name: 'スタート地点',
    description: 'ここから旅が始まる。通過・停止で200マニー獲得！停止時は犯罪計画書の清算（1つ100M）が可能。',
    row: 8,
    col: 8,
  },
  // 1-7: 右側 (Right side going UP, col 8)
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
    row: 7,
    col: 8,
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
    row: 6,
    col: 8,
  },
  {
    id: 3,
    type: 'land',
    landNumber: 3,
    name: 'つばめ広場',
    description: '子どもたちの声が響く明るい広場。',
    cost: 30,
    baseRent: 15,
    ownerId: null,
    rank: 0,
    row: 5,
    col: 8,
  },
  {
    id: 4,
    type: 'event',
    name: 'イベントマス',
    description: '何かが起こる！？停止でカード、通過時も50マニーで引くことが可能！',
    row: 4,
    col: 8,
  },
  {
    id: 5,
    type: 'land',
    landNumber: 4,
    name: '若葉ヒルズ',
    description: '新緑豊かな新興ニュータウン。',
    cost: 40,
    baseRent: 20,
    ownerId: null,
    rank: 0,
    row: 3,
    col: 8,
  },
  {
    id: 6,
    type: 'land',
    landNumber: 5,
    name: 'みどり坂',
    description: '緩やかな坂道沿いの人気エリア。',
    cost: 50,
    baseRent: 25,
    ownerId: null,
    rank: 0,
    row: 2,
    col: 8,
  },
  {
    id: 7,
    type: 'land',
    landNumber: 6,
    name: '陽だまりテラス',
    description: '日当たり抜群の心地よい住宅街。',
    cost: 70,
    baseRent: 30,
    ownerId: null,
    rank: 0,
    row: 1,
    col: 8,
  },

  // 8: 右上 (Top-Right corner)
  {
    id: 8,
    type: 'hellowork',
    name: 'ハローワーク',
    description: '破産時の再起拠点。サイコロ出目×100マニー獲得！バブル期には「天国と地獄」マスへと変化します！',
    row: 0,
    col: 8,
  },

  // 9-15: 上側 (Top side going LEFT, row 0)
  {
    id: 9,
    type: 'land',
    landNumber: 7,
    name: '川沿いプロムナード',
    description: '心地よい風が吹くリバーサイド。',
    cost: 90,
    baseRent: 40,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 7,
  },
  {
    id: 10,
    type: 'land',
    landNumber: 8,
    name: '港町スクエア',
    description: '交易で栄える活気あふれる港湾街。',
    cost: 100,
    baseRent: 50,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 6,
  },
  {
    id: 11,
    type: 'land',
    landNumber: 9,
    name: 'かもめ波止場',
    description: '船乗りたちが集う海の玄関口。',
    cost: 100,
    baseRent: 60,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 5,
  },
  {
    id: 12,
    type: 'event',
    name: 'イベントマス',
    description: '波乱の予感！？停止でカード、通過時も50マニーで引くことが可能！',
    row: 0,
    col: 4,
  },
  {
    id: 13,
    type: 'land',
    landNumber: 10,
    name: 'ベイサイドタワー',
    description: '海を一望できる近代ビル街。',
    cost: 110,
    baseRent: 70,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 3,
  },
  {
    id: 14,
    type: 'land',
    landNumber: 11,
    name: '白銀テラス',
    description: '小規模ながら高利回りの注目スポット。',
    cost: 130,
    baseRent: 80,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 2,
  },
  {
    id: 15,
    type: 'land',
    landNumber: 12,
    name: 'マリンオーシャン',
    description: '豪華客船が停泊するウォーターフロント。',
    cost: 150,
    baseRent: 90,
    ownerId: null,
    rank: 0,
    row: 0,
    col: 1,
  },

  // 16: 左上 (Top-Left corner)
  {
    id: 16,
    type: 'venue',
    name: '占いの館',
    description: '止まった時に100マニーで占いのカードを取得可能！（引かないことも可能）通過時は何も起きません。',
    row: 0,
    col: 0,
  },

  // 17-23: 左側 (Left side going DOWN, col 0)
  {
    id: 17,
    type: 'land',
    landNumber: 13,
    name: '学園前パーク',
    description: '学生街に隣接する若者の集う街。',
    cost: 20,
    baseRent: 10,
    ownerId: null,
    rank: 0,
    row: 1,
    col: 0,
  },
  {
    id: 18,
    type: 'land',
    landNumber: 14,
    name: '紅葉ストリート',
    description: '秋には美しい紅葉が並ぶ並木道。',
    cost: 50,
    baseRent: 30,
    ownerId: null,
    rank: 0,
    row: 2,
    col: 0,
  },
  {
    id: 19,
    type: 'land',
    landNumber: 15,
    name: '銀杏並木通り',
    description: '黄金色に輝く落ち着いた並木街。',
    cost: 100,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 3,
    col: 0,
  },
  {
    id: 20,
    type: 'event',
    name: 'イベントマス',
    description: '運命の分かれ道！？停止でカード、通過時も50マニーで引くことが可能！',
    row: 4,
    col: 0,
  },
  {
    id: 21,
    type: 'land',
    landNumber: 16,
    name: 'サクラモール',
    description: '春になると花見客で賑わう商業区。',
    cost: 100,
    baseRent: 50,
    ownerId: null,
    rank: 0,
    row: 5,
    col: 0,
  },
  {
    id: 22,
    type: 'land',
    landNumber: 17,
    name: 'クラウンアベニュー',
    description: '格式高い店舗が立ち並ぶメイン通り。',
    cost: 150,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 6,
    col: 0,
  },
  {
    id: 23,
    type: 'land',
    landNumber: 18,
    name: 'プレジデント街',
    description: '一流ブランド店が軒を連ねる高級商業地。',
    cost: 180,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 7,
    col: 0,
  },

  // 24: 左下 (Bottom-Left corner)
  {
    id: 24,
    type: 'jail',
    name: '牢屋',
    description: '通常は何の効果もないマス。犯罪計画書を持っていると逮捕されてしまいます！',
    row: 8,
    col: 0,
  },

  // 25-31: 下側 (Bottom side going RIGHT, row 8)
  {
    id: 25,
    type: 'land',
    landNumber: 19,
    name: 'クリスタルガーデン',
    description: 'きらびやかな夜景が広がる高級住宅地。',
    cost: 100,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 1,
  },
  {
    id: 26,
    type: 'land',
    landNumber: 20,
    name: 'エメラルドパーク',
    description: '手入れの行き届いた緑豊かな高級庭園区。',
    cost: 150,
    baseRent: 150,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 2,
  },
  {
    id: 27,
    type: 'land',
    landNumber: 21,
    name: 'サファイアハイツ',
    description: '洗練されたデザインの高層邸宅街。',
    cost: 200,
    baseRent: 200,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 3,
  },
  {
    id: 28,
    type: 'event',
    name: 'イベントマス',
    description: '最後の直線！？停止でカード、通過時も50マニーで引くことが可能！',
    row: 8,
    col: 4,
  },
  {
    id: 29,
    type: 'land',
    landNumber: 22,
    name: 'プラチナレジデンス',
    description: '政財界の要人が暮らす超一等居住区。',
    cost: 200,
    baseRent: 100,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 5,
  },
  {
    id: 30,
    type: 'land',
    landNumber: 23,
    name: 'ダイヤモンドタワー',
    description: '雲を突き抜ける地上最高峰の超高層タワー。',
    cost: 300,
    baseRent: 150,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 6,
  },
  {
    id: 31,
    type: 'land',
    landNumber: 24,
    name: 'ロイヤルパレス',
    description: 'この盤面最高峰のプレステージ地！圧倒的な富の象徴。',
    cost: 500,
    baseRent: 250,
    ownerId: null,
    rank: 0,
    row: 8,
    col: 7,
  },
];

/**
 * 連続する区画ごとの土地（3マスずつ、イベント・角マスをまたがない）
 */
export const CONTIGUOUS_BLOCKS: readonly (readonly [number, number, number])[] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18],
  [19, 20, 21],
  [22, 23, 24],
] as const;

export interface MonopolyGroup {
  name: string;
  landNumbers: number[];
  theme: string;
}

export const MONOPOLY_GROUPS: MonopolyGroup[] = [
  {
    name: '住宅街',
    landNumbers: [1, 2, 3, 4, 5, 6],
    theme: 'emerald',
  },
  {
    name: '港湾街',
    landNumbers: [7, 8, 9, 10, 11, 12],
    theme: 'sky',
  },
  {
    name: '商業街',
    landNumbers: [13, 14, 15, 16, 17, 18],
    theme: 'amber',
  },
  {
    name: '高級街',
    landNumbers: [19, 20, 21, 22, 23, 24],
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

export interface AdjacentBonusInfo {
  isAdjacent: boolean;
  multiplier: number; // 1.0, 1.5, or 1.8
  adjacentCount: number; // 1, 2, or 3
}

/**
 * 指定の土地について、同一区画（連続3マスブロック）内での隣接ボーナスを判定
 * - 区画内3マスすべて同一所有者（3つ並ぶ）: 1.8倍
 * - 区画内で隣り合う2マスを所有（2つ並ぶ）: 1.5倍
 * - 斜めなし、イベントマス・角マスをまたぐ並びはなし
 */
export function getAdjacentBonusInfo(
  tileIdOrTile: number | Tile,
  tiles: Tile[]
): AdjacentBonusInfo {
  const currentTile = typeof tileIdOrTile === 'number' ? tiles[tileIdOrTile] : tileIdOrTile;
  if (!currentTile || currentTile.type !== 'land' || !currentTile.ownerId || !currentTile.landNumber) {
    return { isAdjacent: false, multiplier: 1.0, adjacentCount: 1 };
  }
  const landNum = currentTile.landNumber;
  const ownerId = currentTile.ownerId;

  // Find the block containing this land
  const block = CONTIGUOUS_BLOCKS.find((b) => b.includes(landNum as any));
  if (!block) {
    return { isAdjacent: false, multiplier: 1.0, adjacentCount: 1 };
  }

  const [a, b, c] = block;
  const tileA = tiles.find((t) => t.type === 'land' && t.landNumber === a);
  const tileB = tiles.find((t) => t.type === 'land' && t.landNumber === b);
  const tileC = tiles.find((t) => t.type === 'land' && t.landNumber === c);

  const ownsA = tileA?.ownerId === ownerId;
  const ownsB = tileB?.ownerId === ownerId;
  const ownsC = tileC?.ownerId === ownerId;

  // 1. 3つ並べば1.8倍
  if (ownsA && ownsB && ownsC) {
    return { isAdjacent: true, multiplier: 1.8, adjacentCount: 3 };
  }

  // 2. 隣り合う土地同士で2つ並べば1.5倍（斜めなし・イベントまたぎなし）
  // 端A: 隣のBを持っていれば成立
  if (landNum === a && ownsB) {
    return { isAdjacent: true, multiplier: 1.5, adjacentCount: 2 };
  }
  // 中央B: 隣のAまたはCを持っていれば成立
  if (landNum === b && (ownsA || ownsC)) {
    return { isAdjacent: true, multiplier: 1.5, adjacentCount: 2 };
  }
  // 端C: 隣のBを持っていれば成立
  if (landNum === c && ownsB) {
    return { isAdjacent: true, multiplier: 1.5, adjacentCount: 2 };
  }

  // 単独所有または [A, C] のように間(B)を挟んで離れている場合はボーナスなし
  return { isAdjacent: false, multiplier: 1.0, adjacentCount: 1 };
}

/**
 * 指定の土地について、隣接ボーナスが成立しているか判定（後方互換）
 */
export function isAdjacentLandOwned(tileIdOrTile: number | Tile, tiles: Tile[]): boolean {
  return getAdjacentBonusInfo(tileIdOrTile, tiles).isAdjacent;
}

/**
 * グループ内の所有進捗を取得（例: 3/6マス保有）
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
 * 全ての土地（24マス）が契約済みかどうか判定（バブル期突入判定）
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
 * - Area Monopoly bonus (2.0x)
 * - Contiguous Adjacent bonus (1.8x for 3-in-a-row, 1.5x for 2-in-a-row)
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
  adjacentMultiplier: number;
  adjacentCount: number;
  isMonopolyBonus: boolean;
  isBubbleEra: boolean;
  fluctuationMultiplier: number;
} {
  const baseRent = tile.baseRent || 0;
  const isRankedUp = (tile.rank || 0) > 0;
  // Rankup doubles the rent
  let rent = isRankedUp ? baseRent * 2 : baseRent;

  const isMonopoly = isAreaMonopoly(tile, tiles);
  const adjacentInfo = getAdjacentBonusInfo(tile, tiles);

  // 独占ボーナス（支払額2倍）または隣接ボーナス（3つ並べば1.8倍、2つ並べば1.5倍）
  if (isMonopoly) {
    rent = Math.round(rent * 2.0);
  } else if (adjacentInfo.multiplier > 1.0) {
    rent = Math.round(rent * adjacentInfo.multiplier);
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
    isAdjacentBonus: adjacentInfo.isAdjacent,
    adjacentMultiplier: adjacentInfo.multiplier,
    adjacentCount: adjacentInfo.adjacentCount,
    isMonopolyBonus: isMonopoly,
    isBubbleEra,
    fluctuationMultiplier,
  };
}
