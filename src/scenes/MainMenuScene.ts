import * as Phaser from 'phaser';
import { SaveManager } from '../utils/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { LogoHelper } from '../utils/LogoHelper';
import { BackgroundHelper } from '../utils/BackgroundHelper';

export class MainMenuScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private kidsModeText!: Phaser.GameObjects.Text;
  private kidsModeBtnBg!: Phaser.GameObjects.Graphics;

  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.audioManager = new AudioManager(this);
    const { width, height } = this.cameras.main;

    // Beautiful Sunset, Skyline & Water Reflections Background
    BackgroundHelper.drawSceneBackground(this, width, height);

    // Render the Logo
    LogoHelper.createLogo(this, width / 2, height * 0.22, 1);

    // Best Score Panel (Below Logo)
    const highScore = SaveManager.getHighScore();
    
    // Draw Best Score panel backing
    const bestBacking = this.add.graphics();
    bestBacking.fillStyle(0x130c25, 0.85);
    bestBacking.fillRoundedRect(width / 2 - 100, height * 0.43, 200, 50, 12);
    bestBacking.lineStyle(2, 0xffd214, 0.7);
    bestBacking.strokeRoundedRect(width / 2 - 100, height * 0.43, 200, 50, 12);

    this.add.text(width / 2, height * 0.445, 'BEST SCORE', {
      fontSize: '11px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.465, highScore.toLocaleString(), {
      fontSize: '20px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffd214'
    }).setOrigin(0.5);

    // Left-side icon column (Leaderboard / Stats / Settings), matching reference art layout
    this.createIconButton(60, height * 0.32, '🏆', 'LEADERBOARD', () => this.createLeaderboardPanel());
    this.createIconButton(60, height * 0.44, '📊', 'STATS', () => this.createStatsPanel());
    this.createIconButton(60, height * 0.56, '⚙️', 'SETTINGS', () => this.createSettingsPanel());

    // Play Button (Large, pill-shaped, vibrant orange gradient)
    const playBtnX = width / 2;
    const playBtnY = height * 0.68;
    const playBtnW = 220;
    const playBtnH = 65;

    const playBtn = this.add.graphics();
    this.drawGradientButton(playBtn, playBtnX - playBtnW / 2, playBtnY - playBtnH / 2, playBtnW, playBtnH, 0xff7e14, 0xff5e14);
    
    const playSensor = this.add.zone(playBtnX, playBtnY, playBtnW, playBtnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: playText,
          scale: 1.1,
          duration: 100
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: playText,
          scale: 1.0,
          duration: 100
        });
      })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        this.scene.start('GameScene');
      });

    const playText = this.add.text(playBtnX, playBtnY, 'PLAY GAME', {
      fontSize: '26px',
      fontFamily: '"Lilita One", sans-serif',
      color: '#ffffff',
    }).setOrigin(0.5);
    playText.setShadow(0, 4, '#b43a04', 0, true, true);

    // Pulse animation for Play button text
    this.tweens.add({
      targets: playText,
      angle: { from: -2, to: 2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Kids Mode Toggle (Below Play Button)
    const kidsBtnX = width / 2;
    const kidsBtnY = height * 0.8;
    const kidsBtnW = 200;
    const kidsBtnH = 50;

    this.kidsModeBtnBg = this.add.graphics();
    this.updateKidsModeButtonState(kidsBtnX - kidsBtnW / 2, kidsBtnY - kidsBtnH / 2, kidsBtnW, kidsBtnH);

    const kidsSensor = this.add.zone(kidsBtnX, kidsBtnY, kidsBtnW, kidsBtnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        const settings = SaveManager.getSettings();
        settings.kidsModeEnabled = !settings.kidsModeEnabled;
        SaveManager.saveSettings(settings);
        this.updateKidsModeButtonState(kidsBtnX - kidsBtnW / 2, kidsBtnY - kidsBtnH / 2, kidsBtnW, kidsBtnH);
      });

    this.kidsModeText = this.add.text(kidsBtnX, kidsBtnY, '', {
      fontSize: '16px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.refreshKidsModeText();
  }

  private drawGradientButton(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color1: number, color2: number) {
    g.clear();
    // Shadow
    g.fillStyle(0x0c062c, 0.6);
    g.fillRoundedRect(x, y + 5, w, h, 20);
    // Gradient / Fill
    g.fillStyle(color1, 1);
    g.fillRoundedRect(x, y, w, h, 20);
    g.lineStyle(3, 0xffffff, 0.8);
    g.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 20);
  }

  private updateKidsModeButtonState(x: number, y: number, w: number, h: number) {
    const settings = SaveManager.getSettings();
    this.kidsModeBtnBg.clear();
    
    // Shadow
    this.kidsModeBtnBg.fillStyle(0x0c062c, 0.6);
    this.kidsModeBtnBg.fillRoundedRect(x, y + 4, w, h, 15);
    
    if (settings.kidsModeEnabled) {
      // Vibrant glowing green button
      this.kidsModeBtnBg.fillStyle(0x10b981, 1);
      this.kidsModeBtnBg.fillRoundedRect(x, y, w, h, 15);
      this.kidsModeBtnBg.lineStyle(3, 0xffffff, 0.9);
      this.kidsModeBtnBg.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 15);
    } else {
      // Classic charcoal grey button
      this.kidsModeBtnBg.fillStyle(0x374151, 1);
      this.kidsModeBtnBg.fillRoundedRect(x, y, w, h, 15);
      this.kidsModeBtnBg.lineStyle(3, 0x4b5563, 0.9);
      this.kidsModeBtnBg.strokeRoundedRect(x + 1, y + 1, w - 2, h - 2, 15);
    }
    
    this.refreshKidsModeText();
  }

  private refreshKidsModeText() {
    if (!this.kidsModeText) return;
    const settings = SaveManager.getSettings();
    if (settings.kidsModeEnabled) {
      this.kidsModeText.setText('🧸 KIDS MODE: ON 👦');
      this.kidsModeText.setColor('#ffffff');
    } else {
      this.kidsModeText.setText('🧸 KIDS MODE: OFF');
      this.kidsModeText.setColor('#9ca3af');
    }
  }

  private createIconButton(x: number, y: number, icon: string, label: string, onTap: () => void) {
    const container = this.add.container(x, y);

    const circle = this.add.circle(0, 0, 26, 0x130c25, 0.95)
      .setStrokeStyle(3, 0x3b2d6b, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        circle.setStrokeStyle(3, 0xffd214, 1);
        iconText.setScale(1.15);
      })
      .on('pointerout', () => {
        circle.setStrokeStyle(3, 0x3b2d6b, 1);
        iconText.setScale(1);
      })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        onTap();
      });

    const iconText = this.add.text(0, -2, icon, { fontSize: '24px' }).setOrigin(0.5);

    const labelText = this.add.text(0, 36, label, {
      fontSize: '9px',
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    container.add([circle, iconText, labelText]);
  }

  private createLeaderboardPanel() {
    const { width, height } = this.cameras.main;
    const scores = SaveManager.getLeaderboard();
    const panelGroup = this.add.group();

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0).setInteractive();
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x130c25, 0.95);
    panel.fillRoundedRect(width / 2 - 140, height / 2 - 170, 280, 340, 20);
    panel.lineStyle(4, 0x7c3aed, 1);
    panel.strokeRoundedRect(width / 2 - 140, height / 2 - 170, 280, 340, 20);

    const title = this.add.text(width / 2, height / 2 - 130, 'LEADERBOARD', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '26px',
      color: '#ffd700'
    }).setOrigin(0.5);
    
    title.setShadow(0, 3, '#000', 0, true, true);
    panelGroup.addMultiple([overlay, title]);

    if (scores.length === 0) {
      const empty = this.add.text(width / 2, height / 2, 'No games played yet.\nDrop some blocks!', {
        fontSize: '16px',
        fontFamily: '"Outfit", sans-serif',
        color: '#aaaaaa',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5);
      panelGroup.add(empty);
    } else {
      scores.forEach((score, i) => {
        const rowBg = this.add.graphics();
        rowBg.fillStyle(0x1e153b, 0.6);
        rowBg.fillRoundedRect(width / 2 - 120, height / 2 - 90 + i * 40, 240, 34, 8);
        
        const rankColors = ['#ffd214', '#e2e8f0', '#cd7f32', '#ffffff', '#ffffff'];
        const row = this.add.text(width / 2, height / 2 - 73 + i * 40, `${i + 1}.   ${score.toLocaleString()}`, {
          fontSize: '18px',
          fontFamily: '"Lilita One", sans-serif',
          color: rankColors[i] || '#ffffff'
        }).setOrigin(0.5);
        panelGroup.addMultiple([rowBg, row]);
      });
    }

    const closeBtnBg = this.add.graphics();
    const btnX = width / 2 - 60;
    const btnY = height / 2 + 115;
    closeBtnBg.fillStyle(0x4b5563, 1);
    closeBtnBg.fillRoundedRect(btnX, btnY, 120, 38, 10);
    closeBtnBg.lineStyle(2, 0xffffff, 0.7);
    closeBtnBg.strokeRoundedRect(btnX, btnY, 120, 38, 10);

    const closeBtn = this.add.zone(width / 2, height / 2 + 134, 120, 38)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        panelGroup.destroy(true);
        closeBtnBg.destroy();
      });
      
    const closeText = this.add.text(width / 2, height / 2 + 134, 'CLOSE', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    panelGroup.addMultiple([closeBtn, closeText]);
  }

  private createStatsPanel() {
    const { width, height } = this.cameras.main;
    const stats = SaveManager.getStats();
    const panelGroup = this.add.group();

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0).setInteractive();
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x130c25, 0.95);
    panel.fillRoundedRect(width / 2 - 140, height / 2 - 140, 280, 280, 20);
    panel.lineStyle(4, 0x06b6d4, 1);
    panel.strokeRoundedRect(width / 2 - 140, height / 2 - 140, 280, 280, 20);

    const title = this.add.text(width / 2, height / 2 - 100, 'STATS', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '26px',
      color: '#06b6d4'
    }).setOrigin(0.5);
    title.setShadow(0, 3, '#000', 0, true, true);
    panelGroup.addMultiple([overlay, title]);

    const rows = [
      `Games Played:  ${stats.gamesPlayed}`,
      `Best Combo:  x${stats.bestCombo}`,
      `Total Blocks:  ${stats.totalBlocksStacked}`
    ];
    
    rows.forEach((r, i) => {
      const rowBg = this.add.graphics();
      rowBg.fillStyle(0x1e153b, 0.6);
      rowBg.fillRoundedRect(width / 2 - 120, height / 2 - 50 + i * 42, 240, 34, 8);

      const rowText = this.add.text(width / 2 - 100, height / 2 - 33 + i * 42, r, {
        fontSize: '15px',
        fontFamily: '"Outfit", sans-serif',
        fontStyle: '800',
        color: '#ffffff'
      }).setOrigin(0, 0.5);
      
      panelGroup.addMultiple([rowBg, rowText]);
    });

    const closeBtnBg = this.add.graphics();
    const btnX = width / 2 - 60;
    const btnY = height / 2 + 82;
    closeBtnBg.fillStyle(0x4b5563, 1);
    closeBtnBg.fillRoundedRect(btnX, btnY, 120, 38, 10);
    closeBtnBg.lineStyle(2, 0xffffff, 0.7);
    closeBtnBg.strokeRoundedRect(btnX, btnY, 120, 38, 10);

    const closeBtn = this.add.zone(width / 2, height / 2 + 101, 120, 38)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        panelGroup.destroy(true);
        closeBtnBg.destroy();
      });
      
    const closeText = this.add.text(width / 2, height / 2 + 101, 'CLOSE', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);

    panelGroup.addMultiple([closeBtn, closeText]);
  }

  private createSettingsPanel() {
    const { width, height } = this.cameras.main;
    const settings = SaveManager.getSettings();
    const panelGroup = this.add.group();

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.75).setOrigin(0).setInteractive();
    
    // Panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x130c25, 0.95);
    panel.fillRoundedRect(width / 2 - 150, height / 2 - 160, 300, 320, 20);
    panel.lineStyle(4, 0xec4899, 1);
    panel.strokeRoundedRect(width / 2 - 150, height / 2 - 160, 300, 320, 20);
    
    const title = this.add.text(width / 2, height / 2 - 120, 'SETTINGS', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '26px',
      color: '#ec4899'
    }).setOrigin(0.5);
    title.setShadow(0, 3, '#000', 0, true, true);

    const soundText = this.add.text(width / 2 - 40, height / 2 - 60, 'SOUND:', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    
    const soundToggle = this.add.text(width / 2 + 40, height / 2 - 60, settings.soundEnabled ? 'ON' : 'OFF', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '20px',
      color: settings.soundEnabled ? '#10b981' : '#ef4444'
    }).setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        settings.soundEnabled = !settings.soundEnabled;
        soundToggle.setText(settings.soundEnabled ? 'ON' : 'OFF');
        soundToggle.setColor(settings.soundEnabled ? '#10b981' : '#ef4444');
        SaveManager.saveSettings(settings);
        this.audioManager.setSettings(settings.soundEnabled, settings.musicEnabled);
        this.audioManager.playButtonClick();
      });

    const musicText = this.add.text(width / 2 - 40, height / 2 - 10, 'MUSIC:', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    
    const musicToggle = this.add.text(width / 2 + 40, height / 2 - 10, settings.musicEnabled ? 'ON' : 'OFF', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '20px',
      color: settings.musicEnabled ? '#10b981' : '#ef4444'
    }).setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        settings.musicEnabled = !settings.musicEnabled;
        musicToggle.setText(settings.musicEnabled ? 'ON' : 'OFF');
        musicToggle.setColor(settings.musicEnabled ? '#10b981' : '#ef4444');
        SaveManager.saveSettings(settings);
        this.audioManager.setSettings(settings.soundEnabled, settings.musicEnabled);
        this.audioManager.playButtonClick();
      });

    const kidsModeText = this.add.text(width / 2 - 40, height / 2 + 40, 'KIDS MODE:', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(1, 0.5);

    const kidsModeToggle = this.add.text(width / 2 + 40, height / 2 + 40, settings.kidsModeEnabled ? 'ON' : 'OFF', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '20px',
      color: settings.kidsModeEnabled ? '#10b981' : '#ef4444'
    }).setOrigin(0, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        settings.kidsModeEnabled = !settings.kidsModeEnabled;
        kidsModeToggle.setText(settings.kidsModeEnabled ? 'ON' : 'OFF');
        kidsModeToggle.setColor(settings.kidsModeEnabled ? '#10b981' : '#ef4444');
        SaveManager.saveSettings(settings);
        this.audioManager.playButtonClick();
        this.refreshKidsModeText();
      });

    const closeBtnBg = this.add.graphics();
    const btnX = width / 2 - 60;
    const btnY = height / 2 + 95;
    closeBtnBg.fillStyle(0x4b5563, 1);
    closeBtnBg.fillRoundedRect(btnX, btnY, 120, 38, 10);
    closeBtnBg.lineStyle(2, 0xffffff, 0.7);
    closeBtnBg.strokeRoundedRect(btnX, btnY, 120, 38, 10);

    const closeBtn = this.add.zone(width / 2, height / 2 + 114, 120, 38)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.audioManager.playButtonClick();
        panelGroup.destroy(true);
        closeBtnBg.destroy();
      });
      
    const closeText = this.add.text(width / 2, height / 2 + 114, 'CLOSE', {
      fontFamily: '"Outfit", sans-serif',
      fontStyle: '800',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);

    panelGroup.addMultiple([overlay, panel, title, soundText, soundToggle, musicText, musicToggle, kidsModeText, kidsModeToggle, closeBtn, closeText]);
  }
}
