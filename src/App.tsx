import React, { useState, useEffect, useRef } from 'react';
import {
  Player,
  Tile,
  GamePhase,
  EventCard,
  ActivePriceFluctuation,
  GameLog,
  GameSettings,
  GameStateSync,
  PlayerColor,
} from './types/game';
import { INITIAL_TILES, calculateLandRent } from './utils/boardData';
import { drawRandomEventCard } from './utils/eventCards';
import { AIHelper } from './utils/ai';
import { sounds } from './utils/audio';
import { onlineManager, NetworkMessage } from './utils/online';

import { Board } from './components/Board';
import { GameHeader } from './components/GameHeader';
import { EventCardModal } from './components/EventCardModal';
import { CasinoModal } from './components/CasinoModal';
import { BankruptcyModal } from './components/BankruptcyModal';
import { TileDetailModal } from './components/TileDetailModal';
import { StartGameModal } from './components/StartGameModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';

const ONLINE_COLORS: PlayerColor[] = ['red', 'blue', 'emerald', 'amber', 'purple'];

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
    creditorPlayerId: string | null;
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

  // Online Multiplayer State
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean>(true);
  const [myPlayerId, setMyPlayerId] = useState<string>('p1');
  const [onlineRoomCode, setOnlineRoomCode] = useState<string>('');
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);

  // Keep ref to latest state for online broadcasting
  const latestStateRef = useRef<GameStateSync>({
    players,
    currentPlayerIndex,
    tiles,
    gamePhase,
    currentDice,
    activePriceFluctuation,
    currentEventCard,
    logs,
    winner,
    settings,
    bankruptcyDebt,
  });

  useEffect(() => {
    latestStateRef.current = {
      players,
      currentPlayerIndex,
      tiles,
      gamePhase,
      currentDice,
      activePriceFluctuation,
      currentEventCard,
      logs,
      winner,
      settings,
      bankruptcyDebt,
    };
  });

  // Sound sync
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

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

  // Broadcast state to all online peers if Host
  const broadcastStateIfHost = (overrides: Partial<GameStateSync> = {}) => {
    if (!isOnline || !isHost) return;
    const syncData: GameStateSync = {
      ...latestStateRef.current,
      ...overrides,
    };
    onlineManager.broadcast({
      type: 'SYNC_STATE',
      payload: syncData,
    });
  };

  // Setup Online Listeners
  useEffect(() => {
    onlineManager.onMessageReceived = (msg: NetworkMessage, fromPeerId: string) => {
      // 1. Host receives JOIN_REQUEST from guest
      if (isHost && msg.type === 'JOIN_REQUEST') {
        const guestData = msg.payload as { name: string; avatar: string };
        setPlayers((prev) => {
          if (prev.length >= 5) {
            onlineManager.connections.get(fromPeerId)?.send({
              type: 'JOIN_REJECTED',
              payload: '満員のため参加できませんでした（最大5人）',
            });
            return prev;
          }
          const nextIndex = prev.length;
          const assignedId = `p${nextIndex + 1}` as Player['id'];
          const newPlayer: Player = {
            id: assignedId,
            name: guestData.name || `プレイヤー${nextIndex + 1}`,
            isAi: false,
            color: ONLINE_COLORS[nextIndex],
            avatar: guestData.avatar || '🚗',
            money: 1000,
            position: 0,
            inHelloWork: false,
            hasRentExemption: false,
            hasSuperLucky: false,
            totalLaps: 0,
            peerId: fromPeerId,
          };
          const updated = [...prev, newPlayer];

          // Reply accepted to guest
          onlineManager.connections.get(fromPeerId)?.send({
            type: 'JOIN_ACCEPTED',
            payload: {
              myPlayerId: assignedId,
              players: updated,
              settings,
            },
          });

          // Broadcast lobby update to all guests
          onlineManager.broadcast({
            type: 'LOBBY_UPDATE',
            payload: { players: updated },
          });

          return updated;
        });
      }

      // 2. Guest receives JOIN_ACCEPTED
      if (!isHost && msg.type === 'JOIN_ACCEPTED') {
        const data = msg.payload as {
          myPlayerId: string;
          players: Player[];
          settings: GameSettings;
        };
        setMyPlayerId(data.myPlayerId);
        setPlayers(data.players);
        setSettings(data.settings);
        setShowOnlineLobby(true);
      }

      // 3. Guest receives LOBBY_UPDATE
      if (!isHost && msg.type === 'LOBBY_UPDATE') {
        const data = msg.payload as { players: Player[] };
        setPlayers(data.players);
      }

      // 4. Guest receives START_GAME
      if (!isHost && msg.type === 'START_GAME') {
        const syncData = msg.payload as GameStateSync;
        applySyncState(syncData);
        setShowOnlineLobby(false);
      }

      // 5. Guest receives SYNC_STATE
      if (!isHost && msg.type === 'SYNC_STATE') {
        const syncData = msg.payload as GameStateSync;
        applySyncState(syncData);
      }

      // 6. Host receives PLAYER_ACTION from Guest
      if (isHost && msg.type === 'PLAYER_ACTION') {
        handleGuestAction(msg.payload);
      }
    };
  }, [isHost, settings]);

  const applySyncState = (data: GameStateSync) => {
    setPlayers(data.players);
    setCurrentPlayerIndex(data.currentPlayerIndex);
    setTiles(data.tiles);
    setGamePhase(data.gamePhase);
    setCurrentDice(data.currentDice);
    setActivePriceFluctuation(data.activePriceFluctuation);
    setCurrentEventCard(data.currentEventCard);
    setLogs(data.logs);
    setWinner(data.winner);
    setSettings(data.settings);
    setBankruptcyDebt(data.bankruptcyDebt);
  };

  // Host handles guest actions
  const handleGuestAction = (payload: any) => {
    const action = payload.action;
    if (action === 'roll_dice') {
      handleRollDice();
    } else if (action === 'buy_land') {
      handleBuyLand();
    } else if (action === 'skip_buy_land') {
      handleSkipBuyLand();
    } else if (action === 'rank_up_land') {
      handleRankUpLand();
    } else if (action === 'skip_rank_up') {
      handleSkipRankUp();
    } else if (action === 'super_lucky_roll') {
      handleRollForSuperLucky();
    } else if (action === 'venue_pass_choice') {
      handleVenuePassChoice(payload.draw);
    } else if (action === 'event_card_confirm') {
      handleEventCardConfirm(payload.resultPayload);
    } else if (action === 'casino_finish') {
      handleCasinoFinish(payload.netProfit);
    } else if (action === 'sell_tile') {
      handleSellTile(payload.tileId);
    } else if (action === 'pay_debt_resume') {
      handlePayDebtAndResume();
    } else if (action === 'sell_all_hellowork') {
      handleSellAllAndGoToHelloWork();
    } else if (action === 'hellowork_roll') {
      handleHelloWorkRoll();
    } else if (action === 'next_turn') {
      handleNextTurn();
    }
  };

  // Helper for sending action if client, or executing if host/local
  const executeOrSendAction = (actionName: string, extraPayload: any = {}, localExec: () => void) => {
    if (isOnline && !isHost) {
      onlineManager.sendToHost({
        type: 'PLAYER_ACTION',
        payload: { action: actionName, ...extraPayload },
      });
    } else {
      localExec();
    }
  };

  // Handle Game Setup - Local
  const handleStartLocalGame = (newPlayers: Player[], newSettings: GameSettings) => {
    onlineManager.cleanup();
    setIsOnline(false);
    setIsHost(true);
    setMyPlayerId('p1');
    setOnlineRoomCode('');
    setShowOnlineLobby(false);

    setPlayers(newPlayers);
    setSettings(newSettings);
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
        text: `ゲームスタート！目標金額は ${newSettings.targetMoney.toLocaleString()} マニーです。`,
        type: 'roll',
      },
    ]);
    setGamePhase('waiting_roll');
  };

  // Handle Online Room Creation
  const handleCreateOnlineRoom = (
    hostPlayer: { name: string; avatar: string },
    targetMoney: number,
    roomCode: string
  ) => {
    const code = roomCode.trim().toUpperCase();
    setOnlineRoomCode(code);
    setIsOnline(true);
    setIsHost(true);
    setMyPlayerId('p1');

    const hostP: Player = {
      id: 'p1',
      name: hostPlayer.name || 'ホスト',
      isAi: false,
      color: 'red',
      avatar: hostPlayer.avatar || '🚗',
      money: 1000,
      position: 0,
      inHelloWork: false,
      hasRentExemption: false,
      hasSuperLucky: false,
      totalLaps: 0,
    };

    setPlayers([hostP]);
    setSettings((s) => ({ ...s, targetMoney }));
    setTiles(INITIAL_TILES.map((t) => ({ ...t, ownerId: null, rank: 0 })));

    onlineManager.createRoom(
      code,
      (readyCode) => {
        setOnlineRoomCode(readyCode);
        setShowOnlineLobby(true);
      },
      (err) => {
        alert('部屋の作成に失敗しました。別のコードを試してください。');
        console.error(err);
      }
    );
  };

  // Handle Online Room Join
  const handleJoinOnlineRoom = (
    guestPlayer: { name: string; avatar: string },
    roomCode: string
  ) => {
    const code = roomCode.trim().toUpperCase();
    setOnlineRoomCode(code);
    setIsOnline(true);
    setIsHost(false);

    onlineManager.joinRoom(
      code,
      () => {
        // Send join request to host
        onlineManager.sendToHost({
          type: 'JOIN_REQUEST',
          payload: guestPlayer,
        });
      },
      (err) => {
        alert('部屋への参加に失敗しました。部屋コードを確認してください。');
        console.error(err);
      }
    );
  };

  // Host starts online game from lobby
  const handleStartOnlineGame = () => {
    setShowOnlineLobby(false);
    setTiles(INITIAL_TILES.map((t) => ({ ...t, ownerId: null, rank: 0 })));
    setCurrentPlayerIndex(0);
    setActivePriceFluctuation(null);
    setCurrentEventCard(null);
    setWinner(null);
    setBankruptcyDebt(null);
    setShowCasinoModal(false);
    const initialLogs: GameLog[] = [
      {
        id: 'start_online',
        timestamp: Date.now(),
        text: `オンライン対戦スタート！目標は ${settings.targetMoney.toLocaleString()} マニー！`,
        type: 'roll',
      },
    ];
    setLogs(initialLogs);
    setGamePhase('waiting_roll');

    const initialState: GameStateSync = {
      players,
      currentPlayerIndex: 0,
      tiles: INITIAL_TILES.map((t) => ({ ...t, ownerId: null, rank: 0 })),
      gamePhase: 'waiting_roll',
      currentDice: 1,
      activePriceFluctuation: null,
      currentEventCard: null,
      logs: initialLogs,
      winner: null,
      settings,
      bankruptcyDebt: null,
    };

    onlineManager.broadcast({
      type: 'START_GAME',
      payload: initialState,
    });
  };

  // Leave Lobby
  const handleLeaveLobby = () => {
    onlineManager.cleanup();
    setIsOnline(false);
    setShowOnlineLobby(false);
    setGamePhase('setup');
  };

  // Check victory condition
  const checkVictory = (playerList: Player[]) => {
    for (const p of playerList) {
      if (p.money >= settings.targetMoney) {
        setWinner(p);
        setGamePhase('game_over');
        addLog(`🎉 ${p.name} が目標金額 ${settings.targetMoney.toLocaleString()}マニーに到達！勝利！`, p.id, 'win');
        broadcastStateIfHost({ winner: p, gamePhase: 'game_over' });
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

    let newFluctuation = activePriceFluctuation;
    if (
      activePriceFluctuation &&
      activePriceFluctuation.expiresOnPlayerTurn === nextPlayer.id
    ) {
      newFluctuation = null;
      setActivePriceFluctuation(null);
      addLog('価格変動の効果が終了し、通常の支払額に戻りました。');
    }

    let nextPhase: GamePhase = 'waiting_roll';
    if (nextPlayer.inHelloWork) {
      nextPhase = 'hellowork_turn';
      addLog(
        `💼 ${nextPlayer.name} はハローワークでのターンです。サイコロを振って給料を獲得します。`,
        nextPlayer.id
      );
    }
    setGamePhase(nextPhase);

    broadcastStateIfHost({
      currentPlayerIndex: nextIndex,
      gamePhase: nextPhase,
      activePriceFluctuation: newFluctuation,
    });
  };

  // Hello Work Turn Roll
  const handleHelloWorkRoll = () => {
    executeOrSendAction('hellowork_roll', {}, () => {
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
              inHelloWork: false,
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

        broadcastStateIfHost({ players: updatedPlayers, currentDice: roll });

        if (checkVictory(updatedPlayers)) return;

        setTimeout(() => {
          handleNextTurn();
        }, getDelay(1000));
      }, getDelay(800));
    });
  };

  // Standard Dice Roll
  const handleRollDice = () => {
    executeOrSendAction('roll_dice', {}, () => {
      if (isRolling || gamePhase !== 'waiting_roll') return;
      setIsRolling(true);

      setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        setCurrentDice(roll);
        setIsRolling(false);
        setGamePhase('moving');

        addLog(`🎲 ${currentPlayer.name} はサイコロで【${roll}】を出しました。`, currentPlayer.id, 'roll');
        broadcastStateIfHost({ currentDice: roll, gamePhase: 'moving' });
        movePlayerStepByStep(roll);
      }, getDelay(800));
    });
  };

  // Step-by-Step Movement
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

      if (currentPos === 0) passedStart = true;
      if (currentPos === 12 && currentStep < totalSteps) passedVenue = true;

      setPlayers((prev) => {
        const updated = prev.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, position: currentPos } : p
        );
        broadcastStateIfHost({ players: updated });
        return updated;
      });

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
    broadcastStateIfHost({ players: updatedPlayers });

    if (checkVictory(updatedPlayers)) return;

    if (passedVenue && finalPos !== 12) {
      setGamePhase('venue_pass_prompt');
      broadcastStateIfHost({ gamePhase: 'venue_pass_prompt' });
      return;
    }

    resolveLandingSquare(finalPos, updatedPlayers);
  };

  // Choice when passing Event Venue
  const handleVenuePassChoice = (draw: boolean) => {
    executeOrSendAction('venue_pass_choice', { draw }, () => {
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

        const card = drawRandomEventCard();
        setCurrentEventCard(card);
        setGamePhase('event_card_modal');
        broadcastStateIfHost({
          players: updated,
          currentEventCard: card,
          gamePhase: 'event_card_modal',
        });
      } else {
        addLog(`🎪 ${currentPlayer.name} はイベント会場の通過カードを見送りました。`, currentPlayer.id);
        resolveLandingSquare(currentPlayer.position, players);
      }
    });
  };

  // Resolve Landing Square
  const resolveLandingSquare = (tileId: number, currentPlayersState: Player[]) => {
    const tile = tiles[tileId];
    const player = currentPlayersState[currentPlayerIndex];

    if (tile.type === 'start') {
      addLog(`🏁 ${player.name} はスタート地点に到着しました。`, player.id);
      setGamePhase('turn_end');
      broadcastStateIfHost({ gamePhase: 'turn_end' });
      return;
    }

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
      broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
      return;
    }

    if (tile.type === 'casino') {
      sounds.playCard();
      addLog(`🎰 ${player.name} はカジノに到着しました！一攫千金に挑戦！`, player.id);
      setShowCasinoModal(true);
      setGamePhase('casino_modal');
      broadcastStateIfHost({ gamePhase: 'casino_modal' });
      return;
    }

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
      broadcastStateIfHost({
        currentEventCard: card,
        gamePhase: 'event_card_modal',
      });
      return;
    }

    if (tile.type === 'land') {
      if (!tile.ownerId) {
        addLog(
          `🏡 ${player.name} は未契約の No.${tile.landNumber}「${tile.name}」(契約金: ${tile.cost}M) に止まりました。`,
          player.id
        );
        setGamePhase('land_action');
        broadcastStateIfHost({ gamePhase: 'land_action' });
        return;
      }

      if (tile.ownerId === player.id) {
        if (tile.rank === 0) {
          addLog(
            `🏡 ${player.name} は自身の No.${tile.landNumber}「${tile.name}」に止まりました。ランクアップが可能です。`,
            player.id
          );
          setGamePhase('land_action');
          broadcastStateIfHost({ gamePhase: 'land_action' });
        } else {
          addLog(
            `🏡 ${player.name} は自身の No.${tile.landNumber}「${tile.name}」(★Lv.2 最高ランク) に止まりました。`,
            player.id
          );
          setGamePhase('turn_end');
          broadcastStateIfHost({ gamePhase: 'turn_end' });
        }
        return;
      }

      const owner = currentPlayersState.find((p) => p.id === tile.ownerId);
      if (!owner) {
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
        return;
      }

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
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
        return;
      }

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
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
      } else {
        sounds.playBuzzer();
        addLog(
          `⚠️ ${player.name} は ${totalRent}マニーを支払う所持金がありません！破産処理に入ります。`,
          player.id,
          'bankrupt'
        );
        const debtData = {
          debtAmount: totalRent,
          creditorPlayerId: owner.id,
        };
        setBankruptcyDebt(debtData);
        setGamePhase('bankruptcy_modal');
        broadcastStateIfHost({
          bankruptcyDebt: debtData,
          gamePhase: 'bankruptcy_modal',
        });
      }
    }
  };

  // Land Contract Action (Buy)
  const handleBuyLand = () => {
    executeOrSendAction('buy_land', {}, () => {
      const tile = tiles[currentPlayer.position];
      if (!tile || tile.type !== 'land' || !tile.cost) return;

      if (currentPlayer.money < tile.cost) {
        addLog(`所持金が不足しているため契約できませんでした。`, currentPlayer.id);
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
        return;
      }

      sounds.playBuy();

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
      broadcastStateIfHost({
        players: updatedPlayers,
        tiles: updatedTiles,
        gamePhase: 'turn_end',
      });
    });
  };

  // Super Lucky Roll for Land Contract
  const handleRollForSuperLucky = () => {
    executeOrSendAction('super_lucky_roll', {}, () => {
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

        if (currentPlayer.money < finalCost) {
          addLog(`倍額の契約金が払えないため、契約できませんでした…`, currentPlayer.id);
          const updatedPlayers = players.map((p, idx) =>
            idx === currentPlayerIndex ? { ...p, hasSuperLucky: false } : p
          );
          setPlayers(updatedPlayers);
          setGamePhase('turn_end');
          broadcastStateIfHost({ players: updatedPlayers, gamePhase: 'turn_end' });
          return;
        }

        const updatedPlayers = players.map((p, idx) =>
          idx === currentPlayerIndex
            ? {
                ...p,
                money: p.money - finalCost,
                hasSuperLucky: false,
              }
            : p
        );
        const updatedTiles = tiles.map((t) =>
          t.id === tile.id ? { ...t, ownerId: currentPlayer.id } : t
        );

        setPlayers(updatedPlayers);
        setTiles(updatedTiles);
        setGamePhase('turn_end');

        broadcastStateIfHost({
          players: updatedPlayers,
          tiles: updatedTiles,
          currentDice: roll,
          gamePhase: 'turn_end',
        });
      }, getDelay(800));
    });
  };

  const handleSkipBuyLand = () => {
    executeOrSendAction('skip_buy_land', {}, () => {
      addLog(`${currentPlayer.name} は土地の契約を見送りました。`, currentPlayer.id);
      setGamePhase('turn_end');
      broadcastStateIfHost({ gamePhase: 'turn_end' });
    });
  };

  // Rank up Land
  const handleRankUpLand = () => {
    executeOrSendAction('rank_up_land', {}, () => {
      const tile = tiles[currentPlayer.position];
      if (!tile || !tile.cost || tile.rank !== 0) return;

      const rankUpCost = tile.cost * 2;
      if (currentPlayer.money < rankUpCost) {
        addLog(`所持金が不足しているためランクアップできませんでした。`, currentPlayer.id);
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
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
      broadcastStateIfHost({
        players: updatedPlayers,
        tiles: updatedTiles,
        gamePhase: 'turn_end',
      });
    });
  };

  const handleSkipRankUp = () => {
    executeOrSendAction('skip_rank_up', {}, () => {
      addLog(`${currentPlayer.name} はランクアップを見送りました。`, currentPlayer.id);
      setGamePhase('turn_end');
      broadcastStateIfHost({ gamePhase: 'turn_end' });
    });
  };

  // Event Card Resolution
  const handleEventCardConfirm = (payload?: {
    diceRoll?: number;
    fluctuationMultiplier?: 0.5 | 2.0;
    lotteryMoney?: number;
    majorDamageChoice?: 'pay' | 'relinquish';
    majorDamageTileId?: number;
  }) => {
    executeOrSendAction('event_card_confirm', { resultPayload: payload }, () => {
      if (!currentEventCard) return;

      const card = currentEventCard;
      setCurrentEventCard(null);

      let updatedPlayers = [...players];
      const player = updatedPlayers[currentPlayerIndex];

      switch (card.type) {
        case 'windfall': {
          sounds.playCoin();
          player.money += 200;
          addLog(`💰 ${player.name} は臨時収入で +200マニーを獲得！`, player.id, 'money');
          break;
        }
        case 'sudden_expense': {
          sounds.playBuzzer();
          if (player.money < 100) {
            const debtData = {
              debtAmount: 100,
              creditorPlayerId: null,
            };
            setBankruptcyDebt(debtData);
            setGamePhase('bankruptcy_modal');
            broadcastStateIfHost({
              bankruptcyDebt: debtData,
              gamePhase: 'bankruptcy_modal',
            });
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
          addLog(`🛡️ ${player.name} は【支払い免除】カードを手に入れました！`, player.id);
          break;
        }
        case 'super_lucky': {
          player.hasSuperLucky = true;
          sounds.playBuy();
          addLog(`🎲 ${player.name} は【私は豪運！】カードを手に入れました！`, player.id);
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
            const debtData = {
              debtAmount: disasterCost,
              creditorPlayerId: null,
            };
            setBankruptcyDebt(debtData);
            setGamePhase('bankruptcy_modal');
            broadcastStateIfHost({
              bankruptcyDebt: debtData,
              gamePhase: 'bankruptcy_modal',
            });
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

      if (gamePhase === 'event_card_modal') {
        setGamePhase('turn_end');
      }

      broadcastStateIfHost({
        players: updatedPlayers,
        gamePhase: 'turn_end',
        currentEventCard: null,
      });
    });
  };

  // Casino Minigame Finished
  const handleCasinoFinish = (netProfit: number) => {
    executeOrSendAction('casino_finish', { netProfit }, () => {
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
      broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
    });
  };

  // Bankruptcy: Sell Individual Tile
  const handleSellTile = (tileId: number) => {
    executeOrSendAction('sell_tile', { tileId }, () => {
      const tile = tiles.find((t) => t.id === tileId);
      if (!tile || !tile.cost) return;

      const sellPrice = Math.floor(tile.cost / 2);

      const updatedTiles = tiles.map((t) =>
        t.id === tileId ? { ...t, ownerId: null, rank: 0 } : t
      );
      const updatedPlayers = players.map((p, idx) =>
        idx === currentPlayerIndex ? { ...p, money: p.money + sellPrice } : p
      );

      setTiles(updatedTiles);
      setPlayers(updatedPlayers);

      addLog(
        `💸 ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」を半額（${sellPrice}マニー）で売却しました。`,
        currentPlayer.id
      );

      broadcastStateIfHost({
        tiles: updatedTiles,
        players: updatedPlayers,
      });
    });
  };

  // Bankruptcy: Pay Debt & Resume
  const handlePayDebtAndResume = () => {
    executeOrSendAction('pay_debt_resume', {}, () => {
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

      broadcastStateIfHost({
        players: updated,
        bankruptcyDebt: null,
        gamePhase: 'turn_end',
      });
    });
  };

  // Bankruptcy: Sell all and go to Hello Work
  const handleSellAllAndGoToHelloWork = () => {
    executeOrSendAction('sell_all_hellowork', {}, () => {
      if (!bankruptcyDebt) return;

      const updatedTiles = tiles.map((t) =>
        t.ownerId === currentPlayer.id ? { ...t, ownerId: null, rank: 0 } : t
      );

      const updated = players.map((p) => {
        if (p.id === currentPlayer.id) {
          return {
            ...p,
            money: 0,
            position: 6,
            inHelloWork: true,
          };
        }
        if (bankruptcyDebt.creditorPlayerId && p.id === bankruptcyDebt.creditorPlayerId) {
          return { ...p, money: p.money + Math.max(0, currentPlayer.money) };
        }
        return p;
      });

      setTiles(updatedTiles);
      setPlayers(updated);
      setBankruptcyDebt(null);
      sounds.playBuzzer();

      addLog(
        `💼 ${currentPlayer.name} は全財産を清算しハローワークマスに移動しました！次ターン、サイコロ出目×100マニーで再起を図ります！`,
        currentPlayer.id,
        'bankrupt'
      );

      setGamePhase('turn_end');

      broadcastStateIfHost({
        tiles: updatedTiles,
        players: updated,
        bankruptcyDebt: null,
        gamePhase: 'turn_end',
      });
    });
  };

  // CPU Automated Turn Handling (Host only)
  useEffect(() => {
    if (gamePhase === 'game_over' || gamePhase === 'setup') return;
    if (isOnline && !isHost) return; // Only host drives CPU
    if (!currentPlayer || !currentPlayer.isAi) return;

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
          const roll = Math.floor(Math.random() * 6) + 1;
          const won = (bet.choice === 'high' && roll >= 4) || (bet.choice === 'low' && roll <= 3);
          const profit = won ? bet.betAmount : -bet.betAmount;
          handleCasinoFinish(profit);
        }
      } else if (gamePhase === 'bankruptcy_modal') {
        const ownedTiles = tiles.filter((t) => t.ownerId === currentPlayer.id);
        const tileToSell = AIHelper.selectLandToSell(currentPlayer, ownedTiles);
        if (tileToSell) {
          handleSellTile(tileToSell.id);
        } else {
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
  }, [gamePhase, currentPlayer, tiles, bankruptcyDebt, isOnline, isHost]);

  // Is it my turn to act?
  const isMyTurn = !isOnline || (currentPlayer && currentPlayer.id === myPlayerId);

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-slate-100 flex flex-col items-center justify-between p-1 sm:p-2 select-none font-sans">
      {/* Game Header Bar */}
      {gamePhase !== 'setup' && (
        <GameHeader
          players={players}
          currentPlayerId={currentPlayer?.id || ''}
          settings={settings}
          tiles={tiles}
          onlineRoomCode={onlineRoomCode}
          onToggleSound={() =>
            setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
          }
          onToggleSpeed={() =>
            setSettings((s) => ({
              ...s,
              gameSpeed: s.gameSpeed === 'normal' ? 'fast' : 'normal',
            }))
          }
          onNewGame={() => {
            onlineManager.cleanup();
            setIsOnline(false);
            setGamePhase('setup');
          }}
          onOpenRules={() => setShowRulesModal(true)}
        />
      )}

      {/* Main 7x7 Board Area */}
      {gamePhase !== 'setup' && currentPlayer && (
        <main className="w-full flex-1 flex items-center justify-center overflow-hidden">
          <Board
            tiles={tiles}
            players={players}
            currentPlayer={currentPlayer}
            currentDice={currentDice}
            isRolling={isRolling}
            gamePhase={gamePhase}
            activePriceFluctuation={activePriceFluctuation}
            logs={logs}
            myPlayerId={myPlayerId}
            isOnline={isOnline}
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
        <StartGameModal
          onStartLocalGame={handleStartLocalGame}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
        />
      )}

      {/* 2. Online Lobby Modal */}
      {showOnlineLobby && (
        <OnlineLobbyModal
          isHost={isHost}
          roomCode={onlineRoomCode}
          players={players}
          myPlayerId={myPlayerId}
          settings={settings}
          onStartGame={handleStartOnlineGame}
          onLeaveLobby={handleLeaveLobby}
        />
      )}

      {/* 3. Event Card Modal */}
      {gamePhase === 'event_card_modal' && currentEventCard && currentPlayer && (
        <EventCardModal
          card={currentEventCard}
          player={currentPlayer}
          playerOwnedLands={tiles.filter((t) => t.ownerId === currentPlayer.id)}
          onConfirm={handleEventCardConfirm}
        />
      )}

      {/* 4. Casino Modal */}
      {showCasinoModal && currentPlayer && (
        <CasinoModal player={currentPlayer} onFinish={handleCasinoFinish} />
      )}

      {/* 5. Bankruptcy Modal */}
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

      {/* 6. Tile Inspection Detail Modal */}
      <TileDetailModal
        tile={selectedTileForDetail}
        players={players}
        allTiles={tiles}
        activePriceFluctuation={activePriceFluctuation}
        onClose={() => setSelectedTileForDetail(null)}
      />

      {/* 7. Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* 8. Victory Modal */}
      {winner && (
        <VictoryModal
          winner={winner}
          players={players}
          tiles={tiles}
          settings={settings}
          onPlayAgain={() => {
            onlineManager.cleanup();
            setIsOnline(false);
            setGamePhase('setup');
          }}
        />
      )}
    </div>
  );
}
