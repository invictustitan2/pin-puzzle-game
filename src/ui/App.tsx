import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import useMeasure from 'react-use-measure';
import { GameEngine } from '../core/engine';
import type { GameState } from '../types';
import { GameCanvas } from './GameCanvas';

// Types for UI props
interface HUDProps {
    gameState: GameState;
    onReset: () => void;
    onMenu: () => void;
    isCompact: boolean;
}

const HUD: React.FC<HUDProps> = ({ gameState, onReset, onMenu, isCompact }) => {
    const pillStyle: React.CSSProperties = {
        pointerEvents: 'auto',
        padding: isCompact ? '6px 12px' : '8px 16px',
        borderRadius: 20,
        fontWeight: 'bold',
        fontSize: isCompact ? '0.8rem' : '1rem'
    };

    const btnStyle: React.CSSProperties = {
        ...pillStyle,
        cursor: 'pointer'
    };

    return (
        <div style={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            display: 'flex', 
            gap: 10, 
            pointerEvents: 'none',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            width: '100%' // Ensure it doesn't overflow
        }}>
            <div className="stat-pill" style={pillStyle}>
                ⏱️ {Math.floor((Date.now() - gameState.levelStartTime) / 1000)}s
            </div>
            <div className="stat-pill" style={pillStyle}>
               🔄 {gameState.resets}
            </div>
             <button onClick={onReset} className="glossy-btn" style={btnStyle}>
                Reset
            </button>
             <button onClick={onMenu} className="glossy-btn" style={{ ...btnStyle, filter: 'hue-rotate(45deg)' }}>
                Menu
            </button>
        </div>
    );
};

export const App: React.FC = () => {
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [inMenu, setInMenu] = useState(true);
  
  // Measure window/container to adjust UI density
  const [ref, bounds] = useMeasure();
  const isCompact = bounds.width < 500;

  const handleStateChange = useCallback((state: GameState) => {
    setGameState({ ...state });
  }, []);

  const startLevel = (levelId: number) => {
    if (engine) {
        engine.loadLevel(levelId);
        engine.start();
        setInMenu(false);
    }
  };

  return (
    <div className="app-container" ref={ref} style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      
      {/* Game Layer - Responsive Container */}
      <div className="game-wrapper" style={{ 
          position: 'relative', 
          zIndex: 1, 
          boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: '800px', // Max internal res width
          aspectRatio: '4/3', // Enforce aspect ratio
          maxHeight: '100vh' // Don't overflow height
      }}>
        <GameCanvas 
            onEngineInit={setEngine} 
            onStateChange={handleStateChange} 
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="ui-layer" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        
        {/* Main Menu */}
        <AnimatePresence>
            {inMenu && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)', pointerEvents: 'auto' }}
                >
                    <div className="menu-card" style={{ padding: isCompact ? 20 : 40, textAlign: 'center', width: '90%', maxWidth: 400 }}>
                        <h1 style={{ fontSize: isCompact ? '2.5rem' : '3.5rem', marginBottom: 20, background: 'linear-gradient(to bottom, #ffd700, #b7791f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 2px 0px rgba(0,0,0,0.3))' }}>Pin Puzzle</h1>
                        <h3 style={{color: '#718096', marginBottom: 20}}>Select a Level</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))', gap: 15, justifyItems: 'center' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => startLevel(i + 1)}
                                    className="glossy-btn"
                                    style={{ width: 60, height: 60, borderRadius: 16, cursor: 'pointer', fontSize: '1.5rem' }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* HUD */}
        {!inMenu && gameState && (
            <HUD 
                gameState={gameState} 
                onReset={() => engine?.reset()} 
                onMenu={() => setInMenu(true)} 
                isCompact={isCompact}
            />
        )}

      </div>
    </div>
  );
};
