import { Player, Tile } from '../types/game';

export const AIHelper = {
  /**
   * Decide whether CPU buys the land
   */
  shouldBuyLand(player: Player, tile: Tile): boolean {
    if (!tile.cost) return false;
    // If has super lucky card, very high EV to buy!
    if (player.hasSuperLucky) {
      return player.money >= tile.cost * 2; // Can afford worst-case
    }
    // Keep safety reserve
    const reserve = 40;
    return player.money >= tile.cost + reserve;
  },

  /**
   * Decide whether CPU ranks up on their own land
   */
  shouldRankUp(player: Player, tile: Tile): boolean {
    if (!tile.cost) return false;
    const rankUpCost = tile.cost * 2;
    // Keep a healthy reserve
    return player.money >= rankUpCost + 100;
  },

  /**
   * Decide whether CPU pays 50 money to draw event card when passing Event Venue
   */
  shouldDrawCardAtVenuePass(player: Player): boolean {
    return player.money >= 250;
  },

  /**
   * Decide Casino bet
   */
  getCasinoBet(player: Player): { betAmount: number; choice: 'high' | 'low' | 'skip' } {
    if (player.money < 300) {
      return { betAmount: 0, choice: 'skip' };
    }
    const betAmount = Math.min(100, Math.floor(player.money * 0.1));
    const choice = Math.random() > 0.5 ? 'high' : 'low';
    return { betAmount, choice };
  },

  /**
   * Choose which land to sell during bankruptcy
   * Sells lowest-value/unranked lands first to protect high-tier investments
   */
  selectLandToSell(player: Player, ownedTiles: Tile[]): Tile | null {
    if (ownedTiles.length === 0) return null;
    // Sort by rank ascending, then cost ascending
    const sorted = [...ownedTiles].sort((a, b) => {
      const rankA = a.rank || 0;
      const rankB = b.rank || 0;
      if (rankA !== rankB) return rankA - rankB;
      return (a.cost || 0) - (b.cost || 0);
    });
    return sorted[0];
  },
};
