import React from 'react';
import { GameProvider, useGame } from './contexts/GameContext';
import { TopBar, SideMenu, LogBox } from './components/UIComponents';
import { PortView, MarketView, TavernView, ShipyardView, QuestView, TravelView, HelpView, TravelOverlay } from './components/Views';

const AppContent = () => {
  const { view } = useGame();

  const renderView = () => {
    switch (view) {
      case 'market': return <MarketView />;
      case 'tavern': return <TavernView />;
      case 'shipyard': return <ShipyardView />;
      case 'quests': return <QuestView />;
      case 'travel': return <TravelView />;
      case 'help': return <HelpView />;
      default: return (
        <div className="w-full h-full flex items-center justify-center text-[var(--text-dark)] opacity-60 italic font-serif text-lg">
          请从右侧选择要前往的目的地或设施。
        </div>
      );
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center p-0 md:p-4 bg-black">
      <div className="app-container w-full h-full max-w-7xl max-h-[900px] flex flex-col">
        
        {/* Top/Header */}
        <TopBar />

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 relative border-b-4 border-[var(--brass)]">
          
          {/* Left Column (Graphics + View) */}
          <div className="flex-[3] flex flex-col relative border-r-4 border-[var(--brass)] bg-[var(--wood-dark)]">
            
            {/* Top Scene / Map Area */}
            <div className="h-[45%] relative border-b-4 border-[var(--brass)] bg-[#0b1d3a] overflow-hidden">
               <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <div className="bg-gradient-to-r from-[#030914] to-transparent bg-opacity-80 px-6 py-2 border-l-4 border-[var(--brass-light)] text-[var(--text-light)]">
                      <h1 className="text-2xl font-bold tracking-widest text-[#ebb860] drop-shadow-md">碧海商途</h1>
                      <p className="text-xs opacity-80 mt-1">在风与浪之间，以胆识换取黄金与名望</p>
                  </div>
               </div>
               {/* PortView acts as the persistent top landscape/map */}
               <PortView />
            </div>

            {/* Bottom active view Area */}
            <div className="h-[55%] relative select-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-[color:var(--parchment)] text-[var(--text-dark)]">
              {/* Inner parchment framing */}
              <div className="absolute inset-2 border-2 border-[#bfa27a] pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"></div>
              {renderView()}
            </div>

          </div>
          
          {/* Right Column (Sidebar) */}
          <div className="flex-[1] bg-[var(--panel-blue)] bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] p-4 flex flex-col relative z-20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
            <SideMenu />
          </div>

          <TravelOverlay />
        </div>

        {/* Footer Log */}
        <LogBox />

      </div>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
