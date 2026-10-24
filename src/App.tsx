import React, { useState, useEffect, useRef } from 'react';
import {
  Player,
  Tile,
  GamePhase,
  EventCard,
  ActivePriceFluctuation,
  GameLog,
  GameSettings,
} from './types/game';
import { INITIAL_TILES, calculateLandRent } from './utils/boardData';
import { drawRandomEventCard } from './utils/eventCards';
import { AIHelper } from './utils/ai';
import { sounds } from './utils/audio';

import { Board } from './components/Board';
import { GameHeader } from './components/GameHeader';
import { EventCardModal } from './components/EventCardModal';
import { CasinoModal } from './components/CasinoModal';
import { BankruptcyModal } from './components/BankruptcyModal';
import { TileDetailModal } from './components/TileDetailModal';
import { StartGameModal } from './components/StartGameModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  // Game Configuration & State
  const [settings, setSettings] = useState<GameSettings>({
    targetMoney: 5000,
    startBonus: 200,
    soundEnabled: true,
    gameSpeed: 'normal',
  });

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [tiles, setTiles] = useState<Tile[]>(INITIAL_TILES);
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [currentDice, setCurrentDice] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // Fluctuations & Modals
  const [activePriceFluctuation, setActivePriceFluctuation] =
    useState<ActivePriceFluctuation | null>(null);
  const [currentEventCard, setCurrentEventCard] = useState<EventCard | null>(null);
  const [selectedTileForDetail, setSelectedTileForDetail] = useState<Tile | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showCasinoModal, setShowCasinoModal] = useState<boolean>(false);

  // Bankruptcy State
  const [bankruptcyDebt, setBankruptcyDebt] = useState<{
    debtAmount: number;
    creditorPlayerId: string | null; // null means bank/system
  } | null>(null);

  // Game Logs
  const [logs, setLogs] = useState<GameLog[]>([
    {
      id: 'init',
      timestamp: Date.now(),
      text: 'ものぽりぃへようこそ！目標金額を目指してがんばりましょう！',
    },
  ]);

  // Winner
  const [winner, setWinner] = useState<Player | null>(null);

  // Delay helper based on game speed
  const getDelay = (normalMs: number) => {
    return settings.gameSpeed === 'fast' ? Math.max(100, Math.floor(normalMs * 0.45)) : normalMs;
  };

  const addLog = (
    text: string,
    playerId?: Player['id'],
    type?: GameLog['type']
  ) => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        text,
        playerId,
        type,
      },
    ]);
  };

  const currentPlayer = players[currentPlayerIndex] || null;

  // Sound sync
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Handle Game Setup
  const handleStartNewGame = (newPlayers: Player[], newSettings: GameSettings) => {
    setPlayers(newPlayers);
    setSettings(newSettings);
    // Reset tiles
    setTiles(
      INITIAL_TILES.map((t) => ({
        ...t,
        ownerId: null,
        rank: 0,
      }))
    );
    setCurrentPlayerIndex(0);
    setActivePriceFluctuation(null);
    setCurrentEventCard(null);
    setWinner(null);
    setBankruptcyDebt(null);
    setShowCasinoModal(false);
    setLogs([
      {
        id: 'start',
        timestamp: Date.now(),
        text: `ゲームスタート！目標金額は ${newSettings.targetMoney} マニーです。`,
        type: 'roll',
      },
    ]);
    setGamePhase('waiting_roll');
  };

  // Check victory condition
  const checkVictory = (playerList: Player[]) => {
    for (const p of playerList) {
      if (p.money >= settings.targetMoney) {
        setWinner(p);
        setGamePhase('game_over');
        addLog(`🎉 ${p.name} が目標金額 ${settings.targetMoney}マニーに到達！勝利！`, p.id, 'win');
        return true;
      }
    }
    return false;
  };

  // Next Turn logic
  const handleNextTurn = () => {
    if (gamePhase === 'game_over') return;

    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    const nextPlayer = players[nextIndex];

    // Check if price fluctuation expired
    if (
      activePriceFluctuation &&
      activePriceFluctuation.expiresOnPlayerTurn === nextPlayer.id
    ) {
      setActivePriceFluctuation(null);
      addLog('価格変動の効果が終了し、通常の支払額に戻りました。');
    }

    // Check if next player is in Hello Work
    if (nextPlayer.inHelloWork) {
      setGamePhase('hellowork_turn');
      addLog(
        `💼 ${nextPlayer.name} はハローワークでのターンです。サイコロを振って給料を獲得します。`,
        nextPlayer.id
      );
    } else {
      setGamePhase('waiting_roll');
    }
  };

  // Hello Work Turn Roll
  const handleHelloWorkRoll = () => {
    if (isRolling) return;
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setCurrentDice(roll);
      setIsRolling(false);

      const salary = roll * 100;
      sounds.playCoin();

      const updatedPlayers = players.map((p, idx) => {
        if (idx === currentPlayerIndex) {
          return {
            ...p,
            money: p.money + salary,
            inHelloWork: false, // Recovery turn complete!
          };
        }
        return p;
      });

      setPlayers(updatedPlayers);
      addLog(
        `💼 ${currentPlayer.name} はハローワークでサイコロ【${roll}】を出して ${salary}マニーを獲得！次のターンから行動できます。`,
        currentPlayer.id,
        'money'
      );

      if (checkVictory(updatedPlayers)) return;

      setTimeout(() => {
        handleNextTurn();
      }, getDelay(1000));
    }, getDelay(800));
  };

  // Standard Dice Roll
  const handleRollDice = () => {
    if (isRolling || gamePhase !== 'waiting_roll') return;
    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setCurrentDice(roll);
      setIsRolling(false);
      setGamePhase('moving');

      addLog(`🎲 ${currentPlayer.name} はサイコロで【${roll}】を出しました。`, currentPlayer.id, 'roll');
      movePlayerStepByStep(roll);
    }, getDelay(800));
  };

  // Smooth Step-by-Step Movement
  const movePlayerStepByStep = (totalSteps: number) => {
    let currentStep = 0;
    const startPos = currentPlayer.position;
    let currentPos = startPos;
    let passedStart = false;
    let passedVenue = false;

    const interval = setInterval(() => {
      currentStep++;
      currentPos = (currentPos + 1) % 24;

      sounds.playStep();

      // Check if passed/landed on Start (Index 0)
      if (currentPos === 0) {
        passedStart = true;
      }

      // Check if passed Venue (Index 12) during movement (not landing on 12)
      if (currentPos === 12 && currentStep < totalSteps) {
        passedVenue = true;
      }

      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, position: currentPos } : p
        )
      );

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        handleMovementFinished(startPos, currentPos, passedStart, passedVenue);
      }
    }, getDelay(180));
  };

  // After movement completes
  const handleMovementFinished = (
    startPos: number,
    finalPos: number,
    passedStart: boolean,
    passedVenue: boolean
  ) => {
    let currentMoney = currentPlayer.money;

    // Apply Start Salary if passed or landed on start
    if (passedStart) {
      currentMoney += settings.startBonus;
      sounds.playCoin();
      addLog(
        `🏁 ${currentPlayer.name} はスタート地点を通過し、給料 +${settings.startBonus}マニーを獲得！`,
        currentPlayer.id,
        'money'
      );
    }

    const updatedPlayers = players.map((p, idx) =>
      idx === currentPlayerIndex
        ? {
            ...p,
            money: currentMoney,
            position: finalPos,
            totalLaps: p.totalLaps + (passedStart ? 1 : 0),
          }
        : p
    );
    setPlayers(updatedPlayers);

    if (checkVictory(updatedPlayers)) return;

    // Next: If passed Event Venue (and didn't land on it), prompt for 50M draw
    if (passedVenue && finalPos !== 12) {
      setGamePhase('venue_pass_prompt');
      return;
    }

    // Otherwise directly resolve landing square
    resolveLandingSquare(finalPos, updatedPlayers);
  };

  // Choice when passing Event Venue: Pay 50 to draw card or skip
  const handleVenuePassChoice = (draw: boolean) => {
    if (draw) {
      if (currentPlayer.money < 50) {
        addLog(`マニーが不足しているため、カードを引けませんでした。`, currentPlayer.id);
        resolveLandingSquare(currentPlayer.position, players);
        return;
      }

      const updated = players.map((p, idx) =>
        idx === currentPlayerIndex ? { ...p, money: p.money - 50 } : p
      );
      setPlayers(updated);
      sounds.playCard();
      addLog(
        `🎪 ${currentPlayer.name} はイベント会場の通過時に50マニーを支払い、カードを引きます！`,
        currentPlayer.id
      );

      // Draw card
      const card = drawRandomEventCard();
      setCurrentEventCard(card);
      setGamePhase('event_card_modal');
    } else {
      addLog(`🎪 ${currentPlayer.name} はイベント会場の通過カードを見送りました。`, currentPlayer.id);
      resolveLandingSquare(currentPlayer.position, players);
    }
  };

  // Resolve Landing on a tile
  const resolveLandingSquare = (tileId: number, currentPlayersState: Player[]) => {
    const tile = tiles[tileId];
    const player = currentPlayersState[currentPlayerIndex];

    // 1. Start Tile (Tile 0)
    if (tile.type === 'start') {
      addLog(`🏁 ${player.name} はスタート地点に到着しました。`, player.id);
      setGamePhase('turn_end');
      return;
    }

    // 2. Hello Work (Tile 6)
    if (tile.type === 'hellowork') {
      const partTimeBonus = 100;
      sounds.playCoin();
      const updated = currentPlayersState.map((p, idx) =>
        idx === currentPlayerIndex ? { ...p, money: p.money + partTimeBonus } : p
      );
      setPlayers(updated);
      addLog(
        `💼 ${player.name} はハローワークを訪問！日当アルバイトで +${partTimeBonus}マニーを獲得！`,
        player.id,
        'money'
      );
      if (checkVictory(updated)) return;
      setGamePhase('turn_end');
      return;
    }

    // 3. Casino (Tile 18)
    if (tile.type === 'casino') {
      sounds.playCard();
      addLog(`🎰 ${player.name} はカジノに到着しました！一攫千金に挑戦！`, player.id);
      setShowCasinoModal(true);
      setGamePhase('casino_modal');
      return;
    }

    // 4. Event Venue (Tile 12) or Event Tiles (3, 8, 13, 18)
    if (tile.type === 'venue' || tile.type === 'event') {
      sounds.playCard();
      const card = drawRandomEventCard();
      setCurrentEventCard(card);
      addLog(
        `🎲 ${player.name} は【${tile.name}】に止まり、イベントカードを引きます！`,
        player.id,
        'event'
      );
      setGamePhase('event_card_modal');
      return;
    }

    // 5. Land Tile
    if (tile.type === 'land') {
      // Case 5A: Unowned Land
      if (!tile.ownerId) {
        addLog(
          `🏡 ${player.name} は未契約の No.${tile.landNumber}「${tile.name}」(契約金: ${tile.cost}M) に止まりました。`,
          player.id
        );
        setGamePhase('land_action');
        return;
      }

      // Case 5B: Own Land
      if (tile.ownerId === player.id) {
        if (tile.rank === 0) {
          addLog(
            `🏡 ${player.name} は自身の No.${tile.landNumber}「${tile.name}」に止まりました。ランクアップ（費用: ${(tile.cost || 0) * 2}M）が可能です。`,
            player.id
          );
          setGamePhase('land_action');
        } else {
          addLog(
            `🏡 ${player.name} は自身の No.${tile.landNumber}「${tile.name}」(★Lv.2 最高ランク) に止まりました。`,
            player.id
          );
          setGamePhase('turn_end');
        }
        return;
      }

      // Case 5C: Opponent's Land -> Rent Payment
      const owner = currentPlayersState.find((p) => p.id === tile.ownerId);
      if (!owner) {
        setGamePhase('turn_end');
        return;
      }

      // Check Rent Exemption Card (支払い免除)
      if (player.hasRentExemption) {
        sounds.playBuy();
        const updated = currentPlayersState.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, hasRentExemption: false } : p
        );
        setPlayers(updated);
        addLog(
          `🛡️ ${player.name} は【支払い免除】カードを発動！ No.${tile.landNumber}「${tile.name}」の支払いが全額免除（0マニー）されました！`,
          player.id
        );
        setGamePhase('turn_end');
        return;
      }

      // Calculate rent
      const rentCalculation = calculateLandRent(
        tile,
        tiles,
        activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0
      );
      const totalRent = rentCalculation.rent;

      let detailMsg = `家賃: ${totalRent}マニー`;
      if (rentCalculation.isRankedUp) detailMsg += ' (★Lv.2 ランク補正)';
      if (rentCalculation.isAdjacentBonus) detailMsg += ' (隣接土地1.5倍)';
      if (activePriceFluctuation) detailMsg += ` (市場価格変動 ×${activePriceFluctuation.multiplier})`;

      addLog(
        `💸 ${player.name} は ${owner.name} の No.${tile.landNumber}「${tile.name}」に止まりました！ ${detailMsg}`,
        player.id
      );

      // Check if player has enough money
      if (player.money >= totalRent) {
        sounds.playCoin();
        const updated = currentPlayersState.map((p) => {
          if (p.id === player.id) return { ...p, money: p.money - totalRent };
          if (p.id === owner.id) return { ...p, money: p.money + totalRent };
          return p;
        });
        setPlayers(updated);
        addLog(
          `${player.name} は ${owner.name} に ${totalRent}マニーを支払いました。`,
          player.id,
          'money'
        );

        if (checkVictory(updated)) return;

        setGamePhase('turn_end');
      } else {
        // Player cannot afford -> Bankruptcy Flow!
        sounds.playBuzzer();
        addLog(
          `⚠️ ${player.name} は ${totalRent}マニーを支払う所持金がありません！破産処理に入ります。`,
          player.id,
          'bankrupt'
        );
        setBankruptcyDebt({
          debtAmount: totalRent,
          creditorPlayerId: owner.id,
        });
        setGamePhase('bankruptcy_modal');
      }
    }
  };

  // Land Contract Action (Buy)
  const handleBuyLand = () => {
    const tile = tiles[currentPlayer.position];
    if (!tile || tile.type !== 'land' || !tile.cost) return;

    if (currentPlayer.money < tile.cost) {
      addLog(`所持金が不足しているため契約できませんでした。`, currentPlayer.id);
      setGamePhase('turn_end');
      return;
    }

    sounds.playBuy();

    // Deduct cost and assign owner
    const updatedPlayers = players.map((p, idx) =>
      idx === currentPlayerIndex ? { ...p, money: p.money - tile.cost! } : p
    );
    const updatedTiles = tiles.map((t) =>
      t.id === tile.id ? { ...t, ownerId: currentPlayer.id } : t
    );

    setPlayers(updatedPlayers);
    setTiles(updatedTiles);

    addLog(
      `🎉 ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」を ${tile.cost}マニーで契約しました！`,
      currentPlayer.id,
      'land'
    );

    setGamePhase('turn_end');
  };

  // Special Lucky Roll for Land Contract (私は豪運！)
  const handleRollForSuperLucky = () => {
    const tile = tiles[currentPlayer.position];
    if (!tile || !tile.cost) return;

    setIsRolling(true);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setCurrentDice(roll);
      setIsRolling(false);

      let finalCost = 0;
      if (roll === 1) {
        finalCost = tile.cost! * 2;
        sounds.playBuzzer();
        addLog(
          `🎲 【私は豪運！】サイコロ出目は【1】！痛恨の倍額（${finalCost}マニー）で契約！`,
          currentPlayer.id
        );
      } else {
        finalCost = 0;
        sounds.playWin();
        addLog(
          `✨ 【私は豪運！】サイコロ出目は【${roll}】！見事【タダ（0マニー）】で契約成立！！`,
          currentPlayer.id
        );
      }

      // Check if player has enough money if rolled 1
      if (currentPlayer.money < finalCost) {
        // Can't afford doubled price
        addLog(`倍額の契約金が払えないため、契約できませんでした…`, currentPlayer.id);
        const updatedPlayers = players.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, hasSuperLucky: false } : p
        );
        setPlayers(updatedPlayers);
        setGamePhase('turn_end');
        return;
      }

      const updatedPlayers = players.map((p, idx) =>
        idx === currentPlayerIndex
          ? {
              ...p,
              money: p.money - finalCost,
              hasSuperLucky: false, // Consumed
            }
          : p
      );
      const updatedTiles = tiles.map((t) =>
        t.id === tile.id ? { ...t, ownerId: currentPlayer.id } : t
      );

      setPlayers(updatedPlayers);
      setTiles(updatedTiles);
      setGamePhase('turn_end');
    }, getDelay(800));
  };

  const handleSkipBuyLand = () => {
    addLog(`${currentPlayer.name} は土地の契約を見送りました。`, currentPlayer.id);
    setGamePhase('turn_end');
  };

  // Rank up Land
  const handleRankUpLand = () => {
    const tile = tiles[currentPlayer.position];
    if (!tile || !tile.cost || tile.rank !== 0) return;

    const rankUpCost = tile.cost * 2;
    if (currentPlayer.money < rankUpCost) {
      addLog(`所持金が不足しているためランクアップできませんでした。`, currentPlayer.id);
      setGamePhase('turn_end');
      return;
    }

    sounds.playRankUp();

    const updatedPlayers = players.map((p, idx) =>
      idx === currentPlayerIndex ? { ...p, money: p.money - rankUpCost } : p
    );
    const updatedTiles = tiles.map((t) =>
      t.id === tile.id ? { ...t, rank: 1 } : t
    );

    setPlayers(updatedPlayers);
    setTiles(updatedTiles);

    addLog(
      `⭐ ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」をランクアップ（★Lv.2）しました！家賃が2倍になります！`,
      currentPlayer.id,
      'rankup'
    );

    setGamePhase('turn_end');
  };

  const handleSkipRankUp = () => {
    addLog(`${currentPlayer.name} はランクアップを見送りました。`, currentPlayer.id);
    setGamePhase('turn_end');
  };

  // Event Card Resolution
  const handleEventCardConfirm = (payload?: {
    diceRoll?: number;
    fluctuationMultiplier?: 0.5 | 2.0;
    lotteryMoney?: number;
    majorDamageChoice?: 'pay' | 'relinquish';
    majorDamageTileId?: number;
  }) => {
    if (!currentEventCard) return;

    const card = currentEventCard;
    setCurrentEventCard(null);

    let updatedPlayers = [...players];
    const player = updatedPlayers[currentPlayerIndex];

    switch (card.type) {
      case 'windfall': {
        // +200 money
        sounds.playCoin();
        player.money += 200;
        addLog(`💰 ${player.name} は臨時収入で +200マニーを獲得！`, player.id, 'money');
        break;
      }
      case 'sudden_expense': {
        // -100 money
        sounds.playBuzzer();
        if (player.money < 100) {
          setBankruptcyDebt({
            debtAmount: 100,
            creditorPlayerId: null,
          });
          setGamePhase('bankruptcy_modal');
          return;
        } else {
          player.money -= 100;
          addLog(`💸 ${player.name} は急な出費で 100マニーを支払いました。`, player.id, 'money');
        }
        break;
      }
      case 'price_fluctuation': {
        if (payload && payload.fluctuationMultiplier) {
          setActivePriceFluctuation({
            activeByPlayerId: player.id,
            multiplier: payload.fluctuationMultiplier,
            expiresOnPlayerTurn: player.id,
          });
          addLog(
            `📈 価格変動発動！全土地の支払額が【${payload.fluctuationMultiplier}倍】になりました！（次の ${player.name} のターンまで）`
          );
        }
        break;
      }
      case 'rent_exemption': {
        player.hasRentExemption = true;
        sounds.playBuy();
        addLog(
          `🛡️ ${player.name} は【支払い免除】カードを手に入れました！`,
          player.id
        );
        break;
      }
      case 'super_lucky': {
        player.hasSuperLucky = true;
        sounds.playBuy();
        addLog(
          `🎲 ${player.name} は【私は豪運！】カードを手に入れました！`,
          player.id
        );
        break;
      }
      case 'major_damage': {
        if (payload && payload.majorDamageTileId !== undefined) {
          const targetTile = tiles.find((t) => t.id === payload.majorDamageTileId);
          if (targetTile) {
            if (payload.majorDamageChoice === 'pay') {
              player.money -= 200;
              sounds.playCoin();
              addLog(
                `⚠️ ${player.name} は修繕費200マニーを支払い、No.${targetTile.landNumber}「${targetTile.name}」を守りました！`,
                player.id
              );
            } else {
              sounds.playBuzzer();
              setTiles((prev) =>
                prev.map((t) =>
                  t.id === targetTile.id ? { ...t, ownerId: null, rank: 0 } : t
                )
              );
              addLog(
                `⚠️ ${player.name} は No.${targetTile.landNumber}「${targetTile.name}」を手放し、未契約に戻りました。`,
                player.id
              );
            }
          }
        }
        break;
      }
      case 'lottery': {
        if (payload && payload.lotteryMoney !== undefined) {
          player.money += payload.lotteryMoney;
          addLog(
            `🎫 宝くじ結果: ${player.name} は賞金 ${payload.lotteryMoney}マニーを獲得！`,
            player.id,
            'money'
          );
        }
        break;
      }
      case 'disaster': {
        const ownedCount = tiles.filter((t) => t.ownerId === player.id).length;
        const disasterCost = ownedCount * 100;
        if (player.money < disasterCost) {
          setBankruptcyDebt({
            debtAmount: disasterCost,
            creditorPlayerId: null,
          });
          setGamePhase('bankruptcy_modal');
          return;
        } else {
          sounds.playBuzzer();
          player.money -= disasterCost;
          addLog(
            `⚡ 災害発生！ ${player.name} は所有地${ownedCount}件分の修繕費 ${disasterCost}マニーを支払いました。`,
            player.id,
            'money'
          );
        }
        break;
      }
    }

    setPlayers(updatedPlayers);

    if (checkVictory(updatedPlayers)) return;

    // If venue pass draw was resolving, now resolve landing square!
    if (gamePhase === 'event_card_modal') {
      setGamePhase('turn_end');
    }
  };

  // Casino Minigame Finished
  const handleCasinoFinish = (netProfit: number) => {
    setShowCasinoModal(false);

    const updated = players.map((p, idx) =>
      idx === currentPlayerIndex ? { ...p, money: p.money + netProfit } : p
    );
    setPlayers(updated);

    if (netProfit > 0) {
      addLog(`🎰 カジノ大勝利！ +${netProfit}マニー獲得！`, currentPlayer.id, 'money');
    } else if (netProfit < 0) {
      addLog(`🎰 カジノ敗北… ${netProfit}マニー。`, currentPlayer.id, 'money');
    } else {
      addLog(`🎰 カジノを後にしました。`, currentPlayer.id);
    }

    if (checkVictory(updated)) return;

    setGamePhase('turn_end');
  };

  // Bankruptcy: Sell Individual Tile
  const handleSellTile = (tileId: number) => {
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile || !tile.cost) return;

    const sellPrice = Math.floor(tile.cost / 2);

    // Update tile (reset owner & rank)
    setTiles((prev) =>
      prev.map((t) => (t.id === tileId ? { ...t, ownerId: null, rank: 0 } : t))
    );

    // Give cash to current player
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === currentPlayerIndex ? { ...p, money: p.money + sellPrice } : p
      )
    );

    addLog(
      `💸 ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」を半額（${sellPrice}マニー）で売却しました。`,
      currentPlayer.id
    );
  };

  // Bankruptcy: Pay Debt & Resume
  const handlePayDebtAndResume = () => {
    if (!bankruptcyDebt) return;
    const debt = bankruptcyDebt.debtAmount;

    const updated = players.map((p) => {
      if (p.id === currentPlayer.id) {
        return { ...p, money: p.money - debt };
      }
      if (bankruptcyDebt.creditorPlayerId && p.id === bankruptcyDebt.creditorPlayerId) {
        return { ...p, money: p.money + debt };
      }
      return p;
    });

    setPlayers(updated);
    setBankruptcyDebt(null);
    addLog(`✅ ${currentPlayer.name} は負債 ${debt}マニーを無事に完済しました！`, currentPlayer.id);
    setGamePhase('turn_end');
  };

  // Bankruptcy: Sell all and go to Hello Work (Tile 6)
  const handleSellAllAndGoToHelloWork = () => {
    if (!bankruptcyDebt) return;

    // Reset all lands owned by current player
    setTiles((prev) =>
      prev.map((t) =>
        t.ownerId === currentPlayer.id ? { ...t, ownerId: null, rank: 0 } : t
      )
    );

    // Move player to Hello Work (Tile 6), reset money to 0, flag inHelloWork
    const updated = players.map((p) => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          money: 0,
          position: 6, // Hello Work
          inHelloWork: true,
        };
      }
      if (bankruptcyDebt.creditorPlayerId && p.id === bankruptcyDebt.creditorPlayerId) {
        // Creditor receives whatever player could offer
        return { ...p, money: p.money + Math.max(0, currentPlayer.money) };
      }
      return p;
    });

    setPlayers(updated);
    setBankruptcyDebt(null);
    sounds.playBuzzer();

    addLog(
      `💼 ${currentPlayer.name} は全財産を清算しハローワークマスに移動しました！次ターン、サイコロ出目×100マニーで再起を図ります！`,
      currentPlayer.id,
      'bankrupt'
    );

    setGamePhase('turn_end');
  };

  // CPU Automated Turn Handling
  useEffect(() => {
    if (gamePhase === 'game_over' || gamePhase === 'setup') return;
    if (!currentPlayer || !currentPlayer.isAi) return;

    // CPU Turn Handling with smooth timeouts
    const timer = setTimeout(() => {
      if (gamePhase === 'hellowork_turn') {
        handleHelloWorkRoll();
      } else if (gamePhase === 'waiting_roll') {
        handleRollDice();
      } else if (gamePhase === 'land_action') {
        const currentTile = tiles[currentPlayer.position];
        if (!currentTile) {
          setGamePhase('turn_end');
          return;
        }

        if (currentTile.ownerId === null) {
          if (currentPlayer.hasSuperLucky) {
            handleRollForSuperLucky();
          } else if (AIHelper.shouldBuyLand(currentPlayer, currentTile)) {
            handleBuyLand();
          } else {
            handleSkipBuyLand();
          }
        } else if (currentTile.ownerId === currentPlayer.id && currentTile.rank === 0) {
          if (AIHelper.shouldRankUp(currentPlayer, currentTile)) {
            handleRankUpLand();
          } else {
            handleSkipRankUp();
          }
        } else {
          setGamePhase('turn_end');
        }
      } else if (gamePhase === 'venue_pass_prompt') {
        const shouldDraw = AIHelper.shouldDrawCardAtVenuePass(currentPlayer);
        handleVenuePassChoice(shouldDraw);
      } else if (gamePhase === 'casino_modal') {
        const bet = AIHelper.getCasinoBet(currentPlayer);
        if (bet.choice === 'skip') {
          handleCasinoFinish(0);
        } else {
          // Play a simple automated bet
          const roll = Math.floor(Math.random() * 6) + 1;
          const won = (bet.choice === 'high' && roll >= 4) || (bet.choice === 'low' && roll <= 3);
          const profit = won ? bet.betAmount : -bet.betAmount;
          handleCasinoFinish(profit);
        }
      } else if (gamePhase === 'bankruptcy_modal') {
        // CPU Auto-liquidation
        const ownedTiles = tiles.filter((t) => t.ownerId === currentPlayer.id);
        const tileToSell = AIHelper.selectLandToSell(currentPlayer, ownedTiles);
        if (tileToSell) {
          handleSellTile(tileToSell.id);
        } else {
          // No more lands or still cannot pay
          if (bankruptcyDebt && currentPlayer.money >= bankruptcyDebt.debtAmount) {
            handlePayDebtAndResume();
          } else {
            handleSellAllAndGoToHelloWork();
          }
        }
      } else if (gamePhase === 'turn_end') {
        handleNextTurn();
      }
    }, getDelay(1000));

    return () => clearTimeout(timer);
  }, [gamePhase, currentPlayer, tiles, bankruptcyDebt]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 select-none font-sans overflow-x-hidden">
      {/* Game Header Bar */}
      {gamePhase !== 'setup' && (
        <GameHeader
          players={players}
          currentPlayerId={currentPlayer?.id || ''}
          settings={settings}
          tiles={tiles}
          onToggleSound={() =>
            setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onToggleSpeed={() =>
            setSettings((s) => ({
              ...s,
              gameSpeed: s.gameSpeed === 'normal' ? 'fast' : 'normal',
            }))
          }
          onNewGame={() => setGamePhase('setup')}
          onOpenRules={() => setShowRulesModal(true)}
        />
      )}

      {/* Main 7x7 Board Area */}
      {gamePhase !== 'setup' && currentPlayer && (
        <main className="w-full flex-1 flex items-center justify-center">
          <Board
            tiles={tiles}
            players={players}
            currentPlayer={currentPlayer}
            currentDice={currentDice}
            isRolling={isRolling}
            gamePhase={gamePhase}
            activePriceFluctuation={activePriceFluctuation}
            logs={logs}
            onRollDice={handleRollDice}
            onSelectTile={(t) => setSelectedTileForDetail(t)}
            onBuyLand={handleBuyLand}
            onSkipBuyLand={handleSkipBuyLand}
            onRankUpLand={handleRankUpLand}
            onSkipRankUp={handleSkipRankUp}
            onVenuePassChoice={handleVenuePassChoice}
            onRollForSuperLucky={handleRollForSuperLucky}
            onHelloWorkRoll={handleHelloWorkRoll}
            onEndTurn={handleNextTurn}
            onOpenRules={() => setShowRulesModal(true)}
          />
        </main>
      )}

      {/* Modals */}

      {/* 1. Setup / New Game Modal */}
      {gamePhase === 'setup' && (
        <StartGameModal onStartGame={handleStartNewGame} />
      )}

      {/* 2. Event Card Modal */}
      {gamePhase === 'event_card_modal' && currentEventCard && currentPlayer && (
        <EventCardModal
          card={currentEventCard}
          player={currentPlayer}
          playerOwnedLands={tiles.filter((t) => t.ownerId === currentPlayer.id)}
          onConfirm={handleEventCardConfirm}
        />
      )}

      {/* 3. Casino Modal */}
      {showCasinoModal && currentPlayer && (
        <CasinoModal player={currentPlayer} onFinish={handleCasinoFinish} />
      )}

      {/* 4. Bankruptcy Modal */}
      {gamePhase === 'bankruptcy_modal' && bankruptcyDebt && currentPlayer && (
        <BankruptcyModal
          player={currentPlayer}
          debtAmount={bankruptcyDebt.debtAmount}
          ownedTiles={tiles.filter((t) => t.ownerId === currentPlayer.id)}
          onSellTile={handleSellTile}
          onSellAllAndGoToHelloWork={handleSellAllAndGoToHelloWork}
          onPayDebtAndResume={handlePayDebtAndResume}
        />
      )}

      {/* 5. Tile Inspection Detail Modal */}
      <TileDetailModal
        tile={selectedTileForDetail}
        players={players}
        allTiles={tiles}
        activePriceFluctuation={activePriceFluctuation}
        onClose={() => setSelectedTileForDetail(null)}
      />

      {/* 6. Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* 7. Victory Modal */}
      {winner && (
        <VictoryModal
          winner={winner}
          players={players}
          tiles={tiles}
          settings={settings}
          onPlayAgain={() => setGamePhase('setup')}
        />
      )}
    </div>
  );
}
