import * as Phaser from 'phaser';
import { Block } from '../objects/Block';
import { SaveManager } from '../utils/SaveManager';

export class Spawner {
  private scene: Phaser.Scene;
  private currentBlock: Block | null = null;
  private moveSpeed: number = 3;
  private baseMoveSpeed: number = 3;
  private slowMoMultiplier: number = 1;
  private direction: number = 1;
  private blockWidth: number = 180;
  private blockHeight: number = 50;
  private yPos: number = 100;
  private minX: number = 100;
  private maxX: number;
  private colors = [
    0x33ccff, // Cyan
    0x33ff55, // Bright Green
    0xffbb00, // Gold/Orange
    0xff3366, // Pink/Red
    0xaa33ff, // Purple
    0x0066ff  // Blue
  ];
  private colorIndex = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.maxX = scene.cameras.main.width - 100;
  }

  /** Colour of the block that will spawn after the current one (for the "Next Block" preview). */
  peekNextColor(): number {
    return this.colors[(this.colorIndex + 1) % this.colors.length];
  }

  setSlowMo(multiplier: number) {
    this.slowMoMultiplier = multiplier;
    this.moveSpeed = this.baseMoveSpeed * this.slowMoMultiplier;
  }

  spawnBlock(yOffset: number, difficulty: number): Block {
    this.yPos = yOffset;
    
    const settings = SaveManager.getSettings();
    const isKidsMode = settings.kidsModeEnabled;

    // Scale difficulty. Cap difficulty heavily in Kids Mode.
    const effectiveDifficulty = isKidsMode ? Math.min(difficulty, 1) : difficulty;
    
    this.baseMoveSpeed = Math.min(3 + (effectiveDifficulty * 0.5), isKidsMode ? 4 : 12);
    this.moveSpeed = this.baseMoveSpeed * this.slowMoMultiplier;
    
    // In Kids Mode, keep the block width chunky and easy to stack
    const minWidth = isKidsMode ? 140 : 50;
    const scaledWidth = Math.max(minWidth, this.blockWidth - (effectiveDifficulty * 2));

    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex++;

    const startX = this.direction === 1 ? this.minX : this.maxX;
    this.currentBlock = new Block(this.scene, startX, this.yPos, scaledWidth, this.blockHeight, color);
    
    return this.currentBlock;
  }

  update() {
    if (this.currentBlock && this.currentBlock.body.isStatic) {
      const x = this.currentBlock.body.position.x;
      if (x > this.maxX) {
        this.direction = -1;
      } else if (x < this.minX) {
        this.direction = 1;
      }
      
      const settings = SaveManager.getSettings();
      const speedMult = settings.kidsModeEnabled ? 0.5 : 1.0;
      const currentSpeed = this.moveSpeed * speedMult;
      
      const Matter = (Phaser.Physics.Matter as any).Matter;
      Matter.Body.setPosition(this.currentBlock.body, {
        x: x + (currentSpeed * this.direction),
        y: this.yPos
      });
      this.currentBlock.update();
    }
  }

  dropBlock() {
    if (this.currentBlock) {
      this.currentBlock.drop();
      const dropped = this.currentBlock;
      this.currentBlock = null;
      return dropped;
    }
    return null;
  }

  getCurrentBlock(): Block | null {
    return this.currentBlock;
  }
}
