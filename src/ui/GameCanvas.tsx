import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../core/engine';
import type { GameState } from '../types';

interface GameCanvasProps {
  onEngineInit: (engine: GameEngine) => void;
  onStateChange: (state: GameState) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ onEngineInit, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const engine = new GameEngine(canvasRef.current);
      
      // Wire up updates
      engine.onStateChange = (state) => {
        onStateChange(state);
      };

      onEngineInit(engine);

      // Start the engine
      engine.start();

      return () => {
        engine.stop();
      };
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      id="game-canvas" 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'block', // Removes bottom gap
        borderRadius: '12px',
        background: 'white',
        touchAction: 'none' // DISABLING DEFAULT TOUCH ACTIONS IS CRITICAL FOR MOBILE GAMES
      }}
    />
  );
};
