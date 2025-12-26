import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LevelData {
  id: number;
  title: string;
  description: string;
  pins: any[];
  chambers: any[];
  monsters?: any[];
  treasure: { x: number; y: number };
  targetTime: number;
}

const outputPath = path.resolve(__dirname, '../data/levels.json');
const existingLevels: LevelData[] = JSON.parse(
  fs.readFileSync(outputPath, 'utf-8')
);

// We start from the last ID + 1
let startId = existingLevels[existingLevels.length - 1].id + 1;
const TARGET_TOTAL_LEVELS = 60; // Let's go for 60 to be safe

const templates = ['simple_drop', 'split_path', 'monster_guard', 'gas_chamber'];

function generateLevel(id: number): LevelData {
  const template = templates[Math.floor(Math.random() * templates.length)];
  const level: LevelData = {
    id,
    title: `Level ${id}: Challenge ${id - 31}`,
    description: `Procedurally generated challenge (${template})`,
    targetTime: 60 + Math.floor(Math.random() * 60),
    pins: [],
    chambers: [],
    monsters: [],
    treasure: { x: 400, y: 550 },
  };

  switch (template) {
    case 'simple_drop':
      level.pins.push({
        id: 1,
        x: 400,
        y: 200 + Math.random() * 100,
        angle: 1.57,
        length: 100,
      });
      level.chambers.push({
        x: 350,
        y: 100,
        width: 100,
        height: 100,
        type: 'water',
        particleCount: 50 + Math.floor(Math.random() * 50),
      });
      if (Math.random() > 0.5) {
        level.chambers.push({
          x: 200,
          y: 300,
          width: 100,
          height: 100,
          type: 'lava',
          particleCount: 30,
        });
      }
      break;

    case 'split_path':
      level.pins.push(
        { id: 1, x: 300, y: 200, angle: 1.57, length: 80 },
        { id: 2, x: 500, y: 200, angle: 1.57, length: 80 }
      );
      level.chambers.push(
        {
          x: 250,
          y: 100,
          width: 100,
          height: 80,
          type: 'water',
          particleCount: 40,
        },
        {
          x: 450,
          y: 100,
          width: 100,
          height: 80,
          type: Math.random() > 0.5 ? 'water' : 'lava',
          particleCount: 40,
        }
      );
      break;

    case 'monster_guard':
      level.pins.push({
        id: 1,
        x: 400,
        y: 300,
        angle: 0,
        length: 120,
      });
      level.chambers.push({
        x: 350,
        y: 50,
        width: 100,
        height: 100,
        type: 'water',
        particleCount: 60,
      });
      level.monsters?.push({
        id: 1,
        x: 200 + Math.random() * 400,
        y: 200 + Math.random() * 100,
        type: 'blob',
      });
      break;

    case 'gas_chamber':
      level.pins.push({
        id: 1,
        x: 400,
        y: 300,
        angle: 1.57,
        length: 100,
      });
      level.chambers.push({
        x: 350,
        y: 400,
        width: 100,
        height: 80,
        type: 'gas',
        particleCount: 40,
      });
      level.chambers.push({
        x: 350,
        y: 100,
        width: 100,
        height: 80,
        type: 'water',
        particleCount: 40,
      });
      break;
  }

  return level;
}

console.log(
  `Generating levels from ID ${startId} to ${TARGET_TOTAL_LEVELS}...`
);

for (let i = startId; i <= TARGET_TOTAL_LEVELS; i++) {
  existingLevels.push(generateLevel(i));
}

fs.writeFileSync(outputPath, JSON.stringify(existingLevels, null, 2));
console.log(`Successfully generated ${TARGET_TOTAL_LEVELS} total levels!`);
