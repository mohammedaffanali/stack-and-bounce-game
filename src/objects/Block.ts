import * as Phaser from 'phaser';

export class Block {
  body: MatterJS.BodyType;
  sprite: Phaser.GameObjects.Sprite;
  scene: Phaser.Scene;
  width: number;
  height: number;
  isLanded: boolean = false;
  isPerfect: boolean = false;
  missHandled: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;

    this.sprite = scene.add.sprite(x, y, 'block');
    this.sprite.setDisplaySize(width, height);
    this.sprite.setTint(color);

    this.body = scene.matter.add.rectangle(x, y, width, height - 2, {
      restitution: 0,
      friction: 1,
      density: 0.1,
      sleepThreshold: 15
    });
    (this.body as any).blockRef = this;

    // Make the body static initially so it moves horizontally
    const Matter = (Phaser.Physics.Matter as any).Matter;
    Matter.Body.setStatic(this.body, true);
  }

  update() {
    if (this.sprite && this.body) {
      this.sprite.setPosition(this.body.position.x, this.body.position.y);
      this.sprite.setRotation(this.body.angle);
    }
  }

  drop() {
    const Matter = (Phaser.Physics.Matter as any).Matter;
    Matter.Body.setStatic(this.body, false);
    // Add a bit of downward velocity to start the fall immediately
    Matter.Body.setVelocity(this.body, { x: 0, y: 5 });
  }

  squashAndStretch() {
    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: this.sprite.scaleY * 0.7,
      scaleX: this.sprite.scaleX * 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.body) this.scene.matter.world.remove(this.body);
  }
}
