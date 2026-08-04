import { SaveManager } from '../utils/SaveManager';

export class ScoreSystem {
  private currentScore: number = 0;
  private highScore: number = 0;

  constructor() {
    this.highScore = SaveManager.getHighScore();
  }

  addScore(points: number): void {
    this.currentScore += points;
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      SaveManager.setHighScore(this.highScore);
    }
  }

  getScore(): number {
    return this.currentScore;
  }

  getHighScore(): number {
    return this.highScore;
  }

  reset(): void {
    this.currentScore = 0;
  }
}
