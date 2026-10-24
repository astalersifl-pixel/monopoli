import { Peer, DataConnection } from 'peerjs';
import { Player, GameSettings, GameStateSync } from '../types/game';

export interface NetworkMessage {
  type:
    | 'JOIN_REQUEST'
    | 'JOIN_ACCEPTED'
    | 'JOIN_REJECTED'
    | 'LOBBY_UPDATE'
    | 'START_GAME'
    | 'PLAYER_ACTION'
    | 'SYNC_STATE'
    | 'CHAT';
  payload?: any;
}

export type NetworkRole = 'host' | 'client' | 'local';

class OnlineManager {
  private peer: Peer | null = null;
  public role: NetworkRole = 'local';
  public roomId: string = '';
  public myPeerId: string = '';
  public connections: Map<string, DataConnection> = new Map();
  public hostConnection: DataConnection | null = null;

  // Callbacks
  public onConnectionOpen?: () => void;
  public onMessageReceived?: (msg: NetworkMessage, fromPeerId: string) => void;
  public onPlayerDisconnected?: (peerId: string) => void;
  public onError?: (err: any) => void;

  /**
   * Initialize Host Peer with a Room Code
   */
  public createRoom(
    roomCode: string,
    onReady: (roomId: string) => void,
    onError: (err: any) => void
  ) {
    this.cleanup();
    this.role = 'host';
    const peerId = `mono-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.roomId = roomCode;
        onReady(roomCode);
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.connections.set(conn.peer, conn);
        });

        conn.on('data', (data) => {
          if (this.onMessageReceived) {
            this.onMessageReceived(data as NetworkMessage, conn.peer);
          }
        });

        conn.on('close', () => {
          this.connections.delete(conn.peer);
          if (this.onPlayerDisconnected) {
            this.onPlayerDisconnected(conn.peer);
          }
        });

        conn.on('error', (err) => {
          console.error('Peer connection error:', err);
        });
      });

      this.peer.on('error', (err) => {
        onError(err);
      });
    } catch (e) {
      onError(e);
    }
  }

  /**
   * Connect to an existing Room Code as Client
   */
  public joinRoom(
    roomCode: string,
    onConnected: () => void,
    onError: (err: any) => void
  ) {
    this.cleanup();
    this.role = 'client';
    this.roomId = roomCode;
    const hostPeerId = `mono-${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    try {
      this.peer = new Peer({
        debug: 1,
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        if (!this.peer) return;

        const conn = this.peer.connect(hostPeerId, {
          reliable: true,
        });

        this.hostConnection = conn;

        conn.on('open', () => {
          onConnected();
        });

        conn.on('data', (data) => {
          if (this.onMessageReceived) {
            this.onMessageReceived(data as NetworkMessage, conn.peer);
          }
        });

        conn.on('close', () => {
          if (this.onPlayerDisconnected) {
            this.onPlayerDisconnected(hostPeerId);
          }
        });

        conn.on('error', (err) => {
          onError(err);
        });
      });

      this.peer.on('error', (err) => {
        onError(err);
      });
    } catch (e) {
      onError(e);
    }
  }

  /**
   * Broadcast message to all connected peers (Host only)
   */
  public broadcast(message: NetworkMessage) {
    if (this.role !== 'host') return;
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  /**
   * Send message to Host (Client only)
   */
  public sendToHost(message: NetworkMessage) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(message);
    }
  }

  /**
   * Cleanup connections
   */
  public cleanup() {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.role = 'local';
    this.roomId = '';
    this.myPeerId = '';
  }
}

export const onlineManager = new OnlineManager();
