export interface GameStats {
  gamesPlayed: number;
  bestCombo: number;
  totalBlocksStacked: number;
}

export class SaveManager {
  private static readonly HIGH_SCORE_KEY = 'stack_bounce_high_score';
  private static readonly SETTINGS_KEY = 'stack_bounce_settings';
  private static readonly LEADERBOARD_KEY = 'stack_bounce_leaderboard';
  private static readonly STATS_KEY = 'stack_bounce_stats';
  private static readonly MAX_LEADERBOARD_ENTRIES = 5;

  static getHighScore(): number {
    const score = localStorage.getItem(this.HIGH_SCORE_KEY);
    return score ? parseInt(score, 10) : 0;
  }

  static setHighScore(score: number): void {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
    }
  }

  static getSettings(): { soundEnabled: boolean; musicEnabled: boolean; kidsModeEnabled: boolean } {
    const settings = localStorage.getItem(this.SETTINGS_KEY);
    return settings ? { kidsModeEnabled: false, ...JSON.parse(settings) } : { soundEnabled: true, musicEnabled: true, kidsModeEnabled: false };
  }

  static saveSettings(settings: { soundEnabled: boolean; musicEnabled: boolean; kidsModeEnabled: boolean }): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  static getLeaderboard(): number[] {
    const data = localStorage.getItem(this.LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  }

  static addScoreToLeaderboard(score: number): void {
    const board = this.getLeaderboard();
    board.push(score);
    board.sort((a, b) => b - a);
    localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(board.slice(0, this.MAX_LEADERBOARD_ENTRIES)));
  }

  static getStats(): GameStats {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : { gamesPlayed: 0, bestCombo: 0, totalBlocksStacked: 0 };
  }

  static recordGameEnd(combo: number, blocksStacked: number): GameStats {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.bestCombo = Math.max(stats.bestCombo, combo);
    stats.totalBlocksStacked += blocksStacked;
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    return stats;
  }
}
