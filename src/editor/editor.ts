import { Renderer } from '../core/renderer';
import { LevelData, Pin } from '../types';

export class Editor {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private currentLevel: LevelData;
  private isRunning: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);

    // Initialize with blank level
    this.currentLevel = {
      id: 999,
      title: 'New Level',
      description: 'Created with Editor',
      pins: [],
      chambers: [],
      monsters: [],
      treasure: { x: 400, y: 550 },
      targetTime: 60,
    };

    this.initUI();
    this.setupInputHandlers();
    this.loop();
  }

  private currentTool:
    | 'select'
    | 'pin'
    | 'water'
    | 'lava'
    | 'wall'
    | 'gas'
    | 'monster' = 'select';

  private setupInputHandlers() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  private handleClick(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.currentTool === 'pin') {
      this.currentLevel.pins.push({
        id: Date.now(),
        x,
        y,
        angle: 0,
        length: 200,
      });
    } else if (
      this.currentTool === 'water' ||
      this.currentTool === 'lava' ||
      this.currentTool === 'gas'
    ) {
      this.currentLevel.chambers.push({
        x: x - 50,
        y: y - 50,
        width: 100,
        height: 100,
        type: this.currentTool,
        particleCount: 50,
      });
    } else if (this.currentTool === 'wall') {
      this.currentLevel.chambers.push({
        x: x - 50,
        y: y - 10,
        width: 100,
        height: 20,
        type: 'empty',
        particleCount: 0,
      });
    } else if (this.currentTool === 'monster') {
      if (!this.currentLevel.monsters) this.currentLevel.monsters = [];
      this.currentLevel.monsters.push({
        id: Date.now(),
        x,
        y,
        type: 'blob', // Default monster type
      });
    }
  }

  private handleMouseMove(_e: MouseEvent) {
    // Hover logic will go here
  }

  private initUI() {
    const container = document.createElement('div');
    container.id = 'editor-toolbar';
    container.style.position = 'absolute';
    container.style.top = '10px';
    container.style.left = '10px';
    container.style.display = 'flex';
    container.style.gap = '10px';
    container.style.background = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';

    const tools = [
      'select',
      'pin',
      'water',
      'lava',
      'wall',
      'gas',
      'monster',
    ] as const;

    tools.forEach((tool) => {
      const btn = document.createElement('button');
      btn.textContent = tool.toUpperCase();
      btn.style.padding = '5px 10px';
      btn.style.cursor = 'pointer';
      btn.onclick = () => {
        this.currentTool = tool;
        // Visual feedback
        Array.from(container.children).forEach(
          (c) => ((c as HTMLElement).style.background = '')
        );
        btn.style.background = '#e2e8f0';
      };
      container.appendChild(btn);
    });

    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'EXPORT';
    exportBtn.style.background = '#48bb78';
    exportBtn.style.color = 'white';
    exportBtn.style.padding = '5px 10px';
    exportBtn.style.cursor = 'pointer';
    exportBtn.onclick = () => {
      try {
        const data = JSON.stringify(this.currentLevel);
        // Simple Base64 encoding for "compression"
        const encoded = btoa(data);
        navigator.clipboard.writeText(encoded).then(() => {
          alert('Level code copied to clipboard! Share it with friends.');
        });
      } catch (e) {
        console.error('Export failed', e);
        alert('Export failed. Check console.');
      }
    };
    container.appendChild(exportBtn);

    document.body.appendChild(container);
  }

  private loop() {
    if (!this.isRunning) return;

    this.render();
    requestAnimationFrame(() => this.loop());
  }

  private render() {
    this.renderer.clear();

    // Draw chambers
    for (const chamber of this.currentLevel.chambers) {
      this.renderer.drawChamber(
        chamber.x,
        chamber.y,
        chamber.width,
        chamber.height
      );
    }

    // Draw pins - Convert PinData to Pin for renderer
    for (const pinData of this.currentLevel.pins) {
      const pin: Pin = {
        ...pinData,
        pulled: false,
        hover: false,
      };
      this.renderer.drawPin(pin);
    }

    // Draw monsters
    if (this.currentLevel.monsters) {
      // Create temporary Monster objects for rendering (add active/vx/vy)
      const monsters = this.currentLevel.monsters.map((m) => ({
        ...m,
        active: true,
        vx: 0,
        vy: 0,
      }));
      this.renderer.drawMonsters(monsters);
    }

    this.renderer.drawTreasure(this.currentLevel.treasure, false);

    // Overlay Editor Status
    this.renderer.drawMessage('EDITOR MODE', 50);
  }
}
