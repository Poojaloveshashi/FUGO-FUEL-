/**
 * Companion App Sync Service
 * Connects this Customer Fuel App (ee2e6063-3db0-4d3c-b767-c5c103cedc79)
 * with the Driver / Fleet Bowser Companion App (4d28260b-2153-449e-8927-36441be4e78c)
 * using Supabase Realtime Channels, BroadcastChannel API, and local storage state.
 */

import { getSupabaseClient } from './supabase';
import { SupabaseOrderRecord, StreamEventLog } from '../types';

export const COMPANION_APP_ID = '4d28260b-2153-449e-8927-36441be4e78c';
export const COMPANION_APP_URL = 'https://ai.studio/apps/4d28260b-2153-449e-8927-36441be4e78c';
export const CURRENT_APP_ID = 'ee2e6063-3db0-4d3c-b767-c5c103cedc79';

const BROADCAST_CHANNEL_NAME = 'fugo_interapp_fleet_sync';
const STORAGE_SYNC_KEY = 'fugo_interapp_latest_event';

export interface InterAppMessage {
  id: string;
  sourceAppId: string;
  targetAppId: string;
  type: 
    | 'PING' 
    | 'PONG' 
    | 'ORDER_CREATED' 
    | 'ORDER_ACCEPTED' 
    | 'DRIVER_LOCATION_UPDATE' 
    | 'STATUS_CHANGE' 
    | 'OTP_VERIFIED' 
    | 'DELIVERY_COMPLETED';
  orderId?: string;
  order?: SupabaseOrderRecord;
  driver_lat?: number;
  driver_lng?: number;
  speed_kmh?: number;
  status?: string;
  message?: string;
  timestamp: number;
}

type SyncListener = (msg: InterAppMessage) => void;

class CompanionSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isCompanionOnline: boolean = false;
  private lastCompanionHeartbeat: number = 0;
  private heartbeatTimer: any = null;
  private supabaseChannel: any = null;

  constructor() {
    this.initBroadcastChannel();
    this.initStorageListener();
    this.initSupabaseRealtime();
    this.startHeartbeat();
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncoming(event.data);
        };
      } catch (err) {
        console.warn('[CompanionSync] BroadcastChannel unsupported or failed:', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_SYNC_KEY && event.newValue) {
          try {
            const data: InterAppMessage = JSON.parse(event.newValue);
            this.handleIncoming(data);
          } catch (e) {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private initSupabaseRealtime() {
    try {
      const client = getSupabaseClient();
      if (client) {
        this.supabaseChannel = client.channel('fleet-bowser-sync', {
          config: { broadcast: { self: false } },
        });

        this.supabaseChannel
          .on('broadcast', { event: 'companion-event' }, (payload: any) => {
            if (payload?.payload) {
              this.handleIncoming(payload.payload);
            }
          })
          .subscribe();
      }
    } catch (e) {
      console.warn('[CompanionSync] Supabase broadcast init warning:', e);
    }
  }

  private handleIncoming(msg: InterAppMessage) {
    if (!msg || typeof msg !== 'object') return;

    // Check if coming from companion app or another tab
    if (msg.sourceAppId === COMPANION_APP_ID || msg.sourceAppId !== CURRENT_APP_ID) {
      this.isCompanionOnline = true;
      this.lastCompanionHeartbeat = Date.now();
    }

    if (msg.type === 'PING') {
      // Respond with PONG
      this.sendPong();
    } else if (msg.type === 'PONG') {
      this.isCompanionOnline = true;
      this.lastCompanionHeartbeat = Date.now();
    }

    // Notify registered listeners
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('[CompanionSync] Listener error', e);
      }
    });
  }

  private startHeartbeat() {
    if (typeof window === 'undefined') return;

    // Send initial ping
    this.sendPing();

    this.heartbeatTimer = setInterval(() => {
      // Check if companion timed out (> 25s without heartbeat)
      if (Date.now() - this.lastCompanionHeartbeat > 25000) {
        this.isCompanionOnline = false;
      }
      this.sendPing();
    }, 10000);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(msg: Omit<InterAppMessage, 'id' | 'sourceAppId' | 'targetAppId' | 'timestamp'>) {
    const fullMsg: InterAppMessage = {
      ...msg,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      sourceAppId: CURRENT_APP_ID,
      targetAppId: COMPANION_APP_ID,
      timestamp: Date.now(),
    };

    // 1. BroadcastChannel API
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(fullMsg);
      } catch (e) {
        // Fallback
      }
    }

    // 2. LocalStorage for cross-tab event triggers
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(fullMsg));
      } catch (e) {
        // Ignore quota/private errors
      }
    }

    // 3. Supabase Realtime broadcast channel
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'companion-event',
          payload: fullMsg,
        });
      } catch (e) {
        // Ignore
      }
    }
  }

  public sendPing() {
    this.broadcast({
      type: 'PING',
      message: `Ping from Customer App (${CURRENT_APP_ID})`,
    });
  }

  public sendPong() {
    this.broadcast({
      type: 'PONG',
      message: `Pong from Customer App (${CURRENT_APP_ID})`,
    });
  }

  public notifyOrderPlaced(order: SupabaseOrderRecord) {
    this.broadcast({
      type: 'ORDER_CREATED',
      orderId: order.id,
      order,
      status: order.status,
      message: `New Customer Order: ${order.fuel_type} (${order.litres}L) at lat:${order.delivery_lat}, lng:${order.delivery_lng}`,
    });
  }

  public isConnected(): boolean {
    return this.isCompanionOnline || (Date.now() - this.lastCompanionHeartbeat < 25000);
  }

  public getLastHeartbeat(): number {
    return this.lastCompanionHeartbeat;
  }

  public openCompanionApp() {
    if (typeof window !== 'undefined') {
      window.open(COMPANION_APP_URL, '_blank', 'noopener,noreferrer');
    }
  }
}

export const companionSync = new CompanionSyncManager();
