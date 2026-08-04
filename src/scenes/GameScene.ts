import * as Phaser from 'phaser';
import { Platform } from '../objects/Platform';
import { Block } from '../objects/Block';
import { Spawner } from '../systems/Spawner';
import { ScoreSystem } from '../systems/ScoreSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { CameraEffects } from '../systems/CameraEffects';
import { ParticleManager } from '../systems/ParticleManager';
import { AudioManager } from '../systems/AudioManager';
import { UIManager } from '../ui/UIManager';
import { SaveManager } from '../utils/SaveManager';
import { BackgroundHelper } from '../utils/BackgroundHelper';

export class GameScene extends Phaser.Scene {
  private platform!: Platform;
  private spawner!: Spawner;
  private scoreSystem!: ScoreSystem;
  private comboSystem!: ComboSystem;
  private cameraEffects!: CameraEffects;
  private particleManager!: ParticleManager;
  private audioManager!: AudioManager;

  private blocks: Block[] = [];
  private currentSpawnY: number = 0;
  private cameraTargetY: number = 0;
  
  private difficulty: number = 0;
  private isGameOver: boolean = false;

  private lastBlock: Block | null = null;
  private perfectThreshold: number = 15;
  private deathLineY: number = 0;

  // Power-ups
  private magnetCount: number = 3;
  private shieldCount: number = 2;
  private slowMoCount: number = 3;
  private magnetArmed: boolean = false;
  private slowMoActive: boolean = false;

  // Stability meter, 0-100.
  private stability: number = 100;

  // Kids Mode Accessibility
  private kidsModeEnabled: boolean = false;
  private guideLineGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super('GameScene');
  }

  create() {
    this.isGameOver = false;
    this.blocks = [];
    this.difficulty = 0;
    this.magnetCount = 3;
    this.shieldCount = 2;
    this.slowMoCount = 3;
    this.magnetArmed = false;
    this.slowMoActive = false;
    this.stability = 100;

    // Load Kids Mode setting
    const settings = SaveManager.getSettings();
    this.kidsModeEnabled = settings.kidsModeEnabled;

    const { width, height } = this.cameras.main;

    // Systems
    this.scoreSystem = new ScoreSystem();
    this.comboSystem = new ComboSystem();
    this.cameraEffects = new CameraEffects(this.cameras.main);
    this.particleManager = new ParticleManager(this);
    this.audioManager = new AudioManager(this);
    this.spawner = new Spawner(this);

    // Guide graphics for Kids Mode dotted trajectory line
    this.guideLineGraphics = this.add.graphics();

    // Draw the beautiful sunset skyline background
    BackgroundHelper.drawSceneBackground(this, width, height);

    // Initial Platform - beautiful 3D glowing stone base pedestal
    const platformY = height - 60;
    this.platform = new Platform(this, width / 2, platformY, 300, 100);
    
    this.currentSpawnY = platformY - 200;
    this.cameraTargetY = 0;

    // Death line
    this.deathLineY = height;
    
    // UI Scene
    this.scene.launch('UIManager');
    const uiScene = this.scene.get('UIManager') as UIManager;
    uiScene.events.on('magnetTapped', this.activateMagnet, this);
    uiScene.events.on('slowMoTapped', this.activateSlowMo, this);
    this.events.once('shutdown', () => {
      uiScene.events.off('magnetTapped', this.activateMagnet, this);
      uiScene.events.off('slowMoTapped', this.activateSlowMo, this);
    });

    // Input
    this.input.on('pointerdown', this.handleInput, this);
    
    // Matter events
    this.matter.world.on('collisionstart', this.handleCollision, this);

    uiScene.events.once('create', () => {
      this.spawnNextBlock();
      uiScene.updatePowerups(this.magnetCount, this.shieldCount, this.slowMoCount);
      uiScene.updateStability(this.stability);
    });
  }

  onKidsModeToggled(enabled: boolean) {
    this.kidsModeEnabled = enabled;
    if (enabled) {
      this.stability = 100;
      const uiScene = this.scene.get('UIManager') as UIManager;
      if (uiScene) {
        uiScene.updateStability(100);
        uiScene.updatePowerups(this.magnetCount, this.shieldCount, this.slowMoCount);
      }
    }
  }

  private handleInput(pointer: Phaser.Input.Pointer) {
    if (this.isGameOver) return;

    // Ignore taps inside HUD icons or buttons
    const pauseBtnX = this.cameras.main.width - 40;
    const pauseBtnY = 40;
    if (Phaser.Math.Distance.Between(pointer.x, pointer.y, pauseBtnX, pauseBtnY) < 28) {
      return;
    }
    
    // Left-side column HUD items
    if (pointer.x < 120 && pointer.y > 100) {
      return;
    }

    if (this.scene.isPaused()) return;

    const dropped = this.spawner.dropBlock();
    if (dropped) {
      this.blocks.push(dropped);
      this.spawnNextBlock();
    }
  }

  private spawnNextBlock() {
    let highestLandedY = this.platform.body.position.y;
    let unlandedCount = 0;

    this.blocks.forEach(b => {
      if (b.isLanded && b.body.position.y < highestLandedY) {
        highestLandedY = b.body.position.y;
      }
      if (!b.isLanded) {
        unlandedCount++;
      }
    });

    this.currentSpawnY = highestLandedY - 300 - (unlandedCount * 60);
    
    if (this.currentSpawnY < this.cameras.main.scrollY + 200) {
      this.cameraTargetY = this.currentSpawnY - 200;
      this.cameraEffects.smoothFollow(this.cameraTargetY);
      this.deathLineY = highestLandedY + 400;
    }

    this.spawner.spawnBlock(this.currentSpawnY, this.difficulty);
    this.difficulty += 0.1;

    const uiScene = this.scene.get('UIManager') as UIManager;
    if (uiScene) uiScene.updateNextBlockPreview(this.spawner.peekNextColor());
  }

  private handleCollision(event: MatterJS.IEventCollision<MatterJS.Engine>) {
    if (this.isGameOver) return;

    event.pairs.forEach((pair) => {
      let bodyA = pair.bodyA as any;
      let bodyB = pair.bodyB as any;

      if (bodyA.parent) bodyA = bodyA.parent;
      if (bodyB.parent) bodyB = bodyB.parent;

      const blockA = (bodyA as any).blockRef;
      const blockB = (bodyB as any).blockRef;
      
      const newlyLanded = (blockA && !blockA.isLanded) ? blockA : ((blockB && !blockB.isLanded) ? blockB : null);
      const targetBody = (newlyLanded === blockA) ? bodyB : bodyA;

      if (newlyLanded && targetBody) {
        if (newlyLanded.isLanded) return;
        newlyLanded.isLanded = true;
        this.processLanding(newlyLanded, targetBody as MatterJS.BodyType);
      }
    });
  }

  private processLanding(landedBlock: Block, targetBody: MatterJS.BodyType) {
    const isPlatform = (targetBody as any).isPlatform;
    
    let targetX = 0;
    if (isPlatform) {
      targetX = this.platform.body.position.x;
    } else {
      const prevBlock = (targetBody as any).blockRef;
      targetX = prevBlock ? prevBlock.body.position.x : targetBody.position.x;
    }

    let offsetX = Math.abs(landedBlock.body.position.x - targetX);

    // In Kids Mode, every landed block aligns perfectly automatically!
    if (this.kidsModeEnabled) {
      offsetX = 0;
    }

    if (this.magnetArmed) {
      offsetX = 0;
      this.magnetArmed = false;
    }
    
    const uiScene = this.scene.get('UIManager') as UIManager;
    const threshold = this.kidsModeEnabled ? 75 : this.perfectThreshold;

    if (offsetX < threshold) {
      // Perfect placement
      landedBlock.isPerfect = true;
      
      const isPlatformTarget = (targetBody as any).isPlatform;
      const targetY = targetBody.position.y - (isPlatformTarget ? 75 : 50);
      const Matter = (Phaser.Physics.Matter as any).Matter;
      Matter.Body.setPosition(landedBlock.body, { x: targetX, y: targetY });
      Matter.Body.setAngle(landedBlock.body, 0);
      Matter.Body.setVelocity(landedBlock.body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(landedBlock.body, 0);

      this.comboSystem.increaseCombo();
      const combo = this.comboSystem.getCombo();
      const multiplier = this.comboSystem.getMultiplier();
      
      const scoreAdded = 250 * multiplier;
      this.scoreSystem.addScore(scoreAdded);
      
      this.audioManager.playPerfectHit();
      if (combo > 2) this.audioManager.playCombo(combo);
      
      landedBlock.squashAndStretch();
      this.particleManager.createSparks(landedBlock.body.position.x, landedBlock.body.position.y, landedBlock.width);
      
      if (combo >= 5) {
        this.cameraEffects.heavyShake();
        this.cameraEffects.zoomPulse();
        this.particleManager.createConfetti(landedBlock.body.position.x, landedBlock.body.position.y);
      } else {
        this.cameraEffects.smallShake();
      }

      const scoreTextStr = `PERFECT! +${scoreAdded}`;
      uiScene.showFloatingText(landedBlock.body.position.x, landedBlock.body.position.y - this.cameras.main.scrollY, scoreTextStr, '#ffd214');

      this.stability = this.kidsModeEnabled ? 100 : Math.min(100, this.stability + 5);
    } else {
      // Normal placement
      this.comboSystem.resetCombo();
      this.scoreSystem.addScore(100);
      this.audioManager.playLanding();
      this.particleManager.createDust(landedBlock.body.position.x, landedBlock.body.position.y, landedBlock.width);

      this.stability = this.kidsModeEnabled ? 100 : Math.max(0, this.stability - offsetX * 0.4);
    }

    uiScene.updateScore(this.scoreSystem.getScore());
    uiScene.updateCombo(this.comboSystem.getCombo(), this.comboSystem.getMultiplier(), this.comboSystem.getProgressToNextTier());
    uiScene.updateStability(this.stability);
    
    const landedCount = this.blocks.filter(b => b.isLanded).length;
    uiScene.updateHeight(landedCount + 1);

    if (this.stability <= 0) {
      this.triggerGameOver();
    }
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;

    this.spawner.update();
    
    // Draw guide line if in Kids Mode
    this.guideLineGraphics.clear();
    const currentBlock = this.spawner.getCurrentBlock();
    if (this.kidsModeEnabled && currentBlock && currentBlock.body && currentBlock.body.isStatic) {
      const bx = currentBlock.body.position.x;
      const by = currentBlock.body.position.y;
      
      // Trace down to the highest landed block or platform
      let targetY = this.platform.body.position.y - 50;
      this.blocks.forEach(b => {
        if (b.isLanded && b.body.position.y - 25 < targetY) {
          targetY = b.body.position.y - 25;
        }
      });

      // Draw vertical dotted line to assist aiming
      this.guideLineGraphics.fillStyle(0xffffff, 0.55);
      for (let y = by + 25; y < targetY; y += 14) {
        this.guideLineGraphics.fillCircle(bx, y, 3.5);
      }
    }
    
    this.blocks.forEach(block => {
      block.update();
      // Check death/miss
      if (!block.missHandled && block.body.position.y > this.deathLineY + 200) {
        block.missHandled = true;
        this.handleMiss(block);
      }
    });

    if (this.platform) {
      this.platform.update();
    }
  }

  private handleMiss(block: Block) {
    if (this.kidsModeEnabled) {
      // Auto-Rescue in Kids Mode: automatically snaps onto the stack so they never fail!
      this.rescueBlock(block);
      return;
    }

    if (this.shieldCount > 0) {
      this.shieldCount--;
      const uiScene = this.scene.get('UIManager') as UIManager;
      uiScene.updatePowerups(this.magnetCount, this.shieldCount, this.slowMoCount);
      uiScene.showFloatingText(this.cameras.main.centerX, this.cameras.main.scrollY + 150, 'Shield Saved You!', '#66ccff');
      this.comboSystem.resetCombo();
      uiScene.updateCombo(this.comboSystem.getCombo(), this.comboSystem.getMultiplier(), this.comboSystem.getProgressToNextTier());
      block.destroy();
      this.blocks = this.blocks.filter(b => b !== block);
    } else {
      this.triggerGameOver();
    }
  }

  private rescueBlock(block: Block) {
    const landed = this.blocks.filter(b => b.isLanded && b !== block);
    let targetX = this.platform.body.position.x;
    let targetY = this.platform.body.position.y - 75;

    if (landed.length > 0) {
      let topBlock = landed[0];
      landed.forEach(b => {
        if (b.body.position.y < topBlock.body.position.y) {
          topBlock = b;
        }
      });
      targetX = topBlock.body.position.x;
      targetY = topBlock.body.position.y - 50;
    }

    const Matter = (Phaser.Physics.Matter as any).Matter;
    Matter.Body.setPosition(block.body, { x: targetX, y: targetY });
    Matter.Body.setAngle(block.body, 0);
    Matter.Body.setVelocity(block.body, { x: 0, y: 0 });
    Matter.Body.setAngularVelocity(block.body, 0);
    
    block.isLanded = true;
    block.isPerfect = true;
    block.missHandled = false;

    const uiScene = this.scene.get('UIManager') as UIManager;
    if (uiScene) {
      uiScene.showFloatingText(block.body.position.x, block.body.position.y - this.cameras.main.scrollY, 'RESCUED! 🧸', '#10b981');
      this.comboSystem.increaseCombo();
      this.scoreSystem.addScore(250 * this.comboSystem.getMultiplier());
      uiScene.updateScore(this.scoreSystem.getScore());
      uiScene.updateCombo(this.comboSystem.getCombo(), this.comboSystem.getMultiplier(), this.comboSystem.getProgressToNextTier());
      uiScene.updateStability(100);
      uiScene.updateHeight(this.blocks.filter(b => b.isLanded).length + 1);
    }
    
    this.audioManager.playPerfectHit();
    this.particleManager.createConfetti(block.body.position.x, block.body.position.y);
    block.squashAndStretch();
  }

  private activateMagnet() {
    if (this.isGameOver) return;
    if (!this.kidsModeEnabled) {
      if (this.magnetCount <= 0 || this.magnetArmed) return;
      this.magnetCount--;
    }
    this.magnetArmed = true;
    const uiScene = this.scene.get('UIManager') as UIManager;
    uiScene.updatePowerups(this.magnetCount, this.shieldCount, this.slowMoCount);
  }

  private activateSlowMo() {
    if (this.isGameOver) return;
    if (!this.kidsModeEnabled) {
      if (this.slowMoCount <= 0 || this.slowMoActive) return;
      this.slowMoCount--;
    }
    this.slowMoActive = true;
    this.spawner.setSlowMo(0.4);
    const uiScene = this.scene.get('UIManager') as UIManager;
    uiScene.updatePowerups(this.magnetCount, this.shieldCount, this.slowMoCount);

    this.time.delayedCall(6000, () => {
      this.slowMoActive = false;
      this.spawner.setSlowMo(1);
    });
  }

  private triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    
    this.audioManager.playGameOver();
    this.cameraEffects.heavyShake();
    
    this.scene.stop('UIManager');

    const finalScore = this.scoreSystem.getScore();
    SaveManager.addScoreToLeaderboard(finalScore);
    SaveManager.recordGameEnd(this.comboSystem.getCombo(), this.blocks.filter(b => b.isLanded).length);

    this.time.delayedCall(1500, () => {
      this.scene.start('GameOverScene', {
        score: finalScore,
        highScore: this.scoreSystem.getHighScore()
      });
    });
  }
}
