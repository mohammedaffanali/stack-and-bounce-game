import * as Phaser from 'phaser';
import { BackgroundHelper } from '../utils/BackgroundHelper';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { score: number, highScore: number }) {
    const { width, height } = this.cameras.main;

    // Sunset backdrop
    BackgroundHelper.drawSceneBackground(this, width, height);

    // Dark glass overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x0c062c, 0.65).setOrigin(0);

    // Game Over Title
    const title = this.add.text(width / 2, height * 0.22, 'GAME OVER', {
      fontSize: '54px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ef4444',
      stroke: '#0d0b26',
      strokeThickness: 10
    }).setOrigin(0.5);
    title.setShadow(0, 6, '#000000', 0, true, true);

    // Score Board Panel
    const board = this.add.graphics();
    board.fillStyle(0x130c25, 0.85);
    board.fillRoundedRect(width / 2 - 130, height * 0.32, 260, 160, 16);
    board.lineStyle(3, 0xef4444, 0.8);
    board.strokeRoundedRect(width / 2 - 130, height * 0.32, 260, 160, 16);

    // Score Text
    this.add.text(width / 2, height * 0.36, 'FINAL SCORE', {
      fontSize: '11px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    const scoreVal = this.add.text(width / 2, height * 0.4, data.score.toLocaleString(), {
      fontSize: '32px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    scoreVal.setShadow(0, 3, '#000000', 0, true, true);

    // Best Score Text
    this.add.text(width / 2, height * 0.44, 'PERSONAL BEST', {
      fontSize: '11px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    const bestVal = this.add.text(width / 2, height * 0.47, data.highScore.toLocaleString(), {
      fontSize: '20px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffd214'
    }).setOrigin(0.5);

    // Restart Button (Large gradient pill-button)
    const restartX = width / 2;
    const restartY = height * 0.64;
    const btnW = 200;
    const btnH = 55;

    const restartBtn = this.add.graphics();
    this.drawButton(restartBtn, restartX - btnW / 2, restartY - btnH / 2, btnW, btnH, 0x10b981, 0x059669);

    const restartSensor = this.add.zone(restartX, restartY, btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: restartText,
          scale: 1.08,
          duration: 100
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: restartText,
          scale: 1.0,
          duration: 100
        });
      })
      .on('pointerdown', () => {
        this.scene.stop('GameOverScene');
        this.scene.start('GameScene');
      });

    const restartText = this.add.text(restartX, restartY, 'PLAY AGAIN', {
      fontSize: '20px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    restartText.setShadow(0, 2, '#047857', 0, true, true);

    // Main Menu Button (Smaller secondary button)
    const menuX = width / 2;
    const menuY = height * 0.76;
    const menuBtnW = 200;
    const menuBtnH = 50;

    const menuBtn = this.add.graphics();
    this.drawButton(menuBtn, menuX - menuBtnW / 2, menuY - menuBtnH / 2, menuBtnW, menuBtnH, 0x4b5563, 0x374151);

    const menuSensor = this.add.zone(menuX, menuY, menuBtnW, menuBtnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: menuText,
          scale: 1.08,
          duration: 100
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: menuText,
          scale: 1.0,
          duration: 100
        });
      })
      .on('pointerdown', () => {
        this.scene.stop('GameOverScene');
        this.scene.start('MainMenuScene');
      });

    const menuText = this.add.text(menuX, menuY, 'MAIN MENU', {
      fontSize: '18px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    menuText.setShadow(0, 2, '#1f2937', 0, true, true);
  }

  private drawButton(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color1: number, color2: number) {
    g.clear();
    // Shadow
    g.fillStyle(0x0c062c, 0.5);
    g.fillRoundedRect(x, y + 4, w, h, 15);
    
    // Core Fill
    g.fillStyle(color1, 1);
    g.fillRoundedRect(x, y, w, h, 15);
    g.lineStyle(2.5, 0xffffff, 0.7);
    g.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 15);
  }
}
