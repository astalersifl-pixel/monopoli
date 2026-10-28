import { Player, Tile } from '../types/game';
import { isAreaMonopoly, isAdjacentLandOwned } from './boardData';

export const AIHelper = {
  /**
   * Decide whether CPU buys the land
   */
  shouldBuyLand(player: Player, tile: Tile, allTiles?: Tile[]): boolean {
    if (!tile.cost) return false;
    // If has super lucky card, very high EV to buy!
    if (player.hasSuperLucky) {
      return player.money >= tile.cost * 2; // Can afford worst-case
    }

    // Check if this purchase would complete adjacent pair or monopoly
    let isStrategic = false;
    if (allTiles) {
      const simulatedTiles = allTiles.map((t) => (t.id === tile.id ? { ...t, ownerId: player.id } : t));
      isStrategic = isAreaMonopoly(tile.id, simulatedTiles) || isAdjacentLandOwned(tile.id, simulatedTiles);
    }

    // For strategic lands, reserve requirement is lower
    const reserve = isStrategic ? 10 : 40;
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
   * Decide whether CPU pays 100 money to draw card at 占いの館
   */
  shouldDrawAtFortuneHall(player: Player): boolean {
    return player.money >= 300;
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
   * Decide Jail strategy: 'escape' (脱獄) vs 'release_chance' (釈放チャンス)
   */
  chooseJailStrategy(player: Player): 'escape' | 'release_chance' {
    // If player has powerful cards held, don't lose them: try release chance
    if (player.hasSuperLucky || player.hasSurgeRent || player.hasRentExemption) {
      return 'release_chance';
    }
    // High success rate of release (~61%)
    return Math.random() < 0.65 ? 'release_chance' : 'escape';
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

  /**
   * Decide whether CPU pays 50 money to draw card when passing event tile
   */
  shouldDrawPassingEvent(player: Player): boolean {
    return player.money >= 150;
  },

  /**
   * Decide whether CPU liquidates crime blueprint at Start (+100M)
   * (Keep 5 if aiming for Master Phantom Thief, otherwise liquidate for free money)
   */
  shouldClearCrimeBlueprintAtStart(player: Player): boolean {
    if (player.crimeBlueprintCount === 5) return false;
    return true;
  },

  /**
   * Decide best dice roll (1..6) when AI has info manipulation (情報操作)
   */
  chooseBestDice(player: Player, allTiles: Tile[], allPlayers?: Player[]): number {
    let bestRoll = 6;
    let highestScore = -9999;

    for (let r = 1; r <= 6; r++) {
      const targetPos = (player.position + r) % 32;
      const tile = allTiles[targetPos];
      let score = 0;

      // Passing or stopping at start grants salary
      if (player.position + r >= 32) {
        score += 200;
      }

      // If holding 5 crime blueprints, landing on Jail (tile 24) triggers Master Phantom Thief mode!
      if (player.crimeBlueprintCount === 5 && targetPos === 24) {
        score += 5000;
      } else if (player.crimeBlueprintCount > 0 && targetPos === 24) {
        // Holding blueprints but not 5: arrest risk!
        score -= 2000;
      }

      // If wanted, avoid landing on tiles where other players are stationed
      if (player.isWanted && allPlayers) {
        const hasOtherPlayer = allPlayers.some(
          (p) => p.id !== player.id && p.position === targetPos && !p.inJail
        );
        if (hasOtherPlayer) {
          score -= 1500;
        }
        // Passing or landing on Jail clears wanted status!
        if (targetPos === 24 || (player.position < 24 && player.position + r >= 24)) {
          score += 250;
        }
      }

      if (tile.type === 'start') {
        score += 150;
      } else if (tile.type === 'land') {
        if (!tile.ownerId) {
          // Unowned land: can buy!
          if (player.money >= (tile.cost || 0)) {
            let buyScore = 180 + (tile.cost || 0) * 0.5;
            const sim = allTiles.map((t) => (t.id === tile.id ? { ...t, ownerId: player.id } : t));
            if (isAreaMonopoly(tile.id, sim)) {
              buyScore += 300; // Complete monopoly!
            } else if (isAdjacentLandOwned(tile.id, sim)) {
              buyScore += 140; // Complete adjacent pair!
            }
            score += buyScore;
          } else {
            score += 20;
          }
        } else if (tile.ownerId === player.id) {
          // Own land: rankup opportunity
          if (tile.rank === 0 && player.money >= (tile.cost || 0) * 2) {
            score += 120;
          } else {
            score += 40;
          }
        } else {
          // Opponent land: penalty proportional to rent!
          score -= (tile.baseRent || 50) * 2;
        }
      } else if (tile.type === 'hellowork') {
        score += 80;
      } else if (tile.type === 'event' || tile.type === 'venue') {
        score += 60;
      } else if (tile.type === 'jail') {
        if (player.crimeBlueprintCount === 5) {
          score += 5000;
        } else if (player.crimeBlueprintCount > 0) {
          score -= 2000;
        } else {
          score += 20;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestRoll = r;
      }
    }

    return bestRoll;
  },

  /**
   * Select an opponent land to buy with Transfer of Rights (権利の譲渡)
   */
  selectLandToBuyWithTransferRights(player: Player, allTiles: Tile[]): Tile | null {
    const opponentLands = allTiles.filter(
      (t) => t.type === 'land' && t.ownerId && t.ownerId !== player.id && player.money >= (t.cost || 0)
    );
    if (opponentLands.length === 0) return null;

    // Prioritize lands that complete player's monopoly or adjacent pair, or break opponent monopoly
    const sorted = [...opponentLands].sort((a, b) => {
      const simA = allTiles.map((t) => (t.id === a.id ? { ...t, ownerId: player.id } : t));
      const simB = allTiles.map((t) => (t.id === b.id ? { ...t, ownerId: player.id } : t));

      const aMonopoly = isAreaMonopoly(a.id, simA) ? 1000 : 0;
      const bMonopoly = isAreaMonopoly(b.id, simB) ? 1000 : 0;
      const aAdj = isAdjacentLandOwned(a.id, simA) ? 500 : 0;
      const bAdj = isAdjacentLandOwned(b.id, simB) ? 500 : 0;

      const aScore = aMonopoly + aAdj + (a.baseRent || 0) * 2 + (a.cost || 0);
      const bScore = bMonopoly + bAdj + (b.baseRent || 0) * 2 + (b.cost || 0);
      return bScore - aScore;
    });

    return sorted[0];
  },
};
