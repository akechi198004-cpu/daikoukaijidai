import React from 'react';
import { useGame } from '../contexts/GameContext';

export const TopBar = () => {
  const { player, currentPort, usedCapacity } = useGame();
  
  return (
    <header className="retro-header">
      <div className="title-group">
        <span className="game-title">《碧海商途》 AZURE VOYAGE</span>
        <span className="game-subtitle">在风与浪之间，以胆识换取黄金与名望</span>
      </div>
      
      <div className="stats-bar hidden md:flex">
        <div className="stat-item">
          <span className="stat-label">金币:</span>
          <span className="stat-value" style={{ color: '#ffd700' }}>{player.gold.toLocaleString()} G</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">补给:</span>
          <span className="stat-value">{player.supplies}/{player.cargoCapacity}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">耐久:</span>
          <span className="stat-value">{player.shipDurability}%</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">航行日:</span>
          <span className="stat-value">第 {player.day} 天</span>
        </div>
      </div>
    </header>
  );
};

export const SideMenu = () => {
  const { view, setView, currentPort, player, usedCapacity } = useGame();

  const menuItems = [
    { id: 'port', label: '⚓ 港口总览' },
    { id: 'market', label: '⚖️ 交易所' },
    { id: 'tavern', label: '🍺 酒馆情报' },
    { id: 'shipyard', label: '🔨 造船所' },
    { id: 'quests', label: '📜 承接委托' },
    { id: 'travel', label: '🧭 出航起锚' },
    { id: 'help', label: '❓ 提督指南' },
  ];

  return (
    <>
      <div className="flex justify-between items-center font-bold border-b-2 border-[var(--brass)] pb-2 mb-4 font-serif text-[var(--text-gold)]">
        <span>港口导航</span>
        <span style={{ fontSize: '11px', opacity: 0.8 }} className="font-mono">仓位: {usedCapacity}/{player.cargoCapacity}</span>
      </div>
      
      {/* We emulate the sidebar items via this action menu logic to keep with the theme UI reference */}
      <div className="grid grid-cols-2 gap-2 mt-auto">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`retro-btn ${view === item.id ? 'retro-btn-active' : ''}`}
            onClick={() => setView(item.id as any)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

export const LogBox = () => {
  const { logs } = useGame();
  
  return (
    <div className="footer-log">
      {logs.map((log, idx) => (
        <div key={idx} className="log-entry">
          <span className="log-msg" dangerouslySetInnerHTML={{ __html: log }} />
        </div>
      ))}
    </div>
  );
};
