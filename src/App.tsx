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
  ArrestInfo,
} from './types/game';
import {
  INITIAL_TILES,
  calculateLandRent,
  isAreaMonopoly,
  isAdjacentLandOwned,
  areAllLandsContracted,
} from './utils/boardData';
import { drawNormalEventCard, drawFortuneCard } from './utils/eventCards';
import { AIHelper } from './utils/ai';
import { sounds } from './utils/audio';
import { onlineManager, NetworkMessage } from './utils/online';

import { Board } from './components/Board';
import { GameHeader } from './components/GameHeader';
import { EventCardModal } from './components/EventCardModal';
import { CasinoModal } from './components/CasinoModal';
import { HeavenAndHellModal } from './components/HeavenAndHellModal';
import { SuperLuckyModal } from './components/SuperLuckyModal';
import { BankruptcyModal } from './components/BankruptcyModal';
import { TileDetailModal } from './components/TileDetailModal';
import { StartGameModal } from './components/StartGameModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { GameLogModal } from './components/GameLogModal';
import { ArrestModal } from './components/ArrestModal';

const ONLINE_COLORS: PlayerColor[] = ['red', 'blue', 'emerald', 'amber', 'purple'];

export default function App() {
  // Game Configuration & State
  const [settings, setSettings] = useState<GameSettings>({
    targetMoney: 2000,
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
  const [isBubbleEra, setIsBubbleEra] = useState<boolean>(false);

  // Fluctuations & Modals
  const [activePriceFluctuation, setActivePriceFluctuation] =
    useState<ActivePriceFluctuation | null>(null);
  const [realEstateSalePurchasesRemaining, setRealEstateSalePurchasesRemaining] =
    useState<number>(0);
  const [currentEventCard, setCurrentEventCard] = useState<EventCard | null>(null);
  const [selectedTileForDetail, setSelectedTileForDetail] = useState<Tile | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showCasinoModal, setShowCasinoModal] = useState<boolean>(false);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [jailReleaseDice, setJailReleaseDice] = useState<[number, number]>([1, 1]);
  const [isJailRolling, setIsJailRolling] = useState<boolean>(false);

  // Pending Movement (used when pausing on an event tile to prompt 50M draw)
  const [pendingMovement, setPendingMovement] = useState<{
    remainingSteps: number;
    startPos: number;
    currentPos: number;
    passedStart: boolean;
    passedJail: boolean;
  } | null>(null);

  // Bankruptcy State
  const [bankruptcyDebt, setBankruptcyDebt] = useState<{
    debtAmount: number;
    creditorPlayerId: string | null;
  } | null>(null);

  // Debug Mode Snapshot (Rewind to before rolling)
  const [hasDebugSnapshot, setHasDebugSnapshot] = useState<boolean>(false);
  const debugRollSnapshotRef = useRef<{
    players: Player[];
    tiles: Tile[];
    gamePhase: GamePhase;
    currentDice: number;
    activePriceFluctuation: ActivePriceFluctuation | null;
    realEstateSalePurchasesRemaining: number;
    isBubbleEra: boolean;
    bankruptcyDebt: { debtAmount: number; creditorPlayerId: string | null } | null;
  } | null>(null);
  const actionTokenRef = useRef<number>(0);
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Arrest Presentation Modal State
  const [arrestInfo, setArrestInfo] = useState<ArrestInfo | null>(null);

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
    jailReleaseDice,
    isJailRolling,
    activePriceFluctuation,
    realEstateSalePurchasesRemaining: 0,
    currentEventCard,
    logs,
    winner,
    settings,
    bankruptcyDebt,
    isBubbleEra,
    arrestInfo: null,
  });

  useEffect(() => {
    latestStateRef.current = {
      players,
      currentPlayerIndex,
      tiles,
      gamePhase,
      currentDice,
      jailReleaseDice,
      isJailRolling,
      activePriceFluctuation,
      realEstateSalePurchasesRemaining,
      currentEventCard,
      logs,
      winner,
      settings,
      bankruptcyDebt,
      isBubbleEra,
      arrestInfo,
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
            hasInfoManipulation: false,
            hasSurgeRent: false,
            skipNextTurn: false,
            crimeBlueprintCount: 0,
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
    setRealEstateSalePurchasesRemaining(data.realEstateSalePurchasesRemaining || 0);
    setCurrentEventCard(data.currentEventCard);
    setLogs(data.logs);
    setWinner(data.winner);
    setSettings(data.settings);
    setBankruptcyDebt(data.bankruptcyDebt);
    setIsBubbleEra(data.isBubbleEra || false);
    if (data.arrestInfo !== undefined) {
      setArrestInfo(data.arrestInfo);
    }
  };

  // Host handles guest actions
  const handleGuestAction = (payload: any) => {
    const action = payload.action;
    if (action === 'roll_dice') {
      handleRollDice(payload.chosenRoll);
    } else if (action === 'buy_land') {
      handleBuyLand();
    } else if (action === 'skip_buy_land') {
      handleSkipBuyLand();
    } else if (action === 'rank_up_land') {
      handleRankUpLand();
    } else if (action === 'skip_rank_up') {
      handleSkipRankUp();
    } else if (action === 'super_lucky_roll' || action === 'super_lucky_start') {
      handleRollForSuperLucky();
    } else if (action === 'super_lucky_finish') {
      handleSuperLuckyFinish(payload.roll);
    } else if (action === 'fortune_hall_choice') {
      handleFortuneHallChoice(payload.draw);
    } else if (action === 'event_card_confirm') {
      handleEventCardConfirm(payload.resultPayload);
    } else if (action === 'casino_finish') {
      handleCasinoFinish(payload.netProfit);
    } else if (action === 'heaven_and_hell_finish') {
      handleHeavenAndHellFinish(payload.result);
    } else if (action === 'sell_tile') {
      handleSellTile(payload.tileId);
    } else if (action === 'pay_debt_resume') {
      handlePayDebtAndResume();
    } else if (action === 'sell_all_hellowork') {
      handleSellAllAndGoToHelloWork();
    } else if (action === 'hellowork_roll') {
      handleHelloWorkRoll();
    } else if (action === 'jail_escape') {
      handleJailEscape();
    } else if (action === 'jail_release_roll') {
      handleJailReleaseRoll(payload.die1, payload.die2);
    } else if (action === 'passing_event_choice') {
      handlePassingEventChoice(payload.draw);
    } else if (action === 'start_clearance_choice') {
      handleStartClearanceChoice(payload.clear);
    } else if (action === 'debug_rewind') {
      handleDebugRewindToBeforeRoll();
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
    setRealEstateSalePurchasesRemaining(0);
    setCurrentEventCard(null);
    setWinner(null);
    setBankruptcyDebt(null);
    setShowCasinoModal(false);
    setIsBubbleEra(false);
    setHasDebugSnapshot(false);
    debugRollSnapshotRef.current = null;
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
      hasInfoManipulation: false,
      hasSurgeRent: false,
      skipNextTurn: false,
      crimeBlueprintCount: 0,
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
    setRealEstateSalePurchasesRemaining(0);
    setCurrentEventCard(null);
    setWinner(null);
    setBankruptcyDebt(null);
    setShowCasinoModal(false);
    setIsBubbleEra(false);
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
      realEstateSalePurchasesRemaining: 0,
      currentEventCard: null,
      logs: initialLogs,
      winner: null,
      settings,
      bankruptcyDebt: null,
      isBubbleEra: false,
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

    setHasDebugSnapshot(false);
    debugRollSnapshotRef.current = null;

    const nextIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];

    // Check if player has skipNextTurn (次から頑張る)
    if (nextPlayer.skipNextTurn) {
      const updatedPlayers = players.map((p, idx) =>
        idx === nextIndex ? { ...p, skipNextTurn: false } : p
      );
      setPlayers(updatedPlayers);
      sounds.playBuzzer();
      addLog(
        `💤 【次から頑張る】の効果で ${nextPlayer.name} はこのターンお休みです。`,
        nextPlayer.id
      );

      const subsequentIndex = (nextIndex + 1) % updatedPlayers.length;
      setCurrentPlayerIndex(subsequentIndex);
      const subsequentPlayer = updatedPlayers[subsequentIndex];

      let newFluctuation = activePriceFluctuation;
      if (
        activePriceFluctuation &&
        activePriceFluctuation.expiresOnPlayerTurn === subsequentPlayer.id
      ) {
        newFluctuation = null;
        setActivePriceFluctuation(null);
        addLog('価格変動の効果が終了し、通常の支払額に戻りました。');
      }

      let nextPhase: GamePhase = 'waiting_roll';
      if (subsequentPlayer.inHelloWork) {
        nextPhase = 'hellowork_turn';
        addLog(
          `💼 ${subsequentPlayer.name} はハローワークでのターンです。サイコロを振って給料を獲得します。`,
          subsequentPlayer.id
        );
      } else if (subsequentPlayer.inJail) {
        nextPhase = 'jail_turn';
        addLog(
          `⛓️ ${subsequentPlayer.name} は牢屋に収監中です。【脱獄】か【釈放チャンス】を選択してください。`,
          subsequentPlayer.id
        );
      }
      setGamePhase(nextPhase);

      broadcastStateIfHost({
        players: updatedPlayers,
        currentPlayerIndex: subsequentIndex,
        gamePhase: nextPhase,
        activePriceFluctuation: newFluctuation,
      });
      return;
    }

    setCurrentPlayerIndex(nextIndex);

    // Check if nextPlayer has Bubble Debt (バブル期救済返済)
    if (nextPlayer.bubbleDebt && nextPlayer.bubbleDebt > 0) {
      const grantAmount = 200;
      let remainingDebt = 0;
      let excessMoney = 0;

      if (grantAmount >= nextPlayer.bubbleDebt) {
        excessMoney = grantAmount - nextPlayer.bubbleDebt;
        remainingDebt = 0;
      } else {
        remainingDebt = nextPlayer.bubbleDebt - grantAmount;
        excessMoney = 0;
      }

      const updatedPlayers = players.map((p, idx) =>
        idx === nextIndex
          ? {
              ...p,
              bubbleDebt: remainingDebt,
              money: p.money + excessMoney, // 差額は自分のお金になる
            }
          : p
      );
      setPlayers(updatedPlayers);
      sounds.playCoin();

      let newFluctuation = activePriceFluctuation;
      if (
        activePriceFluctuation &&
        activePriceFluctuation.expiresOnPlayerTurn === nextPlayer.id
      ) {
        newFluctuation = null;
        setActivePriceFluctuation(null);
        addLog('価格変動の効果が終了し、通常の支払額に戻りました。');
      }

      if (remainingDebt > 0) {
        addLog(
          `🏦 【バブル借金救済】 ${nextPlayer.name} に支援金200マニーが支給され返済に充当しました。（残債: ${remainingDebt}マニー）完済までスタート地点で待機となります。`,
          nextPlayer.id,
          'money'
        );
        setGamePhase('turn_end');
        broadcastStateIfHost({
          players: updatedPlayers,
          currentPlayerIndex: nextIndex,
          gamePhase: 'turn_end',
          activePriceFluctuation: newFluctuation,
        });
        return;
      } else {
        addLog(
          `🎉 【借金完済！】 ${nextPlayer.name} は支援金により借金を完済${
            excessMoney > 0 ? `し、差額 ${excessMoney}マニーを獲得` : ''
          }しました！サイコロを振って行動を再開できます！`,
          nextPlayer.id,
          'money'
        );
        setGamePhase('waiting_roll');
        broadcastStateIfHost({
          players: updatedPlayers,
          currentPlayerIndex: nextIndex,
          gamePhase: 'waiting_roll',
          activePriceFluctuation: newFluctuation,
        });
        return;
      }
    }

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
    } else if (nextPlayer.inJail) {
      nextPhase = 'jail_turn';
      addLog(
        `⛓️ ${nextPlayer.name} は牢屋に収監中です。【脱獄】か【釈放チャンス】を選択してください。`,
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
        sounds.playDiceLand();

        const salary = roll * 100 + (isBubbleEra ? 100 : 0);
        setTimeout(() => {
          sounds.playCoin();
        }, 300);

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
          `💼 ${currentPlayer.name} はハローワークでサイコロ【${roll}】を出して ${salary}マニー${
            isBubbleEra ? '（バブル期+100M）' : ''
          }を獲得！次のターンから行動できます。`,
          currentPlayer.id,
          'money'
        );

        broadcastStateIfHost({ players: updatedPlayers, currentDice: roll });

        if (checkVictory(updatedPlayers)) return;

        setTimeout(() => {
          handleNextTurn();
        }, getDelay(1200));
      }, getDelay(800));
    });
  };

  // Jail: Break Out / Escape
  const handleJailEscape = () => {
    executeOrSendAction('jail_escape', {}, () => {
      sounds.playDiceLand();
      const updatedPlayers = players.map((p, idx) =>
        idx === currentPlayerIndex
          ? {
              ...p,
              inJail: false,
              isWanted: true,
              hasRentExemption: false,
              hasSuperLucky: false,
              hasInfoManipulation: false,
              hasSurgeRent: false,
              skipNextTurn: false,
              hasCrimeBlueprint: false,
            }
          : p
      );
      setPlayers(updatedPlayers);
      addLog(
        `⛓️💨 【脱獄決行！】 ${currentPlayer.name} は脱獄しました！すべてのイベント効果を失い【指名手配】されました！通常通りサイコロを振って逃亡します！`,
        currentPlayer.id,
        'roll'
      );
      setGamePhase('waiting_roll');
      broadcastStateIfHost({
        players: updatedPlayers,
        gamePhase: 'waiting_roll',
      });
    });
  };

  // Jail: Release Chance
  const handleJailReleaseRoll = (providedDie1?: number, providedDie2?: number) => {
    const d1 = providedDie1 ?? Math.floor(Math.random() * 6) + 1;
    const d2 = providedDie2 ?? Math.floor(Math.random() * 6) + 1;

    executeOrSendAction('jail_release_roll', { die1: d1, die2: d2 }, () => {
      if (isJailRolling) return;
      setIsJailRolling(true);
      setGamePhase('jail_release_roll');
      setJailReleaseDice([d1, d2]);
      broadcastStateIfHost({
        gamePhase: 'jail_release_roll',
        jailReleaseDice: [d1, d2],
        isJailRolling: true,
      });

      sounds.playDiceRoll();

      setTimeout(() => {
        setIsJailRolling(false);
        sounds.playDiceLand();

        const sum = d1 + d2;
        const isSnakeEyes = d1 === 1 && d2 === 1;
        const isReleased = sum >= 7 || isSnakeEyes;

        if (isReleased) {
          sounds.playWin();
          const updatedPlayers = players.map((p, idx) =>
            idx === currentPlayerIndex ? { ...p, inJail: false, isWanted: false } : p
          );
          setPlayers(updatedPlayers);
          addLog(
            `🎉 【釈放成功！】 ${currentPlayer.name} はサイコロで【${d1}】と【${d2}】（合計: ${sum}）${
              isSnakeEyes ? '【奇跡の1のゾロ目！】' : ''
            }を出して無罪放免！釈放されました！`,
            currentPlayer.id,
            'money'
          );
          broadcastStateIfHost({
            players: updatedPlayers,
            jailReleaseDice: [d1, d2],
            isJailRolling: false,
          });

          if (currentPlayer.isAi) {
            setTimeout(() => {
              handleNextTurn();
            }, getDelay(2500));
          }
        } else {
          sounds.playBuzzer();
          addLog(
            `🔒 【釈放ならず…】 ${currentPlayer.name} はサイコロで【${d1}】と【${d2}】（合計: ${sum}）。釈放条件（合計7以上または1のゾロ目）を満たせず収監継続です。`,
            currentPlayer.id
          );
          broadcastStateIfHost({
            jailReleaseDice: [d1, d2],
            isJailRolling: false,
          });

          if (currentPlayer.isAi) {
            setTimeout(() => {
              handleNextTurn();
            }, getDelay(2500));
          }
        }
      }, getDelay(800));
    });
  };

  // Confirm jail release result and advance to next turn
  const handleConfirmJailRelease = () => {
    executeOrSendAction('next_turn', {}, () => {
      handleNextTurn();
    });
  };

  // Standard Dice Roll
  const handleRollDice = (chosenRoll?: number) => {
    executeOrSendAction('roll_dice', { chosenRoll }, () => {
      if (isRolling || gamePhase !== 'waiting_roll') return;

      // Capture snapshot right before rolling so debug mode can restore it
      debugRollSnapshotRef.current = {
        players: JSON.parse(JSON.stringify(players)),
        tiles: JSON.parse(JSON.stringify(tiles)),
        gamePhase: 'waiting_roll',
        currentDice,
        activePriceFluctuation: activePriceFluctuation ? { ...activePriceFluctuation } : null,
        realEstateSalePurchasesRemaining,
        isBubbleEra,
        bankruptcyDebt: bankruptcyDebt ? { ...bankruptcyDebt } : null,
      };
      setHasDebugSnapshot(true);

      actionTokenRef.current++;
      const currentToken = actionTokenRef.current;

      setIsRolling(true);
      setGamePhase('rolling');
      broadcastStateIfHost({ gamePhase: 'rolling' });

      const hadInfoManipulation = !!currentPlayer.hasInfoManipulation;
      const targetRoll =
        chosenRoll && chosenRoll >= 1 && chosenRoll <= 6
          ? chosenRoll
          : currentPlayer.isAi && hadInfoManipulation
          ? AIHelper.chooseBestDice(currentPlayer, tiles)
          : Math.floor(Math.random() * 6) + 1;

      // Clear hasInfoManipulation immediately when roll is initiated
      if (hadInfoManipulation) {
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === currentPlayerIndex ? { ...p, hasInfoManipulation: false } : p
          )
        );
      }

      setTimeout(() => {
        if (actionTokenRef.current !== currentToken) return;

        const roll = targetRoll;
        setCurrentDice(roll);
        setIsRolling(false);
        sounds.playDiceLand();

        // Use latest state to avoid stale closures
        const latestPlayers = latestStateRef.current.players;
        const updatedPlayers = latestPlayers.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, hasInfoManipulation: false } : p
        );
        setPlayers(updatedPlayers);

        if (hadInfoManipulation) {
          if (chosenRoll && chosenRoll >= 1 && chosenRoll <= 6) {
            addLog(
              `🎯 【情報操作】 ${currentPlayer.name} は出目を狙い通り【${roll}】に指定しました！（効果消費）`,
              currentPlayer.id,
              'roll'
            );
          } else {
            addLog(
              `🎯 【情報操作】 ${currentPlayer.name} はランダムにサイコロを振り【${roll}】を出しました！（効果消費）`,
              currentPlayer.id,
              'roll'
            );
          }
          broadcastStateIfHost({ currentDice: roll, players: updatedPlayers });
        } else {
          addLog(`🎲 ${currentPlayer.name} はサイコロで【${roll}】を出しました！`, currentPlayer.id, 'roll');
          broadcastStateIfHost({ currentDice: roll });
        }

        // Pause for about 1 second (1000ms) on the rolled face so players can clearly register the outcome
        const pauseDuration = settings.gameSpeed === 'fast' ? 700 : 1000;
        setTimeout(() => {
          if (actionTokenRef.current !== currentToken) return;
          setGamePhase('moving');
          broadcastStateIfHost({ currentDice: roll, gamePhase: 'moving' });
          movePlayerStepByStep(roll);
        }, pauseDuration);
      }, getDelay(800));
    });
  };

  // Helper to revert all lands to their original owners when Master Phantom Thief mode ends
  const revertPhantomThiefLands = (currentTiles: Tile[]): Tile[] => {
    return currentTiles.map((t) => {
      if (t.originalOwnerId !== undefined) {
        return { ...t, ownerId: t.originalOwnerId, originalOwnerId: undefined };
      }
      return t;
    });
  };

  // Step-by-Step Movement
  const movePlayerStepByStep = (totalSteps: number) => {
    let currentStep = 0;
    const startPos = currentPlayer.position;
    let currentPos = startPos;
    let passedStart = false;
    let passedJail = false;

    const currentToken = actionTokenRef.current;
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
    }

    const interval = setInterval(() => {
      if (actionTokenRef.current !== currentToken) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        return;
      }

      currentStep++;
      currentPos = (currentPos + 1) % 32;

      sounds.playStep();

      if (currentPos === 0) passedStart = true;
      if (currentPos === 24) passedJail = true;

      setPlayers((prev) => {
        const updated = prev.map((p, idx) =>
          idx === currentPlayerIndex
            ? { ...p, position: currentPos, hasInfoManipulation: false }
            : p
        );
        broadcastStateIfHost({ players: updated });
        return updated;
      });

      // Passing Event Tile check (tiles 4, 12, 20, 28)
      const EVENT_TILES = [4, 12, 20, 28];
      if (EVENT_TILES.includes(currentPos) && currentStep < totalSteps) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        setPendingMovement({
          remainingSteps: totalSteps - currentStep,
          startPos,
          currentPos,
          passedStart,
          passedJail,
        });
        setGamePhase('passing_event_prompt');
        broadcastStateIfHost({ gamePhase: 'passing_event_prompt' });
        return;
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        handleMovementFinished(startPos, currentPos, passedStart, passedJail);
      }
    }, getDelay(180));

    movementIntervalRef.current = interval;
  };

  // Resume remaining steps after passing event interaction
  const resumePendingMovement = () => {
    if (!pendingMovement) return;
    const { remainingSteps, startPos, currentPos: fromPos, passedStart, passedJail } = pendingMovement;
    setPendingMovement(null);
    setGamePhase('moving');
    broadcastStateIfHost({ gamePhase: 'moving' });

    let currentStep = 0;
    let currentPos = fromPos;
    let curPassedStart = passedStart;
    let curPassedJail = passedJail;

    const currentToken = actionTokenRef.current;
    if (movementIntervalRef.current) {
      clearInterval(movementIntervalRef.current);
    }

    const interval = setInterval(() => {
      if (actionTokenRef.current !== currentToken) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        return;
      }

      currentStep++;
      currentPos = (currentPos + 1) % 32;
      sounds.playStep();

      if (currentPos === 0) curPassedStart = true;
      if (currentPos === 24) curPassedJail = true;

      setPlayers((prev) => {
        const updated = prev.map((p, idx) =>
          idx === currentPlayerIndex
            ? { ...p, position: currentPos, hasInfoManipulation: false }
            : p
        );
        broadcastStateIfHost({ players: updated });
        return updated;
      });

      const EVENT_TILES = [4, 12, 20, 28];
      if (EVENT_TILES.includes(currentPos) && currentStep < remainingSteps) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        setPendingMovement({
          remainingSteps: remainingSteps - currentStep,
          startPos,
          currentPos,
          passedStart: curPassedStart,
          passedJail: curPassedJail,
        });
        setGamePhase('passing_event_prompt');
        broadcastStateIfHost({ gamePhase: 'passing_event_prompt' });
        return;
      }

      if (currentStep >= remainingSteps) {
        clearInterval(interval);
        movementIntervalRef.current = null;
        handleMovementFinished(startPos, currentPos, curPassedStart, curPassedJail);
      }
    }, getDelay(180));

    movementIntervalRef.current = interval;
  };

  // Debug mode: rewind to before rolling
  const handleDebugRewindToBeforeRoll = () => {
    executeOrSendAction('debug_rewind', {}, () => {
      if (!debugRollSnapshotRef.current) return;
      actionTokenRef.current++;
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
        movementIntervalRef.current = null;
      }

      const snap = debugRollSnapshotRef.current;
      setPlayers(JSON.parse(JSON.stringify(snap.players)));
      setTiles(JSON.parse(JSON.stringify(snap.tiles)));
      setGamePhase('waiting_roll');
      setCurrentDice(snap.currentDice);
      setActivePriceFluctuation(
        snap.activePriceFluctuation ? { ...snap.activePriceFluctuation } : null
      );
      setRealEstateSalePurchasesRemaining(snap.realEstateSalePurchasesRemaining);
      setIsBubbleEra(snap.isBubbleEra);
      setBankruptcyDebt(snap.bankruptcyDebt ? { ...snap.bankruptcyDebt } : null);
      setCurrentEventCard(null);
      setPendingMovement(null);
      setIsRolling(false);
      setWinner(null);
      setHasDebugSnapshot(false);

      sounds.playDiceLand();
      addLog(
        `🛠️ 【デバッグ機能】サイコロを振る前の状態に巻き戻しました。再度サイコロを振ることができます。`,
        currentPlayer?.id,
        'roll'
      );

      broadcastStateIfHost({
        players: snap.players,
        tiles: snap.tiles,
        gamePhase: 'waiting_roll',
        currentDice: snap.currentDice,
        activePriceFluctuation: snap.activePriceFluctuation,
        realEstateSalePurchasesRemaining: snap.realEstateSalePurchasesRemaining,
        isBubbleEra: snap.isBubbleEra,
        bankruptcyDebt: snap.bankruptcyDebt,
      });
    });
  };

  // Passing Event Choice (50M to draw card or skip)
  const handlePassingEventChoice = (draw: boolean) => {
    executeOrSendAction('passing_event_choice', { draw }, () => {
      if (draw) {
        if (currentPlayer.money < 50) {
          addLog(`所持金が50マニー未満のため、カードを引けませんでした。`, currentPlayer.id);
          resumePendingMovement();
          return;
        }

        const updated = players.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, money: p.money - 50 } : p
        );
        setPlayers(updated);
        sounds.playCard();
        addLog(
          `🎲 ${currentPlayer.name} は50マニーを支払い、通過イベントカードを引きました！`,
          currentPlayer.id,
          'money'
        );

        const card = drawNormalEventCard();
        setCurrentEventCard(card);
        setGamePhase('event_card_modal');
        broadcastStateIfHost({
          players: updated,
          currentEventCard: card,
          gamePhase: 'event_card_modal',
        });
      } else {
        addLog(`🎲 ${currentPlayer.name} はイベントマスをスルーして進みます。`, currentPlayer.id);
        resumePendingMovement();
      }
    });
  };

  // Start Tile Clearance Choice (liquidate 1 crime blueprint for +100M)
  const handleStartClearanceChoice = (clear: boolean) => {
    executeOrSendAction('start_clearance_choice', { clear }, () => {
      if (clear && currentPlayer.crimeBlueprintCount > 0) {
        const newCount = currentPlayer.crimeBlueprintCount - 1;
        const updated = players.map((p, idx) =>
          idx === currentPlayerIndex
            ? {
                ...p,
                money: p.money + 100,
                crimeBlueprintCount: newCount,
                hasCrimeBlueprint: newCount > 0,
              }
            : p
        );
        setPlayers(updated);
        sounds.playCoin();
        addLog(
          `📑 【計画書清算】 ${currentPlayer.name} は犯罪計画書を1枚100マニーで清算しました！（残所持数: ${newCount}/5）`,
          currentPlayer.id,
          'money'
        );
        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
      } else {
        addLog(`🏁 ${currentPlayer.name} は犯罪計画書を清算せずそのまま保持します。`, currentPlayer.id);
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
      }
    });
  };

  // After movement completes
  const handleMovementFinished = (
    startPos: number,
    finalPos: number,
    passedStart: boolean,
    passedJail: boolean
  ) => {
    // Read from latestStateRef to avoid stale closure over players
    const currentPlayers = latestStateRef.current.players;
    const playerToUpdate = currentPlayers[currentPlayerIndex];
    let currentMoney = playerToUpdate.money;

    if (passedStart) {
      const bonus = settings.startBonus + (isBubbleEra ? 100 : 0);
      currentMoney += bonus;
      sounds.playCoin();
      addLog(
        `🏁 ${playerToUpdate.name} はスタート地点を通過し、給料 +${bonus}マニー${
          isBubbleEra ? '（バブル期+100M）' : ''
        }を獲得！`,
        playerToUpdate.id,
        'money'
      );
    }

    let isWanted = !!playerToUpdate.isWanted;
    let isPhantomThief = !!playerToUpdate.isPhantomThief;

    // 1. Passing or stopping at Jail (Tile 24) clears Wanted status
    if (isWanted && (finalPos === 24 || passedJail)) {
      isWanted = false;
      if (isPhantomThief) {
        isPhantomThief = false;
        const restoredTiles = revertPhantomThiefLands(tiles);
        setTiles(restoredTiles);
        addLog(
          `🎩💥 【大怪盗モード解除】 ${playerToUpdate.name} は牢屋（マス24）の監視区域を通過/到着したため、大怪盗モードが解除され、すべての土地が元の所有者に戻りました！`,
          playerToUpdate.id,
          'land'
        );
      } else {
        addLog(
          `🕊️ 【指名手配解除！】 ${playerToUpdate.name} は牢屋の監視区域を通過/到着したため、指名手配が解除されました！`,
          playerToUpdate.id
        );
      }
    }

    // 2. Collision Check:
    // Case A: Moving player is Wanted and lands on tile with other players
    if (isWanted) {
      const otherPlayersHere = currentPlayers.filter(
        (p, idx) => idx !== currentPlayerIndex && p.position === finalPos && !p.inJail
      );
      if (otherPlayersHere.length > 0) {
        const capturer = otherPlayersHere[0];
        sounds.playBuzzer();
        sounds.playCoin();

        let restoredTiles = tiles;
        if (isPhantomThief) {
          isPhantomThief = false;
          restoredTiles = revertPhantomThiefLands(tiles);
          setTiles(restoredTiles);
        }

        const arrestData: ArrestInfo = {
          type: 'wanted_caught',
          arrestedPlayer: playerToUpdate,
          capturerPlayer: capturer,
          bounty: 200,
        };
        setArrestInfo(arrestData);

        addLog(
          `🚨 【指名手配犯を再逮捕！】 ${playerToUpdate.name} は逃走中に ${capturer.name} と同じマスに止まってしまい再逮捕！${capturer.name} は報奨金 200マニーを獲得！${playerToUpdate.name} は牢屋（マス24）へ送還されました！${isPhantomThief ? '（※大怪盗モードも解除され土地が返還されました）' : ''}`,
          playerToUpdate.id,
          'bankrupt'
        );

        const updatedWithArrest = currentPlayers.map((p, idx) => {
          if (idx === currentPlayerIndex) {
            return {
              ...p,
              money: currentMoney,
              position: 24,
              inJail: true,
              isWanted: false,
              isPhantomThief: false,
              totalLaps: p.totalLaps + (passedStart ? 1 : 0),
              hasInfoManipulation: false,
            };
          }
          if (p.id === capturer.id) {
            return {
              ...p,
              money: p.money + 200,
            };
          }
          return p;
        });

        setPlayers(updatedWithArrest);
        setGamePhase('turn_end');
        broadcastStateIfHost({
          players: updatedWithArrest,
          tiles: restoredTiles,
          gamePhase: 'turn_end',
          arrestInfo: arrestData,
        });
        checkVictory(updatedWithArrest);
        return;
      }
    }

    // Case B: Moving player lands on a tile where another player is Wanted
    const wantedOpponentsHere = currentPlayers.filter(
      (p, idx) => idx !== currentPlayerIndex && p.position === finalPos && p.isWanted && !p.inJail
    );

    let caseBArrestData: ArrestInfo | null = null;
    if (wantedOpponentsHere.length > 0) {
      sounds.playWin();
      sounds.playCoin();
      let restoredTiles = tiles;
      for (const wantedOpp of wantedOpponentsHere) {
        currentMoney += 200;
        if (wantedOpp.isPhantomThief) {
          restoredTiles = revertPhantomThiefLands(restoredTiles);
          setTiles(restoredTiles);
        }
        addLog(
          `🚨 【指名手配犯を確保！】 ${playerToUpdate.name} はマスに潜伏していた指名手配犯 ${wantedOpp.name} を捕獲し、報奨金 200マニーを獲得！${wantedOpp.name} は牢屋（マス24）へ送還されました！${wantedOpp.isPhantomThief ? '（※大怪盗モードが解除されました）' : ''}`,
          playerToUpdate.id,
          'money'
        );
      }
      caseBArrestData = {
        type: 'wanted_arrested_self',
        arrestedPlayer: wantedOpponentsHere[0],
        capturerPlayer: playerToUpdate,
        bounty: 200,
      };
      setArrestInfo(caseBArrestData);
    }

    const updatedPlayers = currentPlayers.map((p, idx) => {
      if (idx === currentPlayerIndex) {
        return {
          ...p,
          money: currentMoney,
          position: finalPos,
          isWanted,
          isPhantomThief,
          totalLaps: p.totalLaps + (passedStart ? 1 : 0),
          hasInfoManipulation: false, // 一度きりの効果：サイコロ移動完了時に確実に解除
        };
      }
      if (wantedOpponentsHere.some((w) => w.id === p.id)) {
        return {
          ...p,
          position: 24,
          inJail: true,
          isWanted: false,
          isPhantomThief: false,
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    broadcastStateIfHost({
      players: updatedPlayers,
      ...(caseBArrestData ? { arrestInfo: caseBArrestData } : {}),
    });

    if (checkVictory(updatedPlayers)) return;

    resolveLandingSquare(finalPos, updatedPlayers);
  };

  // Choice when stopping at 占いの館 (Tile 16)
  const handleFortuneHallChoice = (draw: boolean) => {
    executeOrSendAction('fortune_hall_choice', { draw }, () => {
      if (draw) {
        if (currentPlayer.money < 100) {
          addLog(`所持金が不足しているため、カードを引けませんでした。`, currentPlayer.id);
          setGamePhase('turn_end');
          broadcastStateIfHost({ gamePhase: 'turn_end' });
          return;
        }

        const updated = players.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, money: p.money - 100 } : p
        );
        setPlayers(updated);
        sounds.playCard();
        addLog(
          `🔮 ${currentPlayer.name} は占いの館で100マニーを支払い、波乱のカードを引きました！`,
          currentPlayer.id,
          'money'
        );

        const card = drawFortuneCard();
        setCurrentEventCard(card);
        setGamePhase('event_card_modal');
        broadcastStateIfHost({
          players: updated,
          currentEventCard: card,
          gamePhase: 'event_card_modal',
        });
      } else {
        addLog(`🔮 ${currentPlayer.name} は占いの館でのカード取得を見送りました。`, currentPlayer.id);
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
      }
    });
  };

  // Resolve Landing Square
  const resolveLandingSquare = (tileId: number, currentPlayersState: Player[]) => {
    const tile = tiles[tileId];
    const player = currentPlayersState[currentPlayerIndex];

    if (tile.type === 'start') {
      if (player.crimeBlueprintCount > 0) {
        sounds.playCard();
        addLog(`🏁 ${player.name} はスタート地点に到着！所持している犯罪計画書を清算できます。`, player.id);
        setGamePhase('start_clearance_prompt');
        broadcastStateIfHost({ gamePhase: 'start_clearance_prompt' });
        return;
      }
      addLog(`🏁 ${player.name} はスタート地点に到着しました。`, player.id);
      setGamePhase('turn_end');
      broadcastStateIfHost({ gamePhase: 'turn_end' });
      return;
    }

    if (tile.type === 'hellowork' || tile.id === 8) {
      if (isBubbleEra) {
        sounds.playCard();
        addLog(
          `⚖️ ${player.name} はバブル期の審判マス【天国と地獄】（元ハローワーク）に到着！運命のサイコロを振ります！`,
          player.id
        );
        setGamePhase('heaven_and_hell_modal');
        broadcastStateIfHost({ gamePhase: 'heaven_and_hell_modal' });
        return;
      }
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

    if (tile.type === 'jail' || tile.id === 24) {
      if (player.crimeBlueprintCount === 5) {
        sounds.playWin();
        sounds.playDiceLand();
        const updatedTiles: Tile[] = tiles.map((t) => {
          if (t.type === 'land') {
            return {
              ...t,
              originalOwnerId: t.originalOwnerId !== undefined ? t.originalOwnerId : (t.ownerId ?? null),
              ownerId: player.id,
            };
          }
          return t;
        });
        setTiles(updatedTiles);
        const updated = currentPlayersState.map((p, idx) =>
          idx === currentPlayerIndex
            ? {
                ...p,
                isPhantomThief: true,
                isWanted: true,
                crimeBlueprintCount: 0,
                hasCrimeBlueprint: false,
              }
            : p
        );
        setPlayers(updated);
        addLog(
          `🎩✨ 【裏技発動！大怪盗モード突入！！】 ${player.name} は犯罪計画書5枚の力で盤上の全土地を一瞬で掌握しました！全土地が ${player.name} の支配下に置かれます！その代わり指名手配され、追われる身となります！`,
          player.id,
          'rankup'
        );
        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updated, tiles: updatedTiles, gamePhase: 'turn_end' });
        return;
      }

      if (player.crimeBlueprintCount > 0) {
        sounds.playBuzzer();
        const count = player.crimeBlueprintCount;
        const updated = currentPlayersState.map((p, idx) =>
          idx === currentPlayerIndex
            ? { ...p, inJail: true, crimeBlueprintCount: 0, hasCrimeBlueprint: false }
            : p
        );
        setPlayers(updated);
        addLog(
          `🚨 【現行犯逮捕！】 ${player.name} は犯罪計画書を所持していたため警察に現行犯逮捕され、牢屋に収監されました！（計画書は没収）`,
          player.id,
          'bankrupt'
        );
        const arrestData: ArrestInfo = {
          type: 'red_handed',
          arrestedPlayer: player,
          confiscatedBlueprints: count,
        };
        setArrestInfo(arrestData);
        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end', arrestInfo: arrestData });
        return;
      }

      sounds.playStep();
      addLog(
        `⛓️ ${player.name} は牢屋マスに立ち寄りました。通常は何の効果もありません。`,
        player.id
      );
      setGamePhase('turn_end');
      broadcastStateIfHost({ gamePhase: 'turn_end' });
      return;
    }

    if (tile.type === 'venue') {
      sounds.playCard();
      addLog(
        `🔮 ${player.name} は【占いの館】に到着しました！100マニーで占いのカードを引くか選択できます。`,
        player.id,
        'event'
      );
      setGamePhase('fortune_hall_prompt');
      broadcastStateIfHost({ gamePhase: 'fortune_hall_prompt' });
      return;
    }

    if (tile.type === 'event') {
      sounds.playCard();
      const card = drawNormalEventCard();
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
        if (player.hasSuperLucky) {
          setGamePhase('super_lucky_modal');
          broadcastStateIfHost({ gamePhase: 'super_lucky_modal' });
          return;
        }
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
          `🛡️ ${player.name} は【支払い免除】カードを発動！ No.${tile.landNumber}「${tile.name}」の支払いが全額免除（0マニー）され、カードを消費しました！`,
          player.id
        );
        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
        return;
      }

      const rentCalculation = calculateLandRent(
        tile,
        tiles,
        activePriceFluctuation ? activePriceFluctuation.multiplier : 1.0,
        isBubbleEra
      );
      let totalRent = rentCalculation.rent;
      let isSurge = false;
      if (owner.hasSurgeRent) {
        totalRent = totalRent * 2;
        isSurge = true;
      }

      let detailMsg = `家賃: ${totalRent}マニー`;
      if (isSurge) detailMsg += ' (💥【支払額上昇】×2倍)';
      if (rentCalculation.isRankedUp) detailMsg += ' (★Lv.2 ランク補正)';
      if (rentCalculation.isMonopolyBonus) detailMsg += ' (👑【エリア独占】×2倍)';
      else if (rentCalculation.isAdjacentBonus) detailMsg += ' (🤝【隣接ボーナス】×1.5倍)';
      if (rentCalculation.isBubbleEra) detailMsg += ' (💎【バブル期】+100M)';
      if (activePriceFluctuation) detailMsg += ` (市場価格変動 ×${activePriceFluctuation.multiplier})`;

      addLog(
        `💸 ${player.name} は ${owner.name} の No.${tile.landNumber}「${tile.name}」に止まりました！ ${detailMsg}`,
        player.id
      );

      if (isSurge) {
        addLog(
          `💥 【支払額上昇】が発動！ ${owner.name} の土地への支払額が2倍になり、効果が消費されました！`,
          owner.id
        );
      }

      if (isBubbleEra) {
        // --- Bubble Era Rent Resolution ---
        const playerCanAfford = player.money >= totalRent;
        let newPlayerMoney = 0;
        let addedPlayerDebt = 0;

        if (playerCanAfford) {
          sounds.playCoin();
          newPlayerMoney = player.money - totalRent;
        } else {
          sounds.playBuzzer();
          const deficit = totalRent - player.money;
          newPlayerMoney = 0;
          addedPlayerDebt = deficit;
        }

        // Full totalRent is granted to owner.
        // If owner is currently in bubble debt, totalRent is used to repay debt, and any difference/excess becomes owner's money!
        const currentOwnerDebt = owner.bubbleDebt || 0;
        let newOwnerDebt = currentOwnerDebt;
        let newOwnerMoney = owner.money;
        let ownerDebtCleared = false;
        let excessMoney = 0;

        if (currentOwnerDebt > 0) {
          if (totalRent >= currentOwnerDebt) {
            excessMoney = totalRent - currentOwnerDebt;
            newOwnerDebt = 0;
            newOwnerMoney = owner.money + excessMoney;
            ownerDebtCleared = true;
          } else {
            newOwnerDebt = currentOwnerDebt - totalRent;
          }
        } else {
          newOwnerMoney = owner.money + totalRent;
        }

        const updated = currentPlayersState.map((p) => {
          if (p.id === player.id) {
            return {
              ...p,
              money: newPlayerMoney,
              position: playerCanAfford ? p.position : 0, // returned to start if debt incurred!
              bubbleDebt: playerCanAfford ? (p.bubbleDebt || 0) : ((p.bubbleDebt || 0) + addedPlayerDebt),
            };
          }
          if (p.id === owner.id) {
            return {
              ...p,
              money: newOwnerMoney,
              bubbleDebt: newOwnerDebt,
              hasSurgeRent: false,
            };
          }
          return p;
        });
        setPlayers(updated);

        if (playerCanAfford) {
          addLog(
            `${player.name} は ${owner.name} に通行料 ${totalRent}マニーを支払いました。`,
            player.id,
            'money'
          );
        } else {
          addLog(
            `⚠️ 【バブル借金発生！】 ${player.name} は ${owner.name} の土地の通行料（${totalRent}M）に対して所持金が不足したため借金状態（+${addedPlayerDebt}M）となり、スタート地点（マス0）へ戻されました！土地所有者 ${owner.name} には通行料 ${totalRent}マニーが全額支給されました。`,
            player.id,
            'bankrupt'
          );
        }

        if (currentOwnerDebt > 0) {
          if (ownerDebtCleared) {
            addLog(
              `✨ 🎊 【借金完済！】 ${owner.name} は土地の通行料収入（+${totalRent}M）により残債 ${currentOwnerDebt}M を全額完済しました！差額の +${excessMoney}M は所持金となり、次ターンからサイコロを振ることができます！`,
              owner.id,
              'money'
            );
          } else {
            addLog(
              `📈 【通行料で借金返済】 ${owner.name} は土地の通行料収入（+${totalRent}M）を借金返済に充当しました。（残債: ${newOwnerDebt}M）`,
              owner.id,
              'money'
            );
          }
        }

        if (checkVictory(updated)) return;

        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updated, gamePhase: 'turn_end' });
        return;
      }

      // --- Non-Bubble Era Rent Resolution ---
      if (player.money >= totalRent) {
        sounds.playCoin();
        const updated = currentPlayersState.map((p) => {
          if (p.id === player.id) return { ...p, money: p.money - totalRent };
          if (p.id === owner.id) return { ...p, money: p.money + totalRent, hasSurgeRent: false };
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
        const updated = currentPlayersState.map((p) => {
          if (p.id === owner.id) return { ...p, hasSurgeRent: false };
          return p;
        });
        setPlayers(updated);
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
          players: updated,
          bankruptcyDebt: debtData,
          gamePhase: 'bankruptcy_modal',
        });
      }
    }
  };

  // Land Contract Action (Buy)
  // Land Contract Action (Buy)
  const handleBuyLand = () => {
    executeOrSendAction('buy_land', {}, () => {
      const tile = tiles[currentPlayer.position];
      if (!tile || tile.type !== 'land' || !tile.cost) return;

      const isSaleActive = realEstateSalePurchasesRemaining > 0;
      const baseCost = tile.cost;
      const contractPrice = isSaleActive ? Math.floor(baseCost / 2) : baseCost;

      if (currentPlayer.money < contractPrice) {
        addLog(`所持金が不足しているため契約できませんでした。`, currentPlayer.id);
        setGamePhase('turn_end');
        broadcastStateIfHost({ gamePhase: 'turn_end' });
        return;
      }

      sounds.playBuy();

      let newSaleRemaining = realEstateSalePurchasesRemaining;
      if (isSaleActive) {
        newSaleRemaining = Math.max(0, realEstateSalePurchasesRemaining - 1);
        setRealEstateSalePurchasesRemaining(newSaleRemaining);
      }

      const updatedPlayers = players.map((p, idx) =>
        idx === currentPlayerIndex ? { ...p, money: p.money - contractPrice } : p
      );
      const updatedTiles = tiles.map((t) =>
        t.id === tile.id ? { ...t, ownerId: currentPlayer.id } : t
      );

      setPlayers(updatedPlayers);
      setTiles(updatedTiles);

      if (isSaleActive) {
        addLog(
          `🎉 ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」を不動産セール半額（${contractPrice}マニー）で契約しました！${
            newSaleRemaining === 0
              ? '（※セール終了）'
              : `（※セール残り${newSaleRemaining}回）`
          }`,
          currentPlayer.id,
          'land'
        );
      } else {
        addLog(
          `🎉 ${currentPlayer.name} は No.${tile.landNumber}「${tile.name}」を ${contractPrice}マニーで契約しました！`,
          currentPlayer.id,
          'land'
        );
      }

      if (isAreaMonopoly(tile.id, updatedTiles)) {
        sounds.playWin();
        addLog(
          `👑 【エリア独占達成！】 ${currentPlayer.name} は対象エリア（全4マス）を独占しました！支払額が2倍になります！`,
          currentPlayer.id,
          'land'
        );
      } else if (isAdjacentLandOwned(tile.id, updatedTiles)) {
        sounds.playBuy();
        addLog(
          `🤝 【隣接ボーナス発生！】 ${currentPlayer.name} は隣接ペアを保有しました！支払額が1.5倍になります！`,
          currentPlayer.id,
          'land'
        );
      }

      let nextIsBubble = isBubbleEra;
      if (!isBubbleEra && areAllLandsContracted(updatedTiles)) {
        nextIsBubble = true;
        setIsBubbleEra(true);
        sounds.playWin();
        addLog(
          `🎆 【バブル期突入！】 すべての土地が契約されました！支払額・給与・イベント収入が+100マニー！牢屋は【天国と地獄】マスへと変化しました！`,
          undefined,
          'rankup'
        );
      }

      setGamePhase('turn_end');
      broadcastStateIfHost({
        players: updatedPlayers,
        tiles: updatedTiles,
        realEstateSalePurchasesRemaining: newSaleRemaining,
        gamePhase: 'turn_end',
        isBubbleEra: nextIsBubble,
      });
    });
  };

  // Super Lucky Roll for Land Contract (opens dramatic modal)
  const handleRollForSuperLucky = () => {
    executeOrSendAction('super_lucky_start', {}, () => {
      setGamePhase('super_lucky_modal');
      broadcastStateIfHost({ gamePhase: 'super_lucky_modal' });
    });
  };

  // Complete Super Lucky Roll after dramatic staging
  const handleSuperLuckyFinish = (roll: number) => {
    executeOrSendAction('super_lucky_finish', { roll }, () => {
      const tile = tiles[currentPlayer.position];
      if (!tile || !tile.cost) return;

      const isSaleActive = realEstateSalePurchasesRemaining > 0;
      const baseCost = isSaleActive ? Math.floor(tile.cost / 2) : tile.cost;
      setCurrentDice(roll);

      let finalCost = 0;
      if (roll === 1) {
        finalCost = baseCost * 2;
        addLog(
          `🎲 【私は豪運！】サイコロ出目は【1】！痛恨の倍額（${finalCost}マニー）で契約！`,
          currentPlayer.id
        );
      } else {
        finalCost = 0;
        addLog(
          `✨ 【私は豪運！】サイコロ出目は【${roll}】！見事【タダ（0マニー）】で契約成立！！`,
          currentPlayer.id
        );
      }

      if (currentPlayer.money < finalCost) {
        addLog(
          `倍額の契約金が払えないため、契約できませんでした…【私は豪運！】カードは消費されました。`,
          currentPlayer.id
        );
        const updatedPlayers = players.map((p, idx) =>
          idx === currentPlayerIndex ? { ...p, hasSuperLucky: false } : p
        );
        setPlayers(updatedPlayers);
        setGamePhase('turn_end');
        broadcastStateIfHost({ players: updatedPlayers, gamePhase: 'turn_end' });
        return;
      }

      addLog(`✨ 【私は豪運！】カードが消費されました。`, currentPlayer.id);

      let newSaleRemaining = realEstateSalePurchasesRemaining;
      if (isSaleActive) {
        newSaleRemaining = Math.max(0, realEstateSalePurchasesRemaining - 1);
        setRealEstateSalePurchasesRemaining(newSaleRemaining);
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

      if (isAreaMonopoly(tile.id, updatedTiles)) {
        sounds.playWin();
        addLog(
          `👑 【エリア独占達成！】 ${currentPlayer.name} は対象エリア（全4マス）を独占しました！支払額が2倍になります！`,
          currentPlayer.id,
          'land'
        );
      } else if (isAdjacentLandOwned(tile.id, updatedTiles)) {
        sounds.playBuy();
        addLog(
          `🤝 【隣接ボーナス発生！】 ${currentPlayer.name} は隣接ペアを保有しました！支払額が1.5倍になります！`,
          currentPlayer.id,
          'land'
        );
      }

      let nextIsBubble = isBubbleEra;
      if (!isBubbleEra && areAllLandsContracted(updatedTiles)) {
        nextIsBubble = true;
        setIsBubbleEra(true);
        sounds.playWin();
        addLog(
          `🎆 【バブル期突入！】 すべての土地が契約されました！支払額・給与・イベント収入が+100マニー！牢屋は【天国と地獄】マスへと変化しました！`,
          undefined,
          'rankup'
        );
      }

      setGamePhase('turn_end');
      broadcastStateIfHost({
        players: updatedPlayers,
        tiles: updatedTiles,
        realEstateSalePurchasesRemaining: newSaleRemaining,
        gamePhase: 'turn_end',
        isBubbleEra: nextIsBubble,
      });
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
    majorDamageTargetPlayerId?: string;
    transferRightsTileId?: number;
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
          const gain = 200 + (isBubbleEra ? 100 : 0);
          player.money += gain;
          addLog(
            `💰 ${player.name} は臨時収入で +${gain}マニー${isBubbleEra ? '（バブル期+100M）' : ''}を獲得！`,
            player.id,
            'money'
          );
          break;
        }
        case 'sudden_expense': {
          sounds.playBuzzer();
          if (player.money < 100) {
            if (isBubbleEra) {
              const deficit = 100 - player.money;
              player.money = 0;
              player.position = 0;
              player.bubbleDebt = (player.bubbleDebt || 0) + deficit;
              addLog(
                `⚠️ 【バブル借金救済！】 ${player.name} は急な出費（100M）が支払えず、スタート地点（マス0）へ戻されました！残債 ${deficit}マニーは毎ターンの支給で返済されます。`,
                player.id,
                'bankrupt'
              );
              break;
            }
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
        case 'crime_blueprint': {
          player.crimeBlueprintCount = Math.min(5, (player.crimeBlueprintCount || 0) + 1);
          player.hasCrimeBlueprint = true;
          sounds.playBuzzer();
          addLog(
            `📑 【犯罪計画書】 ${player.name} は犯罪計画書を手に入れた！（所持数: ${player.crimeBlueprintCount}/5）所持したまま牢屋に止まると現行犯逮捕されます！`,
            player.id
          );
          break;
        }
        case 'turn_evil': {
          player.crimeBlueprintCount = Math.min(5, (player.crimeBlueprintCount || 0) + 2);
          player.hasCrimeBlueprint = true;
          sounds.playBuzzer();
          addLog(
            `😈 【悪に染まる！】 ${player.name} は悪の誘惑に屈し、犯罪計画書を2枚手に入れた！（所持数: ${player.crimeBlueprintCount}/5）`,
            player.id
          );
          break;
        }
        case 'major_damage': {
          if (payload && payload.majorDamageTargetPlayerId && payload.majorDamageTileId !== undefined) {
            const targetPlayer = updatedPlayers.find((p) => p.id === payload.majorDamageTargetPlayerId);
            const targetTile = tiles.find((t) => t.id === payload.majorDamageTileId);
            if (targetPlayer && targetTile) {
              if (payload.majorDamageChoice === 'pay' && targetPlayer.money >= 200) {
                targetPlayer.money -= 200;
                sounds.playCoin();
                addLog(
                  `⚠️ 大損害！ ${targetPlayer.name} は修繕費200マニーを支払い、No.${targetTile.landNumber}「${targetTile.name}」を守りました！`,
                  targetPlayer.id,
                  'money'
                );
              } else {
                sounds.playBuzzer();
                setTiles((prev) =>
                  prev.map((t) =>
                    t.id === targetTile.id ? { ...t, ownerId: null, rank: 0 } : t
                  )
                );
                addLog(
                  `⚠️ 大損害！ ${targetPlayer.name} は200マニーを支払えず、No.${targetTile.landNumber}「${targetTile.name}」を手放し未契約に戻りました！`,
                  targetPlayer.id,
                  'land'
                );
              }
            }
          }
          break;
        }
        case 'lottery': {
          if (payload && payload.lotteryMoney !== undefined) {
            const prize =
              payload.lotteryMoney > 0
                ? payload.lotteryMoney + (isBubbleEra ? 100 : 0)
                : 0;
            player.money += prize;
            addLog(
              `🎫 宝くじ結果: ${player.name} は賞金 ${prize}マニー${
                isBubbleEra && prize > 0 ? '（バブル期+100M）' : ''
              }を獲得！`,
              player.id,
              'money'
            );
          }
          break;
        }
        case 'disaster': {
          sounds.playBuzzer();
          let anyDamaged = false;
          for (const p of updatedPlayers) {
            const ownedCount = tiles.filter((t) => t.ownerId === p.id).length;
            if (ownedCount > 0) {
              const disasterCost = ownedCount * 50;
              p.money = Math.max(0, p.money - disasterCost);
              addLog(
                `⚡ 災害発生！ ${p.name} は所有地${ownedCount}件分の修繕費 ${disasterCost}マニーを支払いました。`,
                p.id,
                'money'
              );
              anyDamaged = true;
            }
          }
          if (!anyDamaged) {
            addLog(`⚡ 災害発生！しかし誰も土地を所有していなかったため被害はありませんでした。`);
          }
          break;
        }
        case 'info_manipulation': {
          player.hasInfoManipulation = true;
          sounds.playWin();
          addLog(
            `🎯 【情報操作】 ${player.name} は次の手番でサイコロの出目を1〜6から自由に選べるようになりました！`,
            player.id
          );
          break;
        }
        case 'surge_rent': {
          player.hasSurgeRent = true;
          sounds.playWin();
          addLog(
            `💥 【支払額上昇】 ${player.name} の土地への支払額が一度だけ2倍になります！`,
            player.id
          );
          break;
        }
        case 'real_estate_sale': {
          setRealEstateSalePurchasesRemaining(3);
          sounds.playWin();
          addLog(
            `🏷️ 【不動産セール】開催！全土地の契約金がすべて半額（50% OFF）になります！（全プレイヤー合計3回の契約まで）`
          );
          broadcastStateIfHost({ realEstateSalePurchasesRemaining: 3 });
          break;
        }
        case 'transfer_rights': {
          if (payload && payload.transferRightsTileId) {
            const targetTile = tiles.find((t) => t.id === payload.transferRightsTileId);
            if (targetTile && targetTile.cost && player.money >= targetTile.cost) {
              const previousOwner = updatedPlayers.find((p) => p.id === targetTile.ownerId);
              player.money -= targetTile.cost;
              sounds.playBuy();

              const updatedTiles = tiles.map((t) =>
                t.id === targetTile.id ? { ...t, ownerId: player.id, rank: 0 } : t
              );
              setTiles(updatedTiles);

              addLog(
                `📜 【権利の譲渡】 ${player.name} は契約金 ${targetTile.cost}マニーを支払い、${previousOwner?.name || '相手'} の No.${targetTile.landNumber}「${targetTile.name}」を購入・権利を獲得しました！（ランクは初期状態に戻ります）`,
                player.id,
                'land'
              );

              if (isAreaMonopoly(targetTile.id, updatedTiles)) {
                sounds.playWin();
                addLog(
                  `👑 【エリア独占達成！】 ${player.name} は対象エリア（全6マス）を独占しました！支払額が2倍になります！`,
                  player.id,
                  'land'
                );
              } else if (isAdjacentLandOwned(targetTile.id, updatedTiles)) {
                sounds.playBuy();
                addLog(
                  `🤝 【隣接ボーナス発生！】 ${player.name} は隣接ペアを保有しました！支払額が1.5倍になります！`,
                  player.id,
                  'land'
                );
              }

              broadcastStateIfHost({ tiles: updatedTiles });
            }
          } else {
            addLog(`📜 ${player.name} は土地の買収を見送りました。`, player.id);
          }
          break;
        }
        case 'feel_good_roll': {
          sounds.playWin();
          addLog(
            `✨ 【なんだか気分がいい！】 ${player.name} は気分爽快！もう一度サイコロを振ることができます！`,
            player.id
          );
          setPlayers(updatedPlayers);
          setGamePhase('waiting_roll');
          broadcastStateIfHost({
            players: updatedPlayers,
            gamePhase: 'waiting_roll',
            currentEventCard: null,
          });
          return;
        }
        case 'slacking_off': {
          const gain = 100 + (isBubbleEra ? 100 : 0);
          player.money += gain;
          player.skipNextTurn = true;
          sounds.playCoin();
          addLog(
            `💤 【次から頑張る】 ${player.name} は${gain}マニー${
              isBubbleEra ? '（バブル期+100M）' : ''
            }を受け取りました！ただし、次の自分のターンは1回休みになります。`,
            player.id,
            'money'
          );
          break;
        }
        case 'drinking_party': {
          sounds.playBuy();
          updatedPlayers = updatedPlayers.map((p) => ({
            ...p,
            position: 16,
            money: Math.max(0, p.money - 50),
          }));
          addLog(
            '🍻 【飲み会をしよう！】 全員が占いの館（マス16）に集合！参加費として全員が50マニーを消費しました！'
          );
          break;
        }
      }

      setPlayers(updatedPlayers);

      if (checkVictory(updatedPlayers)) return;

      // If passing event card confirmation, resume pending movement
      if (pendingMovement) {
        if (player.inJail || player.position !== pendingMovement.currentPos) {
          setPendingMovement(null);
          setGamePhase('turn_end');
          broadcastStateIfHost({
            players: updatedPlayers,
            gamePhase: 'turn_end',
            currentEventCard: null,
          });
        } else {
          resumePendingMovement();
        }
        return;
      }

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

  // Heaven and Hell Tile Resolution
  const handleHeavenAndHellFinish = (result: {
    roll: number;
    moneyDelta?: number;
    uncontractedTileIds?: number[];
    targetOpponentId?: string;
  }) => {
    executeOrSendAction('heaven_and_hell_finish', { result }, () => {
      let updatedPlayers = [...players];
      let updatedTiles = [...tiles];
      const p = updatedPlayers[currentPlayerIndex];

      // Handle uncontracted lands (effects 5 & 6)
      if (result.uncontractedTileIds && result.uncontractedTileIds.length > 0) {
        updatedTiles = updatedTiles.map((t) =>
          result.uncontractedTileIds!.includes(t.id) ? { ...t, ownerId: null, rank: 0 } : t
        );
        setTiles(updatedTiles);
      }

      // Handle moneyDelta (effects 1, 2, 3, 4)
      if (result.moneyDelta) {
        if (result.moneyDelta > 0) {
          p.money += result.moneyDelta;
          sounds.playWin();
          addLog(
            `✨ ⚖️【天国と地獄】出目【${result.roll}】：${p.name} は200マニーを獲得しました！`,
            p.id,
            'money'
          );
        } else {
          const cost = Math.abs(result.moneyDelta);
          if (p.money < cost) {
            sounds.playBuzzer();
            addLog(
              `💀 ⚖️【天国と地獄】出目【${result.roll}】：${p.name} は200マニーを支払えず破産処理に入ります！`,
              p.id,
              'bankrupt'
            );
            const debtData = {
              debtAmount: cost,
              creditorPlayerId: null,
            };
            setBankruptcyDebt(debtData);
            setGamePhase('bankruptcy_modal');
            setPlayers(updatedPlayers);
            broadcastStateIfHost({
              players: updatedPlayers,
              tiles: updatedTiles,
              bankruptcyDebt: debtData,
              gamePhase: 'bankruptcy_modal',
            });
            return;
          } else {
            p.money -= cost;
            sounds.playBuzzer();
            addLog(
              `💀 ⚖️【天国と地獄】出目【${result.roll}】：${p.name} は200マニーを没収されました…`,
              p.id,
              'money'
            );
          }
        }
      } else if (result.roll === 5) {
        sounds.playBuzzer();
        if (result.uncontractedTileIds && result.uncontractedTileIds.length > 0) {
          const names = result.uncontractedTileIds
            .map((id) => {
              const t = tiles.find((tile) => tile.id === id);
              return t ? `No.${t.landNumber}「${t.name}」` : '';
            })
            .filter(Boolean)
            .join('、');
          addLog(
            `💥 ⚖️【天国と地獄】出目【5】：${p.name} の所有地 ${result.uncontractedTileIds.length}件（${names}）が未契約に戻りました！`,
            p.id,
            'land'
          );
        } else {
          addLog(
            `💥 ⚖️【天国と地獄】出目【5】：${p.name} の土地3件が未契約に…しかし土地を1つも持っていなかったため無傷でした！`,
            p.id
          );
        }
      } else if (result.roll === 6) {
        sounds.playWin();
        if (
          result.targetOpponentId &&
          result.uncontractedTileIds &&
          result.uncontractedTileIds.length > 0
        ) {
          const targetOpp = players.find((pl) => pl.id === result.targetOpponentId);
          const names = result.uncontractedTileIds
            .map((id) => {
              const t = tiles.find((tile) => tile.id === id);
              return t ? `No.${t.landNumber}「${t.name}」` : '';
            })
            .filter(Boolean)
            .join('、');
          addLog(
            `⚡ ⚖️【天国と地獄】出目【6】：ライバル失脚！${
              targetOpp?.name || '相手'
            } の所有地 ${result.uncontractedTileIds.length}件（${names}）が未契約に戻りました！`,
            p.id,
            'land'
          );
        } else {
          addLog(
            `⚡ ⚖️【天国と地獄】出目【6】：ライバルの土地を3件未契約化！…しかし誰も土地を所有していませんでした。`,
            p.id
          );
        }
      }

      setPlayers(updatedPlayers);
      if (checkVictory(updatedPlayers)) return;

      setGamePhase('turn_end');
      broadcastStateIfHost({
        players: updatedPlayers,
        tiles: updatedTiles,
        gamePhase: 'turn_end',
      });
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
            position: 8,
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
      } else if (gamePhase === 'jail_turn') {
        const strat = AIHelper.chooseJailStrategy(currentPlayer);
        if (strat === 'escape') {
          handleJailEscape();
        } else {
          handleJailReleaseRoll();
        }
      } else if (gamePhase === 'waiting_roll') {
        if (currentPlayer.hasInfoManipulation) {
          const bestRoll = AIHelper.chooseBestDice(currentPlayer, tiles);
          handleRollDice(bestRoll);
        } else {
          handleRollDice();
        }
      } else if (gamePhase === 'event_card_modal') {
        if (currentEventCard?.type === 'transfer_rights') {
          const landToBuy = AIHelper.selectLandToBuyWithTransferRights(currentPlayer, tiles);
          if (landToBuy) {
            handleEventCardConfirm({ transferRightsTileId: landToBuy.id });
          } else {
            handleEventCardConfirm();
          }
        } else if (currentEventCard?.type === 'price_fluctuation') {
          const roll = Math.floor(Math.random() * 6) + 1;
          const mult = roll % 2 !== 0 ? 2.0 : 0.5;
          handleEventCardConfirm({ diceRoll: roll, fluctuationMultiplier: mult });
        } else if (currentEventCard?.type === 'major_damage') {
          const opponentsWithLands = players.filter(
            (p) => p.id !== currentPlayer.id && tiles.some((t) => t.ownerId === p.id)
          );
          if (opponentsWithLands.length > 0) {
            const opp = opponentsWithLands[Math.floor(Math.random() * opponentsWithLands.length)];
            const oppLands = tiles.filter((t) => t.type === 'land' && t.ownerId === opp.id);
            if (oppLands.length > 0) {
              const oppLand = oppLands[Math.floor(Math.random() * oppLands.length)];
              const choice = opp.money >= 200 ? 'pay' : 'relinquish';
              handleEventCardConfirm({
                majorDamageChoice: choice,
                majorDamageTileId: oppLand.id,
                majorDamageTargetPlayerId: opp.id,
              });
            } else {
              handleEventCardConfirm();
            }
          } else {
            handleEventCardConfirm();
          }
        } else {
          handleEventCardConfirm();
        }
      } else if (gamePhase === 'land_action') {
        const currentTile = tiles[currentPlayer.position];
        if (!currentTile) {
          setGamePhase('turn_end');
          return;
        }

        if (currentTile.ownerId === null) {
          if (currentPlayer.hasSuperLucky) {
            handleRollForSuperLucky();
          } else if (AIHelper.shouldBuyLand(currentPlayer, currentTile, tiles)) {
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
      } else if (gamePhase === 'super_lucky_modal') {
        const roll = Math.floor(Math.random() * 6) + 1;
        setTimeout(() => {
          handleSuperLuckyFinish(roll);
        }, 1600);
      } else if (gamePhase === 'fortune_hall_prompt') {
        const shouldDraw = AIHelper.shouldDrawAtFortuneHall(currentPlayer);
        handleFortuneHallChoice(shouldDraw);
      } else if (gamePhase === 'passing_event_prompt') {
        const shouldDraw = AIHelper.shouldDrawPassingEvent(currentPlayer);
        handlePassingEventChoice(shouldDraw);
      } else if (gamePhase === 'start_clearance_prompt') {
        const shouldClear = AIHelper.shouldClearCrimeBlueprintAtStart(currentPlayer);
        handleStartClearanceChoice(shouldClear);
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
      } else if (gamePhase === 'heaven_and_hell_modal') {
        const roll = Math.floor(Math.random() * 6) + 1;
        let moneyDelta: number | undefined;
        let uncontractedTileIds: number[] | undefined;
        let targetOpponentId: string | undefined;

        if (roll === 1 || roll === 2) {
          moneyDelta = 200;
        } else if (roll === 3 || roll === 4) {
          moneyDelta = -200;
        } else if (roll === 5) {
          const myLands = tiles.filter(
            (t) => t.type === 'land' && t.ownerId === currentPlayer.id
          );
          const shuffled = [...myLands].sort(() => Math.random() - 0.5);
          uncontractedTileIds = shuffled.slice(0, 3).map((t) => t.id);
        } else if (roll === 6) {
          const opponents = players.filter((p) => p.id !== currentPlayer.id);
          const opponentsWithLands = opponents.filter((p) =>
            tiles.some((t) => t.type === 'land' && t.ownerId === p.id)
          );
          if (opponentsWithLands.length > 0) {
            const opp =
              opponentsWithLands[Math.floor(Math.random() * opponentsWithLands.length)];
            targetOpponentId = opp.id;
            const oppLands = tiles.filter(
              (t) => t.type === 'land' && t.ownerId === opp.id
            );
            const shuffled = [...oppLands].sort(() => Math.random() - 0.5);
            uncontractedTileIds = shuffled.slice(0, 3).map((t) => t.id);
          } else {
            uncontractedTileIds = [];
          }
        }

        handleHeavenAndHellFinish({
          roll,
          moneyDelta,
          uncontractedTileIds,
          targetOpponentId,
        });
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

  // Is current player in debug mode?
  const isCurrentPlayerDebug = Boolean(currentPlayer?.name?.includes('デバッグモード'));
  const isDebugActive = Boolean(
    isCurrentPlayerDebug &&
    hasDebugSnapshot &&
    gamePhase !== 'waiting_roll' &&
    gamePhase !== 'setup' &&
    gamePhase !== 'game_over'
  );

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950 text-slate-100 flex flex-col items-center justify-between p-1 sm:p-2 select-none font-sans relative">
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
          onOpenLogs={() => setShowLogModal(true)}
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
            realEstateSalePurchasesRemaining={realEstateSalePurchasesRemaining}
            isBubbleEra={isBubbleEra}
            logs={logs}
            myPlayerId={myPlayerId}
            isOnline={isOnline}
            onRollDice={handleRollDice}
            onSelectTile={(t) => setSelectedTileForDetail(t)}
            onBuyLand={handleBuyLand}
            onSkipBuyLand={handleSkipBuyLand}
            onRankUpLand={handleRankUpLand}
            onSkipRankUp={handleSkipRankUp}
            onFortuneHallChoice={handleFortuneHallChoice}
            onPassingEventChoice={handlePassingEventChoice}
            onStartClearanceChoice={handleStartClearanceChoice}
            onRollForSuperLucky={handleRollForSuperLucky}
            onHelloWorkRoll={handleHelloWorkRoll}
            onJailEscape={handleJailEscape}
            onJailReleaseRoll={() => handleJailReleaseRoll()}
            jailReleaseDice={jailReleaseDice}
            isJailRolling={isJailRolling}
            onConfirmJailRelease={handleConfirmJailRelease}
            isDebugActive={isDebugActive}
            onDebugRewind={handleDebugRewindToBeforeRoll}
            onEndTurn={handleNextTurn}
            onOpenRules={() => setShowRulesModal(true)}
            onOpenLogs={() => setShowLogModal(true)}
          />
        </main>
      )}

      {/* Floating Debug Rewind Button when debug mode is active and dice has been rolled */}
      {isDebugActive && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[100] animate-bounce-subtle pointer-events-auto">
          <button
            type="button"
            onClick={handleDebugRewindToBeforeRoll}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-2xl border-2 border-amber-300 cursor-pointer transition-all"
          >
            <span className="text-base sm:text-lg">⏪</span>
            <span>【デバッグ】サイコロを振る前に戻る</span>
          </button>
        </div>
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
          allPlayers={players}
          allTiles={tiles}
          onConfirm={handleEventCardConfirm}
        />
      )}

      {/* 3.5. Super Lucky Modal (私は豪運！サイコロ演出) */}
      {gamePhase === 'super_lucky_modal' && currentPlayer && tiles[currentPlayer.position] && (
        <SuperLuckyModal
          player={currentPlayer}
          tile={tiles[currentPlayer.position]}
          effectiveCost={
            realEstateSalePurchasesRemaining > 0
              ? Math.floor((tiles[currentPlayer.position].cost || 0) / 2)
              : (tiles[currentPlayer.position].cost || 0)
          }
          isMyTurn={isMyTurn && !currentPlayer.isAi}
          onFinish={handleSuperLuckyFinish}
        />
      )}

      {/* 4. Casino Modal */}
      {showCasinoModal && currentPlayer && (
        <CasinoModal player={currentPlayer} onFinish={handleCasinoFinish} />
      )}

      {/* 4.5. Heaven and Hell Modal (Bubble Era Tile 18) */}
      {gamePhase === 'heaven_and_hell_modal' && currentPlayer && (
        <HeavenAndHellModal
          player={currentPlayer}
          players={players}
          tiles={tiles}
          isMyTurn={isMyTurn}
          onFinish={handleHeavenAndHellFinish}
        />
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

      {/* 5.5. Arrest Presentation Modal (現行犯逮捕 & 指名手配逮捕の特別演出) */}
      {arrestInfo && (
        <ArrestModal
          arrestInfo={arrestInfo}
          onDismiss={() => {
            setArrestInfo(null);
            broadcastStateIfHost({ arrestInfo: null });
          }}
        />
      )}

      {/* 6. Tile Inspection Detail Modal */}
      <TileDetailModal
        tile={selectedTileForDetail}
        players={players}
        allTiles={tiles}
        activePriceFluctuation={activePriceFluctuation}
        isRealEstateSaleActive={realEstateSalePurchasesRemaining > 0}
        isBubbleEra={isBubbleEra}
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

      {/* 9. Game Log History Modal */}
      {showLogModal && (
        <GameLogModal
          logs={logs}
          players={players}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
