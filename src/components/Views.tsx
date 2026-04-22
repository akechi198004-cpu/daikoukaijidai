import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { calculatePrice, calculateTravelDays, generateMarketHint } from '../gameLogic';

export const TravelOverlay = () => {
  const { travelEvents, clearTravelEvents, setView } = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!travelEvents || travelEvents.length === 0) return;

    if (currentIndex < travelEvents.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1200); // Wait 1.2s per event
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        clearTravelEvents();
        setView('port');
      }, 1500); // 1.5s after the last event to clear
      return () => clearTimeout(timer);
    }
  }, [travelEvents, currentIndex, clearTravelEvents, setView]);

  if (!travelEvents || travelEvents.length === 0) return null;

  const currentEvent = travelEvents[Math.min(currentIndex, travelEvents.length - 1)];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all text-[var(--text-dark)]" style={{ padding: '0 20px' }}>
      <div className="bg-[var(--color-parchment)] border-[6px] border-double border-[var(--color-wood-dark)] p-8 flex flex-col items-center justify-center gap-6 max-w-sm w-full animate-in fade-in zoom-in duration-300 mx-auto shadow-2xl">
        <div className="text-4xl">
          {currentEvent.type === 'departure' && '🧭'}
          {currentEvent.type === 'arrival' && '⚓'}
          {currentEvent.type === 'wind' && '💨'}
          {currentEvent.type === 'storm' && '🌩️'}
          {currentEvent.type === 'starvation' && '💀'}
          {currentEvent.type === 'wreckage' && '📦'}
          {currentEvent.type === 'shipwreck' && '🌊'}
        </div>
        <div className="text-xl text-center leading-relaxed font-bold" dangerouslySetInnerHTML={{ __html: currentEvent.message }} />
        <div className="text-xs opacity-50 uppercase tracking-widest mt-4">
          {currentIndex < travelEvents.length ? '航行中...' : '已抵达'}
        </div>
      </div>
    </div>
  );
};

function BuyButton({ productId }: { productId: string }) {
  const { buyProduct } = useGame();
  const [holdStart, setHoldStart] = useState(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.nativeEvent.type !== 'touchstart') return;
    buyProduct(productId, 1);
    setHoldStart(Date.now());
    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    setHoldStart(0);
    if (e.target instanceof HTMLElement && e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    if (!holdStart) return;

    let timer: NodeJS.Timeout;
    const now = Date.now();
    const elapsed = now - holdStart;

    if (elapsed < 400) {
      timer = setTimeout(() => {
        setHoldStart(holdStart - 1);
      }, 400 - elapsed);
    } else {
      timer = setTimeout(() => {
        const success = buyProduct(productId, 10);
        if (success === false) {
           setHoldStart(0);
        }
      }, 100);
    }

    return () => clearTimeout(timer);
  });

  return (
    <button 
      className="retro-btn py-1 px-4 text-xs select-none" 
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
      onContextMenu={(e) => e.preventDefault()}
      style={{ touchAction: 'none' }}
    >
      买
    </button>
  );
}

export const PortView = () => {
  const { currentPort, ports } = useGame();
  
  return (
    <>
      <div className="map-overlay"></div>
      
      <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="400" height="300" viewBox="0 0 400 300" style={{ filter: 'sepia(0.5) opacity(0.8)' }}>
          {/* A simple decorative dotted line mimicking the HTML */}
          <path d="M50,150 Q100,50 200,100 T350,150" fill="none" stroke="var(--color-brass)" strokeWidth="1" strokeDasharray="5,5"/>
          {ports.map((p, i) => (
             <circle key={p.id} cx={`${p.x * 4}`} cy={`${p.y * 3}`} r="4" fill={p.id === currentPort.id ? "var(--color-crimson)" : "var(--color-brass)"}/>
          ))}
        </svg>
      </div>
      
      {ports.map((p) => {
        const isActive = p.id === currentPort.id;
        return (
          <div key={p.id} className={`port-marker ${isActive ? 'active' : ''}`} style={{ top: `${p.y}%`, left: `${p.x}%`, opacity: isActive ? 1 : 0.6 }}>
            <div className="icon"></div>
            <div className="name">{p.name} {isActive ? '(当前)' : ''}</div>
          </div>
        );
      })}
      
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '10px', border: '1px solid var(--color-brass)', borderRadius: '4px', width: '240px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>{currentPort.name}</div>
        <div style={{ fontSize: '11px', opacity: 0.8, lineHeight: 1.4 }}>{currentPort.description}</div>
      </div>
    </>
  );
};

export const MarketView = () => {
  const { products, currentPort, player, buyProduct, sellProduct, buySupplies } = useGame();
  const hint = generateMarketHint(currentPort.id, products);

  return (
    <div className="p-6 h-full flex flex-col absolute inset-0 z-10 bg-[var(--color-parchment)] overflow-auto shadow-inner">
      <div className="panel-title">
        <span>⚖️ 交易所</span>
        <span style={{ fontSize: '12px', opacity: 0.8 }}>当前资金: {player.gold} G</span>
      </div>
      
      <p className="mb-4 text-[#a22c29] font-bold bg-[#e9dec4] p-3 border border-[#c5a059] text-sm">{hint}</p>
      
      <div className="flex-1">
        <table className="market-table">
          <thead>
            <tr>
              <th>商品</th>
              <th>体积</th>
              <th>单价</th>
              <th>持有</th>
              <th>交易操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const price = calculatePrice(p, currentPort.id);
              const isHigh = price > p.basePrice * 1.1;
              const isLow = price < p.basePrice * 0.9;
              const myQty = player.cargo[p.id] || 0;
              return (
                <tr key={p.id}>
                  <td title={p.description}><strong>{p.name}</strong></td>
                  <td>{p.volume}</td>
                  <td className={isHigh ? "price-up" : isLow ? "price-down" : ""}>
                    {price} G {isHigh ? "↑" : isLow ? "↓" : "-"}
                  </td>
                  <td style={{ fontWeight: myQty > 0 ? 'bold' : 'normal', color: myQty > 0 ? 'var(--color-ocean)' : 'inherit' }}>
                    {myQty}
                  </td>
                  <td className="flex gap-2">
                    <BuyButton productId={p.id} />
                    <button className={`retro-btn py-1 px-4 text-xs ${myQty === 0 ? 'btn-disabled' : ''}`} disabled={myQty === 0} onClick={() => sellProduct(p.id, myQty)}>全卖</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 border border-dashed border-[#c5a059] bg-[rgba(0,0,0,0.02)]">
        <div className="font-bold border-b border-[rgba(0,0,0,0.1)] pb-2 mb-2">出航物资</div>
        <div className="flex justify-between items-center">
          <span className="text-sm">航海补给（水和干粮），每份 5G。</span>
          <div className="flex gap-2">
            <button className="retro-btn text-xs" onClick={() => buySupplies(10)}>买10份 (50G)</button>
            <button className="retro-btn text-xs" onClick={() => buySupplies(50)}>买50份 (250G)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TavernView = () => {
  const { currentPort, player, addLog } = useGame();
  
  const handleDrink = () => {
    if (player.gold < 15) return addLog('资金不足，酒保摇了摇头。');
    const r = currentPort.rumors[Math.floor(Math.random() * currentPort.rumors.length)];
    addLog(`花费 <span class="highlight">15 G</span> 请客... 听到了消息：“${r}”`);
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center absolute inset-0 z-10 bg-[var(--color-parchment)] shadow-inner">
      <div className="panel-title w-full justify-center text-xl mb-6">🍺 海风酒馆</div>
      <p className="text-sm opacity-80 max-w-sm mb-8">鱼龙混杂之地，不仅提供麦酒，也是交换最新航海情报的首选地。</p>
      <button className="retro-btn text-sm px-8 py-3" onClick={handleDrink}>
        请全场喝一杯 (15 G)
      </button>
    </div>
  );
};

export const ShipyardView = () => {
  const { player, repairShip, upgradeCapacity } = useGame();
  
  return (
    <div className="p-6 h-full absolute inset-0 z-10 bg-[var(--color-parchment)] shadow-inner">
      <div className="panel-title mb-6">🔨 皇家造船所</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-[var(--color-wood-light)] bg-[rgba(0,0,0,0.03)] flex flex-col">
          <strong className="text-[16px] mb-2">船体修缮</strong>
          <p className="text-sm mb-4">当前耐久：{player.shipDurability} / {player.shipMaxDurability}</p>
          <p className="text-xs opacity-70 mb-4 block flex-1">风浪无情，保持较高的耐久度能降低海难风险。费用以受损程度计算。</p>
          <button className="retro-btn mt-auto" onClick={repairShip}>一键修满</button>
        </div>
        <div className="p-4 border border-[var(--color-wood-light)] bg-[rgba(0,0,0,0.03)] flex flex-col">
          <strong className="text-[16px] mb-2">货仓改造</strong>
          <p className="text-sm mb-4">当前容量上限：{player.cargoCapacity}</p>
          <p className="text-xs opacity-70 mb-4 block flex-1">花钱请工匠优化舱底结构，每次增加 20 点最大仓位。</p>
          <button className="retro-btn mt-auto" onClick={upgradeCapacity}>扩建货仓 (2500 G)</button>
        </div>
      </div>
    </div>
  );
};

export const QuestView = () => {
  const { player, currentPort, acceptQuest, completeQuest, products } = useGame();

  const availableQuests = player.quests.filter(q => q.status === 'available' && q.giverPortId === currentPort.id);
  const acceptedQuests = player.quests.filter(q => q.status === 'accepted');

  return (
    <div className="p-6 h-full absolute inset-0 z-10 bg-[var(--color-parchment)] overflow-auto shadow-inner">
      <div className="panel-title mb-4">📜 地方委托工会</div>
      
      <div className="mb-6">
        <strong className="block mb-2 text-sm opacity-80 border-b border-[var(--color-brass)] pb-1">新委托</strong>
        {availableQuests.length === 0 ? <p className="text-xs opacity-60">目前没有新的委托。</p> : null}
        {availableQuests.map(q => (
          <div key={q.id} className="quest-card flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <strong>{q.title}</strong>
              <span className="text-[#a22c29] font-bold">酬金: {q.rewardGold} G</span>
            </div>
            <p className="text-[11px] mb-2 leading-relaxed">{q.description}</p>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[10px] opacity-80 bg-[rgba(0,0,0,0.05)] px-2 py-1">
                需求: {q.targetAmount}个 {products.find(p=>p.id === q.targetItemId)?.name} → {q.targetPortId} | 期限: 第 {q.deadlineDay} 天
              </span>
              <button className="retro-btn text-[11px] px-3 py-1" onClick={() => acceptQuest(q.id)}>接取委托</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <strong className="block mb-2 text-sm opacity-80 border-b border-[var(--color-brass)] pb-1">进行中的委托</strong>
        {acceptedQuests.length === 0 ? <p className="text-xs opacity-60">船长室暂无已签署的契约。</p> : null}
        {acceptedQuests.map(q => {
          const isLocal = q.targetPortId === currentPort.id;
          return (
            <div key={q.id} className="quest-card flex flex-col border-[var(--color-ocean)] bg-[rgba(27,73,101,0.05)]">
               <div className="flex justify-between items-start mb-2">
                <strong>{q.title}</strong>
                <span className="text-[var(--color-wood-dark)] font-bold">酬金: {q.rewardGold} G</span>
              </div>
              <div className="text-[11px] text-[var(--color-wood-dark)] mb-2">
                目的地: <strong>{q.targetPortId}</strong> | 期限: 第 {q.deadlineDay} 天
              </div>
              <button 
                className={`retro-btn text-[11px] px-3 py-1 self-end ${!isLocal ? 'btn-disabled' : ''}`}
                disabled={!isLocal} 
                onClick={() => completeQuest(q.id)}
              >
                {isLocal ? '交付货物' : '未在指定港口'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const TravelView = () => {
  const { currentPort, ports, sailTo } = useGame();
  const destinations = ports.filter(p => p.id !== currentPort.id);

  return (
    <div className="p-6 h-full absolute inset-0 z-10 bg-[var(--color-parchment)] shadow-inner overflow-auto">
      <div className="panel-title mb-6">🧭 码头 / 航线选择</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinations.map(port => {
          const days = calculateTravelDays(currentPort, port);
          return (
            <div key={port.id} className="p-4 border border-[var(--color-wood-dark)] bg-[rgba(0,0,0,0.02)] flex flex-col gap-2 relative">
              <strong className="text-[16px]">{port.name}</strong>
              <p className="text-[11px] leading-relaxed opacity-80">{port.description}</p>
              <div className="mt-3 flex justify-between items-end border-t border-[rgba(0,0,0,0.05)] pt-2 relative">
                <span className="text-[12px] font-mono text-[var(--color-ocean)] font-bold">航程: {days} 天</span>
                <button className="retro-btn text-xs px-4" onClick={() => sailTo(port.id)}>扬帆起航</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HelpView = () => (
  <div className="p-6 h-full absolute inset-0 z-10 bg-[var(--color-parchment)] shadow-inner overflow-auto">
    <div className="panel-title mb-6">❓ 提督指南</div>
    <div className="flex flex-col gap-4 text-[13px] leading-relaxed">
      <p><strong>1. 贸易入门：</strong> 在交易所中观察“市场传闻”，买入标价便宜的商品，再通过码头出航，将其运往溢价高的港口卖出以赚取差价。</p>
      <p><strong>2. 航路与补给：</strong> 航行需要消耗天数和补给。如果没有补给，船员会叛乱破坏船只。出航前请在交易所的“杂货铺”备齐补给。</p>
      <p><strong>3. 随机事件：</strong> 海上不一定风平浪静。暴风雨会直接消耗你的船只耐久；但如果遇到顺风或者捡到漂流物资，也能大赚一笔。</p>
      <p><strong>4. 沉船危机：</strong> 若船只耐久度归零，你将损失所有货物，并且被强行救回阿斯特港。记得定期去造船所修补！</p>
      <p><strong>5. 委托任务：</strong> 当地公会会发布急需某些物资的任务，按时将货物送达指定港口即可获得比在交易所直卖高得多的利润。</p>
    </div>
  </div>
);
