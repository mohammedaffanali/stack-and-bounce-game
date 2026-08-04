import * as Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // Generate a 3D-looking block texture (200x60)
    const bGraphics = this.add.graphics();
    const bw = 200;
    const bh = 60;
    
    // Main block base
    bGraphics.fillStyle(0xffffff, 1);
    bGraphics.fillRoundedRect(0, 0, bw, bh, 14);
    
    // Top highlight (simulates 3D glossy top surface)
    bGraphics.fillStyle(0xffffff, 0.45);
    bGraphics.fillRoundedRect(4, 3, bw - 8, bh * 0.4, 10);

    // Two "stud" circles on top, echoing the chunky toy-brick look of the reference art
    bGraphics.fillStyle(0xffffff, 0.55);
    bGraphics.fillCircle(bw * 0.32, bh * 0.32, bh * 0.16);
    bGraphics.fillCircle(bw * 0.68, bh * 0.32, bh * 0.16);
    bGraphics.fillStyle(0x000000, 0.12);
    bGraphics.fillCircle(bw * 0.32, bh * 0.32, bh * 0.16 * 0.55);
    bGraphics.fillCircle(bw * 0.68, bh * 0.32, bh * 0.16 * 0.55);
    
    // Bottom shadow
    bGraphics.fillStyle(0x000000, 0.25);
    bGraphics.fillRoundedRect(0, bh * 0.68, bw, bh * 0.32, 10);
    
    // Inner stroke for crispness
    bGraphics.lineStyle(3, 0xffffff, 0.7);
    bGraphics.strokeRoundedRect(2, 2, bw - 4, bh - 4, 12);
    
    bGraphics.generateTexture('block', bw, bh);
    bGraphics.destroy();

    // Generate a panel texture for UI
    const pGraphics = this.add.graphics();
    pGraphics.fillStyle(0x1a1a2e, 0.85);
    pGraphics.fillRoundedRect(0, 0, 200, 100, 16);
    pGraphics.lineStyle(4, 0x2a2a4a, 1);
    pGraphics.strokeRoundedRect(2, 2, 196, 96, 16);
    pGraphics.generateTexture('panel', 200, 100);
    pGraphics.destroy();

    // Generate a simple circle for particles
    const circle = this.add.graphics();
    circle.fillStyle(0xffffff, 1);
    circle.fillCircle(10, 10, 10);
    circle.generateTexture('particle', 20, 20);
    circle.destroy();

    // Generate a star for perfect particles
    const star = this.add.graphics();
    star.fillStyle(0xffffff, 1);
    // Draw a 5-point star
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? 10 : 4;
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2;
      points.push({ x: 10 + Math.cos(angle) * radius, y: 10 + Math.sin(angle) * radius });
    }
    star.beginPath();
    star.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) star.lineTo(points[i].x, points[i].y);
    star.closePath();
    star.fillPath();
    star.generateTexture('star', 20, 20);
    star.destroy();

    // Rainbow gradient strip, used as the "next combo tier" progress bar
    const rw = 120;
    const rh = 10;
    const rainbow = this.add.graphics();
    const stripeColors = [0xff3b3b, 0xff9d3b, 0xffe83b, 0x59ff3b, 0x3bc7ff, 0xb03bff];
    const stripeWidth = rw / stripeColors.length;
    stripeColors.forEach((c, i) => {
      rainbow.fillStyle(c, 1);
      rainbow.fillRect(i * stripeWidth, 0, stripeWidth, rh);
    });
    rainbow.generateTexture('rainbow-bar', rw, rh);
    rainbow.destroy();

    this.scene.start('MainMenuScene');
  }
}
