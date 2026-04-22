export type ViewState = 'port' | 'market' | 'tavern' | 'shipyard' | 'quests' | 'travel' | 'help';

export interface Port {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  priceModifiers: Record<string, number>;
  rumors: string[];
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  volume: number;
  description: string;
}

export type QuestStatus = 'available' | 'accepted' | 'completed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  giverPortId: string;
  targetPortId: string;
  targetItemId: string;
  targetAmount: number;
  rewardGold: number;
  deadlineDay: number;
  status: QuestStatus;
}

export interface PlayerState {
  name: string;
  gold: number;
  day: number;
  currentPortId: string;
  shipDurability: number;
  shipMaxDurability: number;
  cargoCapacity: number;
  supplies: number;
  cargo: Record<string, number>;
  quests: Quest[];
}

export interface TravelEvent {
  day: number;
  type: 'wind' | 'storm' | 'wreckage' | 'starvation' | 'arrival' | 'shipwreck' | 'departure';
  message: string;
}
