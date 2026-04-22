import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PlayerState, ViewState, Port, Product, Quest, TravelEvent } from '../types';
import { INITIAL_PLAYER, PORTS, PRODUCTS } from '../data';
import { calculatePrice, calculateTravelDays, getUsedCapacity } from '../gameLogic';

interface GameContextType {
  player: PlayerState;
  logs: string[];
  view: ViewState;
  ports: Port[];
  products: Product[];
  currentPort: Port;
  usedCapacity: number;
  travelEvents: TravelEvent[] | null;
  addLog: (msg: string) => void;
  setView: (v: ViewState) => void;
  clearTravelEvents: () => void;
  buyProduct: (itemId: string, qty: number) => boolean;
  sellProduct: (itemId: string, qty: number) => void;
  buySupplies: (qty: number) => void;
  sailTo: (targetPortId: string) => void;
  repairShip: () => void;
  upgradeCapacity: () => void;
  acceptQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [logs, setLogs] = useState<string[]>([
    '[12:05] 航行第 13 天：遭遇顺风，航行速度提升，补给消耗降低。',
    '[14:10] 已到达 米拉多港。码头工人们正在卸货。'
  ]);
  const [view, setView] = useState<ViewState>('port');
  const [travelEvents, setTravelEvents] = useState<TravelEvent[] | null>(null);

  const clearTravelEvents = () => setTravelEvents(null);

  const addLog = (msg: string) => {
    const time = new Date().toTimeString().substring(0, 5);
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const currentPort = PORTS.find(p => p.id === player.currentPortId)!;
  const usedCapacity = getUsedCapacity(player.cargo, PRODUCTS);

  const buyProduct = (itemId: string, qty: number): boolean => {
    const prod = PRODUCTS.find(p => p.id === itemId)!;
    const price = calculatePrice(prod, currentPort.id);
    const cost = price * qty;
    const volumeNeeded = prod.volume * qty;

    if (player.gold < cost) {
      addLog('金钱不足！');
      return false;
    }
    if (usedCapacity + volumeNeeded > player.cargoCapacity) {
      addLog('货仓容量不足！');
      return false;
    }

    setPlayer(p => ({
      ...p,
      gold: p.gold - cost,
      cargo: { ...p.cargo, [itemId]: (p.cargo[itemId] || 0) + qty }
    }));
    addLog(`购入 ${qty} 单位 ${prod.name}，支出 <span class="highlight">${cost} G</span>。`);
    return true;
  };

  const sellProduct = (itemId: string, qty: number) => {
    const prod = PRODUCTS.find(p => p.id === itemId)!;
    const currentQty = player.cargo[itemId] || 0;
    if (currentQty < qty) return addLog('货物余量不足！');

    const price = calculatePrice(prod, currentPort.id);
    const revenue = price * qty;

    setPlayer(p => {
      const newCargo = { ...p.cargo };
      newCargo[itemId] -= qty;
      if (newCargo[itemId] === 0) delete newCargo[itemId];
      return { ...p, gold: p.gold + revenue, cargo: newCargo };
    });
    addLog(`在交易所卖出 ${qty} 单位 ${prod.name}，获利 <span class="highlight">${revenue} G</span>。`);
  };

  const buySupplies = (qty: number) => {
    const pricePerSupply = 5;
    const cost = pricePerSupply * qty;
    if (player.gold < cost) return addLog('金钱不足以购买补给！');
    if (player.supplies + qty > player.cargoCapacity) return addLog('补给堆满了货仓！');
    
    setPlayer(p => ({ ...p, gold: p.gold - cost, supplies: p.supplies + qty }));
    addLog(`花费 <span class="highlight">${cost} G</span> 取得了 ${qty} 份航海补给。`);
  };

  const sailTo = (targetPortId: string) => {
    const targetPort = PORTS.find(p => p.id === targetPortId)!;
    const daysNeeded = calculateTravelDays(currentPort, targetPort);
    
    let currentDurability = player.shipDurability;
    let currentSupplies = player.supplies;
    let currentGold = player.gold;
    
    const events: TravelEvent[] = [];
    events.push({
      day: player.day,
      type: 'departure',
      message: `从 <span class="highlight">${currentPort.name}</span> 出发，目的地：${targetPort.name}。`
    });
    addLog(`从 <span class="highlight">${currentPort.name}</span> 出发，目的地：${targetPort.name}。`);
    
    // 每日结算
    for (let i = 0; i < daysNeeded; i++) {
      if (currentSupplies > 0) {
        currentSupplies -= 1;
      } else {
        currentDurability -= 5;
        events.push({
           day: player.day + i,
           type: 'starvation',
           message: `航行第 ${player.day + i} 天：补给见底，船员哗变损伤了船只！`
        });
      }

      if (Math.random() < 0.15) {
        const rand = Math.random();
        if (rand < 0.4) {
          currentSupplies++;
          events.push({
             day: player.day + i,
             type: 'wind',
             message: `航行第 ${player.day + i} 天：遭遇顺风，航行速度提升，补给消耗降低。`
          });
        } else if (rand < 0.7) {
          currentDurability -= 10;
          events.push({
             day: player.day + i,
             type: 'storm',
             message: `航行第 ${player.day + i} 天：遭遇暴风雨，船只结构受损！`
          });
        } else {
          currentGold += 100;
          events.push({
             day: player.day + i,
             type: 'wreckage',
             message: `航行第 ${player.day + i} 天：打捞到漂浮物资，获得 <span class="highlight">100 G</span>。`
          });
        }
      }
    }

    if (currentDurability <= 0) {
      events.push({
         day: player.day + daysNeeded,
         type: 'shipwreck',
         message: `由于船只耐久耗尽，你在航程中遭遇了海难... 被商船救回了阿斯特港。`
      });
      events.forEach(e => addLog(e.message));
      setPlayer({ ...INITIAL_PLAYER, gold: Math.floor(currentGold / 2) });
      setTravelEvents(events);
      // Wait for UI to deal with clearing travelEvents to go to port view
      return;
    }

    events.push({
       day: player.day + daysNeeded,
       type: 'arrival',
       message: `已到达 <span class="highlight">${targetPort.name}</span>。码头工人们正在卸货。`
    });

    // Record only non-departure events into logs that happened on the way
    events.filter(e => e.type !== 'departure').forEach(e => addLog(e.message));

    setPlayer(p => ({
      ...p,
      currentPortId: targetPort.id,
      day: p.day + daysNeeded,
      supplies: currentSupplies,
      shipDurability: currentDurability,
      gold: currentGold
    }));
    
    setTravelEvents(events);
  };

  const repairShip = () => {
    const damage = player.shipMaxDurability - player.shipDurability;
    if (damage <= 0) return addLog('船只完好无损，不需要修理。');
    const cost = damage * 20; // 20G per durability point
    if (player.gold < cost) return addLog('资金不足，无法全额支付修缮费。');
    setPlayer(p => ({ ...p, gold: p.gold - cost, shipDurability: p.shipMaxDurability }));
    addLog(`船只修理完毕，消耗 <span class="highlight">${cost} G</span>，耐久恢复至 100%。`);
  };

  const upgradeCapacity = () => {
    const cost = 2500;
    if (player.gold < cost) return addLog(`需要支付 <span class="highlight">${cost} G</span> 改造费！`);
    setPlayer(p => ({ ...p, gold: p.gold - cost, cargoCapacity: p.cargoCapacity + 20 }));
    addLog(`船坞工匠完成了改造！总仓位增加了 20，消耗 <span class="highlight">${cost} G</span>。`);
  };

  const acceptQuest = (questId: string) => {
    setPlayer(p => {
      const qs = p.quests.map(q => q.id === questId ? { ...q, status: 'accepted' as const } : q);
      return { ...p, quests: qs };
    });
    addLog('接取了新委托，签署了契约。');
  };

  const completeQuest = (questId: string) => {
    const quest = player.quests.find(q => q.id === questId);
    if (!quest) return;
    
    if (quest.targetPortId !== currentPort.id) return addLog('交货地点不匹配，委托人不在本港。');
    const haveAmount = player.cargo[quest.targetItemId] || 0;
    if (haveAmount < quest.targetAmount) return addLog(`数量不足！你缺乏目标物资。`);
    if (player.day > quest.deadlineDay) return addLog('已逾期... 委托方拒绝支付。');

    setPlayer(p => {
      const newCargo = { ...p.cargo };
      newCargo[quest.targetItemId] -= quest.targetAmount;
      if (newCargo[quest.targetItemId] === 0) delete newCargo[quest.targetItemId];
      
      const qs = p.quests.map(q => q.id === questId ? { ...q, status: 'completed' as const } : q);
      return { ...p, cargo: newCargo, gold: p.gold + quest.rewardGold, quests: qs };
    });
    addLog(`完成了委托【${quest.title}】，获得酬金 <span class="highlight">${quest.rewardGold} G</span>！`);
  };

  return (
    <GameContext.Provider value={{
      player, logs, view, ports: PORTS, products: PRODUCTS, currentPort, usedCapacity,
      addLog, setView, buyProduct, sellProduct, buySupplies, sailTo, repairShip, upgradeCapacity, acceptQuest, completeQuest
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
