import type { Particle, Pin, Vec2 } from '../types';

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');

    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear(): void {
    this.ctx.fillStyle = '#f0f4f8';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawChamber(x: number, y: number, width: number, height: number): void {
    // Draw chamber walls
    this.ctx.strokeStyle = '#2d3748';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(x, y, width, height);

    // Draw inner shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.ctx.fillRect(x, y, width, height);
  }

  drawPin(pin: Pin): void {
    const endX = pin.x + Math.cos(pin.angle) * pin.length;
    const endY = pin.y + Math.sin(pin.angle) * pin.length;

    if (pin.pulled) {
      // Pin has been pulled - show as faded
      this.ctx.globalAlpha = 0.3;
    }

    // Draw pin body
    this.ctx.strokeStyle = pin.hover ? '#f56565' : '#4a5568';
    this.ctx.lineWidth = 8;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(pin.x, pin.y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Draw pin head
    this.ctx.fillStyle = pin.hover ? '#f56565' : '#4a5568';
    this.ctx.beginPath();
    this.ctx.arc(pin.x, pin.y, 6, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pin tip
    this.ctx.beginPath();
    this.ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.globalAlpha = 1;
  }

  drawParticles(particles: Particle[]): void {
    for (const p of particles) {
      if (!p.active) continue;

      this.ctx.beginPath();

      if (p.type === 'water') {
        this.ctx.fillStyle = 'rgba(66, 153, 225, 0.8)';
        this.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      } else if (p.type === 'lava') {
        // Lava with glow effect
        const gradient = this.ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          4
        );
        gradient.addColorStop(0, 'rgba(255, 100, 50, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 50, 0, 0.8)');
        this.ctx.fillStyle = gradient;
        this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      } else if (p.type === 'steam') {
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
        this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      }

      this.ctx.fill();
    }
  }

  drawTreasure(treasure: Vec2, isWon: boolean = false): void {
    // Draw treasure chest
    const size = 30;

    if (isWon) {
      // Draw glow effect when won
      const gradient = this.ctx.createRadialGradient(
        treasure.x,
        treasure.y,
        0,
        treasure.x,
        treasure.y,
        size
      );
      gradient.addColorStop(0, 'rgba(72, 187, 120, 0.5)');
      gradient.addColorStop(1, 'rgba(72, 187, 120, 0)');
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(treasure.x, treasure.y, size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw chest base
    this.ctx.fillStyle = '#d69e2e';
    this.ctx.fillRect(
      treasure.x - size / 2,
      treasure.y - size / 4,
      size,
      size / 2
    );

    // Draw chest lid
    this.ctx.fillStyle = '#b7791f';
    this.ctx.beginPath();
    this.ctx.moveTo(treasure.x - size / 2, treasure.y - size / 4);
    this.ctx.lineTo(treasure.x, treasure.y - size / 2);
    this.ctx.lineTo(treasure.x + size / 2, treasure.y - size / 4);
    this.ctx.fill();

    // Draw lock
    this.ctx.fillStyle = '#2d3748';
    this.ctx.beginPath();
    this.ctx.arc(treasure.x, treasure.y, 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawMessage(message: string, y: number = 100): void {
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Draw shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillText(message, this.width / 2 + 2, y + 2);

    // Draw text
    this.ctx.fillStyle = '#2d3748';
    this.ctx.fillText(message, this.width / 2, y);
  }
}
