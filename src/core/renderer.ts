import type { Monster, Particle, Pin, Vec2 } from '../types';
import { AssetManager } from './AssetManager';

export interface VisualEffect {
  x: number;
  y: number;
  type: 'sparkle' | 'steam' | 'splash';
  age: number;
  maxAge: number;
}

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly assetManager: AssetManager;

  constructor(canvas: HTMLCanvasElement, assetManager: AssetManager) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.assetManager = assetManager;
  }

  clear(): void {
    // console.log('[Renderer] Clearing canvas'); // Commented out to avoid spam, but can enable if needed
    // Draw tiled background if available
    const bg = this.assetManager.getImage('background');
    if (bg) {
      const pattern = this.ctx.createPattern(bg, 'repeat');
      if (pattern) {
        this.ctx.fillStyle = pattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
        return;
      }
    }
    this.ctx.fillStyle = '#f0f4f8';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawChamber(x: number, y: number, width: number, height: number): void {
    // 1. Draw chamber background (darker)
    this.ctx.fillStyle = 'rgba(20, 20, 30, 0.7)';
    this.ctx.fillRect(x, y, width, height);

    // 2. Draw Inner Shadow (gradient)
    const shadowSize = 15;
    const gradient = this.ctx.createLinearGradient(x, y, x, y + shadowSize);
    gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, shadowSize);

    // 3. Draw Thick Stone Border
    this.ctx.lineWidth = 12;
    // Outer border (highlight/bevel logic simplified to stroke for now, but textured later)
    this.ctx.strokeStyle = '#4A5568'; // Stone gray
    this.ctx.strokeRect(x - 6, y - 6, width + 12, height + 12);

    // 4. Inner metallic rim
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = '#2d3748'; // Darker inner rim
    this.ctx.strokeRect(x, y, width, height);
  }

  drawPin(pin: Pin): void {
    const endX = pin.x + Math.cos(pin.angle) * pin.length;
    const endY = pin.y + Math.sin(pin.angle) * pin.length;

    if (pin.pulled) return;

    const pinAtlas = this.assetManager.getImage('pins');

    if (pinAtlas) {
      // Save context state
      this.ctx.save();

      // Translate to pin position and rotate
      this.ctx.translate(pin.x, pin.y);
      this.ctx.rotate(pin.angle);

      // Draw Rod (Item 1 in sprite sheet - assume top)
      // Atlas likely 3 rows.
      const h = pinAtlas.height / 3;

      // Draw Rod
      // Stretch rod middle? Simplified: Draw rod sprite scaled to length.
      // Source: x:0, y:0, w:width, h:h
      // Dest: x:0, y:-10, w:length, h:20
      this.ctx.drawImage(
        pinAtlas,
        0,
        0,
        pinAtlas.width,
        h,
        0,
        -10,
        pin.length,
        20
      );

      // Draw Head (Item 2 or 3 - Handle)
      // Let's use Item 2 (Heart) for now. y = h
      // Center the handle at 0,0 (start point)
      const handleSize = 40;
      this.ctx.drawImage(
        pinAtlas,
        0,
        h,
        pinAtlas.width,
        h,
        -handleSize / 2,
        -handleSize / 2,
        handleSize,
        handleSize
      );

      this.ctx.restore();
    } else {
      // Draw pin body (Gold)
      this.ctx.strokeStyle = '#ECC94B'; // Gold
      this.ctx.lineWidth = 12;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(pin.x, pin.y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Highlight
      this.ctx.strokeStyle = '#FFFFF0'; // White highlight
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.moveTo(pin.x, pin.y - 2);
      this.ctx.lineTo(endX, endY - 2);
      this.ctx.stroke();

      // Draw pin head (Handle)
      this.ctx.fillStyle = '#D69E2E'; // Darker Gold
      this.ctx.beginPath();
      this.ctx.arc(pin.x, pin.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = 1;
  }

  drawParticles(particles: Particle[]): void {
    const liquidAtlas = this.assetManager.getImage('liquids');

    // Render settings
    this.ctx.globalCompositeOperation = 'screen';

    for (const p of particles) {
      if (!p.active) continue;

      if (liquidAtlas) {
        // The atlas is likely a 2x2 grid.
        // We need to carefully select the sub-rectangle to avoid bleeding edges.
        // Assuming 256x256 total image, 128x128 cells.
        // We'll take a smaller inner rect to be safe, e.g., 100x100 centered in the 128x128 cell.

        const cellWidth = liquidAtlas.width / 2;
        const cellHeight = liquidAtlas.height / 2;

        let sx = 0,
          sy = 0;
        // Map types to quadrants
        if (p.type === 'water') {
          sx = 0;
          sy = 0;
        } // Top-left
        else if (p.type === 'lava') {
          sx = cellWidth;
          sy = 0;
        } // Top-right
        else {
          sx = 0;
          sy = cellHeight;
        } // Bottom-left (Steam/Gas)

        // Draw
        const size = 32; // Slightly larger for glow overlap
        this.ctx.drawImage(
          liquidAtlas,
          sx,
          sy,
          cellWidth,
          cellHeight,
          p.x - size / 2,
          p.y - size / 2,
          size,
          size
        );
      } else {
        // Fallback drawing
        this.ctx.beginPath();
        if (p.type === 'water') {
          this.ctx.fillStyle = '#4299e1';
          this.ctx.shadowBlur = 5;
          this.ctx.shadowColor = '#4299e1';
        } else if (p.type === 'lava') {
          this.ctx.fillStyle = '#e53e3e';
          this.ctx.shadowBlur = 5;
          this.ctx.shadowColor = '#e53e3e';
        } else this.ctx.fillStyle = '#a0aec0';

        this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }

  drawMonsters(monsters: Monster[]): void {
    if (!monsters) return;
    const charsAtlas = this.assetManager.getImage('characters');

    for (const m of monsters) {
      if (!m.active) continue;

      if (charsAtlas) {
        // Prompt asked for: 1. Hedgehog, 2. Slime, 3. Saw.
        // Assume 2x2 grid again.
        let sx = 0,
          sy = 0;
        if (m.type === 'blob') {
          sx = 128;
          sy = 0;
        } // Slime (Item 2)
        else {
          sx = 0;
          sy = 0;
        } // Default hedgehog?

        const size = 32;
        this.ctx.drawImage(
          charsAtlas,
          sx,
          sy,
          128,
          128,
          m.x - size / 2,
          m.y - size / 2,
          size,
          size
        );
      } else {
        // Fallback
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  // Keep drawTreasure and drawMessage/Effects largely the same for now, or update
  drawTreasure(treasure: Vec2, isWon: boolean = false): void {
    const itemAtlas = this.assetManager.getImage('items');
    const size = 64; // Larger size for sprite

    if (isWon) {
      // Glow effect
      const gradient = this.ctx.createRadialGradient(
        treasure.x,
        treasure.y,
        0,
        treasure.x,
        treasure.y,
        size
      );
      gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(treasure.x, treasure.y, size * 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (itemAtlas) {
      // Assuming 3x3 grid based on generation prompt (3 items per row)
      const cols = 3;
      const rows = 3;
      const cellW = itemAtlas.width / cols;
      const cellH = itemAtlas.height / rows;

      // Row 0: Chests. Col 0: Closed, Col 1: Ajar, Col 2: Open/Full
      let col = 0;
      const row = 0;

      if (isWon) {
        col = 2; // Full chest
      } else {
        col = 0; // Closed chest
      }

      this.ctx.drawImage(
        itemAtlas,
        col * cellW,
        row * cellH,
        cellW,
        cellH,
        treasure.x - size / 2,
        treasure.y - size / 2,
        size,
        size
      );
    } else {
      // Fallback
      this.ctx.fillStyle = '#d69e2e';
      this.ctx.fillRect(treasure.x - 15, treasure.y - 15, 30, 30);
    }
  }

  drawMessage(message: string, y: number = 100): void {
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillText(message, this.width / 2 + 2, y + 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(message, this.width / 2, y);
  }

  drawEffects(effects: VisualEffect[]): void {
    for (const effect of effects) {
      // ... existing simple effects ...
      const alpha = 1 - effect.age / effect.maxAge;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(effect.x, effect.y, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }
}
