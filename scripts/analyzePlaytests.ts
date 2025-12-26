import fs from 'fs/promises';
import path from 'path';

// Define types locally to avoid build/import issues with tsx/ESM
interface LevelSession {
  levelId: number;
  startTime: string;
  completionTime: number | null;
  resetCount: number;
  pinPullSequence: number[];
  success: boolean;
}

interface MetricsExport {
  playerId: string;
  exportTime: string;
  sessions: LevelSession[];
}

interface LevelStats {
  levelId: number;
  attempts: number;
  completions: number;
  totalTime: number;
  totalResets: number;
  dropOffs: number;
}

const RED_FLAGS = {
  completionRate: 0.5, // < 50%
  avgResets: 10, // > 10
  // Time target is dynamic per level, so we'd need level data to check 2x target.
  // For now we'll stick to generic flags we can compute from sessions.
};

const YELLOW_FLAGS = {
  completionRate: 0.7, // < 70%
  avgResets: 7, // > 7
};

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: npm run analyze -- <path-to-json-files...>');
    process.exit(1);
  }

  const levelStats = new Map<number, LevelStats>();
  let totalSessionsProcessed = 0;
  const playerIds = new Set<string>();

  // 1. Ingest Data
  for (const filePath of args) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data: MetricsExport = JSON.parse(content);

      playerIds.add(data.playerId);

      for (const session of data.sessions) {
        totalSessionsProcessed++;
        if (!levelStats.has(session.levelId)) {
          levelStats.set(session.levelId, {
            levelId: session.levelId,
            attempts: 0,
            completions: 0,
            totalTime: 0,
            totalResets: 0,
            dropOffs: 0,
          });
        }

        const stats = levelStats.get(session.levelId)!;
        stats.attempts++;
        stats.totalResets += session.resetCount;

        if (session.success && session.completionTime !== null) {
          stats.completions++;
          stats.totalTime += session.completionTime;
        } else {
          stats.dropOffs++;
        }
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  // 2. Compute Metrics & Identify Flags
  const results = Array.from(levelStats.values())
    .sort((a, b) => a.levelId - b.levelId)
    .map((stats) => {
      const avgTime =
        stats.completions > 0 ? stats.totalTime / stats.completions : 0;
      const avgResets =
        stats.attempts > 0 ? stats.totalResets / stats.attempts : 0;
      const completionRate =
        stats.attempts > 0 ? stats.completions / stats.attempts : 0;
      const dropOffRate =
        stats.attempts > 0 ? stats.dropOffs / stats.attempts : 0;

      const flags: string[] = [];
      if (completionRate < RED_FLAGS.completionRate)
        flags.push('🔴 Low Completion');
      if (avgResets > RED_FLAGS.avgResets) flags.push('🔴 High Resets');

      if (flags.length === 0) {
        if (completionRate < YELLOW_FLAGS.completionRate)
          flags.push('🟡 Medium Completion');
        if (avgResets > YELLOW_FLAGS.avgResets)
          flags.push('🟡 Elevated Resets');
      }

      return {
        levelId: stats.levelId,
        attempts: stats.attempts,
        completions: stats.completions,
        avgTime: avgTime.toFixed(1) + 's',
        avgResets: avgResets.toFixed(1),
        successRate: (completionRate * 100).toFixed(1) + '%',
        flags: flags.join(', '),
      };
    });

  // 3. Console Output
  console.log('\n📊 Playtest Analysis Summary');
  console.log(`Unique Players: ${playerIds.size}`);
  console.log(`Total Level Sessions: ${totalSessionsProcessed}\n`);
  console.table(results);

  // 4. Generate Markdown Report
  const reportPath = path.join(process.cwd(), 'reports');
  await fs.mkdir(reportPath, { recursive: true });

  let mdContent = `# Playtest Analysis Report\n`;
  mdContent += `**Generated**: ${new Date().toLocaleString()}\n`;
  mdContent += `**Players**: ${playerIds.size} | **Sessions**: ${totalSessionsProcessed}\n\n`;

  mdContent += `## Level Performance\n\n`;
  mdContent += `| Level | Attempts | Success Rate | Avg Time | Avg Resets | Flags |\n`;
  mdContent += `|-------|----------|--------------|----------|------------|-------|\n`;

  for (const r of results) {
    mdContent += `| ${r.levelId} | ${r.attempts} | ${r.successRate} | ${r.avgTime} | ${r.avgResets} | ${r.flags} |\n`;
  }

  mdContent += `\n## Recommendations\n`;
  const redLevels = results.filter((r) => r.flags.includes('🔴'));
  const yellowLevels = results.filter((r) => r.flags.includes('🟡'));

  if (redLevels.length > 0) {
    mdContent += `\n### 🚨 Urgent Attention Required (Red Flags)\n`;
    redLevels.forEach((r) => {
      mdContent += `- **Level ${r.levelId}**: ${r.flags}. Consider reducing difficulty or checking for bugs.\n`;
    });
  }

  if (yellowLevels.length > 0) {
    mdContent += `\n### ⚠️ Monitoring Needed (Yellow Flags)\n`;
    yellowLevels.forEach((r) => {
      mdContent += `- **Level ${r.levelId}**: ${r.flags}. Watch for player frustration.\n`;
    });
  }

  if (redLevels.length === 0 && yellowLevels.length === 0) {
    mdContent += `\n✅ All levels performing within target parameters.\n`;
  }

  await fs.writeFile(path.join(reportPath, 'analysis-report.md'), mdContent);
  console.log(`\n📄 Report saved to reports/analysis-report.md`);
}

main().catch(console.error);
