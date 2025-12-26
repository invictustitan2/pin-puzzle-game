import Matter from 'matter-js';
import type { Monster, Particle, Pin, Vec2 } from '../types';

export class PhysicsWorld {
  public engine: Matter.Engine;
  public world: Matter.World;

  // Mapping game IDs to Matter Bodies
  private bodies: Map<number, Matter.Body> = new Map();
  private pinBodies: Map<number, Matter.Body> = new Map();
  private particles: Map<number, Matter.Body> = new Map();
  private monsterBodies: Map<number, Matter.Body> = new Map();

  // Clean up references
  constructor() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // Configure gravity
    this.engine.gravity.y = 1.0;

    // Collision handling
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // Check for Water + Lava
        if (
          (bodyA.label === 'water' && bodyB.label === 'lava') ||
          (bodyA.label === 'lava' && bodyB.label === 'water')
        ) {
          // Store for processing (don't mutate inside step ideally, but Matter handles it usually)
          // We'll mark them for conversion
          bodyA.plugin = { remove: true, type: bodyA.label };
          bodyB.plugin = { remove: true, type: bodyB.label };
        }
      });
    });
  }

  public update(dt: number): void {
    // Matter.js recommends fixed timestep usually, but we'll use dt correction
    // dt comes in 'frames' (approx 16ms normalized). Matter.Engine.update takes ms
    // So 1 frame = 16.666ms
    Matter.Engine.update(this.engine, dt * 16.666);
  }

  public clear(): void {
    Matter.World.clear(this.world, false);
    this.bodies.clear();
    this.pinBodies.clear();
    this.particles.clear();
    this.monsterBodies.clear();
  }

  public addWall(x: number, y: number, width: number, height: number): void {
    const wall = Matter.Bodies.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      {
        isStatic: true,
        friction: 0.5,
        render: { visible: false },
      }
    );
    Matter.World.add(this.world, wall);
  }

  public addPin(pin: Pin): void {
    // Pins are kinematic: they block things but can be moved manually
    // For now we treat them as static bodies that we remove when pulled
    const length = pin.length || 200; // Default if missing

    // Create a thin rectangle for the pin
    // Adjust position: Matter.js uses center of mass, but our data uses start point (head)
    // We need to calculate the center point based on length and angle.
    const angle = pin.angle || 0;
    const centerX = pin.x + (length / 2) * Math.cos(angle);
    const centerY = pin.y + (length / 2) * Math.sin(angle);

    const pinBody = Matter.Bodies.rectangle(centerX, centerY, length, 10, {
      isStatic: true,
      angle: angle,
      friction: 0.1,
      label: `pin-${pin.id}`,
    });

    this.pinBodies.set(pin.id, pinBody);
    Matter.World.add(this.world, pinBody);
  }

  public addMonster(monster: Monster): void {
    const radius = 15; // Visual size for monster
    const body = Matter.Bodies.circle(monster.x, monster.y, radius, {
      restitution: 0.2, // Less bouncy
      friction: 0.1,
      label: 'monster',
    });
    this.monsterBodies.set(monster.id, body);
    Matter.World.add(this.world, body);
  }

  // Get monster position
  public getMonsterPosition(id: number): Vec2 | null {
    const body = this.monsterBodies.get(id);
    if (!body) return null;
    return { x: body.position.x, y: body.position.y };
  }

  public removePin(id: number): void {
    const body = this.pinBodies.get(id);
    if (body) {
      Matter.World.remove(this.world, body);
      this.pinBodies.delete(id);
    }
  }

  public addParticle(
    id: number,
    x: number,
    y: number,
    type: 'water' | 'lava' | 'gas' | 'steam'
  ): void {
    // Create fluid particle
    const radius = 4; // Visual size is usually small

    const particle = Matter.Bodies.circle(x, y, radius, {
      friction: 0.05,
      restitution: 0.5, // Bouncy
      density: type === 'water' ? 0.001 : type === 'lava' ? 0.002 : 0.0005,
      frictionAir: type === 'gas' || type === 'steam' ? 0.05 : 0.01, // Gas floats/drifts logic needed in update potentially, or negative gravity?
      // Matter.js gravity is global. For gas/steam we might need to apply force in update loop.
      render: {
        fillStyle:
          type === 'water'
            ? '#4299e1'
            : type === 'lava'
              ? '#e53e3e'
              : type === 'gas'
                ? '#a0aec0'
                : '#e2e8f0',
      },
      label: type,
      collisionFilter: {
        group: type === 'water' ? 1 : 2, // Allow self-collision? Yes.
      },
    });

    // We mapping by an index or ID?
    // Engine generates particles. We need to track them to sync back positions.
    // We'll use the array index from the engine as the ID for now.
    this.particles.set(id, particle);
    Matter.World.add(this.world, particle);
  }

  public removeParticle(id: number): void {
    const body = this.particles.get(id);
    if (body) {
      Matter.World.remove(this.world, body);
      this.particles.delete(id);
    }
  }

  // Get position back for rendering
  public getParticlePosition(id: number): Vec2 | null {
    const body = this.particles.get(id);
    if (!body) return null;
    return { x: body.position.x, y: body.position.y };
  }

  public setTreasure(_pos: Vec2): void {
    // Just store it if needed for physics-based sensing, or rely on external checks.
    // For now, engine checks contact manually using positions.
  }

  public checkTreasureContact(_particles: Particle[], treasure: Vec2): boolean {
    // Using simpler check for now if I don't want to use the unused 'particles' arg yet
    // or actually use it if my logic relies on the external list.
    // The parameter 'particles' was used in the legacy check.
    // If I want to be cleaner:
    const radius = 15;
    // We can iterate the physics bodies directly and ignore the passed 'particles' array
    // to avoid the unused var warning, OR use it.
    // Since the method signature expects it, let's just prefix it if we don't use it,
    // but wait, I am iterating `this.particles` (the Map of bodies), NOT the argument `particles`.
    // That explains the warning!
    return this.checkContact(treasure, radius, 'water');
  }

  private checkContact(target: Vec2, radius: number, type: string): boolean {
    let touched = false;
    this.particles.forEach((body) => {
      if (body.label === type) {
        const dx = body.position.x - target.x;
        const dy = body.position.y - target.y;
        if (dx * dx + dy * dy < radius * radius) touched = true;
      }
    });
    return touched;
  }

  public getAndClearFluidCollisions(): Vec2[] {
    const interactionPoints: Vec2[] = [];
    const bodiesToRemove: number[] = [];

    // Scan for marked bodies
    this.particles.forEach((body, id) => {
      // Using 'plugin' property as a temp tag
      if (body.plugin && body.plugin.remove) {
        interactionPoints.push({ x: body.position.x, y: body.position.y });
        bodiesToRemove.push(id);
      }
    });

    // Remove them
    bodiesToRemove.forEach((id) => this.removeParticle(id));

    return interactionPoints;
  }

  public checkLavaContact(_particles: Particle[], treasure: Vec2): boolean {
    return this.checkContact(treasure, 15, 'lava');
  }

  public checkMonsterContact(_monsters: Monster[], treasure: Vec2): boolean {
    const radius = 20;
    let touched = false;
    this.monsterBodies.forEach((body) => {
      const dx = body.position.x - treasure.x;
      const dy = body.position.y - treasure.y;
      if (dx * dx + dy * dy < radius * radius) touched = true;
    });
    return touched;
  }
}
