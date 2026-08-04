import * as Phaser from 'phaser';

export class Platform {
  body: MatterJS.BodyType;
  graphics: Phaser.GameObjects.Graphics;
  scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.scene = scene;
    
    // Draw the beautiful base platform matching the reference image
    this.graphics = scene.add.graphics();
    this.drawPlatform(width, height);
    this.graphics.setPosition(x, y);

    this.body = scene.matter.add.rectangle(x, y + 10, width + 20, height - 20, {
      isStatic: true,
      friction: 1,
      restitution: 0
    });
    (this.body as any).isPlatform = true;
  }

  private drawPlatform(w: number, h: number) {
    const g = this.graphics;
    g.clear();

    // 1. Dark bottom base rim (stone block)
    g.fillStyle(0x130c25, 1);
    g.fillRoundedRect(-w / 2, -h / 2 + 25, w, h - 25, 15);
    g.lineStyle(4, 0x2b2050, 1);
    g.strokeRoundedRect(-w / 2, -h / 2 + 25, w, h - 25, 15);

    // 2. Yellow/Orange Glowing Slot Lights (along the base)
    const numLights = 6;
    const lightW = 22;
    const lightH = 12;
    const spacing = w / (numLights + 1);
    
    g.fillStyle(0xff9900, 1); // Orange glow
    for (let i = 1; i <= numLights; i++) {
      const lx = -w / 2 + i * spacing - lightW / 2;
      const ly = -h / 2 + 52;
      g.fillRoundedRect(lx, ly, lightW, lightH, 3);
      
      // Outer bright yellow core glow
      g.fillStyle(0xffeb3b, 0.7);
      g.fillRoundedRect(lx + 4, ly + 2, lightW - 8, lightH - 4, 2);
      g.fillStyle(0xff9900, 1); // Reset
    }

    // 3. Middle dark purple border
    g.fillStyle(0x32133a, 1);
    g.fillRoundedRect(-w / 2 - 10, -h / 2 + 10, w + 20, 20, 8);
    g.lineStyle(2, 0x7c3aed, 1);
    g.strokeRoundedRect(-w / 2 - 10, -h / 2 + 10, w + 20, 20, 8);

    // 4. Top Purple Stone Slab (the stack surface)
    g.fillStyle(0x7c3aed, 1);
    g.fillRoundedRect(-w / 2 - 16, -h / 2 - 5, w + 32, 20, 10);
    g.lineStyle(3, 0xa78bfa, 1);
    g.strokeRoundedRect(-w / 2 - 16, -h / 2 - 5, w + 32, 20, 10);
  }

  update() {
    if (this.graphics && this.body) {
      // In Phaser Matter, static bodies don't move, but we position it relative to body
      this.graphics.setPosition(this.body.position.x, this.body.position.y - 10);
    }
  }

  destroy() {
    if (this.graphics) this.graphics.destroy();
    if (this.body) this.scene.matter.world.remove(this.body);
  }
}
