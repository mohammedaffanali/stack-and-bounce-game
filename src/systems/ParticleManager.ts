export class ParticleManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createDust(x: number, y: number, width: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      x: { min: -width/2, max: width/2 },
      y: 0,
      lifespan: 400,
      speed: { min: 20, max: 50 },
      angle: { min: -10, max: 190 },
      gravityY: -100,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xffffff,
      blendMode: 'ADD',
      emitting: false
    });
    emitter.explode(10);
    this.scene.time.delayedCall(500, () => emitter.destroy());
  }

  createSparks(x: number, y: number, width: number) {
    const emitter = this.scene.add.particles(x, y, 'star', {
      x: { min: -width/2, max: width/2 },
      y: 0,
      lifespan: 1000,
      speed: { min: 100, max: 250 },
      angle: { min: 180, max: 360 },
      gravityY: 150,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xffd700, 0xffaa00, 0xffffff], // Mixed gold and white stars
      blendMode: 'ADD',
      emitting: false
    });
    emitter.explode(30);
    this.scene.time.delayedCall(1200, () => emitter.destroy());
  }

  createConfetti(x: number, y: number) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    colors.forEach(color => {
      const emitter = this.scene.add.particles(x, y, 'particle', {
        lifespan: 1500,
        speed: { min: 100, max: 300 },
        angle: { min: 200, max: 340 },
        gravityY: 300,
        scale: { start: 0.6, end: 0 },
        alpha: { start: 1, end: 0 },
        tint: color,
        emitting: false
      });
      emitter.explode(15);
      this.scene.time.delayedCall(1600, () => emitter.destroy());
    });
  }

  createExplosion(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'particle', {
      lifespan: 800,
      speed: { min: 100, max: 400 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0xff4444,
      blendMode: 'ADD',
      emitting: false
    });
    emitter.explode(50);
    this.scene.time.delayedCall(1000, () => emitter.destroy());
  }
}
