import * as Phaser from 'phaser';

export class LogoHelper {
  static createLogo(scene: Phaser.Scene, x: number, y: number, scale: number = 1): Phaser.GameObjects.Container {
    const container = scene.add.container(x, y);

    // Crown text
    const crownText = scene.add.text(0, -75, '👑', {
      fontSize: '48px'
    }).setOrigin(0.5);

    // Subtle crown bounce animation
    scene.tweens.add({
      targets: crownText,
      y: -82,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // "STACK" Text
    const stackText = scene.add.text(0, -32, 'STACK', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '56px',
      color: '#ffd214',
      stroke: '#0d0b26',
      strokeThickness: 10
    }).setOrigin(0.5);
    stackText.setShadow(0, 6, '#0d0b26', 0, true, true);

    // "&" Text
    const ampText = scene.add.text(0, 15, '&', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#0d0b26',
      strokeThickness: 8
    }).setOrigin(0.5);
    ampText.setShadow(0, 4, '#0d0b26', 0, true, true);

    // "BOUNCE" Text
    const bounceText = scene.add.text(0, 62, 'BOUNCE', {
      fontFamily: '"Lilita One", sans-serif',
      fontSize: '64px',
      color: '#1cb8ff',
      stroke: '#0d0b26',
      strokeThickness: 12
    }).setOrigin(0.5);
    bounceText.setShadow(0, 8, '#0d0b26', 0, true, true);

    // Banner background
    const bannerBg = scene.add.graphics();
    const bw = 240;
    const bh = 30;
    const bx = -bw / 2;
    const by = 100;
    
    // Draw ribbon shape with swallowtail ends
    bannerBg.fillStyle(0x7c3aed, 1); // Purple
    bannerBg.lineStyle(3, 0x9333ea, 1);
    
    bannerBg.beginPath();
    bannerBg.moveTo(bx + 15, by);
    bannerBg.lineTo(bx + bw - 15, by);
    bannerBg.lineTo(bx + bw, by + bh / 2);
    bannerBg.lineTo(bx + bw - 15, by + bh);
    bannerBg.lineTo(bx + 15, by + bh);
    bannerBg.lineTo(bx, by + bh / 2);
    bannerBg.closePath();
    bannerBg.fillPath();
    bannerBg.strokePath();

    // Banner Text
    const bannerText = scene.add.text(0, by + bh / 2, 'PHYSICS ARCADE BUILDER', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '11px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#4c1d95',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([crownText, stackText, ampText, bounceText, bannerBg, bannerText]);
    container.setScale(scale);

    return container;
  }
}
