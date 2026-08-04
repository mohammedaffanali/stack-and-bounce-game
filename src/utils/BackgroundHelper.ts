import * as Phaser from 'phaser';

export class BackgroundHelper {
  /** Draws the background gradient, stars, city skyline, and water reflections. */
  static drawSceneBackground(scene: Phaser.Scene, width: number, height: number) {
    // 1. Sky Gradient
    const sky = scene.add.graphics();
    // Gradient from dark space blue to vibrant orange/magenta sunset
    sky.fillGradientStyle(0x0c062c, 0x0c062c, 0x581c4c, 0xce5e4d, 1);
    // Draw sky all the way up to cover vertical camera movement
    sky.fillRect(0, -height * 10, width, height * 11);

    // 2. Stars (above the skyline area)
    for (let i = 0; i < 60; i++) {
      const sx = Phaser.Math.Between(0, width);
      const sy = Phaser.Math.Between(-height * 10, height * 0.6);
      const size = Phaser.Math.FloatBetween(0.8, 2.2);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.9);
      const star = scene.add.circle(sx, sy, size, 0xffffff, alpha);
      
      // Star twinkle
      if (Math.random() > 0.4) {
        scene.tweens.add({
          targets: star,
          alpha: alpha * 0.3,
          duration: Phaser.Math.Between(1000, 3000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // 3. City Skyline Silhouette
    const skylineY = height - 120;
    const skyline = scene.add.graphics();
    skyline.fillStyle(0x130c25, 1); // Dark blue-black silhouette

    let curX = 0;
    const buildings: Array<{x: number, w: number, h: number}> = [];
    
    while (curX < width) {
      const bWidth = Phaser.Math.Between(45, 80);
      const bHeight = Phaser.Math.Between(70, 210);
      skyline.fillRect(curX, skylineY - bHeight, bWidth, bHeight + 50);
      
      buildings.push({ x: curX, w: bWidth, h: bHeight });
      
      // Draw building antennae/spires
      if (Math.random() > 0.5) {
        skyline.lineStyle(2, 0x130c25, 1);
        skyline.lineBetween(curX + bWidth / 2, skylineY - bHeight, curX + bWidth / 2, skylineY - bHeight - 15);
      }
      
      curX += bWidth + Phaser.Math.Between(5, 12);
    }

    // 4. Building Windows (Glowing Yellow)
    buildings.forEach(b => {
      // Draw windows inside the building boundary
      const winCols = Math.floor((b.w - 16) / 12);
      const winRows = Math.floor((b.h - 20) / 16);
      
      if (winCols > 0 && winRows > 0) {
        const windowG = scene.add.graphics();
        windowG.fillStyle(0xffcc44, 0.45); // Warm yellow glow
        
        for (let c = 0; c < winCols; c++) {
          for (let r = 0; r < winRows; r++) {
            if (Math.random() > 0.6) { // Turn some windows off
              const wx = b.x + 10 + c * 12;
              const wy = skylineY - b.h + 12 + r * 16;
              windowG.fillRect(wx, wy, 4, 6);
            }
          }
        }
      }
    });

    // 5. Water reflection at the bottom
    const waterY = height - 90;
    const waterHeight = 90;
    
    const water = scene.add.graphics();
    // Purple-orange water gradient
    water.fillGradientStyle(0x32133a, 0x32133a, 0x11071c, 0x11071c, 1);
    water.fillRect(0, waterY, width, waterHeight);
    
    // Draw horizontal sunset reflection streaks in the water
    const streaks = scene.add.graphics();
    for (let i = 0; i < 15; i++) {
      const sy = waterY + Phaser.Math.Between(5, waterHeight - 10);
      const sx = Phaser.Math.Between(0, width - 80);
      const sw = Phaser.Math.Between(30, 150);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.35);
      
      streaks.fillStyle(i % 2 === 0 ? 0xf58852 : 0xffcc44, alpha);
      streaks.fillRect(sx, sy, sw, 2);
    }
  }
}
