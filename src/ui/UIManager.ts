import * as Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager';
import { LogoHelper } from '../utils/LogoHelper';

export class UIManager extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private highScoreText!: Phaser.GameObjects.Text;
  private comboContainer!: Phaser.GameObjects.Container;
  private comboText!: Phaser.GameObjects.Text;
  private rainbowBar!: Phaser.GameObjects.Image;
  private heightText!: Phaser.GameObjects.Text;

  private nextBlockPreview!: Phaser.GameObjects.Graphics;
  private nextBlockContainerColor: number = 0xffffff;

  private magnetCountText!: Phaser.GameObjects.Text;
  private shieldCountText!: Phaser.GameObjects.Text;
  private slowMoCountText!: Phaser.GameObjects.Text;
  private magnetBtn!: Phaser.GameObjects.Container;
  private slowMoBtn!: Phaser.GameObjects.Container;
  private shieldBtn!: Phaser.GameObjects.Container;

  private stabilityBarBg!: Phaser.GameObjects.Graphics;
  private stabilityPointer!: Phaser.GameObjects.Graphics;
  private stabilityBarX = 40;
  private stabilityBarY = 0;
  private stabilityBarW = 26;
  private stabilityBarH = 170;

  private kidsModeToggleText!: Phaser.GameObjects.Text;
  private kidsModeToggleBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super('UIManager');
  }

  create() {
    const { width, height } = this.cameras.main;

    // 1. Top Left Game Logo (scaled down for HUD)
    LogoHelper.createLogo(this, 90, 65, 0.45);

    // 2. Kids Mode Toggle (Top-Left, below logo)
    this.createKidsModeToggle(90, 150);

    // 3. Top Center Score & Best Panels
    const scorePanelX = width / 2;
    const scorePanelY = 55;
    
    // Score backing box
    const scorePanel = this.add.graphics();
    scorePanel.fillStyle(0x0c062c, 0.9);
    scorePanel.fillRoundedRect(scorePanelX - 90, scorePanelY - 35, 180, 65, 12);
    scorePanel.lineStyle(3, 0x1e153b, 1);
    scorePanel.strokeRoundedRect(scorePanelX - 90, scorePanelY - 35, 180, 65, 12);

    this.add.text(scorePanelX, scorePanelY - 24, 'SCORE', {
      fontSize: '11px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(scorePanelX, scorePanelY, '0', {
      fontSize: '28px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Best Score Panel (nested below score panel)
    const bestPanel = this.add.graphics();
    bestPanel.fillStyle(0x130c25, 0.95);
    bestPanel.fillRoundedRect(scorePanelX - 60, scorePanelY + 38, 120, 30, 8);
    bestPanel.lineStyle(2, 0xffd214, 0.5);
    bestPanel.strokeRoundedRect(scorePanelX - 60, scorePanelY + 38, 120, 30, 8);

    const highScore = SaveManager.getHighScore();
    this.highScoreText = this.add.text(scorePanelX, scorePanelY + 52, `BEST  ${highScore.toLocaleString()}`, {
      fontSize: '11px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffd214'
    }).setOrigin(0.5);

    // 4. Top Right Combo Panel
    const comboX = width - 110;
    this.comboContainer = this.add.container(comboX, 100);
    this.comboContainer.setAlpha(0); // Hidden initially

    const comboPanelBg = this.add.graphics();
    comboPanelBg.fillStyle(0x0c062c, 0.9);
    comboPanelBg.fillRoundedRect(-60, -45, 120, 95, 12);
    comboPanelBg.lineStyle(3, 0x1e153b, 1);
    comboPanelBg.strokeRoundedRect(-60, -45, 120, 95, 12);

    const comboTitle = this.add.text(0, -32, 'COMBO', {
      fontSize: '11px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '900',
      color: '#d946ef'
    }).setOrigin(0.5);

    this.comboText = this.add.text(0, -6, 'X1', {
      fontSize: '32px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#d946ef'
    }).setOrigin(0.5);
    this.comboText.setShadow(0, 3, '#000000', 0, true, true);

    this.rainbowBar = this.add.image(0, 24, 'rainbow-bar');
    this.rainbowBar.setDisplaySize(90, 8);
    this.rainbowBar.setCrop(0, 0, 0, 10);

    const rainbowLabel = this.add.text(0, 38, 'NEXT RAINBOW', {
      fontSize: '9px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#e879f9'
    }).setOrigin(0.5);

    this.comboContainer.add([comboPanelBg, comboTitle, this.comboText, this.rainbowBar, rainbowLabel]);

    // 5. Top Right Pause Button
    const pauseX = width - 40;
    const pauseY = 40;
    
    const pauseBtn = this.add.circle(pauseX, pauseY, 20, 0x130c25, 1)
      .setStrokeStyle(3, 0x3b2d6b, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => pauseBtn.setStrokeStyle(3, 0xffd214, 1))
      .on('pointerout', () => pauseBtn.setStrokeStyle(3, 0x3b2d6b, 1))
      .on('pointerdown', () => {
        const gameScene = this.scene.get('GameScene');
        if (gameScene.scene.isPaused()) {
          gameScene.scene.resume();
          pauseIcon.setText('II');
        } else {
          gameScene.scene.pause();
          pauseIcon.setText('►');
        }
      });
      
    const pauseIcon = this.add.text(pauseX, pauseY, 'II', {
      fontSize: '18px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 6. Left Stack Buttons (Leaderboard, Stats, Settings)
    const buttonYStart = 220;
    this.createSideButton(40, buttonYStart, '🏆', 'LEADERBOARD', () => this.scene.get('MainMenuScene')['createLeaderboardPanel'].call(this.scene.get('MainMenuScene')));
    this.createSideButton(40, buttonYStart + 75, '📊', 'STATS', () => this.scene.get('MainMenuScene')['createStatsPanel'].call(this.scene.get('MainMenuScene')));
    this.createSideButton(40, buttonYStart + 150, '⚙️', 'SETTINGS', () => this.scene.get('MainMenuScene')['createSettingsPanel'].call(this.scene.get('MainMenuScene')));

    // 7. Next Block Preview Panel (Mid-Right)
    const nextBlockY = 320;
    const nextPanelBg = this.add.graphics();
    nextPanelBg.fillStyle(0x0c062c, 0.9);
    nextPanelBg.fillRoundedRect(width - 120, nextBlockY - 35, 100, 75, 12);
    nextPanelBg.lineStyle(3, 0x1e153b, 1);
    nextPanelBg.strokeRoundedRect(width - 120, nextBlockY - 35, 100, 75, 12);

    this.add.text(width - 70, nextBlockY - 24, 'NEXT BLOCK', {
      fontSize: '9px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '900',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Arrow Left
    this.add.text(width - 105, nextBlockY + 10, '◀', {
      fontSize: '12px',
      color: '#4b5563'
    }).setOrigin(0.5);
    
    // Arrow Right
    this.add.text(width - 35, nextBlockY + 10, '▶', {
      fontSize: '12px',
      color: '#4b5563'
    }).setOrigin(0.5);

    // Next Block Graphic Container
    this.nextBlockPreview = this.add.graphics();
    this.drawNextBlockPreview();

    // 8. Powerup Buttons (Bottom Right Stack)
    const puX = width - 40;
    const puYStart = height - 250;

    this.magnetBtn = this.createPowerupButton(puX, puYStart, '🧲', 'MAGNET', 0xef4444, () => {
      this.events.emit('magnetTapped');
    });
    this.magnetCountText = this.addCountBadge(puX, puYStart);

    this.shieldBtn = this.createPowerupButton(puX, puYStart + 75, '🛡️', 'SHIELD', 0x3b82f6, () => {
      // Shield is passive or auto-saves, but we can animate a click
    });
    this.shieldCountText = this.addCountBadge(puX, puYStart + 75);

    this.slowMoBtn = this.createPowerupButton(puX, puYStart + 150, '⏱️', 'SLOW MO', 0x8b5cf6, () => {
      this.events.emit('slowMoTapped');
    });
    this.slowMoCountText = this.addCountBadge(puX, puYStart + 150);

    // 9. Stability Gauge & Height (Bottom Left)
    this.stabilityBarY = height - 310;
    
    this.add.text(this.stabilityBarX + this.stabilityBarW / 2, this.stabilityBarY - 14, 'STABILITY', {
      fontSize: '10px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '900',
      color: '#ffd214'
    }).setOrigin(0.5);

    this.stabilityBarBg = this.add.graphics();
    this.stabilityPointer = this.add.graphics();
    this.drawStability(100);

    // Height Backing Panel
    const heightPanel = this.add.graphics();
    heightPanel.fillStyle(0x0c062c, 0.9);
    heightPanel.fillRoundedRect(this.stabilityBarX - 10, height - 105, 80, 50, 10);
    heightPanel.lineStyle(2, 0x1e153b, 1);
    heightPanel.strokeRoundedRect(this.stabilityBarX - 10, height - 105, 80, 50, 10);

    this.add.text(this.stabilityBarX + 30, height - 94, 'HEIGHT', {
      fontSize: '9px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.heightText = this.add.text(this.stabilityBarX + 30, height - 76, '1 / 50', {
      fontSize: '16px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  private createKidsModeToggle(x: number, y: number) {
    const w = 110;
    const h = 32;

    this.kidsModeToggleBg = this.add.graphics();
    
    const sensor = this.add.zone(x, y, w, h)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        const settings = SaveManager.getSettings();
        settings.kidsModeEnabled = !settings.kidsModeEnabled;
        SaveManager.saveSettings(settings);
        this.refreshKidsModeToggle();
        
        // Notify game scene to adjust speeds/physics instantly
        const gameScene = this.scene.get('GameScene') as any;
        if (gameScene && typeof gameScene.onKidsModeToggled === 'function') {
          gameScene.onKidsModeToggled(settings.kidsModeEnabled);
        }
      });

    this.kidsModeToggleText = this.add.text(x, y, '', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '10px',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.refreshKidsModeToggle();
  }

  private refreshKidsModeToggle() {
    const settings = SaveManager.getSettings();
    const x = this.kidsModeToggleText.x;
    const y = this.kidsModeToggleText.y;
    const w = 110;
    const h = 32;
    
    this.kidsModeToggleBg.clear();
    this.kidsModeToggleBg.fillStyle(0x0c062c, 0.6);
    this.kidsModeToggleBg.fillRoundedRect(x - w/2, y - h/2 + 3, w, h, 8); // Shadow
    
    if (settings.kidsModeEnabled) {
      this.kidsModeToggleBg.fillStyle(0x10b981, 1); // Green
      this.kidsModeToggleBg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
      this.kidsModeToggleBg.lineStyle(2, 0xffffff, 0.9);
      this.kidsModeToggleBg.strokeRoundedRect(x - w/2 + 1, y - h/2 + 1, w - 2, h - 2, 8);
      this.kidsModeToggleText.setText('🧸 KIDS MODE: ON');
    } else {
      this.kidsModeToggleBg.fillStyle(0x4b5563, 1); // Grey
      this.kidsModeToggleBg.fillRoundedRect(x - w/2, y - h/2, w, h, 8);
      this.kidsModeToggleBg.lineStyle(2, 0x6b7280, 0.9);
      this.kidsModeToggleBg.strokeRoundedRect(x - w/2 + 1, y - h/2 + 1, w - 2, h - 2, 8);
      this.kidsModeToggleText.setText('🧸 KIDS MODE: OFF');
    }
  }

  private createSideButton(x: number, y: number, icon: string, label: string, onTap: () => void) {
    const container = this.add.container(x, y);

    const circle = this.add.circle(0, 0, 20, 0x130c25, 0.9)
      .setStrokeStyle(2, 0x3b2d6b, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        circle.setStrokeStyle(2, 0xffd214, 1);
        iconText.setScale(1.15);
      })
      .on('pointerout', () => {
        circle.setStrokeStyle(2, 0x3b2d6b, 1);
        iconText.setScale(1);
      })
      .on('pointerdown', () => {
        onTap();
      });

    const iconText = this.add.text(0, -1, icon, { fontSize: '18px' }).setOrigin(0.5);

    const labelText = this.add.text(0, 26, label, {
      fontSize: '8px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    container.add([circle, iconText, labelText]);
  }

  private createPowerupButton(x: number, y: number, icon: string, label: string, color: number, onTap: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const circle = this.add.circle(0, 0, 22, 0x130c25, 1)
      .setStrokeStyle(3, color, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        circle.setStrokeStyle(3, 0xffffff, 1);
        iconText.setScale(1.2);
      })
      .on('pointerout', () => {
        circle.setStrokeStyle(3, color, 1);
        iconText.setScale(1);
      })
      .on('pointerdown', onTap);

    const iconText = this.add.text(0, -1, icon, { fontSize: '20px' }).setOrigin(0.5);

    const labelText = this.add.text(0, 30, label, {
      fontSize: '8px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '900',
      color: '#ffffff'
    }).setOrigin(0.5);
    labelText.setShadow(0, 1, '#000000', 0, true, true);

    container.add([circle, iconText, labelText]);
    return container;
  }

  private addCountBadge(x: number, y: number): Phaser.GameObjects.Text {
    // Red badge bubble
    const badgeBg = this.add.circle(x + 15, y - 15, 9, 0xef4444, 1)
      .setStrokeStyle(1.5, 0xffffff, 1);
    
    const badgeText = this.add.text(x + 15, y - 15, '0', {
      fontSize: '10px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    return badgeText;
  }

  private drawStability(value: number) {
    const bg = this.stabilityBarBg;
    bg.clear();

    // Stability track backing
    bg.fillStyle(0x0c062c, 0.8);
    bg.fillRoundedRect(this.stabilityBarX, this.stabilityBarY, this.stabilityBarW, this.stabilityBarH, 10);
    bg.lineStyle(3, 0x1e153b, 1);
    bg.strokeRoundedRect(this.stabilityBarX, this.stabilityBarY, this.stabilityBarW, this.stabilityBarH, 10);

    // Rainbow Gradient Fill (Green at bottom, Yellow in middle, Red at top)
    // We fill a nested rect inside the track
    const pad = 3;
    const fillX = this.stabilityBarX + pad;
    const fillY = this.stabilityBarY + pad;
    const fillW = this.stabilityBarW - pad * 2;
    const fillH = this.stabilityBarH - pad * 2;

    const fillG = this.add.graphics();
    // vertical gradient: red at top, green at bottom
    fillG.fillGradientStyle(0xef4444, 0xef4444, 0x10b981, 0x10b981, 1);
    fillG.fillRoundedRect(fillX, fillY, fillW, fillH, 8);
    
    // We mask or draw it, but simpler: draw it once statically, then position a pointer
    // Let's draw it onto stabilityBarBg so it is static
    bg.fillGradientStyle(0xef4444, 0xef4444, 0x10b981, 0x10b981, 1);
    bg.fillRoundedRect(fillX, fillY, fillW, fillH, 8);
    
    // Now place the pointer
    const pct = Phaser.Math.Clamp(value, 0, 100) / 100;
    // Y position: 100% stability is Green (bottom), 0% is Red (top)
    const pointerY = fillY + fillH - (pct * fillH);

    const ptr = this.stabilityPointer;
    ptr.clear();
    // Draw white pointer arrow pointing to the gauge
    const ptrSize = 6;
    ptr.fillStyle(0xffffff, 1);
    ptr.lineStyle(1.5, 0x0c062c, 1);
    
    ptr.beginPath();
    ptr.moveTo(this.stabilityBarX + this.stabilityBarW + ptrSize + 2, pointerY);
    ptr.lineTo(this.stabilityBarX + this.stabilityBarW + 2, pointerY - ptrSize);
    ptr.lineTo(this.stabilityBarX + this.stabilityBarW + 2, pointerY + ptrSize);
    ptr.closePath();
    ptr.fillPath();
    ptr.strokePath();
  }

  private drawNextBlockPreview() {
    const nextBlockY = 320;
    const { width } = this.cameras.main;
    const previewX = width - 70;
    
    const preview = this.nextBlockPreview;
    preview.clear();

    // Small glossy representation of a brick
    const bw = 50;
    const bh = 20;
    const bx = previewX - bw / 2;
    const by = nextBlockY + 10 - bh / 2;

    // Fill
    preview.fillStyle(this.nextBlockContainerColor, 1);
    preview.fillRoundedRect(bx, by, bw, bh, 6);

    // Gloss
    preview.fillStyle(0xffffff, 0.4);
    preview.fillRoundedRect(bx + 2, by + 1, bw - 4, bh * 0.35, 4);

    // Studs
    preview.fillStyle(this.nextBlockContainerColor, 1);
    preview.fillCircle(previewX - 12, by, 4);
    preview.fillCircle(previewX + 12, by, 4);

    // Outline
    preview.lineStyle(2, 0xffffff, 0.7);
    preview.strokeRoundedRect(bx, by, bw, bh, 6);
  }

  updateStability(value: number) {
    this.drawStability(value);
  }

  updatePowerups(magnet: number, shield: number, slowMo: number) {
    this.magnetCountText.setText(magnet.toString());
    this.shieldCountText.setText(shield.toString());
    this.slowMoCountText.setText(slowMo.toString());

    this.magnetBtn.setAlpha(magnet > 0 ? 1 : 0.4);
    this.slowMoBtn.setAlpha(slowMo > 0 ? 1 : 0.4);
    this.shieldBtn.setAlpha(shield > 0 ? 1 : 0.4);
  }

  updateNextBlockPreview(color: number) {
    this.nextBlockContainerColor = color;
    this.drawNextBlockPreview();
  }

  updateHeight(count: number) {
    if (this.heightText) {
      this.heightText.setText(`${count} / 50`);
    }
  }

  updateScore(score: number) {
    this.scoreText.setText(score.toLocaleString());
    const highScore = SaveManager.getHighScore();
    if (score > highScore) {
      this.highScoreText.setText(`BEST  ${score.toLocaleString()}`);
    }
  }

  updateCombo(combo: number, multiplier: number, progressToNextTier: number = 0) {
    this.rainbowBar.setCrop(0, 0, 90 * Phaser.Math.Clamp(progressToNextTier, 0, 1), 10);

    if (combo > 1) {
      this.comboText.setText(`X${multiplier}`);
      this.comboContainer.setAlpha(1);
      
      this.tweens.add({
        targets: this.comboContainer,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 150,
        yoyo: true,
        ease: 'Quad.easeOut'
      });
    } else {
      this.tweens.add({
        targets: this.comboContainer,
        alpha: 0,
        duration: 200
      });
    }
  }

  showFloatingText(x: number, y: number, text: string, color: string) {
    // Custom styled pop text matching reference image (e.g. PERFECT! +1,200)
    const floatText = this.add.text(x, y, text.toUpperCase(), {
      fontSize: '32px',
      fontFamily: '"Lilita One", sans-serif',
      color: color,
      stroke: '#0d0b26',
      strokeThickness: 6
    }).setOrigin(0.5);

    floatText.setShadow(0, 4, '#000000', 0, true, true);
    floatText.setScale(0.5);

    this.tweens.add({
      targets: floatText,
      scale: 1.25,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: floatText,
          y: y - 80,
          alpha: 0,
          duration: 750,
          ease: 'Sine.easeIn',
          onComplete: () => floatText.destroy()
        });
      }
    });
  }
}
