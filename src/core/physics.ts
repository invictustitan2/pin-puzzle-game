import type { Vec2, Particle } from '../types';

export class Physics {
  private gravity: number = 0.5;
  private damping: number = 0.98;
  private collisionDamping: number = 0.7;

  update(
    particles: Particle[],
    walls: { x: number; y: number; width: number; height: number }[],
    dt: number
  ): void {
    // Update particle physics
    for (const p of particles) {
      if (!p.active) continue;

      // Apply gravity
      if (p.type === 'water') {
        p.vy += this.gravity * dt;
      } else if (p.type === 'lava') {
        // Lava is more viscous, slower falling
        p.vy += this.gravity * 0.3 * dt;
      } else if (p.type === 'steam') {
        // Steam rises
        p.vy -= 0.3 * dt;
      }

      // Apply velocity
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Apply damping (air resistance)
      p.vx *= this.damping;
      p.vy *= this.damping;

      // Handle wall collisions
      for (const wall of walls) {
        this.handleWallCollision(p, wall);
      }

      // Deactivate steam that goes off screen
      if (p.type === 'steam' && p.y < -10) {
        p.active = false;
      }

      // Deactivate particles that fall too far
      if (p.y > 700) {
        p.active = false;
      }
    }

    // Handle particle-particle interactions
    this.handleParticleInteractions(particles);
  }

  private handleWallCollision(
    p: Particle,
    wall: { x: number; y: number; width: number; height: number }
  ): void {
    const margin = 3;

    // Bottom collision
    if (
      p.y + margin > wall.y + wall.height &&
      p.y - margin < wall.y + wall.height
    ) {
      if (p.x > wall.x && p.x < wall.x + wall.width) {
        p.y = wall.y + wall.height - margin;
        p.vy = -Math.abs(p.vy) * this.collisionDamping;
      }
    }

    // Top collision
    if (p.y - margin < wall.y && p.y + margin > wall.y) {
      if (p.x > wall.x && p.x < wall.x + wall.width) {
        p.y = wall.y + margin;
        p.vy = Math.abs(p.vy) * this.collisionDamping;
      }
    }

    // Left collision
    if (p.x - margin < wall.x && p.x + margin > wall.x) {
      if (p.y > wall.y && p.y < wall.y + wall.height) {
        p.x = wall.x + margin;
        p.vx = Math.abs(p.vx) * this.collisionDamping;
      }
    }

    // Right collision
    if (
      p.x + margin > wall.x + wall.width &&
      p.x - margin < wall.x + wall.width
    ) {
      if (p.y > wall.y && p.y < wall.y + wall.height) {
        p.x = wall.x + wall.width - margin;
        p.vx = -Math.abs(p.vx) * this.collisionDamping;
      }
    }
  }

  private handleParticleInteractions(particles: Particle[]): void {
    // Check for water-lava interactions
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      if (!p1.active) continue;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        if (!p2.active) continue;

        // Check for water-lava collision
        if (
          (p1.type === 'water' && p2.type === 'lava') ||
          (p1.type === 'lava' && p2.type === 'water')
        ) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 6) {
            // Extinguish both particles and create steam
            p1.active = false;
            p2.active = false;

            // Create steam particle
            particles.push({
              x: (p1.x + p2.x) / 2,
              y: (p1.y + p2.y) / 2,
              vx: (Math.random() - 0.5) * 2,
              vy: -2 - Math.random(),
              type: 'steam',
              active: true,
              mass: 0.5,
            });
          }
        }

        // Simple particle repulsion for water-water and lava-lava
        if (
          p1.type === p2.type &&
          (p1.type === 'water' || p1.type === 'lava')
        ) {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 5 && dist > 0) {
            const force = (5 - dist) * 0.1;
            const nx = dx / dist;
            const ny = dy / dist;

            p1.vx -= nx * force;
            p1.vy -= ny * force;
            p2.vx += nx * force;
            p2.vy += ny * force;
          }
        }
      }
    }
  }

  checkTreasureContact(
    particles: Particle[],
    treasure: Vec2,
    radius: number = 15
  ): boolean {
    // Check if any water particle touches the treasure
    for (const p of particles) {
      if (p.active && p.type === 'water') {
        const dx = p.x - treasure.x;
        const dy = p.y - treasure.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          return true;
        }
      }
    }
    return false;
  }

  checkLavaContact(
    particles: Particle[],
    treasure: Vec2,
    radius: number = 15
  ): boolean {
    // Check if any lava particle touches the treasure
    for (const p of particles) {
      if (p.active && p.type === 'lava') {
        const dx = p.x - treasure.x;
        const dy = p.y - treasure.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < radius) {
          return true;
        }
      }
    }
    return false;
  }
}
