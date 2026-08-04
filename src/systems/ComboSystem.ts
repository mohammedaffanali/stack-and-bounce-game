export class ComboSystem {
  private combo: number = 0;
  private comboMultiplier: number = 1;
  private static readonly TIERS = [2, 3, 5, 10];

  increaseCombo(): void {
    this.combo++;
    this.updateMultiplier();
  }

  resetCombo(): void {
    this.combo = 0;
    this.comboMultiplier = 1;
  }

  private updateMultiplier(): void {
    if (this.combo >= 10) this.comboMultiplier = 10;
    else if (this.combo >= 5) this.comboMultiplier = 5;
    else if (this.combo >= 3) this.comboMultiplier = 3;
    else if (this.combo >= 2) this.comboMultiplier = 2;
    else this.comboMultiplier = 1;
  }

  getCombo(): number {
    return this.combo;
  }

  getMultiplier(): number {
    return this.comboMultiplier;
  }

  /** 0..1 progress from the current tier toward the next combo tier (for the rainbow bar). */
  getProgressToNextTier(): number {
    const tiers = ComboSystem.TIERS;
    let prev = 0;
    for (const tier of tiers) {
      if (this.combo < tier) {
        const raw = (this.combo - prev) / (tier - prev);
        return Math.max(0, Math.min(1, raw));
      }
      prev = tier;
    }
    return 1; // maxed out
  }
}
